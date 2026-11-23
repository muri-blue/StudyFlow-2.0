/* =========================================================
   StudyFlow — mascote.js
   ========================================================= */
(function () {
  "use strict";

  var el = {
    nivel: document.getElementById("nivel"),
    sequencia: document.getElementById("sequencia"),
    palco: document.getElementById("palco"),
    mascote: document.getElementById("mascote"),
    mensagem: document.getElementById("mensagem-mascote"),
    conquistas: document.getElementById("conquistas-recentes"),
    moedas: document.getElementById("moedas"),
    vestiario: document.getElementById("vestiario"),
  };

  var SKILLS = {
    alimentar: { custo: 10, ganho: { energia: 20, felicidade: 3, xp: 5 }, stat: "alimentou", msg: "Nham! A Idebinha adorou o lanche. +20 Energia" },
    brincar: { custo: 5, ganho: { felicidade: 15, energia: -5, xp: 5 }, stat: "brincou", msg: "Que divertido! +15 Felicidade" },
    estudar: { custo: 0, ganho: { sabedoria: 5, energia: -8, xp: 10 }, stat: "estudouJunto", msg: "Vocês estudaram juntas! +5 Sabedoria" },
  };

  function mensagem(e) {
    if (e.energia < 25) return "A Idebinha está com pouca energia. Que tal dar um lanche para ela?";
    if (e.felicidade < 30) return "A Idebinha está meio tristinha… Brinque com ela ou faça um carinho!";
    if (e.sabedoria < 30) return "Estudar juntas aumenta a sabedoria da Idebinha. Bora abrir os livros?";
    if (e.felicidade >= 80 && e.energia >= 70) return "A Idebinha está radiante! Continue estudando para mantê-la feliz e cheia de energia.";
    return "Mantenha a rotina de estudos para manter a Idebinha feliz e cheia de energia! Estudar juntas aumenta a sabedoria dela.";
  }

  function renderBarras(e) {
    ["felicidade", "energia", "sabedoria"].forEach(function (k) {
      var barra = document.querySelector('.barra[data-atributo="' + k + '"]');
      if (!barra) return;
      barra.querySelector(".barra__valor").textContent = e[k] + "%";
      barra.querySelector(".barra__preenchido").style.width = e[k] + "%";
      barra.classList.toggle("barra--baixa", e[k] < 25);
      barra.querySelector(".barra__trilho").setAttribute("role", "progressbar");
      barra.querySelector(".barra__trilho").setAttribute("aria-valuenow", e[k]);
      barra.querySelector(".barra__trilho").setAttribute("aria-label", k);
    });
  }

  function renderVestiario(e) {
    var itens = e.itens
      .map(function (id) {
        return Idebinha.item(id);
      })
      .filter(Boolean);
    if (!itens.length) {
      el.vestiario.innerHTML = '<li class="vazio">Nenhum acessório ainda.</li>';
      return;
    }
    // Vestidos primeiro
    itens.sort(function (a, b) {
      var va = e.equipados[a.lugar] === a.id ? 0 : 1;
      var vb = e.equipados[b.lugar] === b.id ? 0 : 1;
      return va - vb;
    });
    el.vestiario.innerHTML = itens
      .map(function (i) {
        var vestido = e.equipados[i.lugar] === i.id;
        return (
          '<li><button type="button" class="opcao" data-item="' + i.id + '" aria-pressed="' + vestido + '">' +
          '<span class="opcao__icone opcao__icone--roxo" data-icone="' + Idebinha.LUGARES[i.lugar].icone + '" data-tamanho="16"></span>' +
          '<span class="opcao__texto"><strong>' + Util.escapar(i.nome) + "</strong></span>" +
          (vestido ? '<span class="etiqueta etiqueta--verde">Equipado</span>' : '<span class="etiqueta etiqueta--cinza">Vestir</span>') +
          "</button></li>"
        );
      })
      .join("");
  }

  function renderConquistas() {
    var lista = Conquistas.recentes(3);
    if (!lista.length) {
      el.conquistas.innerHTML = '<li class="vazio">Nenhuma conquista ainda. Comece a estudar para desbloquear!</li>';
      return;
    }
    el.conquistas.innerHTML = lista.map(Conquistas.miniHTML).join("");
  }

  var desenhoAtual = ""; // evita redesenhar a Idebinha sem necessidade

  function desenharIdebinha(e, lugarNovo) {
    var chave = JSON.stringify(e.equipados) + (e.felicidade < 30 ? "triste" : "feliz");
    if (chave === desenhoAtual) return;
    desenhoAtual = chave;
    Idebinha.render(el.mascote, { equipados: e.equipados, triste: e.felicidade < 30 });
    if (lugarNovo) {
      var g = el.mascote.querySelector('.idebinha__item[data-lugar="' + lugarNovo + '"]');
      if (g) g.classList.add("idebinha__item--novo");
    }
  }

  function render(lugarNovo) {
    var e = EstadoMascote.ler();
    el.nivel.textContent = "Nível " + e.nivel + " — " + EstadoMascote.titulo(e.nivel);
    var seq = Conquistas.stats().diasSeguidos || 1;
    el.sequencia.textContent = seq + (seq === 1 ? " Dia Seguido" : " Dias Seguidos");
    desenharIdebinha(e, lugarNovo);
    renderBarras(e);
    el.mensagem.textContent = mensagem(e);
    Layout.contar(el.moedas, Carteira.saldo());
    renderVestiario(e);
    renderConquistas();
  }

  /* ---------------- Carinho ---------------- */
  el.palco.addEventListener("click", function (ev) {
    EstadoMascote.ganhar({ felicidade: 2 });
    Conquistas.registrar("carinhos");
    el.mascote.classList.remove("carinho");
    void el.mascote.offsetWidth; // reinicia a animação
    el.mascote.classList.add("carinho");

    var r = el.palco.getBoundingClientRect();
    var c = document.createElement("span");
    c.className = "coracao";
    c.innerHTML = Icones.svg("heart", 22, 2.5);
    var x = ev.clientX ? ev.clientX - r.left : r.width / 2;
    var y = ev.clientY ? ev.clientY - r.top : r.height / 3;
    c.style.left = x - 11 + "px";
    c.style.top = y - 11 + "px";
    el.palco.appendChild(c);
    setTimeout(function () {
      c.remove();
    }, 1000);
    render();
  });

  /* ---------------- Skills ---------------- */
  document.querySelectorAll("[data-skill]").forEach(function (b) {
    b.addEventListener("click", function () {
      var s = SKILLS[b.getAttribute("data-skill")];
      var e = EstadoMascote.ler();
      if (s.ganho.energia < 0 && e.energia + s.ganho.energia < 5) {
        return Layout.aviso("A Idebinha está cansada demais. Dê um lanche para ela primeiro!", { icone: "cookie", tipo: "erro" });
      }
      if (s.custo && !Carteira.gastar(s.custo)) {
        return Layout.aviso("Moedas insuficientes. Termine um Pomodoro para ganhar mais!", { icone: "coins", tipo: "erro" });
      }
      EstadoMascote.ganhar(s.ganho);
      Conquistas.registrar(s.stat);
      Layout.aviso(s.msg, { icone: "heart", tipo: "sucesso" });
      el.mascote.classList.remove("carinho");
      void el.mascote.offsetWidth;
      el.mascote.classList.add("carinho");
      render();
    });
  });

  /* ---------------- Vestiário ---------------- */
  el.vestiario.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-item]");
    if (!b) return;
    var item = Idebinha.item(b.getAttribute("data-item"));
    EstadoMascote.alternarItem(item.id, item.lugar);
    render(item.lugar);
  });

  document.addEventListener("conquistas:mudou", renderConquistas);
  document.addEventListener("moedas:mudou", function () {
    Layout.contar(el.moedas, Carteira.saldo());
  });

  el.mascote.addEventListener("animationend", function (ev) {
    if (ev.animationName === "carinho") el.mascote.classList.remove("carinho");
  });

  render();
})();
