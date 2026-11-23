/* =========================================================
   StudyFlow — estudar.js
   Planos de estudo, cronômetro Pomodoro e metas da semana.
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     Matérias: ícone e cor
     ======================================================= */
  var MATERIAS = {
    matematica: { icone: "sqrt", cor: "vermelho" },
    portugues: { icone: "book", cor: "roxo" },
    ciencias: { icone: "atom", cor: "verde" },
    historia: { icone: "history", cor: "laranja" },
    geografia: { icone: "globe", cor: "azul" },
    ingles: { icone: "languages", cor: "azul" },
    artes: { icone: "palette", cor: "roxo" },
    "educacao fisica": { icone: "dumbbell", cor: "verde" },
    fisica: { icone: "zap", cor: "laranja" },
    quimica: { icone: "flask", cor: "roxo" },
    biologia: { icone: "leaf", cor: "verde" },
  };

  function estiloMateria(nome) {
    return MATERIAS[Util.semAcento(nome)] || { icone: "bookOpen", cor: "azul" };
  }

  /* =======================================================
     Planos
     Cada dia tem: título, checklist (tópicos), e o conteúdo
     gerado pela IA (explicação, exercícios e atividades).
     ======================================================= */
  var VERSAO_PLANO = 2;

  function cortar(t, n) {
    t = String(t || "");
    return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t;
  }

  function montarDias(gerado) {
    return gerado.dias.map(function (d) {
      return {
        titulo: d.titulo,
        topicos: d.topicos.map(function (t) {
          return { id: Util.id(), texto: t, feito: false };
        }),
        conteudo: d.conteudo,
        registrado: false,
      };
    });
  }

  /**
   * dados = { materia, tipo, data, dias, assunto, fontes: [metadados], textos: [{ nome, texto }] }
   */
  function novoPlano(dados) {
    var gerado = GeradorEstudo.gerar({
      materia: dados.materia,
      tipo: dados.tipo,
      dias: dados.dias,
      assunto: dados.assunto,
      fontes: dados.textos || [],
    });
    return {
      id: Util.id(),
      materia: dados.materia,
      tipo: dados.tipo,
      data: dados.data,
      assunto: dados.assunto || "",
      fontes: dados.fontes || [],
      origem: gerado.origem,
      versao: VERSAO_PLANO,
      geradoEm: Date.now(),
      criado: Date.now(),
      dias: montarDias(gerado),
    };
  }

  // Marca "diasCompletos" dias inteiros e "extras" tópicos do dia seguinte
  function marcarProgresso(plano, diasCompletos, extras) {
    plano.dias.forEach(function (d, i) {
      d.topicos.forEach(function (t, j) {
        t.feito = i < diasCompletos || (i === diasCompletos && j < extras);
      });
      d.registrado = i < diasCompletos;
    });
  }

  function exemplos() {
    var h = Util.hoje();
    var mat = novoPlano({ materia: "Matemática", tipo: "prova", data: Util.iso(Util.somarDias(h, 4)), dias: 6 });
    marcarProgresso(mat, 2, 1);
    var cie = novoPlano({ materia: "Ciências", tipo: "prova", data: Util.iso(Util.somarDias(h, 7)), dias: 5 });
    marcarProgresso(cie, 1, 1);
    var his = novoPlano({ materia: "História", tipo: "trabalho", data: Util.iso(Util.somarDias(h, 2)), dias: 4, assunto: "Revolução Industrial" });
    marcarProgresso(his, 3, 1);
    return [mat, cie, his];
  }

  /** Planos antigos (antes das fontes) ganham explicações e exercícios, mantendo o progresso. */
  function migrar(lista) {
    var mudou = false;
    lista.forEach(function (p) {
      if (p.versao >= VERSAO_PLANO) return;
      var gerado = GeradorEstudo.gerar({ materia: p.materia, tipo: p.tipo, dias: p.dias.length, assunto: p.assunto });
      p.dias = p.dias.map(function (antigo, i) {
        var novo = gerado.dias[i] || gerado.dias[gerado.dias.length - 1];
        var total = antigo.topicos.length;
        var feitos = antigo.topicos.filter(function (t) {
          return t.feito;
        }).length;
        var topicos = novo.topicos.map(function (t) {
          return { id: Util.id(), texto: t, feito: false };
        });
        var nFeitos = total ? Math.round((feitos / total) * topicos.length) : 0;
        topicos.forEach(function (t, j) {
          t.feito = j < nFeitos;
        });
        return { titulo: novo.titulo, topicos: topicos, conteudo: novo.conteudo, registrado: !!antigo.registrado };
      });
      p.fontes = p.fontes || [];
      p.origem = gerado.origem;
      p.versao = VERSAO_PLANO;
      p.geradoEm = Date.now();
      mudou = true;
    });
    if (mudou) salvarPlanos(lista);
    return lista;
  }

  function lerPlanos() {
    var p = Dados.ler("planos", null);
    if (p === null) p = Dados.salvar("planos", Auth.ehDemo() ? exemplos() : []);
    return migrar(p);
  }

  function salvarPlanos(lista) {
    Dados.salvar("planos", lista);
  }

  function buscarPlano(lista, id) {
    return lista.filter(function (p) {
      return p.id === id;
    })[0];
  }

  function diaFeito(dia) {
    return dia.topicos.length > 0 && dia.topicos.every(function (t) {
      return t.feito;
    });
  }

  function progresso(plano) {
    var total = 0;
    var feitos = 0;
    plano.dias.forEach(function (d) {
      total += d.topicos.length;
      d.topicos.forEach(function (t) {
        if (t.feito) feitos++;
      });
    });
    return total ? Math.round((feitos / total) * 100) : 0;
  }

  function textoRestante(plano) {
    if (progresso(plano) === 100) return { texto: "Concluído", classe: "plano__restantes--concluido" };
    if (!plano.data) return { texto: "Sem data", classe: "" };
    var n = Util.diasEntre(Util.hoje(), Util.data(plano.data));
    if (n < 0) return { texto: "Prazo encerrado", classe: "plano__restantes--urgente" };
    if (n === 0) return { texto: "É hoje!", classe: "plano__restantes--urgente" };
    if (n === 1) return { texto: "1 Dia restante", classe: "plano__restantes--urgente" };
    return { texto: n + " Dias restantes", classe: n <= 2 ? "plano__restantes--urgente" : "" };
  }

  var elPlanos = document.getElementById("planos");
  var filtro = "todas";
  var abertos = {}; // id do plano → aberto?
  var primeiraVez = true;

  function renderPlanos() {
    Layout.barrasSuaves(elPlanos, desenharPlanos);
  }

  function desenharPlanos() {
    var lista = lerPlanos();
    if (primeiraVez && lista.length) {
      abertos[lista[0].id] = true;
      primeiraVez = false;
    }

    var visiveis = lista.filter(function (p) {
      var pr = progresso(p);
      if (filtro === "andamento") return pr < 100;
      if (filtro === "concluidas") return pr === 100;
      return true;
    });

    if (!visiveis.length) {
      var msg =
        filtro === "concluidas" ? "Nenhum plano concluído ainda. Você chega lá!" :
        filtro === "andamento" ? "Nenhum plano em andamento." :
        "Você ainda não tem planos de estudo. Toque no + para criar o primeiro.";
      elPlanos.innerHTML = '<div class="vazio">' + msg + "</div>";
      return;
    }

    elPlanos.innerHTML = visiveis
      .map(function (p) {
        var est = estiloMateria(p.materia);
        var pr = progresso(p);
        var rest = textoRestante(p);
        var aberto = !!abertos[p.id];
        var nFontes = (p.fontes || []).length;
        var dias = p.dias
          .map(function (d, i) {
            var feitos = d.topicos.filter(function (t) {
              return t.feito;
            }).length;
            return (
              '<button type="button" class="dia-card' + (diaFeito(d) ? " feito" : "") + '" data-plano="' + p.id + '" data-dia="' + i + '" title="' + Util.escapar(d.titulo || "") + '" aria-label="Dia ' + (i + 1) + ": " + Util.escapar(d.titulo || "") + ", " + feitos + " de " + d.topicos.length + ' feitos">' +
              '<span class="dia-card__seta" data-icone="arrowUpRight" data-tamanho="20" data-traco="2.5"></span>' +
              "Dia " + (i + 1) +
              '<span class="dia-card__texto"><span class="dia-card__conta">' + feitos + "/" + d.topicos.length + "</span></span></button>"
            );
          })
          .join("");

        return (
          '<article class="plano cor-' + est.cor + (aberto ? "" : " plano--recolhido") + '" data-id="' + p.id + '">' +
          '<div class="plano__topo">' +
          '<button type="button" class="plano__abrir" data-alternar="' + p.id + '" aria-expanded="' + aberto + '">' +
          '<span class="plano__icone"><span data-icone="' + est.icone + '" data-tamanho="18"></span></span>' +
          '<h2 class="plano__nome">' + Util.escapar(p.materia) + "</h2>" +
          '<span class="plano__tipo">' + (p.tipo === "prova" ? "Prova" : "Trabalho") + "</span>" +
          '<span class="plano__seta" data-icone="chevronDown" data-tamanho="16"></span>' +
          "</button>" +
          '<span class="plano__restantes ' + rest.classe + '">' + rest.texto + "</span>" +
          '<div class="plano__acoes">' +
          '<button type="button" class="plano__fontes' + (nFontes ? " plano__fontes--tem" : "") + '" data-fontes="' + p.id + '" title="Fontes de estudo deste plano">' +
          '<span data-icone="paperclip" data-tamanho="14"></span>' + (nFontes ? nFontes + (nFontes === 1 ? " fonte" : " fontes") : "Fontes") + "</button>" +
          '<button type="button" class="botao-icone" data-apagar="' + p.id + '" aria-label="Apagar plano de ' + Util.escapar(p.materia) + '" title="Apagar plano"><span data-icone="trash" data-tamanho="15"></span></button>' +
          "</div>" +
          "</div>" +
          '<div class="progresso__rotulo"><span>Progresso</span><strong>' + pr + "%</strong></div>" +
          '<div class="progresso__trilho" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pr + '"><div class="progresso__preenchido" data-barra="' + p.id + '" style="width:' + pr + '%"></div></div>' +
          // Gaveta: abre/fecha deslizando (a altura anima via grid-template-rows)
          '<div class="plano__gaveta"' + (aberto ? "" : " inert") + '><div class="plano__gaveta-interno">' +
          '<div class="plano__dias">' + dias + "</div>" +
          "</div></div>" +
          "</article>"
        );
      })
      .join("");
  }

  elPlanos.addEventListener("click", function (e) {
    var alt = e.target.closest("[data-alternar]");
    if (alt) {
      // Abre/fecha sem redesenhar, para a animação da gaveta acontecer
      var id = alt.getAttribute("data-alternar");
      abertos[id] = !abertos[id];
      var artigo = alt.closest(".plano");
      var gaveta = artigo.querySelector(".plano__gaveta");
      artigo.classList.toggle("plano--recolhido", !abertos[id]);
      alt.setAttribute("aria-expanded", String(abertos[id]));
      if (abertos[id]) {
        gaveta.removeAttribute("inert");
        artigo.classList.add("plano--abrindo");
        clearTimeout(artigo._t);
        artigo._t = setTimeout(function () {
          artigo.classList.remove("plano--abrindo");
        }, 700);
      } else {
        gaveta.setAttribute("inert", "");
        artigo.classList.remove("plano--abrindo");
      }
      return;
    }
    var fo = e.target.closest("[data-fontes]");
    if (fo) {
      abrirFontes(fo.getAttribute("data-fontes"));
      return;
    }
    var ap = e.target.closest("[data-apagar]");
    if (ap) {
      var lista = lerPlanos();
      var plano = buscarPlano(lista, ap.getAttribute("data-apagar"));
      if (plano && confirm("Apagar o plano de " + plano.materia + "? O progresso e as fontes dele serão perdidos.")) {
        (plano.fontes || []).forEach(function (f) {
          Fontes.remover(f.id);
        });
        plano.dias.forEach(function (d) {
          (d.materiais || []).forEach(function (f) {
            Fontes.remover(f.id);
          });
        });
        salvarPlanos(lista.filter(function (p) {
          return p.id !== plano.id;
        }));
        renderPlanos();
        preencherMaterias();
      }
      return;
    }
    var dia = e.target.closest(".dia-card");
    if (dia) abrirDia(dia.getAttribute("data-plano"), +dia.getAttribute("data-dia"));
  });

  document.querySelectorAll("[data-filtro]").forEach(function (b) {
    b.addEventListener("click", function () {
      filtro = b.getAttribute("data-filtro");
      document.querySelectorAll("[data-filtro]").forEach(function (o) {
        var ativo = o === b;
        o.classList.toggle("ativo", ativo);
        o.setAttribute("aria-pressed", String(ativo));
      });
      renderPlanos();
    });
  });

  /* =======================================================
     Animação "A IA está montando seu plano…"
     ======================================================= */
  function animacaoGerando(dialog, comFontes, trabalho) {
    var alvo = dialog; // cobre a janela inteira, mesmo se o formulário for comprido
    dialog.scrollTop = 0;
    var passos = comFontes
      ? ["Lendo as suas fontes", "Encontrando os tópicos principais", "Escrevendo as explicações", "Criando exercícios e atividades"]
      : ["Separando o conteúdo da matéria", trabalho ? "Organizando as etapas do trabalho" : "Dividindo os dias de estudo", "Escrevendo as explicações", "Criando exercícios e atividades"];
    var el = document.createElement("div");
    el.className = "gerando";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<div class="gerando__orbe"><span data-icone="sparkles" data-tamanho="30"></span></div>' +
      "<strong>A IA está montando seu plano…</strong>" +
      '<ul class="gerando__passos">' +
      passos
        .map(function (p, i) {
          return '<li style="--i:' + i + '"><span class="gerando__marca" data-icone="check" data-tamanho="12"></span>' + p + "</li>";
        })
        .join("") +
      "</ul>";
    alvo.appendChild(el);
    var minimo = Layout.semAnimacao() ? 0 : 2200;
    var inicio = Date.now();
    return {
      fim: function () {
        return new Promise(function (ok) {
          setTimeout(function () {
            el.classList.add("gerando--saindo");
            setTimeout(function () {
              el.remove();
              ok();
            }, Layout.semAnimacao() ? 0 : 250);
          }, Math.max(0, minimo - (Date.now() - inicio)));
        });
      },
    };
  }

  /* =======================================================
     Modal do dia: explicação, exercícios, atividades e checklist
     ======================================================= */
  var modalDia = document.getElementById("modal-dia");
  var diaEtiqueta = document.getElementById("dia-etiqueta");
  var diaTitulo = document.getElementById("dia-titulo");
  var diaSub = document.getElementById("dia-sub");
  var diaPainel = document.getElementById("dia-painel");
  var diaChecklist = document.getElementById("dia-checklist");
  var diaTopicos = document.getElementById("dia-topicos");
  var formTopico = document.getElementById("form-topico");
  var novoTopico = document.getElementById("novo-topico");
  var btnTudo = document.getElementById("btn-dia-tudo");
  var btnAnterior = document.getElementById("btn-dia-anterior");
  var btnProximo = document.getElementById("btn-dia-proximo");
  var abas = modalDia.querySelectorAll("[data-aba]");
  var diaAtual = null; // { plano: id, dia: índice }
  var abaAtual = "explicacao";

  var NOME_TIPO = { definicao: "Definição", lacuna: "Complete", vf: "Verdadeiro ou falso", aberta: "Responda", calculo: "Cálculo" };

  function comDia(fn) {
    var lista = lerPlanos();
    var plano = buscarPlano(lista, diaAtual.plano);
    if (!plano) return;
    var dia = plano.dias[diaAtual.dia];
    var antes = diaFeito(dia);
    fn(dia, plano);
    // Recompensa só na primeira vez que o dia é concluído
    if (!antes && diaFeito(dia) && !dia.registrado) {
      dia.registrado = true;
      Conquistas.registrar("diasConcluidos");
      EstadoMascote.ganhar({ sabedoria: 4, xp: 15 });
      Layout.aviso("Dia " + (diaAtual.dia + 1) + " de " + plano.materia + " concluído!", { icone: "check", tipo: "sucesso" });
      if (progresso(plano) === 100) Layout.confete();
    }
    salvarPlanos(lista);
    renderDia(false);
    renderPlanos();
  }

  function htmlExplicacao(c) {
    var h = "";
    (c.resumo || []).forEach(function (p) {
      h += "<p>" + Util.escapar(p) + "</p>";
    });
    if (c.pontos && c.pontos.length) {
      h += '<ul class="dia-pontos">' + c.pontos.map(function (p) {
        return "<li>" + Util.escapar(p) + "</li>";
      }).join("") + "</ul>";
    }
    if (c.formula) h += '<pre class="dia-formula">' + Util.escapar(c.formula) + "</pre>";
    if (c.palavras && c.palavras.length) {
      h += '<div class="dia-bloco"><span class="dia-bloco__titulo">Palavras-chave</span><div class="dia-chips">' +
        c.palavras.map(function (p) {
          return '<span class="dia-chip">' + Util.escapar(p) + "</span>";
        }).join("") + "</div></div>";
    }
    return h;
  }

  function htmlExercicios(c) {
    var ex = c.exercicios || [];
    if (!ex.length) return '<p class="dia-vazio">Este dia não tem exercícios.</p>';
    return (
      '<ol class="exercicios">' +
      ex.map(function (e, i) {
        return (
          '<li class="exercicio" style="--i:' + i + '">' +
          '<div class="exercicio__topo"><span class="exercicio__num">' + (i + 1) + '</span><span class="exercicio__tipo">' + (NOME_TIPO[e.tipo] || "Exercício") + "</span></div>" +
          '<p class="exercicio__pergunta">' + Util.escapar(e.pergunta) + "</p>" +
          '<details class="exercicio__resposta"><summary><span data-icone="eye" data-tamanho="14"></span>Ver resposta</summary><div><p>' + Util.escapar(e.resposta) + "</p></div></details>" +
          "</li>"
        );
      }).join("") +
      "</ol>"
    );
  }

  function htmlAtividades(c) {
    var at = c.atividades || [];
    if (!at.length) return '<p class="dia-vazio">Nenhuma atividade para este dia.</p>';
    return (
      '<ul class="atividades">' +
      at.map(function (a, i) {
        return '<li style="--i:' + i + '"><span class="atividades__icone" data-icone="' + (i === 0 ? "puzzle" : i === 1 ? "lightbulb" : "target") + '" data-tamanho="16"></span><p>' + Util.escapar(a) + "</p></li>";
      }).join("") +
      "</ul>" +
      '<p class="dia-dica"><span data-icone="clock" data-tamanho="14"></span>Dica: faça uma sessão Pomodoro de 25 minutos para cada atividade.</p>'
    );
  }

  var diaIcone = document.getElementById("dia-icone");
  var diaAnel = document.getElementById("dia-anel");
  var diaAnelTexto = document.getElementById("dia-anel-texto");
  var diaTrilha = document.getElementById("dia-trilha");
  var diaMaterial = document.getElementById("dia-material");
  var diaMateriais = document.getElementById("dia-materiais");
  var contaEx = document.getElementById("dia-conta-ex");
  var contaMat = document.getElementById("dia-conta-mat");
  var indicador = modalDia.querySelector(".dia-abas__indicador");
  var CIRCUNFERENCIA = 2 * Math.PI * 15.5;

  /** Move a barrinha das abas para baixo da aba ativa */
  function moverIndicador() {
    var ativa = modalDia.querySelector(".dia-abas__aba.ativo");
    if (!ativa || !indicador) return;
    indicador.style.width = ativa.offsetWidth + "px";
    indicador.style.transform = "translateX(" + ativa.offsetLeft + "px)";
  }

  /* ---------- Material do dia (arquivos anexados ao dia) ---------- */
  function htmlMateriais(lista) {
    return lista
      .map(function (f) {
        var info = [Fontes.ROTULO[f.tipo] || "Arquivo"];
        if (f.paginas) info.push(f.paginas + (f.paginas === 1 ? " página" : " páginas"));
        else if (f.tamanho) info.push(Fontes.tamanhoLegivel(f.tamanho));
        return (
          '<li class="fonte fonte--' + f.tipo + ' fonte--salva">' +
          '<span class="fonte__icone" data-icone="' + (Fontes.ICONE[f.tipo] || "fileText") + '" data-tamanho="16"></span>' +
          '<div class="fonte__texto"><strong title="' + Util.escapar(f.nome) + '">' + Util.escapar(f.nome) + "</strong><span>" + info.join(" · ") + "</span></div>" +
          '<button type="button" class="botao-icone botao-icone--pequeno" data-tirar-material="' + f.id + '" aria-label="Tirar ' + Util.escapar(f.nome) + '"><span data-icone="trash" data-tamanho="13"></span></button>' +
          "</li>"
        );
      })
      .join("");
  }

  var seletorDia = Fontes.criarSeletor(document.getElementById("dia-material-zona"), {
    compacto: true,
    semColar: true,
    titulo: "Arraste e solte o material do dia aqui",
    // Assim que um arquivo é lido, ele é guardado neste dia
    aoPronto: function (item) {
      var plano0 = diaAtual.plano;
      var dia0 = diaAtual.dia;
      Fontes.guardar(item).then(function (meta) {
        var lista = lerPlanos();
        var plano = buscarPlano(lista, plano0);
        if (!plano) return;
        var dia = plano.dias[dia0];
        dia.materiais = (dia.materiais || []).concat([meta]);
        salvarPlanos(lista);
        if (diaAtual && diaAtual.plano === plano0 && diaAtual.dia === dia0) renderMaterial();
        Layout.aviso("“" + meta.nome + "” guardado no Dia " + (dia0 + 1) + ".", { icone: "paperclip", tipo: "sucesso" });
      });
    },
  });

  function renderMaterial() {
    var plano = buscarPlano(lerPlanos(), diaAtual.plano);
    if (!plano) return;
    var lista = plano.dias[diaAtual.dia].materiais || [];
    diaMateriais.innerHTML = htmlMateriais(lista);
    contaMat.textContent = lista.length ? lista.length : "";
  }

  diaMateriais.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tirar-material]");
    if (!b) return;
    var id = b.getAttribute("data-tirar-material");
    var lista = lerPlanos();
    var dia = buscarPlano(lista, diaAtual.plano).dias[diaAtual.dia];
    dia.materiais = (dia.materiais || []).filter(function (f) {
      return f.id !== id;
    });
    salvarPlanos(lista);
    Fontes.remover(id);
    var li = b.closest("li");
    li.classList.add("fonte--saindo");
    setTimeout(renderMaterial, Layout.semAnimacao() ? 0 : 220);
  });

  function renderPainel(animar) {
    var plano = buscarPlano(lerPlanos(), diaAtual.plano);
    if (!plano) return;
    var dia = plano.dias[diaAtual.dia];
    var c = dia.conteudo || {};

    abas.forEach(function (b) {
      var ativa = b.getAttribute("data-aba") === abaAtual;
      b.classList.toggle("ativo", ativa);
      b.setAttribute("aria-selected", String(ativa));
    });
    moverIndicador();

    var checklist = abaAtual === "checklist";
    var material = abaAtual === "material";
    diaChecklist.hidden = !checklist;
    diaMaterial.hidden = !material;
    diaPainel.hidden = checklist || material;
    if (material) renderMaterial();
    if (!checklist && !material) {
      diaPainel.innerHTML =
        abaAtual === "exercicios" ? htmlExercicios(c) :
        abaAtual === "atividades" ? htmlAtividades(c) :
        htmlExplicacao(c);
      var rodapeFonte = c.fontes && c.fontes.length
        ? '<p class="dia-origem"><span data-icone="paperclip" data-tamanho="13"></span>Feito a partir de: ' + c.fontes.map(Util.escapar).join(", ") + "</p>"
        : '<p class="dia-origem"><span data-icone="sparkles" data-tamanho="13"></span>Conteúdo de demonstração. Adicione fontes ao plano para estudar o seu material.</p>';
      if (abaAtual === "explicacao") diaPainel.innerHTML += rodapeFonte;
      diaPainel.scrollTop = 0;
    }
    var alvo = checklist ? diaChecklist : material ? diaMaterial : diaPainel;
    if (animar) {
      alvo.classList.remove("dia-painel--entrando");
      void alvo.offsetWidth;
      alvo.classList.add("dia-painel--entrando");
    }
  }

  function renderTrilha(plano) {
    diaTrilha.innerHTML = plano.dias
      .map(function (d, i) {
        var atual = i === diaAtual.dia;
        var feito = diaFeito(d);
        return (
          '<button type="button" class="dia-trilha__dia' + (atual ? " atual" : "") + (feito ? " feito" : "") + '" data-ir-dia="' + i + '"' +
          (atual ? ' aria-current="step"' : "") + ' title="' + Util.escapar(d.titulo || "") + '">' +
          (feito ? '<span data-icone="check" data-tamanho="12" data-traco="3"></span>' : "") +
          "Dia " + (i + 1) +
          "</button>"
        );
      })
      .join("");
    var atualEl = diaTrilha.querySelector(".atual");
    if (atualEl) {
      // centraliza o dia atual na trilha (quando há muitos dias)
      var alvoScroll = atualEl.offsetLeft - diaTrilha.clientWidth / 2 + atualEl.offsetWidth / 2;
      diaTrilha.scrollTo({ left: alvoScroll, behavior: Layout.semAnimacao() ? "auto" : "smooth" });
    }
  }

  diaTrilha.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ir-dia]");
    if (!b) return;
    var destino = +b.getAttribute("data-ir-dia");
    if (destino !== diaAtual.dia) irParaDia(destino - diaAtual.dia);
  });

  function renderDia(animar) {
    var plano = buscarPlano(lerPlanos(), diaAtual.plano);
    if (!plano) return Layout.fecharModal(modalDia);
    var dia = plano.dias[diaAtual.dia];
    var feitos = dia.topicos.filter(function (t) {
      return t.feito;
    }).length;
    var est = estiloMateria(plano.materia);

    diaIcone.className = "dia-topo__icone cor-" + est.cor;
    diaIcone.innerHTML = '<span data-icone="' + est.icone + '" data-tamanho="22"></span>';
    diaEtiqueta.textContent = "Dia " + (diaAtual.dia + 1) + " de " + plano.dias.length + " · " + (plano.tipo === "prova" ? "Prova" : "Trabalho") + " de " + plano.materia;
    diaTitulo.textContent = dia.titulo || plano.materia + " — Dia " + (diaAtual.dia + 1);
    diaSub.textContent = dia.topicos.length
      ? feitos + " de " + dia.topicos.length + " itens do checklist feitos"
      : "Adicione o que você vai estudar neste dia";

    // Anel de progresso do dia
    var fracao = dia.topicos.length ? feitos / dia.topicos.length : 0;
    diaAnel.style.setProperty("--offset", (CIRCUNFERENCIA * (1 - fracao)).toFixed(2));
    diaAnel.style.setProperty("--circ", CIRCUNFERENCIA.toFixed(2));
    diaAnel.classList.toggle("dia-anel--completo", fracao === 1);
    diaAnelTexto.innerHTML = fracao === 1 ? Icones.svg("check", 16, 3) : Math.round(fracao * 100) + "%";
    diaAnel.setAttribute("aria-label", Math.round(fracao * 100) + "% do dia feito");

    var nEx = ((dia.conteudo || {}).exercicios || []).length;
    contaEx.textContent = nEx || "";
    contaMat.textContent = (dia.materiais || []).length || "";

    renderTrilha(plano);

    diaTopicos.innerHTML = dia.topicos
      .map(function (t) {
        return (
          '<li class="' + (t.feito ? "feito" : "") + '"><label><input type="checkbox" data-topico="' + t.id + '"' + (t.feito ? " checked" : "") + " />" +
          "<span>" + Util.escapar(t.texto) + "</span></label>" +
          '<button type="button" class="botao-icone" data-remover-topico="' + t.id + '" aria-label="Remover tópico"><span data-icone="x" data-tamanho="14"></span></button></li>'
        );
      })
      .join("");
    btnTudo.disabled = !dia.topicos.length || feitos === dia.topicos.length;
    btnTudo.textContent = diaFeito(dia) ? "Dia concluído ✓" : "Marcar dia como feito";
    btnAnterior.disabled = diaAtual.dia === 0;
    btnProximo.disabled = diaAtual.dia >= plano.dias.length - 1;
    if (animar !== false) renderPainel(animar);
  }

  function abrirDia(planoId, indice) {
    diaAtual = { plano: planoId, dia: indice };
    abaAtual = "explicacao";
    novoTopico.value = "";
    seletorDia.limpar();
    renderDia(false);
    renderPainel(false);
    Layout.abrirModal(modalDia);
    // a largura das abas só existe depois que a janela abre
    requestAnimationFrame(moverIndicador);
  }

  abas.forEach(function (b) {
    b.addEventListener("click", function () {
      if (abaAtual === b.getAttribute("data-aba")) return;
      abaAtual = b.getAttribute("data-aba");
      renderPainel(true);
    });
  });

  window.addEventListener("resize", function () {
    if (modalDia.open) moverIndicador();
  });

  function irParaDia(delta) {
    var plano = buscarPlano(lerPlanos(), diaAtual.plano);
    var novo = diaAtual.dia + delta;
    if (!plano || novo < 0 || novo >= plano.dias.length) return;
    diaAtual.dia = novo;
    seletorDia.limpar();
    var corpo = modalDia.querySelector(".modal__form");
    corpo.classList.remove("dia--ir-frente", "dia--ir-tras");
    void corpo.offsetWidth;
    corpo.classList.add(delta > 0 ? "dia--ir-frente" : "dia--ir-tras");
    renderDia(false);
    renderPainel(false);
  }

  btnAnterior.addEventListener("click", function () {
    irParaDia(-1);
  });
  btnProximo.addEventListener("click", function () {
    irParaDia(1);
  });

  diaTopicos.addEventListener("change", function (e) {
    var id = e.target.getAttribute("data-topico");
    if (!id) return;
    comDia(function (dia) {
      dia.topicos.forEach(function (t) {
        if (t.id === id) t.feito = e.target.checked;
      });
    });
  });

  diaTopicos.addEventListener("click", function (e) {
    var b = e.target.closest("[data-remover-topico]");
    if (!b) return;
    var id = b.getAttribute("data-remover-topico");
    comDia(function (dia) {
      dia.topicos = dia.topicos.filter(function (t) {
        return t.id !== id;
      });
    });
  });

  formTopico.addEventListener("submit", function (e) {
    e.preventDefault();
    var texto = novoTopico.value.trim();
    if (!texto) return novoTopico.focus();
    comDia(function (dia) {
      dia.topicos.push({ id: Util.id(), texto: texto, feito: false });
    });
    novoTopico.value = "";
    novoTopico.focus();
  });

  btnTudo.addEventListener("click", function () {
    comDia(function (dia) {
      dia.topicos.forEach(function (t) {
        t.feito = true;
      });
    });
  });

  /* =======================================================
     Modal de novo plano (com fontes)
     ======================================================= */
  var modalPlano = document.getElementById("modal-plano");
  var formPlano = document.getElementById("form-plano");
  var plErro = document.getElementById("pl-erro");
  var btnCriar = document.getElementById("btn-criar-plano");
  var pl = {
    materia: document.getElementById("pl-materia"),
    assunto: document.getElementById("pl-assunto"),
    tipo: document.getElementById("pl-tipo"),
    data: document.getElementById("pl-data"),
    dias: document.getElementById("pl-dias"),
    calendario: document.getElementById("pl-calendario"),
  };
  var seletorNovo = Fontes.criarSeletor(document.getElementById("pl-fontes"));

  document.getElementById("btn-novo-plano").addEventListener("click", function () {
    formPlano.reset();
    seletorNovo.limpar();
    plErro.hidden = true;
    btnCriar.disabled = false;
    pl.data.min = Util.hojeISO();
    pl.data.value = Util.iso(Util.somarDias(Util.hoje(), 7));
    Layout.abrirModal(modalPlano);
    setTimeout(function () {
      pl.materia.focus();
    }, 30);
  });

  function erroPlano(msg, campo) {
    plErro.textContent = msg;
    plErro.hidden = false;
    if (campo) campo.focus();
  }

  /** Guarda as fontes novas no navegador e devolve { metas, textos } */
  function guardarFontes(lista) {
    return Promise.all(
      lista.map(function (f) {
        return Fontes.guardar(f);
      })
    ).then(function (metas) {
      return {
        metas: metas,
        textos: lista.map(function (f) {
          return { nome: f.nome, texto: f.texto };
        }),
      };
    });
  }

  formPlano.addEventListener("submit", function (e) {
    e.preventDefault();
    var materia = pl.materia.value.trim();
    var n = parseInt(pl.dias.value, 10);
    if (!materia) return erroPlano("Diga qual é a matéria.", pl.materia);
    if (!pl.data.value) return erroPlano("Escolha a data da prova ou da entrega.", pl.data);
    if (!(n >= 1 && n <= 12)) return erroPlano("Escolha entre 1 e 12 dias de estudo.", pl.dias);
    if (seletorNovo.lendo()) return erroPlano("Espere terminar de ler os arquivos.");
    plErro.hidden = true;

    var fontesNovas = seletorNovo.prontos();
    var tipo = pl.tipo.value;
    var assunto = pl.assunto.value.trim();
    var data = pl.data.value;
    var noCalendario = pl.calendario.checked;
    btnCriar.disabled = true;
    var anim = animacaoGerando(modalPlano, fontesNovas.length > 0, tipo === "trabalho");

    guardarFontes(fontesNovas)
      .then(function (r) {
        var plano = novoPlano({ materia: materia, tipo: tipo, data: data, dias: n, assunto: assunto, fontes: r.metas, textos: r.textos });
        return anim.fim().then(function () {
          return plano;
        });
      })
      .then(function (plano) {
        var lista = lerPlanos();
        lista.unshift(plano);
        salvarPlanos(lista);
        abertos[plano.id] = true;

        if (noCalendario) {
          Eventos.adicionar({
            titulo: (tipo === "prova" ? "Prova de " : "Trabalho de ") + materia,
            data: data,
            hora: "08:00",
            materia: materia,
            tipo: tipo,
            prioridade: "alta",
          });
        }

        Conquistas.registrar("planos");
        EstadoMascote.ganhar({ xp: 10 });
        Layout.fecharModal(modalPlano);
        Layout.aviso(
          plano.origem === "fontes"
            ? "Plano de " + materia + " criado a partir das suas fontes!"
            : "Plano de " + materia + " criado!",
          { icone: "sparkles", tipo: "sucesso" }
        );
        renderPlanos();
        preencherMaterias();
      })
      .catch(function (err) {
        anim.fim();
        erroPlano("Não consegui criar o plano: " + (err && err.message ? err.message : "erro desconhecido") + ".");
      })
      .then(function () {
        btnCriar.disabled = false;
      });
  });

  /* =======================================================
     Modal de fontes de um plano já criado
     ======================================================= */
  var modalFontes = document.getElementById("modal-fontes");
  var fontesTitulo = document.getElementById("fontes-titulo");
  var fontesSub = document.getElementById("fontes-sub");
  var fontesSalvas = document.getElementById("fontes-salvas");
  var btnGerar = document.getElementById("btn-gerar-plano");
  var seletorPlano = Fontes.criarSeletor(document.getElementById("fontes-novas"));
  var planoFontes = null; // id do plano aberto no modal

  function renderFontesSalvas() {
    var plano = buscarPlano(lerPlanos(), planoFontes);
    if (!plano) return;
    fontesTitulo.textContent = "Fontes de " + plano.materia;
    fontesSub.textContent =
      (plano.tipo === "prova" ? "Prova" : "Trabalho") + " · " + plano.dias.length + " dias · " +
      (plano.origem === "fontes" ? "o plano atual foi feito a partir das fontes" : "o plano atual usa o conteúdo de demonstração");
    var lista = plano.fontes || [];
    fontesSalvas.hidden = !lista.length;
    fontesSalvas.innerHTML = lista
      .map(function (f) {
        var info = [Fontes.ROTULO[f.tipo] || "Arquivo"];
        if (f.paginas) info.push(f.paginas + (f.paginas === 1 ? " página" : " páginas"));
        if (f.caracteres) info.push(Math.max(1, Math.round(f.caracteres / 6)).toLocaleString("pt-BR") + " palavras");
        return (
          '<li class="fonte fonte--' + f.tipo + ' fonte--salva">' +
          '<span class="fonte__icone" data-icone="' + (Fontes.ICONE[f.tipo] || "fileText") + '" data-tamanho="16"></span>' +
          '<div class="fonte__texto"><strong title="' + Util.escapar(f.nome) + '">' + Util.escapar(f.nome) + "</strong><span>" + info.join(" · ") + "</span></div>" +
          '<button type="button" class="botao-icone botao-icone--pequeno" data-remover-fonte="' + f.id + '" aria-label="Remover ' + Util.escapar(f.nome) + '"><span data-icone="trash" data-tamanho="13"></span></button>' +
          "</li>"
        );
      })
      .join("");
  }

  function abrirFontes(planoId) {
    planoFontes = planoId;
    seletorPlano.limpar();
    btnGerar.disabled = false;
    renderFontesSalvas();
    Layout.abrirModal(modalFontes);
  }

  fontesSalvas.addEventListener("click", function (e) {
    var b = e.target.closest("[data-remover-fonte]");
    if (!b) return;
    var id = b.getAttribute("data-remover-fonte");
    var lista = lerPlanos();
    var plano = buscarPlano(lista, planoFontes);
    plano.fontes = (plano.fontes || []).filter(function (f) {
      return f.id !== id;
    });
    salvarPlanos(lista);
    Fontes.remover(id);
    renderFontesSalvas();
    renderPlanos();
  });

  btnGerar.addEventListener("click", function () {
    var lista = lerPlanos();
    var plano = buscarPlano(lista, planoFontes);
    if (!plano) return;
    if (seletorPlano.lendo()) return Layout.aviso("Espere terminar de ler os arquivos.", { icone: "info" });
    if (progresso(plano) > 0 && !confirm("Gerar o plano de " + plano.materia + " de novo? O que você já marcou volta a zero.")) return;

    var novas = seletorPlano.prontos();
    var temFontes = novas.length + (plano.fontes || []).length > 0;
    btnGerar.disabled = true;
    var anim = animacaoGerando(modalFontes, temFontes, plano.tipo === "trabalho");

    guardarFontes(novas)
      .then(function (r) {
        var ids = (plano.fontes || []).map(function (f) {
          return f.id;
        });
        return Fontes.textos(ids).then(function (salvos) {
          return { metas: (plano.fontes || []).concat(r.metas), textos: salvos.concat(r.textos) };
        });
      })
      .then(function (r) {
        var gerado = GeradorEstudo.gerar({ materia: plano.materia, tipo: plano.tipo, dias: plano.dias.length, assunto: plano.assunto, fontes: r.textos });
        return anim.fim().then(function () {
          return { r: r, gerado: gerado };
        });
      })
      .then(function (x) {
        var listaAtual = lerPlanos();
        var p = buscarPlano(listaAtual, planoFontes);
        var antigos = p.dias;
        p.dias = montarDias(x.gerado).map(function (d, i) {
          // quem já ganhou a recompensa de um dia não ganha de novo
          d.registrado = !!(antigos[i] && antigos[i].registrado);
          if (antigos[i] && antigos[i].materiais) d.materiais = antigos[i].materiais; // material do dia continua
          return d;
        });
        p.fontes = x.r.metas;
        p.origem = x.gerado.origem;
        p.geradoEm = Date.now();
        salvarPlanos(listaAtual);
        abertos[p.id] = true;
        Layout.fecharModal(modalFontes);
        Layout.aviso(
          p.origem === "fontes" ? "Plano de " + p.materia + " refeito a partir das suas fontes!" : "Plano de " + p.materia + " refeito.",
          { icone: "sparkles", tipo: "sucesso" }
        );
        renderPlanos();
      })
      .catch(function (err) {
        anim.fim();
        Layout.aviso("Não consegui gerar o plano: " + (err && err.message ? err.message : "erro desconhecido"), { icone: "alert", tipo: "erro" });
      })
      .then(function () {
        btnGerar.disabled = false;
      });
  });

  /* =======================================================
     Pomodoro
     ======================================================= */
  var elTempo = document.getElementById("tempo");
  var elMsg = document.getElementById("pomo-msg");
  var elTag = document.getElementById("pomo-tag");
  var elMateria = document.getElementById("pomo-materia");
  var btnIniciar = document.getElementById("btn-iniciar");
  var btnReiniciar = document.getElementById("btn-reiniciar");
  var btnPular = document.getElementById("btn-pular");
  var tituloOriginal = document.title;
  var elSessao = document.querySelector(".sessao");
  var elBarraPomo = document.createElement("div");
  elBarraPomo.className = "sessao__barra";
  elBarraPomo.setAttribute("aria-hidden", "true");
  elBarraPomo.innerHTML = "<div></div>";
  elMsg.insertAdjacentElement("afterend", elBarraPomo);
  var intervalo = null;

  function duracao(modo) {
    var cfg = Config.ler();
    return (modo === "pausa" ? cfg.pausa : cfg.foco) * 60;
  }

  function lerPomo() {
    var p = Dados.ler("pomodoro", null);
    if (!p) p = { modo: "foco", rodando: false, fim: null, restante: duracao("foco"), materia: "" };
    return p;
  }

  var pomo = lerPomo();

  function salvarPomo() {
    Dados.salvar("pomodoro", pomo);
  }

  function segundosRestantes() {
    if (pomo.rodando && pomo.fim) return Math.max(0, Math.round((pomo.fim - Date.now()) / 1000));
    return pomo.restante;
  }

  function formatar(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  function renderPomo() {
    var s = segundosRestantes();
    elTempo.textContent = formatar(s);
    var pausa = pomo.modo === "pausa";
    elTag.textContent = pausa ? "Pausa" : "Pomodoro";
    elTag.classList.toggle("tag--verde", pausa);
    elSessao.classList.toggle("rodando", !!pomo.rodando);
    elSessao.classList.toggle("pausa", pausa);
    var total = duracao(pomo.modo);
    elBarraPomo.firstChild.style.width = Math.min(100, ((total - s) / total) * 100) + "%";

    if (pomo.rodando) {
      elMsg.textContent = pausa ? "Hora de descansar um pouquinho!" : "Foque nos seus estudos!";
      btnIniciar.textContent = "Pausar";
      btnIniciar.classList.add("pausado");
      document.title = formatar(s) + " · " + (pausa ? "Pausa" : "Foco") + " — StudyFlow";
    } else {
      var cheio = s === duracao(pomo.modo);
      elMsg.textContent = cheio ? (pausa ? "Pausa pronta para começar." : "Foque nos seus estudos!") : "Pausado. Continue quando quiser.";
      btnIniciar.textContent = cheio ? "Iniciar" : "Continuar";
      btnIniciar.classList.remove("pausado");
      document.title = tituloOriginal;
    }
  }

  // Nesta tela o próprio cronômetro avisa o fim (o lembretes.js não repete)
  window.PomodoroNaTela = true;

  function bipe() {
    if (window.Lembretes) Lembretes.bipe();
  }

  /** Se o aluno estiver em outra aba, manda notificação do navegador. */
  function notificarFora(titulo, corpo) {
    // Só quando a notificação pode mesmo sair do navegador; senão o aviso do site (abaixo) basta
    if (document.hidden && window.Lembretes && Config.ler().lembretes && Lembretes.permissao() === "granted") {
      Lembretes.avisar(titulo, corpo, { tag: "pomodoro", link: "estudar.html", icone: "clock" });
      return true;
    }
    return false;
  }

  function terminar() {
    var eraFoco = pomo.modo === "foco";
    pomo.modo = eraFoco ? "pausa" : "foco";
    pomo.rodando = false;
    pomo.fim = null;
    pomo.restante = duracao(pomo.modo);
    salvarPomo();
    pararIntervalo();
    // Na outra aba: notificação (já toca o bipe). Nesta aba: só o bipe, o aviso vem abaixo.
    var fora = eraFoco
      ? notificarFora("Sessão de foco concluída!", "+10 moedas para a Idebinha. Hora da pausa.")
      : notificarFora("Pausa terminada", "Bora voltar aos estudos!");
    if (!fora) bipe();
    elTempo.classList.remove("terminou");
    void elTempo.offsetWidth;
    elTempo.classList.add("terminou");
    if (eraFoco) {
      Carteira.somar(10);
      EstadoMascote.ganhar({ sabedoria: 3, xp: 20 });
      Conquistas.registrar("pomodoros");
      Layout.aviso("Sessão de foco concluída! +10 moedas para a Idebinha", { icone: "coins", tipo: "moedas", duracao: 4500 });
    } else {
      Layout.aviso("Pausa terminada. Bora voltar aos estudos!", { icone: "clock" });
    }
    renderPomo();
  }

  function tique() {
    if (pomo.rodando && segundosRestantes() <= 0) return terminar();
    renderPomo();
  }

  function pararIntervalo() {
    if (intervalo) clearInterval(intervalo);
    intervalo = null;
  }

  function iniciar() {
    pomo.rodando = true;
    pomo.fim = Date.now() + pomo.restante * 1000;
    salvarPomo();
    pararIntervalo();
    intervalo = setInterval(tique, 250);
    renderPomo();
  }

  function pausar() {
    pomo.restante = segundosRestantes();
    pomo.rodando = false;
    pomo.fim = null;
    salvarPomo();
    pararIntervalo();
    renderPomo();
  }

  btnIniciar.addEventListener("click", function () {
    if (pomo.rodando) pausar();
    else iniciar();
  });

  btnReiniciar.addEventListener("click", function () {
    pararIntervalo();
    pomo.rodando = false;
    pomo.fim = null;
    pomo.restante = duracao(pomo.modo);
    salvarPomo();
    renderPomo();
  });

  btnPular.addEventListener("click", function () {
    pararIntervalo();
    pomo.modo = pomo.modo === "foco" ? "pausa" : "foco";
    pomo.rodando = false;
    pomo.fim = null;
    pomo.restante = duracao(pomo.modo);
    salvarPomo();
    renderPomo();
  });

  function preencherMaterias() {
    var nomes = [];
    lerPlanos().forEach(function (p) {
      if (nomes.indexOf(p.materia) === -1) nomes.push(p.materia);
    });
    ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês"].forEach(function (m) {
      if (nomes.indexOf(m) === -1) nomes.push(m);
    });
    elMateria.innerHTML = nomes
      .map(function (m) {
        return '<option value="' + Util.escapar(m) + '">Estudando: ' + Util.escapar(m) + "</option>";
      })
      .join("");
    if (pomo.materia && nomes.indexOf(pomo.materia) !== -1) elMateria.value = pomo.materia;
  }

  elMateria.addEventListener("change", function () {
    pomo.materia = elMateria.value;
    salvarPomo();
  });

  // Se o tempo acabou enquanto o aluno estava em outra tela
  if (pomo.rodando) {
    if (segundosRestantes() <= 0) {
      setTimeout(terminar, 300);
    } else {
      intervalo = setInterval(tique, 250);
    }
  } else if (pomo.restante > duracao(pomo.modo)) {
    pomo.restante = duracao(pomo.modo); // tempo mudou nas configurações
  }

  /* =======================================================
     Metas da semana
     ======================================================= */
  var elMetas = document.getElementById("metas");
  var elContagem = document.getElementById("metas-contagem");
  var formMeta = document.getElementById("form-meta");
  var novaMeta = document.getElementById("nova-meta");

  function lerMetas() {
    var m = Dados.ler("metas", null);
    if (m === null && !Auth.ehDemo()) m = Dados.salvar("metas", []);
    if (m === null) {
      m = Dados.salvar("metas", [
        { id: Util.id(), texto: "Revisar Cálculo - Cap. 5", feita: true, contou: true },
        { id: Util.id(), texto: "Fazer exercícios de História", feita: false, contou: false },
        { id: Util.id(), texto: "Ler artigo de Ciências", feita: true, contou: true },
        { id: Util.id(), texto: "Preparar relatório de Computação", feita: false, contou: false },
      ]);
    }
    return m;
  }

  function renderMetas() {
    var metas = lerMetas();
    var feitas = metas.filter(function (m) {
      return m.feita;
    }).length;
    elContagem.textContent = metas.length ? feitas + "/" + metas.length + " Concluídas" : "";
    if (!metas.length) {
      elMetas.innerHTML = '<li class="meta--vazia">Sem metas por enquanto. Adicione uma abaixo!</li>';
      return;
    }
    elMetas.innerHTML = metas
      .map(function (m) {
        return (
          '<li class="' + (m.feita ? "feita" : "") + '"><label><input type="checkbox" data-meta="' + m.id + '"' + (m.feita ? " checked" : "") + " />" +
          "<span>" + Util.escapar(m.texto) + "</span></label>" +
          '<button type="button" class="botao-icone" data-remover-meta="' + m.id + '" aria-label="Remover meta"><span data-icone="x" data-tamanho="14"></span></button></li>'
        );
      })
      .join("");
  }

  elMetas.addEventListener("change", function (e) {
    var id = e.target.getAttribute("data-meta");
    if (!id) return;
    var metas = lerMetas();
    metas.forEach(function (m) {
      if (m.id !== id) return;
      m.feita = e.target.checked;
      if (m.feita && !m.contou) {
        m.contou = true;
        Conquistas.registrar("metas");
        EstadoMascote.ganhar({ felicidade: 3, xp: 10 });
      }
    });
    Dados.salvar("metas", metas);
    renderMetas();
  });

  elMetas.addEventListener("click", function (e) {
    var b = e.target.closest("[data-remover-meta]");
    if (!b) return;
    var id = b.getAttribute("data-remover-meta");
    Dados.salvar("metas", lerMetas().filter(function (m) {
      return m.id !== id;
    }));
    renderMetas();
  });

  formMeta.addEventListener("submit", function (e) {
    e.preventDefault();
    var texto = novaMeta.value.trim();
    if (!texto) return novaMeta.focus();
    var metas = lerMetas();
    metas.push({ id: Util.id(), texto: texto, feita: false, contou: false });
    Dados.salvar("metas", metas);
    novaMeta.value = "";
    renderMetas();
  });

  /* ---------------- Início ---------------- */
  renderPlanos();
  preencherMaterias();
  renderPomo();
  renderMetas();
})();
