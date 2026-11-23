/* =========================================================
   StudyFlow — auth.js
   Sessão do usuário, armazenamento por usuário (Dados)
   e utilitários de data/texto (Util).
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- Utilitários ---------------- */
  var MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  var MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  function dois(n) {
    return (n < 10 ? "0" : "") + n;
  }

  var Util = {
    MESES: MESES,
    MESES_CURTOS: MESES_CURTOS,

    /** Date → "AAAA-MM-DD" (horário local) */
    iso: function (d) {
      return d.getFullYear() + "-" + dois(d.getMonth() + 1) + "-" + dois(d.getDate());
    },

    /** "AAAA-MM-DD" → Date (meia-noite local) */
    data: function (iso) {
      var p = String(iso).split("-");
      return new Date(+p[0], +p[1] - 1, +p[2]);
    },

    hoje: function () {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },

    hojeISO: function () {
      return Util.iso(new Date());
    },

    somarDias: function (d, n) {
      var r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
      return r;
    },

    /** Diferença em dias inteiros (b - a) */
    diasEntre: function (a, b) {
      var ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      var ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
      return Math.round((ub - ua) / 86400000);
    },

    /** "14 Ago" */
    dataCurta: function (d) {
      return d.getDate() + " " + MESES_CURTOS[d.getMonth()];
    },

    /** "Hoje", "Ontem" ou "12 Ago" */
    dataRelativa: function (iso) {
      var d = Util.data(iso);
      var dif = Util.diasEntre(d, Util.hoje());
      if (dif === 0) return "Hoje";
      if (dif === 1) return "Ontem";
      return Util.dataCurta(d);
    },

    /** Segunda-feira da semana de d */
    inicioSemana: function (d) {
      var dia = (d.getDay() + 6) % 7; // 0 = segunda
      return Util.somarDias(d, -dia);
    },

    escapar: function (txt) {
      return String(txt == null ? "" : txt)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },

    id: function () {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },

    limitar: function (n, min, max) {
      return Math.max(min, Math.min(max, n));
    },

    iniciais: function (nome) {
      var partes = String(nome || "?").trim().split(/\s+/);
      var a = partes[0] ? partes[0][0] : "?";
      var b = partes.length > 1 ? partes[partes.length - 1][0] : "";
      return (a + b).toUpperCase();
    },

    semAcento: function (txt) {
      return String(txt || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
    },
  };

  /* ---------------- Sessão ---------------- */
  /* A sessão fica no sessionStorage: some ao fechar o navegador
     (importante em computadores compartilhados da escola).
     Os dados do aluno continuam no localStorage. */
  var CHAVE_SESSAO = "studyflow:sessao";

  // Versões antigas guardavam a sessão no localStorage: limpa
  try {
    localStorage.removeItem(CHAVE_SESSAO);
  } catch (e) {}

  function lerSessao() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || "null");
    } catch (e) {
      return null;
    }
  }

  var Auth = {
    /** Confere matrícula e senha com a lista de contas (data/contas.js). */
    entrar: function (matricula, senha) {
      var contas = window.CONTAS || [];
      var m = String(matricula || "").trim().toLowerCase();
      var conta = null;
      for (var i = 0; i < contas.length; i++) {
        if (String(contas[i].matricula).toLowerCase() === m && contas[i].senha === senha) {
          conta = contas[i];
          break;
        }
      }
      if (!conta) return null;
      var usuario = {
        matricula: conta.matricula,
        nome: conta.nome,
        papel: conta.papel || "Aluno(a)",
        turma: conta.turma || null,
        escola: conta.escola || null,
        demo: !!conta.demo,
        acessos: conta.acessos || [],
        turmaId: conta.turmaId || null,
        turmas: conta.turmas || [],
      };
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
      return usuario;
    },

    sair: function () {
      sessionStorage.removeItem(CHAVE_SESSAO);
      window.location.href = "index.html";
    },

    usuario: function () {
      return lerSessao();
    },

    /** Conta de demonstração: começa com dados de exemplo. Aluno de verdade começa vazio. */
    ehDemo: function () {
      var u = lerSessao();
      return !!(u && u.demo);
    },

    /**
     * A conta pode abrir esta tela de gestão? ("professor" ou "secretaria")
     * ATENÇÃO: conferência só no navegador, serve para a demonstração.
     * Com o servidor, quem garante o acesso são as regras do banco.
     */
    pode: function (acesso) {
      var u = lerSessao();
      return !!(u && u.acessos && u.acessos.indexOf(acesso) !== -1);
    },

    /** Para as telas de gestão: quem não tem acesso volta ao início. */
    exigir: function (acesso) {
      if (!Auth.pode(acesso)) window.location.replace("calendario.html");
    },

    /** Nome exibido: apelido escolhido no perfil, se houver. */
    nomeExibido: function () {
      var u = lerSessao();
      if (!u) return "";
      var perfil = Dados.ler("perfil", {});
      return (perfil.apelido && perfil.apelido.trim()) || u.nome;
    },

    corAvatar: function () {
      return Dados.ler("perfil", {}).cor || "#4f46e5";
    },
  };

  /* ---------------- Dados por usuário ---------------- */
  function prefixo() {
    var u = lerSessao();
    return "studyflow:" + (u ? u.matricula : "anonimo") + ":";
  }

  var Dados = {
    ler: function (chave, padrao) {
      try {
        var v = localStorage.getItem(prefixo() + chave);
        return v === null ? padrao : JSON.parse(v);
      } catch (e) {
        return padrao;
      }
    },
    salvar: function (chave, valor) {
      try {
        localStorage.setItem(prefixo() + chave, JSON.stringify(valor));
      } catch (e) {}
      return valor;
    },
    remover: function (chave) {
      localStorage.removeItem(prefixo() + chave);
    },
    /** Todas as chaves deste usuário (sem o prefixo). */
    chaves: function () {
      var p = prefixo();
      var lista = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(p) === 0) lista.push(k.slice(p.length));
      }
      return lista;
    },
    exportar: function () {
      var out = {};
      Dados.chaves().forEach(function (k) {
        out[k] = Dados.ler(k, null);
      });
      return out;
    },
    apagarTudo: function () {
      Dados.chaves().forEach(function (k) {
        Dados.remover(k);
      });
    },
  };

  window.Util = Util;
  window.Auth = Auth;
  window.Dados = Dados;

  /* ---------------- Proteção das páginas ---------------- */
  var naTelaDeLogin = !!document.getElementById("form-login");
  if (naTelaDeLogin) {
    if (lerSessao()) window.location.replace("calendario.html");
  } else if (!lerSessao()) {
    window.location.replace("index.html");
  }
})();
