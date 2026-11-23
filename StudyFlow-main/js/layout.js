/* =========================================================
   StudyFlow — layout.js
   Monta a sidebar e cuida de coisas comuns a todas as telas:
   modais, avisos (toasts) e confete.
   ========================================================= */
(function () {
  "use strict";

  var MENU = [
    { href: "calendario.html", rotulo: "Calendário", icone: "calendar", paginas: ["calendario.html"] },
    { href: "mascote.html", rotulo: "Mascote", icone: "heart", paginas: ["mascote.html", "loja.html", "conquistas.html"] },
    { href: "assistente.html", rotulo: "Assistente de IA", curto: "Assistente", icone: "sparkle", paginas: ["assistente.html"] },
    { href: "estudar.html", rotulo: "Estudar", icone: "bookOpen", paginas: ["estudar.html"] },
    { href: "ranking.html", rotulo: "Ranking", icone: "trophy", paginas: ["ranking.html"] },
  ];

  // Telas de gestão: só aparecem para quem tem o acesso (Auth.pode)
  var GESTAO = [
    { href: "professor.html", rotulo: "Minhas turmas", icone: "users", acesso: "professor" },
    { href: "secretaria.html", rotulo: "Painel da rede", icone: "chart", acesso: "secretaria" },
    { href: "cadastro.html", rotulo: "Cadastro de alunos", icone: "upload", acesso: "secretaria" },
  ];

  function itensGestao() {
    return GESTAO.filter(function (g) {
      return Auth.pode(g.acesso);
    });
  }

  function paginaAtual() {
    var p = window.location.pathname.split("/").pop();
    return p || "index.html";
  }

  function montarSidebar() {
    var sb = document.getElementById("sidebar");
    if (!sb) return;
    var usuario = window.Auth ? Auth.usuario() : null;
    if (!usuario) return;

    var atual = paginaAtual();
    var gestao = itensGestao();
    var nome = Auth.nomeExibido();
    // Lido direto dos dados para a sidebar já nascer pronta (sem "piscar" na troca de página)
    var nivel = window.EstadoMascote ? EstadoMascote.ler().nivel : 1 + Math.floor((Dados.ler("mascote", { xp: Auth.ehDemo() ? 700 : 0 }).xp || 0) / 100);
    var detalhe = (usuario.turma || usuario.papel) + " • Nível " + nivel;

    var links = MENU.map(function (item) {
      var ativo = item.paginas.indexOf(atual) !== -1;
      return (
        '<a href="' + item.href + '"' + (ativo ? ' class="ativo" aria-current="page"' : "") + ">" +
        '<span data-icone="' + item.icone + '" data-tamanho="20"></span>' +
        // No celular (barra inferior) aparece o nome curto, se houver
        (item.curto
          ? '<span class="rotulo-longo">' + item.rotulo + '</span><span class="rotulo-curto">' + item.curto + "</span>"
          : "<span>" + item.rotulo + "</span>") +
        "</a>"
      );
    }).join("");

    sb.innerHTML =
      '<a class="sidebar__marca" href="calendario.html">' +
      '<span class="sidebar__logo"><span data-icone="graduationCap" data-tamanho="22"></span></span>' +
      '<div><strong class="sidebar__nome">StudyFlow</strong><small class="sidebar__sub">Plataforma de estudos</small></div>' +
      "</a>" +
      '<nav class="sidebar__nav" aria-label="Menu principal">' + links + "</nav>" +
      (gestao.length
        ? '<nav class="sidebar__gestao" aria-label="Gestão"><small>Gestão</small>' +
          gestao.map(function (g) {
            var ativo = g.href === atual;
            return '<a href="' + g.href + '"' + (ativo ? ' class="ativo" aria-current="page"' : "") + '><span data-icone="' + g.icone + '" data-tamanho="18"></span>' + g.rotulo + "</a>";
          }).join("") +
          "</nav>"
        : "") +
      // Cartão da prefeitura
      '<div class="sidebar__prefeitura">' +
      '<img src="assets/brasao.webp" alt="" width="30" height="47" onerror="this.hidden=true" />' +
      "<div><small>Prefeitura Municipal de</small><strong>Santa Rosa do Sul</strong></div>" +
      "</div>" +
      // Cartão do usuário + menu da engrenagem
      '<div class="sidebar__usuario' + (atual === "perfil.html" || atual === "configuracoes.html" ? " ativo" : "") + '">' +
      '<a class="sidebar__perfil" href="perfil.html" title="Meu perfil">' +
      '<span class="sidebar__avatar" style="background:' + Util.escapar(Auth.corAvatar()) + '">' + Util.escapar(Util.iniciais(nome)) + "</span>" +
      '<span class="sidebar__usuario-texto"><strong>' + Util.escapar(nome) + "</strong><small>" + Util.escapar(detalhe) + "</small></span>" +
      "</a>" +
      '<button type="button" class="sidebar__config" id="btn-menu-conta" aria-label="Menu da conta" title="Menu da conta" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-conta">' +
      '<span data-icone="settings" data-tamanho="18"></span></button>' +
      '<div class="menu-conta" id="menu-conta" role="menu" aria-label="Menu da conta" hidden>' +
      '<a role="menuitem" href="perfil.html"><span data-icone="user" data-tamanho="16"></span>Meu perfil</a>' +
      '<a role="menuitem" href="configuracoes.html"><span data-icone="settings" data-tamanho="16"></span>Configurações</a>' +
      gestao.map(function (g) {
        return '<a role="menuitem" href="' + g.href + '" class="menu-conta__gestao"><span data-icone="' + g.icone + '" data-tamanho="16"></span>' + g.rotulo + "</a>";
      }).join("") +
      '<button type="button" role="menuitemcheckbox" data-acao="tema" aria-checked="false"><span data-icone="moon" data-tamanho="16"></span>' +
      '<span class="menu-conta__rotulo">Modo escuro</span><span class="menu-conta__chave" aria-hidden="true"></span></button>' +
      '<hr />' +
      '<button type="button" role="menuitem" data-acao="sair" class="menu-conta__sair"><span data-icone="logout" data-tamanho="16"></span>Sair</button>' +
      "</div>" +
      "</div>";

    ligarMenuConta(sb);
  }

  /* ---------------- Menu da engrenagem ---------------- */
  function temaEscuro() {
    return document.documentElement.getAttribute("data-tema") === "escuro";
  }

  function ligarMenuConta(sb) {
    var botao = sb.querySelector("#btn-menu-conta");
    var menu = sb.querySelector("#menu-conta");
    if (!botao || !menu) return;
    var itemTema = menu.querySelector('[data-acao="tema"]');

    function itens() {
      // só os visíveis (os itens de Gestão ficam escondidos no computador)
      return Array.prototype.slice.call(menu.querySelectorAll('[role^="menuitem"]')).filter(function (i) {
        return i.offsetParent !== null;
      });
    }

    function atualizarTema() {
      var escuro = temaEscuro();
      itemTema.setAttribute("aria-checked", String(escuro));
      itemTema.querySelector("[data-icone]").setAttribute("data-icone", escuro ? "sun" : "moon");
    }

    function abrir(focarPrimeiro) {
      atualizarTema();
      menu.hidden = false;
      botao.setAttribute("aria-expanded", "true");
      if (focarPrimeiro) itens()[0].focus();
    }

    function fechar(devolverFoco) {
      if (menu.hidden) return;
      menu.hidden = true;
      botao.setAttribute("aria-expanded", "false");
      if (devolverFoco) botao.focus();
    }

    botao.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menu.hidden) abrir(e.detail === 0); // teclado (Enter/Espaço) já foca o 1º item
      else fechar();
    });

    menu.addEventListener("click", function (e) {
      var alvo = e.target.closest("[data-acao]");
      if (!alvo) return;
      if (alvo.getAttribute("data-acao") === "tema") {
        if (window.Config) {
          Config.salvar({ tema: temaEscuro() ? "claro" : "escuro" });
          document.dispatchEvent(new CustomEvent("studyflow:config"));
        }
        atualizarTema();
      } else if (alvo.getAttribute("data-acao") === "sair") {
        Auth.sair();
      }
    });

    menu.addEventListener("keydown", function (e) {
      var lista = itens();
      var i = lista.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        lista[(i + 1) % lista.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        lista[(i - 1 + lista.length) % lista.length].focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        lista[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        lista[lista.length - 1].focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        fechar(true);
      } else if (e.key === "Tab") {
        fechar();
      }
    });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target)) fechar();
    });
  }

  /* ---------------- Modais ---------------- */
  function abrirModal(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function semAnimacao() {
    return document.documentElement.getAttribute("data-animacoes") === "reduzidas" ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /** Fecha com uma animação curta de saída. */
  function fecharModal(dialog) {
    if (!dialog || !dialog.open || dialog.classList.contains("fechando")) return;
    var fechar = function () {
      dialog.classList.remove("fechando");
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    };
    if (semAnimacao()) return fechar();
    dialog.classList.add("fechando");
    setTimeout(fechar, 180);
  }

  // Tecla Esc também fecha com animação
  document.addEventListener(
    "cancel",
    function (e) {
      if (e.target.tagName === "DIALOG") {
        e.preventDefault();
        // Janelas obrigatórias (ex.: aceite dos Termos) não fecham com Esc
        if (!e.target.hasAttribute("data-obrigatorio")) fecharModal(e.target);
      }
    },
    true
  );

  /* ---------------- Números que contam ---------------- */
  /** Anima um número de onde está até "valor" (e dá um pulinho se mudou). */
  function contar(el, valor, duracao) {
    if (!el) return;
    var de = parseInt(el.textContent, 10);
    if (isNaN(de) || de === valor || semAnimacao()) {
      el.textContent = valor;
      return;
    }
    var inicio = null;
    var dur = duracao || 600;
    if (el._quadro) cancelAnimationFrame(el._quadro);
    function passo(t) {
      if (inicio === null) inicio = t;
      var p = Math.min(1, (t - inicio) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(de + (valor - de) * e);
      if (p < 1) el._quadro = requestAnimationFrame(passo);
    }
    el._quadro = requestAnimationFrame(passo);
    el.classList.remove("pulso");
    void el.offsetWidth;
    el.classList.add("pulso");
  }

  /* ---------------- Barras que deslizam entre re-renderizações ---------------- */
  /**
   * Roda "desenhar" (que troca o HTML de "alvo") mantendo as barras com
   * data-barra="id" deslizando da largura antiga para a nova.
   */
  function barrasSuaves(alvo, desenhar) {
    var antes = {};
    alvo.querySelectorAll("[data-barra]").forEach(function (b) {
      antes[b.getAttribute("data-barra")] = b.style.width;
    });
    desenhar();
    if (semAnimacao()) return;
    var mudar = [];
    alvo.querySelectorAll("[data-barra]").forEach(function (b) {
      var id = b.getAttribute("data-barra");
      if (antes[id] !== undefined && antes[id] !== b.style.width) {
        mudar.push([b, b.style.width]);
        b.style.transition = "none";
        b.style.width = antes[id];
      }
    });
    if (!mudar.length) return;
    void alvo.offsetWidth;
    mudar.forEach(function (m) {
      m[0].style.transition = "";
      m[0].style.width = m[1];
    });
  }

  document.addEventListener("click", function (e) {
    var fechar = e.target.closest("[data-fechar]");
    if (fechar) {
      fecharModal(fechar.closest("dialog"));
      return;
    }
    // Clique fora da caixa (no fundo escurecido) fecha o modal
    if (e.target.tagName === "DIALOG" && e.target.open && !e.target.hasAttribute("data-obrigatorio")) {
      var r = e.target.getBoundingClientRect();
      var dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!dentro) fecharModal(e.target);
    }
  });

  /* ---------------- Avisos ---------------- */
  var caixaAvisos = null;

  function aviso(texto, opcoes) {
    opcoes = opcoes || {};
    if (!caixaAvisos) {
      caixaAvisos = document.createElement("div");
      caixaAvisos.className = "avisos";
      caixaAvisos.setAttribute("role", "status");
      caixaAvisos.setAttribute("aria-live", "polite");
      document.body.appendChild(caixaAvisos);
    }
    var el = document.createElement("div");
    el.className = "aviso" + (opcoes.tipo ? " aviso--" + opcoes.tipo : "");
    el.innerHTML = (opcoes.icone ? '<span data-icone="' + opcoes.icone + '" data-tamanho="18"></span>' : "") + "<span>" + Util.escapar(texto) + "</span>";
    caixaAvisos.appendChild(el);
    setTimeout(function () {
      el.classList.add("aviso--saindo");
      setTimeout(function () {
        el.remove();
      }, 300);
    }, opcoes.duracao || 3200);
  }

  /* ---------------- Confete ---------------- */
  function confete() {
    var alvo = document.getElementById("confete");
    if (!alvo) {
      alvo = document.createElement("div");
      alvo.className = "confete";
      alvo.setAttribute("aria-hidden", "true");
      document.body.appendChild(alvo);
    }
    var cores = ["#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
    for (var i = 0; i < 60; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = cores[i % cores.length];
      p.style.animationDelay = Math.random() * 0.4 + "s";
      p.style.animationDuration = 1.2 + Math.random() * 0.9 + "s";
      p.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      alvo.appendChild(p);
    }
    setTimeout(function () {
      alvo.innerHTML = "";
    }, 2600);
  }

  window.Layout = {
    montarSidebar: montarSidebar,
    abrirModal: abrirModal,
    fecharModal: fecharModal,
    aviso: aviso,
    confete: confete,
    contar: contar,
    barrasSuaves: barrasSuaves,
    semAnimacao: semAnimacao,
  };

  montarSidebar();

  // Último acesso (aparece para o professor em "Minhas turmas")
  if (window.Auth && Auth.usuario()) Dados.salvar("ultimo-acesso", Date.now());

  // Cascata de entrada: só enquanto a página está abrindo
  document.body.classList.add("entrando");
  setTimeout(function () {
    document.body.classList.remove("entrando");
  }, 1500);
})();
