/* =========================================================
   StudyFlow — lembretes.js
   Avisos de eventos do dia e do fim do Pomodoro.

   Funciona enquanto o StudyFlow estiver aberto em alguma aba
   (o projeto é só web, sem app instalado):
   - Com a aba visível: aviso dentro do site (+ bipe, se o som
     estiver ligado nas Configurações).
   - Com a aba escondida: notificação do navegador, se o aluno
     permitiu. Navegadores só permitem isso em endereço seguro
     (https ou localhost); fora disso, fica só o aviso no site.

   Carregado em todas as telas internas, depois do conquistas.js.
   ========================================================= */
(function () {
  "use strict";

  var suportado = "Notification" in window && window.isSecureContext !== false;

  /* ---------------- Som ---------------- */
  function bipe() {
    if (!Config.ler().som) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      [0, 0.25].forEach(function (atraso) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + atraso);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + atraso + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + atraso + 0.2);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + atraso);
        o.stop(ctx.currentTime + atraso + 0.22);
      });
    } catch (e) {}
  }

  /* ---------------- Permissão ---------------- */
  function permissao() {
    return suportado ? Notification.permission : "indisponivel"; // granted | denied | default | indisponivel
  }

  function pedirPermissao() {
    if (!suportado) return Promise.resolve("indisponivel");
    if (Notification.permission !== "default") return Promise.resolve(Notification.permission);
    try {
      var r = Notification.requestPermission();
      if (r && r.then) return r;
    } catch (e) {}
    // Safari antigo usa callback
    return new Promise(function (ok) {
      Notification.requestPermission(ok);
    });
  }

  /* ---------------- Avisar ---------------- */
  /**
   * Mostra um lembrete.
   * opcoes: { tag, link, icone, forcar }
   *  - link: página para abrir ao clicar na notificação
   *  - forcar: mostra mesmo com os lembretes desligados (botão "Testar")
   */
  function avisar(titulo, corpo, opcoes) {
    opcoes = opcoes || {};
    if (!opcoes.forcar && !Config.ler().lembretes) return;

    if (document.hidden && permissao() === "granted") {
      try {
        var n = new Notification(titulo, { body: corpo, tag: opcoes.tag || "studyflow", icon: "assets/brasao.webp" });
        n.onclick = function () {
          window.focus();
          if (opcoes.link && window.location.pathname.split("/").pop() !== opcoes.link) window.location.href = opcoes.link;
          n.close();
        };
      } catch (e) {}
    } else if (window.Layout) {
      Layout.aviso(titulo + (corpo ? " — " + corpo : ""), { icone: opcoes.icone || "bell", duracao: 6000 });
    }
    bipe();
  }

  /* ---------------- Não avisar duas vezes ---------------- */
  // Guarda o que já foi avisado (vale para todas as abas abertas)
  function avisados() {
    return Dados.ler("lembretes-avisados", {});
  }

  function jaAvisou(chave) {
    return !!avisados()[chave];
  }

  function marcar(chave) {
    var a = avisados();
    a[chave] = Date.now();
    // limpa o que tem mais de 3 dias
    var limite = Date.now() - 3 * 86400000;
    Object.keys(a).forEach(function (k) {
      if (a[k] < limite) delete a[k];
    });
    Dados.salvar("lembretes-avisados", a);
  }

  /* ---------------- Conferir ---------------- */
  function horaDoEvento(e) {
    var p = String(e.hora || "").split(":");
    var d = Util.data(e.data);
    d.setHours(+p[0] || 0, +p[1] || 0, 0, 0);
    return d.getTime();
  }

  function conferirEventos(agora) {
    var cfg = Config.ler();
    var hoje = Util.hojeISO();
    // eventos do aluno + os que o professor criou para a turma dele
    var turmaId = (Auth.usuario() || {}).turmaId;
    var daTurma = [];
    try {
      daTurma = JSON.parse(localStorage.getItem("studyflow:rede:eventos-turma") || "[]").filter(function (e) {
        return turmaId && e.turmaId === turmaId;
      });
    } catch (e) {}
    var deHoje = Dados.ler("eventos", []).concat(daTurma).filter(function (e) {
      return e.data === hoje;
    });

    // Resumo do dia: uma vez por dia, ao abrir o StudyFlow
    if (deHoje.length && !jaAvisou("dia:" + hoje)) {
      marcar("dia:" + hoje);
      var nomes = deHoje.slice(0, 3).map(function (e) {
        return e.titulo;
      }).join(", ");
      avisar(
        deHoje.length === 1 ? "Hoje você tem 1 compromisso" : "Hoje você tem " + deHoje.length + " compromissos",
        nomes + (deHoje.length > 3 ? "…" : ""),
        { tag: "dia", link: "calendario.html", icone: "calendar" }
      );
      return; // um aviso por vez
    }

    // Lembrete antes de cada evento com horário
    var antes = (cfg.antecedencia || 30) * 60000;
    deHoje.forEach(function (e) {
      if (!e.hora) return;
      var quando = horaDoEvento(e);
      var chave = "ev:" + e.id + ":" + e.data + ":" + e.hora;
      if (agora >= quando - antes && agora < quando + 10 * 60000 && !jaAvisou(chave)) {
        marcar(chave);
        var falta = Math.round((quando - agora) / 60000);
        var titulo = falta > 0 ? "Daqui a " + falta + (falta === 1 ? " minuto" : " minutos") + ": " + e.titulo : "Agora: " + e.titulo;
        var tipo = (window.Eventos && Eventos.TIPOS[e.tipo]) || { tarefa: "Tarefa", prova: "Prova", trabalho: "Trabalho" }[e.tipo] || "";
        avisar(titulo, [tipo, e.materia, "às " + e.hora].filter(Boolean).join(" • "), { tag: chave, link: "calendario.html", icone: "calendar" });
      }
    });
  }

  function conferirPomodoro(agora) {
    // Na tela Estudar quem cuida disso é o próprio cronômetro (estudar.js)
    if (window.PomodoroNaTela) return;
    var p = Dados.ler("pomodoro", null);
    if (!p || !p.rodando || !p.fim || agora < p.fim) return;
    var chave = "pomo:" + p.fim;
    if (jaAvisou(chave)) return;
    marcar(chave);
    if (p.modo === "pausa") {
      avisar("Pausa terminada", "Bora voltar aos estudos!", { tag: "pomodoro", link: "estudar.html", icone: "clock" });
    } else {
      avisar("Sessão de foco concluída!", "Abra Estudar para ganhar as moedas da Idebinha.", { tag: "pomodoro", link: "estudar.html", icone: "clock" });
    }
  }

  function conferir() {
    if (!window.Auth || !Auth.usuario() || !Config.ler().lembretes) return;
    if (document.querySelector("dialog.aceite[open]")) return; // espera o aceite dos Termos
    var agora = Date.now();
    conferirPomodoro(agora);
    conferirEventos(agora);
  }

  setTimeout(conferir, 1800); // depois da animação de entrada da página
  setInterval(conferir, 15000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) conferir();
  });

  window.Lembretes = {
    suportado: suportado,
    permissao: permissao,
    pedirPermissao: pedirPermissao,
    avisar: avisar,
    bipe: bipe,
    conferir: conferir,
  };
})();
