/* =========================================================
   StudyFlow — professor.js (Minhas turmas)
   Usa só o js/rede.js para buscar dados: quando o servidor
   chegar, esta tela não precisa mudar.
   ========================================================= */
(function () {
  "use strict";

  var el = {
    aviso: document.getElementById("aviso-exemplo"),
    seletor: document.getElementById("seletor"),
    kpis: document.getElementById("kpis"),
    alunos: document.getElementById("alunos"),
    eventos: document.getElementById("eventos"),
    filtros: document.querySelectorAll("[data-filtro]"),
    btnEvento: document.getElementById("btn-evento"),
    modal: document.getElementById("modal-evento"),
    modalTurma: document.getElementById("modal-turma"),
    form: document.getElementById("form-evento"),
    erro: document.getElementById("ev-erro"),
    titulo: document.getElementById("ev-titulo"),
    data: document.getElementById("ev-data"),
    hora: document.getElementById("ev-hora"),
    materia: document.getElementById("ev-materia"),
    tipo: document.getElementById("ev-tipo"),
  };

  var estado = { turmas: [], turma: null, alunos: [], filtro: "todos" };
  var DIA = 86400000;
  var TIPOS = { prova: "Prova", trabalho: "Trabalho", tarefa: "Tarefa" };

  el.aviso.hidden = !Rede.EXEMPLO;

  /* ---------------- Situação de cada aluno ---------------- */
  function diasSemEntrar(a) {
    return a.ultimoAcesso === null ? null : Math.floor((Date.now() - a.ultimoAcesso) / DIA);
  }

  function situacao(a) {
    var d = diasSemEntrar(a);
    if (d === null) return { classe: "nunca", texto: "Nunca entrou", peso: 0 };
    if (d >= 7) return { classe: "atencao", texto: d + " dias sem entrar", peso: 1 };
    if (a.progressoPlanos < 30) return { classe: "atencao", texto: "Planos atrasados", peso: 2 };
    return { classe: "ok", texto: "Em dia", peso: 3 };
  }

  function quando(ms) {
    if (ms === null) return "—";
    var d = Math.floor((Util.hoje() - new Date(ms).setHours(0, 0, 0, 0)) / DIA);
    if (d <= 0) return "Hoje";
    if (d === 1) return "Ontem";
    if (d < 7) return "Há " + d + " dias";
    return Util.dataCurta(new Date(ms));
  }

  /* ---------------- Desenho ---------------- */
  function renderSeletor() {
    el.seletor.innerHTML = estado.turmas.map(function (t) {
      var ativo = estado.turma && estado.turma.id === t.id;
      return '<button type="button" data-turma="' + t.id + '" aria-pressed="' + ativo + '">' + Util.escapar(t.nome) + " · " + Util.escapar(t.escola.replace(" (exemplo)", "")) + "</button>";
    }).join("");
  }

  function kpi(icone, rotulo, valor, detalhe) {
    return (
      '<div class="kpi"><span class="kpi__rotulo"><span data-icone="' + icone + '" data-tamanho="15"></span>' + rotulo + "</span>" +
      '<span class="kpi__valor">' + valor + "</span>" +
      '<span class="kpi__detalhe">' + detalhe + "</span></div>"
    );
  }

  function renderKpis() {
    var a = estado.alunos;
    var n = a.length || 1;
    var ativos = a.filter(Rede.ativoNaSemana).length;
    var atencao = a.filter(function (x) {
      return situacao(x).peso < 3;
    }).length;
    var foco = a.reduce(function (s, x) {
      return s + x.sessoesFoco;
    }, 0);
    var prog = Math.round(a.reduce(function (s, x) {
      return s + x.progressoPlanos;
    }, 0) / n);
    el.kpis.innerHTML =
      kpi("users", "Ativos na semana", ativos + "<small> / " + a.length + "</small>", Math.round((ativos / n) * 100) + "% da turma entrou nos últimos 7 dias") +
      kpi("alert", "Precisam de atenção", String(atencao), "sem entrar há 7+ dias ou com planos atrasados") +
      kpi("clock", "Sessões de foco", String(foco), (Math.round((foco / n) * 10) / 10).toString().replace(".", ",") + " por aluno") +
      kpi("listChecks", "Planos de estudo", prog + "%", "progresso médio da turma");
  }

  function renderAlunos() {
    var u = Auth.usuario();
    var lista = estado.alunos.slice().sort(function (x, y) {
      return situacao(x).peso - situacao(y).peso || x.nome.localeCompare(y.nome, "pt-BR");
    });
    if (estado.filtro === "atencao") {
      lista = lista.filter(function (a) {
        return situacao(a).peso < 3;
      });
    }
    if (!lista.length) {
      el.alunos.innerHTML = '<tr><td colspan="6"><div class="vazio-gestao">Ninguém precisa de atenção nesta turma. 🎉</div></td></tr>';
      return;
    }
    el.alunos.innerHTML = lista.map(function (a) {
      var s = situacao(a);
      return (
        "<tr>" +
        "<td><strong>" + Util.escapar(a.nome) + "</strong>" + (!a.ficticio ? '<span class="voce">conta de teste</span>' : "") + "</td>" +
        "<td>" + quando(a.ultimoAcesso) + "</td>" +
        '<td class="numero">' + a.sessoesFoco + "</td>" +
        '<td><div class="barra-mini"><div class="barra-mini__trilho"><div class="barra-mini__cheio" style="width:' + a.progressoPlanos + '%"></div></div><span>' + a.progressoPlanos + "%</span></div></td>" +
        '<td class="numero">' + a.perguntas + "</td>" +
        '<td><span class="situacao situacao--' + s.classe + '">' + s.texto + "</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderEventos() {
    Rede.eventosDaTurma(estado.turma.id).then(function (lista) {
      var hoje = Util.hojeISO();
      var futuros = lista.filter(function (e) {
        return e.data >= hoje;
      });
      if (!futuros.length) {
        el.eventos.innerHTML = '<li class="vazio-gestao" style="display:block">Nenhum evento enviado. Use “Evento para a turma” para avisar sobre provas e trabalhos.</li>';
        return;
      }
      el.eventos.innerHTML = futuros.map(function (e) {
        var d = Util.data(e.data);
        return (
          "<li>" +
          '<span class="lista-eventos__data"><strong>' + d.getDate() + "</strong><small>" + Util.MESES_CURTOS[d.getMonth()] + "</small></span>" +
          '<span class="lista-eventos__texto"><strong>' + Util.escapar(e.titulo) + "</strong><span>" +
          Util.escapar([TIPOS[e.tipo], e.materia, e.hora ? "às " + e.hora : ""].filter(Boolean).join(" • ")) + "</span></span>" +
          '<button type="button" class="botao-icone" data-remover="' + e.id + '" aria-label="Cancelar o evento ' + Util.escapar(e.titulo) + '"><span data-icone="trash" data-tamanho="16"></span></button>' +
          "</li>"
        );
      }).join("");
    });
  }

  function escolherTurma(id) {
    estado.turma = estado.turmas.filter(function (t) {
      return t.id === id;
    })[0] || estado.turmas[0];
    try {
      sessionStorage.setItem("studyflow:turma-professor", estado.turma.id);
    } catch (e) {}
    renderSeletor();
    Rede.alunosDaTurma(estado.turma.id).then(function (alunos) {
      estado.alunos = alunos;
      renderKpis();
      renderAlunos();
      renderEventos();
    });
  }

  /* ---------------- Ações ---------------- */
  el.seletor.addEventListener("click", function (e) {
    var b = e.target.closest("[data-turma]");
    if (b) escolherTurma(b.getAttribute("data-turma"));
  });

  el.filtros.forEach(function (b) {
    b.addEventListener("click", function () {
      estado.filtro = b.getAttribute("data-filtro");
      el.filtros.forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === b));
      });
      renderAlunos();
    });
  });

  el.eventos.addEventListener("click", function (e) {
    var b = e.target.closest("[data-remover]");
    if (!b) return;
    if (!confirm("Cancelar este evento? Ele some do calendário de todos os alunos da turma.")) return;
    Rede.removerEventoTurma(b.getAttribute("data-remover")).then(function () {
      Layout.aviso("Evento cancelado.", { icone: "trash" });
      renderEventos();
    });
  });

  el.btnEvento.addEventListener("click", function () {
    if (!estado.turma) return;
    el.form.reset();
    el.erro.hidden = true;
    el.data.value = Util.iso(Util.somarDias(Util.hoje(), 1));
    el.hora.value = "08:00";
    el.modalTurma.textContent = "Vai aparecer no calendário de todos os alunos do " + estado.turma.nome + ".";
    Layout.abrirModal(el.modal);
    setTimeout(function () {
      el.titulo.focus();
    }, 30);
  });

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    var titulo = el.titulo.value.trim();
    if (!titulo) {
      el.erro.textContent = "Dê um título ao evento.";
      el.erro.hidden = false;
      el.titulo.focus();
      return;
    }
    if (!el.data.value) {
      el.erro.textContent = "Escolha a data.";
      el.erro.hidden = false;
      el.data.focus();
      return;
    }
    Rede.criarEventoTurma(estado.turma.id, {
      titulo: titulo,
      data: el.data.value,
      hora: el.hora.value,
      materia: el.materia.value,
      tipo: el.tipo.value,
    }).then(function () {
      Layout.fecharModal(el.modal);
      Layout.aviso("Enviado para o " + estado.turma.nome + "!", { icone: "check", tipo: "sucesso" });
      renderEventos();
    });
  });

  /* ---------------- Início ---------------- */
  Rede.minhasTurmas().then(function (turmas) {
    estado.turmas = turmas;
    if (!turmas.length) {
      el.kpis.innerHTML = "";
      el.alunos.innerHTML = '<tr><td colspan="6"><div class="vazio-gestao">Nenhuma turma vinculada à sua conta. Procure a Secretaria de Educação.</div></td></tr>';
      el.btnEvento.disabled = true;
      return;
    }
    var salva = null;
    try {
      salva = sessionStorage.getItem("studyflow:turma-professor");
    } catch (e) {}
    escolherTurma(salva);
  });
})();
