/* =========================================================
   StudyFlow — tema.js
   Carregado no <head> para aplicar tema/tamanho de texto
   antes da página aparecer (evita "piscar" claro → escuro).
   ========================================================= */
(function () {
  "use strict";

  var CHAVE = "studyflow:config";
  var PADRAO = {
    tema: "claro", // claro | escuro | auto
    texto: "normal", // normal | grande
    reduzirAnimacoes: false,
    foco: 25, // minutos
    pausa: 5, // minutos
    som: true,
    lembretes: true, // avisos de eventos do dia e do fim do Pomodoro
    antecedencia: 30, // minutos antes do evento
  };

  function ler() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
      var cfg = {};
      for (var k in PADRAO) cfg[k] = k in salvo ? salvo[k] : PADRAO[k];
      return cfg;
    } catch (e) {
      return Object.assign({}, PADRAO);
    }
  }

  function salvar(parcial) {
    var cfg = Object.assign(ler(), parcial);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(cfg));
    } catch (e) {}
    var raiz = document.documentElement;
    if ("tema" in parcial && !cfg.reduzirAnimacoes) {
      raiz.classList.add("trocando-tema");
      clearTimeout(salvar._t);
      salvar._t = setTimeout(function () {
        raiz.classList.remove("trocando-tema");
      }, 450);
    }
    aplicar(cfg);
    return cfg;
  }

  var midiaEscura = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function aplicar(cfg) {
    cfg = cfg || ler();
    var raiz = document.documentElement;
    var escuro = cfg.tema === "escuro" || (cfg.tema === "auto" && midiaEscura && midiaEscura.matches);
    raiz.setAttribute("data-tema", escuro ? "escuro" : "claro");
    raiz.setAttribute("data-texto", cfg.texto === "grande" ? "grande" : "normal");
    if (cfg.reduzirAnimacoes) raiz.setAttribute("data-animacoes", "reduzidas");
    else raiz.removeAttribute("data-animacoes");
  }

  if (midiaEscura && midiaEscura.addEventListener) {
    midiaEscura.addEventListener("change", function () {
      if (ler().tema === "auto") aplicar();
    });
  }

  aplicar();

  window.Config = { ler: ler, salvar: salvar, aplicar: aplicar, PADRAO: PADRAO };
})();
