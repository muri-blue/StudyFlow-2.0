/* =========================================================
   StudyFlow — loja.js
   ========================================================= */
(function () {
  "use strict";

  var el = {
    saldo: document.getElementById("saldo"),
    categorias: document.getElementById("categorias"),
    ordem: document.getElementById("ordem"),
    vitrine: document.getElementById("vitrine"),
    provador: document.getElementById("provador"),
    provadorInfo: document.getElementById("provador-info"),
    desfazer: document.getElementById("btn-desfazer"),
    ganharConquistas: document.getElementById("ganhar-conquistas"),
    modal: document.getElementById("modal-compra"),
    compraPreview: document.getElementById("compra-preview"),
    compraNome: document.getElementById("compra-nome"),
    compraRaridade: document.getElementById("compra-raridade"),
    compraPreco: document.getElementById("compra-preco"),
    compraSaldo: document.getElementById("compra-saldo"),
    compraDepois: document.getElementById("compra-depois"),
    confirmar: document.getElementById("btn-confirmar"),
  };

  var estado = {
    categoria: "todos",
    posse: "todos",
    provando: null, // id do item no provador
    comprando: null,
  };

  /* ---------------- Categorias ---------------- */
  function renderCategorias() {
    var cats = [{ id: "todos", nome: "Todos", icone: "sparkles" }];
    Object.keys(Idebinha.LUGARES).forEach(function (k) {
      cats.push({ id: k, nome: Idebinha.LUGARES[k].nome, icone: Idebinha.LUGARES[k].icone });
    });
    el.categorias.innerHTML = cats
      .map(function (c) {
        var qtd = c.id === "todos" ? Idebinha.CATALOGO.length : Idebinha.CATALOGO.filter(function (i) {
          return i.lugar === c.id;
        }).length;
        var ativo = estado.categoria === c.id;
        return (
          '<button type="button" class="categoria' + (ativo ? " ativo" : "") + '" data-categoria="' + c.id + '" aria-pressed="' + ativo + '">' +
          '<span data-icone="' + c.icone + '" data-tamanho="15"></span>' + c.nome + ' <small class="categoria__qtd">' + qtd + "</small></button>"
        );
      })
      .join("");
  }

  el.categorias.addEventListener("click", function (e) {
    var b = e.target.closest("[data-categoria]");
    if (!b) return;
    estado.categoria = b.getAttribute("data-categoria");
    renderCategorias();
    renderVitrine();
  });

  document.querySelectorAll("[data-posse]").forEach(function (b) {
    b.addEventListener("click", function () {
      estado.posse = b.getAttribute("data-posse");
      document.querySelectorAll("[data-posse]").forEach(function (o) {
        o.classList.toggle("ativo", o === b);
        o.setAttribute("aria-pressed", String(o === b));
      });
      renderVitrine();
    });
  });

  el.ordem.addEventListener("change", renderVitrine);

  /* ---------------- Vitrine ---------------- */
  function itensFiltrados() {
    var m = EstadoMascote.ler();
    var lista = Idebinha.CATALOGO.filter(function (i) {
      if (estado.categoria !== "todos" && i.lugar !== estado.categoria) return false;
      var tem = m.itens.indexOf(i.id) !== -1;
      if (estado.posse === "tenho" && !tem) return false;
      if (estado.posse === "falta" && tem) return false;
      return true;
    });
    var ordem = el.ordem.value;
    lista.sort(function (a, b) {
      if (ordem === "preco-desc") return b.preco - a.preco;
      if (ordem === "raridade") return Idebinha.RARIDADES[b.raridade].ordem - Idebinha.RARIDADES[a.raridade].ordem || b.preco - a.preco;
      if (ordem === "nome") return a.nome.localeCompare(b.nome, "pt-BR");
      return a.preco - b.preco;
    });
    return lista;
  }

  function botaoItem(i, m) {
    var tem = m.itens.indexOf(i.id) !== -1;
    var vestido = m.equipados[i.lugar] === i.id;
    if (vestido) return '<button type="button" class="botao-secundario" data-acao="tirar" data-id="' + i.id + '">Tirar</button>';
    if (tem) return '<button type="button" class="botao-secundario" data-acao="vestir" data-id="' + i.id + '">Vestir</button>';
    return '<button type="button" class="botao-primario" data-acao="comprar" data-id="' + i.id + '">Comprar</button>';
  }

  function renderVitrine() {
    var m = EstadoMascote.ler();
    var saldo = Carteira.saldo();
    var lista = itensFiltrados();
    if (!lista.length) {
      el.vitrine.innerHTML = '<div class="vazio">' + (estado.posse === "tenho" ? "Você ainda não tem itens desta categoria." : "Você já tem todos os itens desta categoria!") + "</div>";
      return;
    }
    el.vitrine.innerHTML = lista
      .map(function (i) {
        var tem = m.itens.indexOf(i.id) !== -1;
        var vestido = m.equipados[i.lugar] === i.id;
        var equip = {};
        equip[i.lugar] = i.id;
        var classes = "item-loja";
        if (tem) classes += " tenho";
        if (vestido) classes += " equipado";
        if (estado.provando === i.id) classes += " provando";
        if (!tem && saldo < i.preco) classes += " sem-saldo";
        return (
          '<article class="' + classes + '" data-raridade="' + i.raridade + '" data-provar="' + i.id + '" tabindex="0" aria-label="Provar ' + Util.escapar(i.nome) + '">' +
          '<div class="item-loja__preview">' + Idebinha.svg({ equipados: equip, semSombra: true }) + "</div>" +
          '<span class="raridade">' + Idebinha.RARIDADES[i.raridade].nome + "</span>" +
          (tem ? '<span class="selo-tenho"><span data-icone="check" data-tamanho="11"></span>' + (vestido ? "Vestido" : "Tenho") + "</span>" : "") +
          '<strong class="item-loja__nome">' + Util.escapar(i.nome) + "</strong>" +
          '<div class="item-loja__rodape">' +
          (tem
            ? '<span class="item-loja__preco item-loja__preco--caro">' + Idebinha.LUGARES[i.lugar].nome + "</span>"
            : '<span class="item-loja__preco' + (saldo < i.preco ? " item-loja__preco--caro" : "") + '"><span data-icone="coins" data-tamanho="15"></span>' + (i.preco || "Grátis") + "</span>") +
          botaoItem(i, m) +
          "</div></article>"
        );
      })
      .join("");
  }

  el.vitrine.addEventListener("click", function (e) {
    var b = e.target.closest("[data-acao]");
    if (b) {
      e.stopPropagation();
      acao(b.getAttribute("data-acao"), b.getAttribute("data-id"));
      return;
    }
    var card = e.target.closest("[data-provar]");
    if (card) provar(card.getAttribute("data-provar"));
  });

  el.vitrine.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-provar]")) {
      e.preventDefault();
      provar(e.target.getAttribute("data-provar"));
    }
  });

  function acao(tipo, id) {
    var i = Idebinha.item(id);
    if (tipo === "comprar") return abrirCompra(id);
    if (tipo === "vestir") {
      EstadoMascote.vestir(i.id, i.lugar);
      Layout.aviso(i.nome + " vestido!", { icone: "check", tipo: "sucesso" });
    }
    if (tipo === "tirar") {
      EstadoMascote.alternarItem(i.id, i.lugar);
    }
    estado.provando = null;
    tudo();
  }

  /* ---------------- Provador ---------------- */
  function provar(id) {
    estado.provando = estado.provando === id ? null : id;
    renderProvador();
    renderVitrine();
  }

  function renderProvador() {
    var m = EstadoMascote.ler();
    var eq = Object.assign({}, m.equipados);
    var i = estado.provando ? Idebinha.item(estado.provando) : null;
    if (i) eq[i.lugar] = i.id;
    Idebinha.render(el.provador, { equipados: eq });
    el.desfazer.hidden = !i;

    if (!i) {
      el.provadorInfo.innerHTML = "<span>Toque em um item da vitrine para ver como fica na Idebinha.</span>";
      return;
    }
    var tem = m.itens.indexOf(i.id) !== -1;
    el.provadorInfo.innerHTML =
      "<strong>" + Util.escapar(i.nome) + "</strong>" +
      "<span>" + Idebinha.RARIDADES[i.raridade].nome + " · " + Idebinha.LUGARES[i.lugar].nome + (tem ? " · Você já tem" : " · " + i.preco + " moedas") + "</span>" +
      (tem
        ? '<button type="button" class="botao-primario" data-acao-provador="vestir">Vestir agora</button>'
        : '<button type="button" class="botao-primario" data-acao-provador="comprar">Comprar por ' + i.preco + " moedas</button>");
  }

  el.provadorInfo.addEventListener("click", function (e) {
    var b = e.target.closest("[data-acao-provador]");
    if (b && estado.provando) acao(b.getAttribute("data-acao-provador"), estado.provando);
  });

  el.desfazer.addEventListener("click", function () {
    estado.provando = null;
    renderProvador();
    renderVitrine();
  });

  /* ---------------- Compra ---------------- */
  function abrirCompra(id) {
    var i = Idebinha.item(id);
    var saldo = Carteira.saldo();
    if (saldo < i.preco) {
      Layout.aviso("Faltam " + (i.preco - saldo) + " moedas para comprar " + i.nome + ".", { icone: "coins", tipo: "erro" });
      return;
    }
    estado.comprando = id;
    var m = EstadoMascote.ler();
    var eq = Object.assign({}, m.equipados);
    eq[i.lugar] = i.id;
    el.compraPreview.innerHTML = Idebinha.svg({ equipados: eq, semSombra: true });
    el.compraNome.textContent = i.nome;
    el.compraRaridade.textContent = Idebinha.RARIDADES[i.raridade].nome + " · " + Idebinha.LUGARES[i.lugar].nome;
    el.compraRaridade.parentNode.setAttribute("data-raridade", i.raridade);
    el.compraPreco.textContent = i.preco + " moedas";
    el.compraSaldo.textContent = saldo + " moedas";
    el.compraDepois.textContent = saldo - i.preco + " moedas";
    Layout.abrirModal(el.modal);
  }

  el.confirmar.addEventListener("click", function () {
    var i = Idebinha.item(estado.comprando);
    if (!i) return;
    if (!Carteira.gastar(i.preco)) {
      Layout.fecharModal(el.modal);
      return Layout.aviso("Moedas insuficientes.", { icone: "coins", tipo: "erro" });
    }
    EstadoMascote.adicionarItem(i.id);
    EstadoMascote.vestir(i.id, i.lugar);
    EstadoMascote.ganhar({ felicidade: 10 });
    Conquistas.registrar("compras");
    Layout.fecharModal(el.modal);
    Layout.confete();
    Layout.aviso("A Idebinha amou o " + i.nome + "!", { icone: "heart", tipo: "sucesso" });
    estado.comprando = null;
    estado.provando = null;
    tudo();
  });

  /* ---------------- Geral ---------------- */
  function renderSaldo() {
    Layout.contar(el.saldo, Carteira.saldo());
    var pend = Conquistas.pendentes();
    if (pend.length) {
      var total = pend.reduce(function (s, c) {
        return s + c.moedas;
      }, 0);
      el.ganharConquistas.textContent = pend.length + (pend.length === 1 ? " conquista" : " conquistas") + " para resgatar (" + total + " moedas)";
    } else {
      el.ganharConquistas.textContent = "De 10 a 100 moedas cada";
    }
  }

  function tudo() {
    renderSaldo();
    renderCategorias();
    renderVitrine();
    renderProvador();
  }

  document.addEventListener("moedas:mudou", renderSaldo);
  document.addEventListener("conquistas:mudou", renderSaldo);

  tudo();
})();
