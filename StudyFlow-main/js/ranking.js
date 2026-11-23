/* =========================================================
   StudyFlow — ranking.js
   Ranking da TURMA: cada turma tem o seu, e só os colegas da
   mesma turma competem entre si.
   - Aluno: vê o ranking da própria turma.
   - Professor: escolhe entre as turmas dele.
   Dados vêm do js/rede.js (com o servidor, esta tela não muda).
   ========================================================= */
(function () {
  "use strict";

  var el = {
    aviso: document.getElementById("aviso-exemplo"),
    titulo: document.getElementById("titulo"),
    subtitulo: document.getElementById("subtitulo"),
    seletor: document.getElementById("seletor"),
    voce: document.getElementById("voce"),
    podio: document.getElementById("podio"),
    lista: document.getElementById("lista"),
    como: document.getElementById("como"),
  };

  var estado = { turmas: [], turmaId: null };

  el.aviso.hidden = !Rede.EXEMPLO;

  /* ---------------- Peças ---------------- */
  function lugarPodio(item, lugar) {
    if (!item) return '<div class="podio__lugar podio__lugar--' + lugar + '"></div>';
    return (
      '<div class="podio__lugar podio__lugar--' + lugar + (item.voce ? " eu" : "") + '">' +
      '<span class="podio__medalha" aria-hidden="true">' + lugar + "</span>" +
      '<span class="podio__nome">' + Util.escapar(item.nome) + "</span>" +
      '<span class="podio__base">' + item.pontos.toLocaleString("pt-BR") + " pts</span>" +
      '<span class="sr-only">' + lugar + "º lugar</span>" +
      "</div>"
    );
  }

  function linha(item) {
    return (
      '<li class="' + (item.voce ? "eu" : "") + '">' +
      '<span class="ranking__pos">' + item.posicao + "º</span>" +
      '<span class="ranking__quem"><strong>' + Util.escapar(item.nome) + (item.voce ? " (você)" : "") + "</strong></span>" +
      '<span class="ranking__pontos">' + item.pontos.toLocaleString("pt-BR") + "<small> pts</small></span>" +
      "</li>"
    );
  }

  function renderVoce(r) {
    el.voce.className = "ranking__voce";
    if (!r.voce) {
      el.voce.innerHTML = ""; // professor ou Secretaria: só olha
      return;
    }
    if (r.voce.foraDoRanking) {
      el.voce.className = "ranking__voce ranking__voce--neutro";
      el.voce.innerHTML = '<div><strong>Você não aparece no ranking</strong><span>Foi sua escolha. Para participar, ligue em <a href="configuracoes.html">Configurações</a>.</span></div>';
      return;
    }
    var meu = r.lista.filter(function (i) {
      return i.voce;
    })[0];
    if (!meu) {
      el.voce.innerHTML = "";
      return;
    }
    var texto;
    if (meu.posicao === 1) {
      texto = "Você está em 1º lugar na turma! Continue estudando para manter a liderança.";
    } else {
      var acima = r.lista[meu.posicao - 2];
      texto = "Faltam " + (acima.pontos - meu.pontos + 1) + " pontos para passar " + Util.escapar(acima.nome) + " (" + acima.posicao + "º). Uma sessão de foco vale " + Rede.PONTOS.sessoesFoco + "!";
    }
    // Sem "de N alunos": ninguém precisa ver que está entre os últimos
    el.voce.innerHTML =
      '<span class="ranking__voce-pos">' + meu.posicao + "º</span>" +
      "<div><strong>Sua posição: " + meu.posicao + "º • " + meu.pontos.toLocaleString("pt-BR") + " pontos</strong><span>" + texto + "</span></div>";
  }

  /* ---------------- Desenho ---------------- */
  function renderSeletor() {
    el.seletor.hidden = estado.turmas.length < 2;
    el.seletor.innerHTML = estado.turmas.map(function (t) {
      return '<button type="button" data-turma="' + t.id + '" aria-pressed="' + (t.id === estado.turmaId) + '">' + Util.escapar(t.nome) + "</button>";
    }).join("");
  }

  function render() {
    renderSeletor();
    Rede.rankingDaTurma(estado.turmaId).then(function (r) {
      el.titulo.textContent = "Ranking do " + r.turma.nome;
      el.subtitulo.textContent = r.turma.escola + " • só os colegas desta turma";
      renderVoce(r);

      if (!r.lista.length) {
        el.podio.innerHTML = "";
        el.lista.innerHTML = '<li class="vazio-gestao" style="display:block">Ninguém no ranking desta turma ainda. Estude um pouquinho e seja o primeiro!</li>';
        return;
      }

      // pódio: 2º, 1º, 3º
      el.podio.innerHTML = lugarPodio(r.lista[1], 2) + lugarPodio(r.lista[0], 1) + lugarPodio(r.lista[2], 3);

      var h = r.lista.slice(3, 10).map(linha).join("");
      var meu = r.lista.filter(function (i) {
        return i.voce;
      })[0];
      if (meu && meu.posicao > 10) h += '<li class="separador" aria-hidden="true">• • •</li>' + linha(meu);
      el.lista.innerHTML = h;
    });
  }

  function semTurma() {
    el.titulo.textContent = "Ranking da turma";
    el.subtitulo.textContent = "";
    el.voce.className = "ranking__voce ranking__voce--neutro";
    el.voce.innerHTML = "<div><strong>Sua conta ainda não está ligada a uma turma</strong><span>O ranking aparece quando a escola vincular você a uma turma.</span></div>";
    el.podio.innerHTML = "";
    el.lista.innerHTML = "";
  }

  /* ---------------- Ações ---------------- */
  el.seletor.addEventListener("click", function (e) {
    var b = e.target.closest("[data-turma]");
    if (!b) return;
    estado.turmaId = b.getAttribute("data-turma");
    render();
  });

  var COMO = {
    sessoesFoco: ["Sessão de foco (Pomodoro) completa", "clock"],
    diasConcluidos: ["Dia de plano de estudo concluído", "checkSquare"],
    conquistas: ["Conquista desbloqueada", "trophy"],
    metas: ["Meta da semana concluída", "target"],
    diasSeguidos: ["Cada dia da sua sequência", "flame"],
  };
  el.como.innerHTML = Object.keys(COMO).map(function (k) {
    return '<li><span><span data-icone="' + COMO[k][1] + '" data-tamanho="15"></span> ' + COMO[k][0] + "</span><b>+" + Rede.PONTOS[k] + " pts</b></li>";
  }).join("");

  Rede.turmasDoRanking().then(function (turmas) {
    estado.turmas = turmas;
    if (!turmas.length) return semTurma();
    estado.turmaId = turmas[0].id;
    render();
  });
})();
