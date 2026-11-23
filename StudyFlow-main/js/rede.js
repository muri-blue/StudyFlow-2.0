/* =========================================================
   StudyFlow — rede.js
   Dados da rede municipal (escolas, turmas, alunos) para as
   telas de gestão: Minhas turmas, Painel da rede e Cadastro.

   HOJE: as 4 escolas são as da rede; turmas e alunos são de
   EXEMPLO, gerados aqui mesmo (sempre iguais), com nomes
   fictícios. Nenhum aluno real.
   O "Aluno Teste" (matrícula "aluno") aparece no 8º ano A da
   EMEB Governador Pedro Ivo Campos com a atividade real dele
   neste navegador.

   DEPOIS (servidor): troque só o miolo destas funções por
   chamadas ao Supabase. Todas já devolvem Promise, como um
   banco de dados devolveria, então as telas não mudam.
   ========================================================= */
(function () {
  "use strict";

  var CHAVE_EVENTOS = "studyflow:rede:eventos-turma"; // mesma chave lida por eventos.js e lembretes.js
  var CHAVE_IMPORTADOS = "studyflow:rede:alunos-importados";

  /* ---------------- Sorteio que sempre dá o mesmo resultado ---------------- */
  function semente(texto) {
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function sorteador(texto) {
    var a = semente(texto);
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function entre(r, min, max) {
    return Math.floor(min + r() * (max - min + 1));
  }

  /* ---------------- Escolas e turmas (fictícias) ---------------- */
  // As 4 escolas da rede municipal. As TURMAS e os ALUNOS abaixo são
  // de exemplo (quantidade de turmas e nomes inventados) até o banco chegar.
  var ESCOLAS = [
    { id: "pedroivo", nome: "EMEB Governador Pedro Ivo Campos", engajamento: 0.8 },
    { id: "alzira", nome: "EMEB Alzira Ramos de Souza", engajamento: 0.72 },
    { id: "hercilio", nome: "EMEB Professor Hercílio de Faveri", engajamento: 0.62 },
    { id: "anaregis", nome: "EMEB Ana Régis Arantes", engajamento: 0.68 },
  ];

  // Do 1º ao 9º ano, turma A em todas; algumas séries com turma B
  var TURMAS_B = { pedroivo: [6, 8], alzira: [7], hercilio: [], anaregis: [8] };
  var TURMAS_POR_ESCOLA = {};
  ESCOLAS.forEach(function (e) {
    var lista = [];
    for (var ano = 1; ano <= 9; ano++) {
      lista.push(ano + "º ano A");
      if (TURMAS_B[e.id].indexOf(ano) !== -1) lista.push(ano + "º ano B");
    }
    TURMAS_POR_ESCOLA[e.id] = lista;
  });

  var PROFESSORES = ["Prof.ª Ana", "Prof. Bruno", "Prof.ª Carla", "Prof.ª Denise", "Prof. Eduardo", "Prof.ª Fernanda", "Prof.ª Gabriela", "Prof. Henrique"];

  var NOMES = ["Ana", "Arthur", "Beatriz", "Bernardo", "Clara", "Davi", "Eduarda", "Enzo", "Gabriel", "Giovana", "Heitor", "Helena", "Isabela", "Joaquim", "Júlia", "Laura", "Lorenzo", "Lucas", "Luiza", "Manuela", "Maria", "Miguel", "Nicolas", "Pedro", "Rafael", "Samuel", "Sofia", "Theo", "Valentina", "Yasmin"];
  var SOBRENOMES = ["Alves", "Becker", "Cardoso", "Costa", "Fernandes", "Gomes", "Hoffmann", "Lima", "Machado", "Martins", "Oliveira", "Pereira", "Ribeiro", "Rocha", "Santos", "Schmidt", "Silva", "Souza", "Vieira", "Zanella"];

  // id da turma: escola + série + letra (ex.: "pedroivo-8a")
  function idTurma(escolaId, nome) {
    var m = nome.match(/^(\d+)º ano ([A-Z])$/);
    return escolaId + "-" + m[1] + m[2].toLowerCase();
  }

  var TURMAS = [];
  ESCOLAS.forEach(function (e) {
    TURMAS_POR_ESCOLA[e.id].forEach(function (nome) {
      var r = sorteador(e.id + nome);
      TURMAS.push({
        id: idTurma(e.id, nome),
        escolaId: e.id,
        escola: e.nome,
        nome: nome,
        serie: parseInt(nome, 10), // 1 a 9: o ranking junta todas as turmas da mesma série
        professor: PROFESSORES[entre(r, 0, PROFESSORES.length - 1)],
        tamanho: entre(r, 17, 27),
      });
    });
  });

  function turmaPorId(id) {
    return TURMAS.filter(function (t) {
      return t.id === id;
    })[0] || null;
  }

  /* ---------------- Alunos (fictícios) ---------------- */
  var DIA = 86400000;

  function alunoFicticio(turma, n, engajamento) {
    var r = sorteador(turma.id + ":" + n);
    var ativo = r() < engajamento;
    var diasSemAcesso = ativo ? entre(r, 0, 6) : entre(r, 8, 40);
    if (r() < 0.06) diasSemAcesso = null; // nunca entrou
    var nome = NOMES[entre(r, 0, NOMES.length - 1)] + " " + SOBRENOMES[entre(r, 0, SOBRENOMES.length - 1)];
    var foco = diasSemAcesso === null ? 0 : ativo ? entre(r, 2, 18) : entre(r, 0, 3);
    var a = {
      matricula: "2026" + String(semente(turma.id + n) % 100000).padStart(5, "0"),
      nome: nome,
      ficticio: true,
      ultimoAcesso: diasSemAcesso === null ? null : Date.now() - diasSemAcesso * DIA - entre(r, 0, 20) * 3600000,
      sessoesFoco: foco,
      progressoPlanos: diasSemAcesso === null ? 0 : ativo ? entre(r, 35, 100) : entre(r, 0, 40),
      perguntas: diasSemAcesso === null ? 0 : entre(r, 0, ativo ? 22 : 4),
      diasSeguidos: ativo ? entre(r, 1, 12) : 0,
      conquistas: diasSemAcesso === null ? 0 : entre(r, 1, ativo ? 11 : 4),
      diasConcluidos: diasSemAcesso === null ? 0 : entre(r, 0, ativo ? 20 : 4),
      metas: diasSemAcesso === null ? 0 : entre(r, 0, ativo ? 12 : 2),
      foraDoRanking: r() < 0.05, // alguns alunos escolhem não aparecer
    };
    a.pontos = pontos(a);
    return a;
  }

  /**
   * Pontos do ranking: só o que é ESTUDO (perguntas ao Assistente não contam,
   * para ninguém ganhar pontos só mandando mensagem).
   */
  var PONTOS = { sessoesFoco: 10, diasConcluidos: 15, metas: 5, conquistas: 20, diasSeguidos: 5 };

  function pontos(a) {
    return Object.keys(PONTOS).reduce(function (s, k) {
      return s + (a[k] || 0) * PONTOS[k];
    }, 0);
  }

  /** O Aluno Teste com o que ele fez de verdade neste navegador. */
  function alunoTeste() {
    function ler(chave, padrao) {
      try {
        var v = localStorage.getItem("studyflow:aluno:" + chave);
        return v === null ? padrao : JSON.parse(v);
      } catch (e) {
        return padrao;
      }
    }
    var stats = ler("estatisticas", {});
    var planos = ler("planos", []);
    var total = 0, feitos = 0;
    planos.forEach(function (p) {
      (p.dias || []).forEach(function (d) {
        (d.topicos || []).forEach(function (t) {
          total++;
          if (t.feito) feitos++;
        });
      });
    });
    var a = {
      matricula: "aluno",
      nome: "Aluno Teste",
      ficticio: false,
      ultimoAcesso: ler("ultimo-acesso", null),
      sessoesFoco: stats.pomodoros || 0,
      progressoPlanos: total ? Math.round((feitos / total) * 100) : 0,
      perguntas: stats.perguntas || 0,
      diasSeguidos: stats.diasSeguidos || 0,
      conquistas: Object.keys(ler("conquistas", {})).length,
      diasConcluidos: stats.diasConcluidos || 0,
      metas: stats.metas || 0,
      foraDoRanking: ler("perfil", {}).ranking === false,
    };
    a.pontos = pontos(a);
    return a;
  }

  function alunosDaTurmaSync(turmaId) {
    var t = turmaPorId(turmaId);
    if (!t) return [];
    var esc = ESCOLAS.filter(function (e) {
      return e.id === t.escolaId;
    })[0];
    var lista = [];
    for (var i = 0; i < t.tamanho; i++) lista.push(alunoFicticio(t, i, esc.engajamento));
    if (turmaId === "pedroivo-8a") lista.unshift(alunoTeste());
    return lista.sort(function (a, b) {
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }

  /* ---------------- Contas para o painel ---------------- */
  var SETE_DIAS = 7 * DIA;

  function ativoNaSemana(a) {
    return a.ultimoAcesso !== null && Date.now() - a.ultimoAcesso <= SETE_DIAS;
  }

  function resumir(alunos) {
    var n = alunos.length || 1;
    var ativos = alunos.filter(ativoNaSemana).length;
    var soma = function (campo) {
      return alunos.reduce(function (s, a) {
        return s + (a[campo] || 0);
      }, 0);
    };
    return {
      alunos: alunos.length,
      ativos: ativos,
      ativosPct: Math.round((ativos / n) * 100),
      nuncaEntraram: alunos.filter(function (a) {
        return a.ultimoAcesso === null;
      }).length,
      sessoesFoco: soma("sessoesFoco"),
      focoPorAluno: Math.round((soma("sessoesFoco") / n) * 10) / 10,
      progressoMedio: Math.round(soma("progressoPlanos") / n),
      perguntas: soma("perguntas"),
    };
  }

  /* ---------------- Eventos para a turma ---------------- */
  function lerEventos() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_EVENTOS) || "[]");
    } catch (e) {
      return [];
    }
  }

  function salvarEventos(lista) {
    localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(lista));
  }

  /* ---------------- Alunos importados (cadastro em lote) ---------------- */
  function lerImportados() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_IMPORTADOS) || "[]");
    } catch (e) {
      return [];
    }
  }

  function pronto(valor) {
    return Promise.resolve(valor);
  }

  /* ---------------- API (troque por chamadas ao banco) ---------------- */
  var Rede = {
    EXEMPLO: true, // as telas mostram o aviso "Dados de exemplo" enquanto isso for true

    escolas: function () {
      return pronto(ESCOLAS.map(function (e) {
        return { id: e.id, nome: e.nome };
      }));
    },

    /** Turmas da professora/professor logado (data/contas.js → turmas). */
    minhasTurmas: function () {
      var u = Auth.usuario() || {};
      return pronto((u.turmas || []).map(turmaPorId).filter(Boolean));
    },

    alunosDaTurma: function (turmaId) {
      return pronto(alunosDaTurmaSync(turmaId));
    },

    /** Painel da Secretaria: só números agregados, sem nomes de alunos (LGPD). */
    resumoDaRede: function () {
      var porEscola = ESCOLAS.map(function (e) {
        var turmas = TURMAS.filter(function (t) {
          return t.escolaId === e.id;
        });
        var alunos = [];
        var porTurma = turmas.map(function (t) {
          var lista = alunosDaTurmaSync(t.id);
          alunos = alunos.concat(lista);
          return Object.assign({ id: t.id, nome: t.nome, professor: t.professor }, resumir(lista));
        });
        return Object.assign({ id: e.id, nome: e.nome, turmas: porTurma }, resumir(alunos));
      });
      var todos = [];
      ESCOLAS.forEach(function (e) {
        TURMAS.filter(function (t) {
          return t.escolaId === e.id;
        }).forEach(function (t) {
          todos = todos.concat(alunosDaTurmaSync(t.id));
        });
      });
      return pronto({ rede: resumir(todos), escolas: porEscola, totalTurmas: TURMAS.length });
    },

    eventosDaTurma: function (turmaId) {
      return pronto(lerEventos().filter(function (e) {
        return e.turmaId === turmaId;
      }).sort(function (a, b) {
        return (a.data + a.hora).localeCompare(b.data + b.hora);
      }));
    },

    criarEventoTurma: function (turmaId, dados) {
      var u = Auth.usuario() || {};
      var ev = {
        id: "t" + Util.id(),
        turmaId: turmaId,
        titulo: String(dados.titulo || "").trim(),
        data: dados.data,
        hora: dados.hora || "",
        materia: String(dados.materia || "").trim(),
        tipo: dados.tipo || "tarefa",
        prioridade: dados.tipo === "prova" ? "alta" : "media",
        professor: Auth.nomeExibido() || u.nome || "Professor(a)",
        criadoEm: Date.now(),
      };
      var lista = lerEventos();
      lista.push(ev);
      salvarEventos(lista);
      return pronto(ev);
    },

    removerEventoTurma: function (id) {
      salvarEventos(lerEventos().filter(function (e) {
        return e.id !== id;
      }));
      return pronto(true);
    },

    /** Cadastro em lote: hoje guarda neste navegador. No servidor, cria as contas de verdade. */
    salvarAlunosImportados: function (alunos) {
      var lista = lerImportados();
      var existentes = {};
      lista.forEach(function (a) {
        existentes[a.matricula] = true;
      });
      var novos = alunos.filter(function (a) {
        return !existentes[a.matricula];
      }).map(function (a) {
        return Object.assign({}, a, { importadoEm: Date.now() });
      });
      localStorage.setItem(CHAVE_IMPORTADOS, JSON.stringify(lista.concat(novos)));
      return pronto({ salvos: novos.length, repetidos: alunos.length - novos.length });
    },

    alunosImportados: function () {
      return pronto(lerImportados());
    },

    apagarImportados: function () {
      localStorage.removeItem(CHAVE_IMPORTADOS);
      return pronto(true);
    },

    /** Para validar o cadastro: nomes das escolas e turmas que existem. */
    turmasDaRede: function () {
      return pronto(TURMAS.map(function (t) {
        return { id: t.id, escolaId: t.escolaId, escola: t.escola, nome: t.nome, serie: t.serie };
      }));
    },

    /** Turmas cujo ranking a conta pode ver: a do aluno, ou as do professor. */
    turmasDoRanking: function () {
      var u = Auth.usuario() || {};
      var ids = u.turmaId ? [u.turmaId] : u.turmas || [];
      return pronto(ids.map(turmaPorId).filter(Boolean));
    },

    PONTOS: PONTOS,

    /**
     * Ranking de UMA turma: só os alunos daquela turma competem entre si
     * (nada de misturar com outras turmas ou escolas).
     * Mostra só "Nome S." (primeiro nome + inicial) e respeita quem
     * escolheu não aparecer. Quem nunca entrou não entra no ranking.
     */
    rankingDaTurma: function (turmaId) {
      var u = Auth.usuario() || {};
      var t = turmaPorId(turmaId);
      if (!t) return pronto(null);
      var alunos = alunosDaTurmaSync(t.id);
      var participantes = alunos.filter(function (a) {
        return a.ultimoAcesso !== null && !a.foraDoRanking;
      });
      participantes.sort(function (a, b) {
        return b.pontos - a.pontos || a.nome.localeCompare(b.nome, "pt-BR");
      });
      var lista = participantes.map(function (a, i) {
        var partes = a.nome.split(" ");
        return {
          posicao: i + 1,
          nome: partes[0] + (partes.length > 1 ? " " + partes[partes.length - 1][0] + "." : ""),
          pontos: a.pontos,
          voce: a.matricula === u.matricula,
        };
      });
      var eu = alunos.filter(function (a) {
        return a.matricula === u.matricula;
      })[0];
      return pronto({
        turma: { id: t.id, nome: t.nome, escola: t.escola },
        totalAlunos: alunos.length,
        lista: lista,
        voce: eu ? { foraDoRanking: !!eu.foraDoRanking, pontos: eu.pontos } : null,
      });
    },

    ativoNaSemana: ativoNaSemana,
  };

  window.Rede = Rede;
})();
