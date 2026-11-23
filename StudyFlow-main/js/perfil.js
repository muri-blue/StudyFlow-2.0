/* =========================================================
   StudyFlow — perfil.js
   ========================================================= */
(function () {
  "use strict";

  var CORES = ["#4f46e5", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#334155"];

  var el = {
    avatar: document.getElementById("perfil-avatar"),
    nome: document.getElementById("perfil-nome"),
    detalhe: document.getElementById("perfil-detalhe"),
    editar: document.getElementById("btn-editar"),
    form: document.getElementById("form-perfil"),
    apelido: document.getElementById("campo-apelido"),
    cores: document.getElementById("opcoes-cor"),
    cancelar: document.getElementById("btn-cancelar"),
    matricula: document.getElementById("info-matricula"),
    papel: document.getElementById("info-papel"),
    escola: document.getElementById("info-escola"),
    turma: document.getElementById("info-turma"),
    estatisticas: document.getElementById("estatisticas"),
    conquistas: document.getElementById("perfil-conquistas"),
    palco: document.querySelector(".perfil-idebinha__palco"),
    idebinhaNivel: document.getElementById("idebinha-nivel"),
    sair: document.getElementById("btn-sair"),
  };

  var usuario = Auth.usuario();
  var corEscolhida = null;

  function renderDados() {
    var nome = Auth.nomeExibido();
    var cor = Auth.corAvatar();
    el.avatar.textContent = Util.iniciais(nome);
    el.avatar.style.background = cor;
    el.nome.textContent = nome;
    el.detalhe.textContent = [usuario.papel, usuario.turma].filter(Boolean).join(" • ") + (nome !== usuario.nome ? " • " + usuario.nome : "");
    el.matricula.textContent = usuario.matricula;
    el.papel.textContent = usuario.papel;
    if (usuario.escola) el.escola.textContent = usuario.escola;
    if (usuario.turma) el.turma.textContent = usuario.turma;
  }

  function renderEstatisticas() {
    var s = Conquistas.stats();
    var lista = Conquistas.lista();
    var desbloqueadas = lista.filter(function (c) {
      return c.desbloqueada;
    }).length;
    var itens = [
      { valor: s.pomodoros || 0, rotulo: "Sessões de foco", icone: "clock", cor: "azul" },
      { valor: s.diasSeguidos || 1, rotulo: "Dias seguidos", icone: "flame", cor: "laranja" },
      { valor: s.diasConcluidos || 0, rotulo: "Dias de estudo feitos", icone: "checkSquare", cor: "verde" },
      { valor: s.metas || 0, rotulo: "Metas concluídas", icone: "target", cor: "verde" },
      { valor: s.perguntas || 0, rotulo: "Perguntas à IA", icone: "sparkles", cor: "roxo" },
      { valor: desbloqueadas + "/" + lista.length, rotulo: "Conquistas", icone: "trophy", cor: "laranja" },
    ];
    el.estatisticas.innerHTML = itens
      .map(function (i) {
        return (
          '<li><span class="estatistica__icone estatistica__icone--' + i.cor + '"><span data-icone="' + i.icone + '" data-tamanho="18"></span></span>' +
          "<div><strong>" + i.valor + "</strong><span>" + i.rotulo + "</span></div></li>"
        );
      })
      .join("");
  }

  function renderConquistas() {
    var recentes = Conquistas.recentes(4);
    el.conquistas.innerHTML = recentes.length
      ? recentes.map(Conquistas.itemHTML).join("")
      : '<li class="vazio">Nenhuma conquista ainda. Use o StudyFlow para desbloquear!</li>';
  }

  function renderIdebinha() {
    var e = EstadoMascote.ler();
    Idebinha.render(el.palco, { equipados: e.equipados, triste: e.felicidade < 30 });
    el.idebinhaNivel.textContent = "Nível " + e.nivel + " — " + EstadoMascote.titulo(e.nivel) + " · " + e.xpNoNivel + "/100 XP";
  }

  /* ---------------- Edição ---------------- */
  function renderCores() {
    el.cores.innerHTML = CORES.map(function (c) {
      var ativo = c === corEscolhida;
      return '<button type="button" class="cor" data-cor="' + c + '" style="background:' + c + '" aria-pressed="' + ativo + '" aria-label="Cor ' + c + '"></button>';
    }).join("");
  }

  el.editar.addEventListener("click", function () {
    var perfil = Dados.ler("perfil", {});
    el.apelido.value = perfil.apelido || "";
    el.apelido.placeholder = usuario.nome;
    corEscolhida = Auth.corAvatar();
    renderCores();
    el.form.hidden = false;
    el.editar.hidden = true;
    el.apelido.focus();
  });

  el.cores.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cor]");
    if (!b) return;
    corEscolhida = b.getAttribute("data-cor");
    renderCores();
    el.avatar.style.background = corEscolhida; // prévia
  });

  function fecharForm() {
    el.form.hidden = true;
    el.editar.hidden = false;
    renderDados();
  }

  el.cancelar.addEventListener("click", fecharForm);

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    Dados.salvar("perfil", { apelido: el.apelido.value.trim(), cor: corEscolhida });
    fecharForm();
    Layout.montarSidebar();
    Layout.aviso("Perfil atualizado!", { icone: "check", tipo: "sucesso" });
  });

  /* ---------------- Outros ---------------- */
  el.conquistas.addEventListener("click", function (e) {
    var b = e.target.closest("[data-resgatar]");
    if (!b) return;
    var moedas = Conquistas.resgatar(b.getAttribute("data-resgatar"));
    if (moedas) {
      Layout.confete();
      Layout.aviso("+" + moedas + " moedas resgatadas!", { icone: "coins", tipo: "moedas" });
    }
    renderConquistas();
  });

  el.sair.addEventListener("click", function () {
    Auth.sair();
  });

  document.addEventListener("conquistas:mudou", function () {
    renderConquistas();
    renderEstatisticas();
  });

  renderDados();
  renderEstatisticas();
  renderConquistas();
  renderIdebinha();
})();
