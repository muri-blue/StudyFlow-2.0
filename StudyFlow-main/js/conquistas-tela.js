/* =========================================================
   StudyFlow — conquistas-tela.js (conquistas.html)
   ========================================================= */
(function () {
  "use strict";

  var el = {
    resumo: document.getElementById("resumo"),
    saldo: document.getElementById("saldo"),
    numero: document.getElementById("geral-numero"),
    barra: document.getElementById("geral-barra"),
    resgatarTodas: document.getElementById("btn-resgatar-todas"),
    resgatarTexto: document.getElementById("resgatar-todas-texto"),
    lista: document.getElementById("lista"),
    proxima: document.getElementById("proxima"),
  };

  var filtro = "todas";

  function render() {
    var todas = Conquistas.lista();
    var desbloqueadas = todas.filter(function (c) {
      return c.desbloqueada;
    });
    var pendentes = desbloqueadas.filter(function (c) {
      return !c.resgatada;
    });
    var moedasPendentes = pendentes.reduce(function (s, c) {
      return s + c.moedas;
    }, 0);

    Layout.contar(el.saldo, Carteira.saldo());
    el.numero.textContent = desbloqueadas.length + "/" + todas.length;
    el.barra.setAttribute("data-barra", "geral");
    el.barra.style.width = Math.round((desbloqueadas.length / todas.length) * 100) + "%";
    el.resumo.textContent = pendentes.length
      ? "Você tem " + moedasPendentes + " moedas esperando para serem resgatadas!"
      : "Continue estudando para desbloquear mais conquistas";

    el.resgatarTodas.hidden = pendentes.length < 2;
    el.resgatarTexto.textContent = "Resgatar todas (" + moedasPendentes + " moedas)";

    // Lista: para resgatar primeiro, depois em andamento, depois resgatadas
    var peso = function (c) {
      if (c.desbloqueada && !c.resgatada) return 0;
      if (!c.desbloqueada) return 1;
      return 2;
    };
    var visiveis = todas
      .filter(function (c) {
        if (filtro === "desbloqueadas") return c.desbloqueada;
        if (filtro === "andamento") return !c.desbloqueada;
        return true;
      })
      .sort(function (a, b) {
        return peso(a) - peso(b) || b.progresso - a.progresso;
      });

    el.lista.innerHTML = visiveis.length
      ? visiveis.map(Conquistas.itemHTML).join("")
      : '<li class="vazio">' + (filtro === "desbloqueadas" ? "Nenhuma conquista desbloqueada ainda." : "Você desbloqueou todas! Incrível!") + "</li>";

    // "Quase lá": a bloqueada com mais progresso
    var bloqueadas = todas
      .filter(function (c) {
        return !c.desbloqueada;
      })
      .sort(function (a, b) {
        return b.progresso - a.progresso;
      });
    el.proxima.innerHTML = bloqueadas.length
      ? '<ul class="lista-conquistas lista-conquistas--uma">' + Conquistas.itemHTML(bloqueadas[0]) + "</ul>"
      : "<p>Você desbloqueou todas as conquistas. Parabéns!</p>";
  }

  el.lista.addEventListener("click", function (e) {
    var b = e.target.closest("[data-resgatar]");
    if (!b) return;
    var moedas = Conquistas.resgatar(b.getAttribute("data-resgatar"));
    if (moedas) {
      Layout.confete();
      Layout.aviso("+" + moedas + " moedas resgatadas!", { icone: "coins", tipo: "moedas" });
    }
    render();
  });

  el.resgatarTodas.addEventListener("click", function () {
    var total = 0;
    Conquistas.pendentes().forEach(function (c) {
      total += Conquistas.resgatar(c.id);
    });
    if (total) {
      Layout.confete();
      Layout.aviso("+" + total + " moedas resgatadas!", { icone: "coins", tipo: "moedas" });
    }
    render();
  });

  document.querySelectorAll("[data-filtro]").forEach(function (b) {
    b.addEventListener("click", function () {
      filtro = b.getAttribute("data-filtro");
      document.querySelectorAll("[data-filtro]").forEach(function (o) {
        o.classList.toggle("ativo", o === b);
        o.setAttribute("aria-pressed", String(o === b));
      });
      render();
    });
  });

  document.addEventListener("conquistas:mudou", render);

  render();
})();
