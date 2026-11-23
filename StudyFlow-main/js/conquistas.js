/* =========================================================
   StudyFlow — conquistas.js
   Carregado em todas as telas internas. Guarda:
   - Carteira: moedas do aluno
   - EstadoMascote: bem-estar, nível e roupas da Idebinha
   - Conquistas: estatísticas, desbloqueio e resgate
   ========================================================= */
(function () {
  "use strict";

  function avisar(texto, opcoes) {
    if (window.Layout) Layout.aviso(texto, opcoes);
  }

  /* =======================================================
     Carteira
     ======================================================= */
  var MOEDAS_INICIAIS = 50;

  var Carteira = {
    saldo: function () {
      return Dados.ler("moedas", MOEDAS_INICIAIS);
    },
    somar: function (n) {
      var s = Carteira.saldo() + n;
      Dados.salvar("moedas", s);
      document.dispatchEvent(new CustomEvent("moedas:mudou", { detail: s }));
      return s;
    },
    /** Retorna false se não houver moedas suficientes. */
    gastar: function (n) {
      if (Carteira.saldo() < n) return false;
      Carteira.somar(-n);
      return true;
    },
  };

  /* =======================================================
     Estado da Idebinha
     ======================================================= */
  var XP_POR_NIVEL = 100;

  // Aluno novo: Idebinha no nível 1, com os 3 itens grátis da loja
  var MASCOTE_PADRAO = {
    felicidade: 80,
    energia: 80,
    sabedoria: 30,
    xp: 0,
    atualizado: 0,
    itens: ["capelo", "oculos-leitura", "livro"],
    equipados: { cabeca: "capelo", rosto: "oculos-leitura", mao: "livro", pescoco: null },
  };

  // Conta de demonstração: já no nível 8 (mostra mais itens liberados na loja)
  var MASCOTE_DEMO = Object.assign({}, MASCOTE_PADRAO, { felicidade: 85, energia: 70, sabedoria: 60, xp: 700 });

  function lerBruto() {
    var e = Dados.ler("mascote", null);
    if (!e) {
      e = JSON.parse(JSON.stringify(Auth.ehDemo() ? MASCOTE_DEMO : MASCOTE_PADRAO));
      e.atualizado = Date.now();
      Dados.salvar("mascote", e);
    }
    return e;
  }

  var EstadoMascote = {
    /** Estado atual, já com o cansaço/fome das horas que passaram. */
    ler: function () {
      var e = lerBruto();
      var horas = Math.max(0, (Date.now() - (e.atualizado || Date.now())) / 3600000);
      var r = JSON.parse(JSON.stringify(e));
      r.felicidade = Math.round(Util.limitar(e.felicidade - horas * 1.5, 5, 100));
      r.energia = Math.round(Util.limitar(e.energia - horas * 2, 5, 100));
      r.sabedoria = Math.round(Util.limitar(e.sabedoria - horas * 0.5, 5, 100));
      r.nivel = 1 + Math.floor(r.xp / XP_POR_NIVEL);
      r.xpNoNivel = r.xp % XP_POR_NIVEL;
      return r;
    },

    salvar: function (estado) {
      var e = {
        felicidade: estado.felicidade,
        energia: estado.energia,
        sabedoria: estado.sabedoria,
        xp: estado.xp,
        atualizado: Date.now(),
        itens: estado.itens,
        equipados: estado.equipados,
      };
      Dados.salvar("mascote", e);
      document.dispatchEvent(new CustomEvent("mascote:mudou"));
      return EstadoMascote.ler();
    },

    /** Soma (ou tira) pontos. Ex.: ganhar({ energia: 20, xp: 10 }) */
    ganhar: function (delta) {
      var e = EstadoMascote.ler();
      var nivelAntes = e.nivel;
      ["felicidade", "energia", "sabedoria"].forEach(function (k) {
        if (delta[k]) e[k] = Util.limitar(e[k] + delta[k], 0, 100);
      });
      if (delta.xp) e.xp = Math.max(0, e.xp + delta.xp);
      var novo = EstadoMascote.salvar(e);
      if (novo.nivel > nivelAntes) {
        avisar("A Idebinha subiu para o nível " + novo.nivel + "!", { icone: "star", tipo: "sucesso" });
      }
      return novo;
    },

    titulo: function (nivel) {
      if (nivel >= 20) return "Lenda dos Estudos";
      if (nivel >= 14) return "Mestre dos Estudos";
      if (nivel >= 10) return "Estudante Exemplar";
      if (nivel >= 6) return "Estudante Dedicada";
      if (nivel >= 3) return "Estudante Curiosa";
      return "Estudante Iniciante";
    },

    tem: function (idItem) {
      return lerBruto().itens.indexOf(idItem) !== -1;
    },

    adicionarItem: function (idItem) {
      var e = EstadoMascote.ler();
      if (e.itens.indexOf(idItem) === -1) e.itens.push(idItem);
      return EstadoMascote.salvar(e);
    },

    /** Veste o item no seu lugar (ou tira, se já estiver vestido). */
    alternarItem: function (idItem, lugar) {
      var e = EstadoMascote.ler();
      e.equipados[lugar] = e.equipados[lugar] === idItem ? null : idItem;
      return EstadoMascote.salvar(e);
    },

    vestir: function (idItem, lugar) {
      var e = EstadoMascote.ler();
      e.equipados[lugar] = idItem;
      return EstadoMascote.salvar(e);
    },
  };

  /* =======================================================
     Conquistas
     ======================================================= */
  var LISTA = [
    { id: "boas-vindas", nome: "Boas-vindas!", desc: "Entre no StudyFlow pela primeira vez", icone: "star", cor: "azul", stat: "acessos", meta: 1, moedas: 10 },
    { id: "sequencia-3", nome: "3 dias seguidos", desc: "Estude 3 dias sem parar", icone: "flame", cor: "laranja", stat: "diasSeguidos", meta: 3, moedas: 20 },
    { id: "sequencia-7", nome: "7 dias seguidos", desc: "Fidelidade extrema", icone: "flame", cor: "laranja", stat: "diasSeguidos", meta: 7, moedas: 50 },
    { id: "sequencia-30", nome: "30 dias seguidos", desc: "Um mês inteiro de foco", icone: "crown", cor: "laranja", stat: "diasSeguidos", meta: 30, moedas: 100 },
    { id: "pomodoro-1", nome: "Primeiro foco", desc: "Complete uma sessão Pomodoro", icone: "clock", cor: "azul", stat: "pomodoros", meta: 1, moedas: 10 },
    { id: "pomodoro-10", nome: "Mestre do foco", desc: "Complete 10 sessões Pomodoro", icone: "clock", cor: "azul", stat: "pomodoros", meta: 10, moedas: 50 },
    { id: "pomodoro-50", nome: "Maratonista", desc: "Complete 50 sessões Pomodoro", icone: "zap", cor: "roxo", stat: "pomodoros", meta: 50, moedas: 100 },
    { id: "evento-1", nome: "Organizada", desc: "Crie seu primeiro evento no calendário", icone: "calendar", cor: "roxo", stat: "eventos", meta: 1, moedas: 10 },
    { id: "evento-10", nome: "Agenda cheia", desc: "Crie 10 eventos no calendário", icone: "calendarGrid", cor: "roxo", stat: "eventos", meta: 10, moedas: 30 },
    { id: "plano-1", nome: "Planejadora", desc: "Crie um plano de estudo", icone: "bookOpen", cor: "verde", stat: "planos", meta: 1, moedas: 15 },
    { id: "dias-5", nome: "Dia após dia", desc: "Conclua 5 dias de estudo dos planos", icone: "checkSquare", cor: "verde", stat: "diasConcluidos", meta: 5, moedas: 30 },
    { id: "dias-20", nome: "Esforço reconhecido", desc: "Conclua 20 dias de estudo dos planos", icone: "trophy", cor: "verde", stat: "diasConcluidos", meta: 20, moedas: 80 },
    { id: "metas-5", nome: "Metas em dia", desc: "Conclua 5 metas da semana", icone: "target", cor: "verde", stat: "metas", meta: 5, moedas: 20 },
    { id: "ia-5", nome: "Curiosa", desc: "Faça 5 perguntas ao Assistente de IA", icone: "sparkles", cor: "roxo", stat: "perguntas", meta: 5, moedas: 20 },
    { id: "ia-25", nome: "Mestre em perguntas", desc: "Faça 25 perguntas ao Assistente de IA", icone: "lightbulb", cor: "roxo", stat: "perguntas", meta: 25, moedas: 50 },
    { id: "carinho-10", nome: "Melhores amigas", desc: "Faça 10 carinhos na Idebinha", icone: "heart", cor: "vermelho", stat: "carinhos", meta: 10, moedas: 15 },
    { id: "alimentar-5", nome: "Bem alimentada", desc: "Alimente a Idebinha 5 vezes", icone: "cookie", cor: "laranja", stat: "alimentou", meta: 5, moedas: 15 },
    { id: "estudar-junto-10", nome: "Dupla de estudos", desc: "Estude junto com a Idebinha 10 vezes", icone: "graduationCap", cor: "azul", stat: "estudouJunto", meta: 10, moedas: 30 },
    { id: "compra-1", nome: "Primeira compra", desc: "Compre um acessório na loja", icone: "cart", cor: "azul", stat: "compras", meta: 1, moedas: 10 },
    { id: "compra-5", nome: "Colecionadora", desc: "Compre 5 acessórios na loja", icone: "gift", cor: "vermelho", stat: "compras", meta: 5, moedas: 40 },
  ];

  function lerStats() {
    return Dados.ler("estatisticas", {});
  }

  function lerEstado() {
    return Dados.ler("conquistas", {});
  }

  function verificar() {
    var stats = lerStats();
    var estado = lerEstado();
    var novas = [];
    LISTA.forEach(function (c) {
      if (!estado[c.id] && (stats[c.stat] || 0) >= c.meta) {
        estado[c.id] = { em: Date.now(), resgatada: false };
        novas.push(c);
      }
    });
    if (novas.length) {
      Dados.salvar("conquistas", estado);
      novas.forEach(function (c) {
        avisar("Conquista desbloqueada: " + c.nome + " (+" + c.moedas + " moedas para resgatar)", { icone: "trophy", tipo: "moedas", duracao: 4500 });
      });
      document.dispatchEvent(new CustomEvent("conquistas:mudou"));
    }
    return novas;
  }

  var Conquistas = {
    LISTA: LISTA,

    stats: lerStats,

    /** Soma n a uma estatística (ex.: "pomodoros") e confere conquistas. */
    registrar: function (stat, n) {
      var s = lerStats();
      s[stat] = (s[stat] || 0) + (n == null ? 1 : n);
      Dados.salvar("estatisticas", s);
      verificar();
      return s[stat];
    },

    definir: function (stat, valor) {
      var s = lerStats();
      s[stat] = valor;
      Dados.salvar("estatisticas", s);
      verificar();
    },

    verificar: verificar,

    /** Lista completa com progresso de cada conquista. */
    lista: function () {
      var stats = lerStats();
      var estado = lerEstado();
      return LISTA.map(function (c) {
        var atual = Math.min(stats[c.stat] || 0, c.meta);
        var e = estado[c.id];
        return Object.assign({}, c, {
          atual: atual,
          progresso: Math.round((atual / c.meta) * 100),
          desbloqueada: !!e,
          resgatada: !!(e && e.resgatada),
          em: e ? e.em : 0,
        });
      });
    },

    recentes: function (n) {
      return Conquistas.lista()
        .filter(function (c) {
          return c.desbloqueada;
        })
        .sort(function (a, b) {
          return b.em - a.em;
        })
        .slice(0, n || 3);
    },

    pendentes: function () {
      return Conquistas.lista().filter(function (c) {
        return c.desbloqueada && !c.resgatada;
      });
    },

    /** Entrega as moedas de uma conquista. Retorna quantas moedas deu. */
    resgatar: function (id) {
      var estado = lerEstado();
      var def = LISTA.filter(function (c) {
        return c.id === id;
      })[0];
      if (!def || !estado[id] || estado[id].resgatada) return 0;
      estado[id].resgatada = true;
      Dados.salvar("conquistas", estado);
      Carteira.somar(def.moedas);
      document.dispatchEvent(new CustomEvent("conquistas:mudou"));
      return def.moedas;
    },

    /** Item da lista grande (telas Conquistas e Perfil). */
    itemHTML: function (c) {
      var classes = "conquista";
      if (!c.desbloqueada) classes += " conquista--bloqueada";
      else if (!c.resgatada) classes += " conquista--resgatar";
      else classes += " conquista--resgatada";

      var rodape;
      if (!c.desbloqueada) {
        rodape =
          '<div class="conquista__progresso"><div class="barra__trilho"><div class="barra__preenchido barra__preenchido--sabedoria" style="width:' +
          c.progresso + '%"></div></div><span>' + c.atual + "/" + c.meta + "</span></div>" +
          '<div class="conquista__rodape"><span class="conquista__premio"><span data-icone="coins" data-tamanho="14"></span>' + c.moedas + " moedas</span></div>";
      } else if (!c.resgatada) {
        rodape =
          '<div class="conquista__rodape"><span class="conquista__premio"><span data-icone="coins" data-tamanho="14"></span>' + c.moedas +
          ' moedas</span><button type="button" class="botao-primario conquista__resgatar" data-resgatar="' + c.id + '">Resgatar</button></div>';
      } else {
        rodape =
          '<div class="conquista__rodape"><span class="conquista__premio conquista__ok"><span data-icone="check" data-tamanho="14"></span>' +
          c.moedas + " moedas resgatadas</span></div>";
      }

      return (
        '<li class="' + classes + '" data-id="' + c.id + '">' +
        '<span class="conquista__icone conquista__icone--' + c.cor + '"><span data-icone="' + c.icone + '" data-tamanho="20"></span></span>' +
        '<div class="conquista__texto"><strong class="conquista__nome">' + Util.escapar(c.nome) + "</strong>" +
        '<p class="conquista__descricao">' + Util.escapar(c.desc) + "</p>" + rodape + "</div></li>"
      );
    },

    /** Item pequeno (Conquistas Recentes da tela Mascote). */
    miniHTML: function (c) {
      return (
        '<li><span class="icone-caixa icone-caixa--' + c.cor + '"><span data-icone="' + c.icone + '" data-tamanho="16"></span></span>' +
        "<div><strong>" + Util.escapar(c.nome) + "</strong><span>" + Util.escapar(c.desc) + "</span></div></li>"
      );
    },
  };

  /* ---------- Dias seguidos ---------- */
  function marcarDia() {
    var hoje = Util.hojeISO();
    var ultimo = Dados.ler("ultimoAcesso", null);
    if (ultimo === hoje) return;
    var stats = lerStats();
    var seguidos = 1;
    if (ultimo && Util.diasEntre(Util.data(ultimo), Util.hoje()) === 1) {
      seguidos = (stats.diasSeguidos || 0) + 1;
    }
    Dados.salvar("ultimoAcesso", hoje);
    stats.diasSeguidos = seguidos;
    stats.recordeSequencia = Math.max(stats.recordeSequencia || 0, seguidos);
    stats.acessos = (stats.acessos || 0) + 1;
    Dados.salvar("estatisticas", stats);
  }

  window.Carteira = Carteira;
  window.EstadoMascote = EstadoMascote;
  window.Conquistas = Conquistas;

  if (window.Auth && Auth.usuario()) {
    marcarDia();
    // Espera a página montar antes de mostrar avisos de conquistas
    document.addEventListener("DOMContentLoaded", verificar);
  }
})();
