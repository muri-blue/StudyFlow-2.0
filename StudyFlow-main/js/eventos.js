/* =========================================================
   StudyFlow — eventos.js
   Eventos do calendário (provas, tarefas e trabalhos).
   Usado pelo Calendário e pela tela Estudar.
   ========================================================= */
(function () {
  "use strict";

  var TIPOS = { tarefa: "Tarefa", prova: "Prova", trabalho: "Trabalho" };
  var PRIORIDADES = { alta: "Alta", media: "Média", baixa: "Baixa" };

  function exemplos() {
    var h = Util.hoje();
    function d(n) {
      return Util.iso(Util.somarDias(h, n));
    }
    return [
      { titulo: "Revisão de Cálculo I", data: d(0), hora: "08:00", materia: "Matemática", tipo: "tarefa", prioridade: "alta" },
      { titulo: "Entregar relatório de Lab", data: d(0), hora: "14:00", materia: "Física", tipo: "trabalho", prioridade: "media" },
      { titulo: "Prova de Histologia", data: d(0), hora: "18:30", materia: "Biologia", tipo: "prova", prioridade: "alta" },
      { titulo: "Trabalho de História", data: d(2), hora: "10:00", materia: "História", tipo: "trabalho", prioridade: "alta" },
      { titulo: "Prova de Matemática", data: d(4), hora: "08:00", materia: "Matemática", tipo: "prova", prioridade: "alta" },
      { titulo: "Prova de Ciências", data: d(7), hora: "09:30", materia: "Ciências", tipo: "prova", prioridade: "alta" },
      { titulo: "Lista de exercícios", data: d(-11), hora: "08:00", materia: "Matemática", tipo: "tarefa", prioridade: "baixa" },
      { titulo: "Redação", data: d(-6), hora: "08:00", materia: "Português", tipo: "tarefa", prioridade: "media" },
      { titulo: "Prova de Geografia", data: d(-5), hora: "10:00", materia: "Geografia", tipo: "prova", prioridade: "alta" },
      { titulo: "Exercícios de Inglês", data: d(3), hora: "15:00", materia: "Inglês", tipo: "tarefa", prioridade: "baixa" },
      { titulo: "Maquete de Artes", data: d(11), hora: "13:30", materia: "Artes", tipo: "trabalho", prioridade: "media" },
      { titulo: "Questionário", data: d(13), hora: "08:00", materia: "Ciências", tipo: "tarefa", prioridade: "media" },
    ].map(function (e) {
      e.id = Util.id();
      return e;
    });
  }

  function ler() {
    var lista = Dados.ler("eventos", null);
    if (lista === null) lista = Dados.salvar("eventos", Auth.ehDemo() ? exemplos() : []);
    return lista;
  }

  /**
   * Eventos que o professor criou para a turma do aluno (js/rede.js).
   * Só leitura para o aluno: aparecem com "daTurma: true".
   * Hoje vêm deste navegador; com o servidor, virão do banco.
   */
  function daTurma() {
    var u = window.Auth && Auth.usuario();
    if (!u || !u.turmaId) return [];
    try {
      return JSON.parse(localStorage.getItem("studyflow:rede:eventos-turma") || "[]")
        .filter(function (e) {
          return e.turmaId === u.turmaId;
        })
        .map(function (e) {
          return Object.assign({}, e, { daTurma: true });
        });
    } catch (e) {
      return [];
    }
  }

  function ordenar(a, b) {
    return (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || ""));
  }

  var Eventos = {
    TIPOS: TIPOS,
    PRIORIDADES: PRIORIDADES,

    /** Eventos do aluno + os que o professor criou para a turma. */
    todos: function () {
      return ler().concat(daTurma()).sort(ordenar);
    },

    doDia: function (iso) {
      return Eventos.todos().filter(function (e) {
        return e.data === iso;
      });
    },

    entre: function (inicioISO, fimISO) {
      return Eventos.todos().filter(function (e) {
        return e.data >= inicioISO && e.data <= fimISO;
      });
    },

    buscar: function (id) {
      return ler().filter(function (e) {
        return e.id === id;
      })[0] || null;
    },

    adicionar: function (dados) {
      var lista = ler();
      var ev = {
        id: Util.id(),
        titulo: String(dados.titulo || "").trim(),
        data: dados.data,
        hora: dados.hora || "",
        materia: String(dados.materia || "").trim(),
        tipo: TIPOS[dados.tipo] ? dados.tipo : "tarefa",
        prioridade: PRIORIDADES[dados.prioridade] ? dados.prioridade : "media",
      };
      lista.push(ev);
      Dados.salvar("eventos", lista);
      if (window.Conquistas) {
        Conquistas.registrar("eventos");
      }
      if (window.EstadoMascote) EstadoMascote.ganhar({ xp: 5 });
      return ev;
    },

    atualizar: function (id, dados) {
      var lista = ler().map(function (e) {
        return e.id === id ? Object.assign({}, e, dados, { id: id }) : e;
      });
      Dados.salvar("eventos", lista);
    },

    remover: function (id) {
      Dados.salvar(
        "eventos",
        ler().filter(function (e) {
          return e.id !== id;
        })
      );
    },
  };

  window.Eventos = Eventos;
})();
