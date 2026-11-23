/* =========================================================
   StudyFlow — cadastro.js (Cadastro de alunos em lote)
   Lê uma planilha CSV, confere cada linha e salva os válidos
   pelo js/rede.js (hoje no navegador; depois, no servidor).
   ========================================================= */
(function () {
  "use strict";

  var el = {
    modelo: document.getElementById("btn-modelo"),
    zona: document.getElementById("zona"),
    arquivo: document.getElementById("arquivo"),
    colar: document.getElementById("colar"),
    conferir: document.getElementById("btn-conferir"),
    resultado: document.getElementById("resultado"),
    resultadoSub: document.getElementById("resultado-sub"),
    resumo: document.getElementById("resumo"),
    linhas: document.getElementById("linhas"),
    limpar: document.getElementById("btn-limpar"),
    salvar: document.getElementById("btn-salvar"),
    salvosSub: document.getElementById("salvos-sub"),
    apagarSalvos: document.getElementById("btn-apagar-salvos"),
  };

  var turmasDaRede = [];
  var conferidos = [];

  /* ---------------- Texto → linhas ---------------- */
  function normal(txt) {
    return Util.semAcento(txt)
      .replace(/\(exemplo\)/g, "")
      .replace(/[º°ª]/g, "")
      .replace(/^(emeb|e\.m\.e\.b\.|em|e\.m\.|escola municipal( de educacao basica)?)\s+/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Lê CSV com ; , ou tab, aspas e quebras de linha dentro de aspas. */
  function lerCSV(texto) {
    texto = String(texto || "").replace(/^﻿/, "");
    var primeira = texto.split(/\r?\n/)[0] || "";
    var sep = [";", "\t", ","].sort(function (a, b) {
      return primeira.split(b).length - primeira.split(a).length;
    })[0];
    var linhas = [], campo = "", linha = [], aspas = false;
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (aspas) {
        if (c === '"' && texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else if (c === '"') aspas = false;
        else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === sep) {
        linha.push(campo);
        campo = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        linha.push(campo);
        linhas.push(linha);
        linha = [];
        campo = "";
      } else campo += c;
    }
    if (campo || linha.length) {
      linha.push(campo);
      linhas.push(linha);
    }
    return linhas.filter(function (l) {
      return l.some(function (x) {
        return x.trim();
      });
    });
  }

  var COLUNAS = {
    nome: ["nome", "nome completo", "aluno", "nome do aluno"],
    matricula: ["matricula", "matricula do aluno", "codigo", "ra"],
    escola: ["escola", "unidade", "unidade escolar"],
    turma: ["turma", "serie", "ano/turma", "classe"],
  };

  function mapearCabecalho(cab) {
    var mapa = {};
    cab.forEach(function (c, i) {
      var n = Util.semAcento(c).trim();
      Object.keys(COLUNAS).forEach(function (k) {
        if (mapa[k] === undefined && COLUNAS[k].indexOf(n) !== -1) mapa[k] = i;
      });
    });
    return mapa;
  }

  /* ---------------- Conferência ---------------- */
  function conferir(texto, jaSalvos) {
    var linhas = lerCSV(texto);
    if (!linhas.length) return { erroGeral: "O arquivo está vazio." };
    var mapa = mapearCabecalho(linhas[0]);
    var faltando = Object.keys(COLUNAS).filter(function (k) {
      return mapa[k] === undefined;
    });
    if (faltando.length) {
      return { erroGeral: "Não achei a(s) coluna(s): " + faltando.join(", ") + ". A primeira linha precisa ter os títulos nome; matricula; escola; turma — baixe o modelo." };
    }

    var salvos = {};
    jaSalvos.forEach(function (a) {
      salvos[a.matricula] = true;
    });
    var vistas = {};

    var resultado = linhas.slice(1).map(function (l, i) {
      var a = {
        linha: i + 2,
        nome: (l[mapa.nome] || "").trim().replace(/\s+/g, " "),
        matricula: (l[mapa.matricula] || "").trim(),
        escola: (l[mapa.escola] || "").trim(),
        turma: (l[mapa.turma] || "").trim(),
        erros: [],
        avisos: [],
      };
      if (!a.nome) a.erros.push("Falta o nome");
      else if (a.nome.split(" ").length < 2) a.avisos.push("Só um nome — confira se é o nome completo");
      if (!a.matricula) a.erros.push("Falta a matrícula");
      else if (!/^[A-Za-z0-9.\-]{3,20}$/.test(a.matricula)) a.erros.push("Matrícula com caracteres inválidos");
      else if (vistas[a.matricula]) a.erros.push("Matrícula repetida (linha " + vistas[a.matricula] + ")");
      else if (salvos[a.matricula]) a.erros.push("Já cadastrado antes");
      if (a.matricula) vistas[a.matricula] = vistas[a.matricula] || a.linha;

      var escolaN = normal(a.escola);
      var daEscola = turmasDaRede.filter(function (t) {
        return normal(t.escola) === escolaN;
      });
      if (!a.escola) a.erros.push("Falta a escola");
      else if (!daEscola.length) a.erros.push("Escola não encontrada na rede");
      else {
        a.escola = daEscola[0].escola;
        var turma = daEscola.filter(function (t) {
          return normal(t.nome) === normal(a.turma);
        })[0];
        if (!a.turma) a.erros.push("Falta a turma");
        else if (!turma) a.erros.push("Turma não existe nesta escola (" + daEscola.map(function (t) { return t.nome; }).join(", ") + ")");
        else {
          a.turma = turma.nome;
          a.turmaId = turma.id;
        }
      }
      return a;
    });
    return { alunos: resultado };
  }

  /* ---------------- Desenho ---------------- */
  function chip(classe, texto) {
    return '<span class="situacao situacao--' + classe + '">' + texto + "</span>";
  }

  function mostrar(r) {
    el.resultado.hidden = false;
    if (r.erroGeral) {
      conferidos = [];
      el.resultadoSub.textContent = "";
      el.resumo.innerHTML = chip("nunca", "Não deu para ler");
      el.linhas.innerHTML = '<tr><td colspan="6"><div class="vazio-gestao">' + Util.escapar(r.erroGeral) + "</div></td></tr>";
      el.salvar.hidden = true;
      return;
    }
    conferidos = r.alunos;
    var ok = conferidos.filter(function (a) {
      return !a.erros.length;
    });
    var ruins = conferidos.length - ok.length;
    el.resultadoSub.textContent = conferidos.length + " linha(s) lida(s)";
    el.resumo.innerHTML = chip("ok", ok.length + " prontos") + (ruins ? chip("nunca", ruins + " com erro") : "");
    el.linhas.innerHTML = conferidos
      .slice()
      .sort(function (a, b) {
        return (b.erros.length ? 1 : 0) - (a.erros.length ? 1 : 0) || a.linha - b.linha;
      })
      .map(function (a) {
        var sit = a.erros.length
          ? a.erros.map(function (e) {
              return '<span class="erro-celula">' + Util.escapar(e) + "</span>";
            }).join("")
          : chip("ok", "Pronto") + a.avisos.map(function (e) {
              return '<span class="erro-celula" style="color:#b45309">' + Util.escapar(e) + "</span>";
            }).join("");
        return (
          '<tr class="' + (a.erros.length ? "linha-erro" : "") + '">' +
          "<td>" + a.linha + "</td>" +
          "<td>" + Util.escapar(a.nome || "—") + "</td>" +
          "<td>" + Util.escapar(a.matricula || "—") + "</td>" +
          "<td>" + Util.escapar(a.escola || "—") + "</td>" +
          "<td>" + Util.escapar(a.turma || "—") + "</td>" +
          "<td>" + sit + "</td></tr>"
        );
      })
      .join("");
    el.salvar.hidden = !ok.length;
    el.salvar.textContent = ruins ? "Salvar os " + ok.length + " prontos" : "Salvar " + ok.length + " aluno(s)";
    el.resultado.scrollIntoView({ behavior: Layout.semAnimacao() ? "auto" : "smooth", block: "start" });
  }

  function renderSalvos() {
    Rede.alunosImportados().then(function (lista) {
      el.salvosSub.textContent = lista.length
        ? lista.length + " aluno(s) cadastrado(s) neste navegador. Com o servidor, eles recebem conta e senha."
        : "Nenhum ainda.";
      el.apagarSalvos.hidden = !lista.length;
    });
  }

  function processar(texto) {
    Rede.alunosImportados().then(function (salvos) {
      mostrar(conferir(texto, salvos));
    });
  }

  /* ---------------- Ações ---------------- */
  el.modelo.addEventListener("click", function () {
    var csv =
      "﻿nome;matricula;escola;turma\r\n" +
      "Maria Eduarda Souza;202600101;EMEB Governador Pedro Ivo Campos;8º ano A\r\n" +
      "João Pedro Schmidt;202600102;EMEB Ana Régis Arantes;6º ano A\r\n";
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "modelo-cadastro-alunos.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  });

  function lerArquivo(arq) {
    if (!arq) return;
    if (/\.xlsx?$/i.test(arq.name)) {
      Layout.aviso("Esse é um arquivo do Excel. Abra no Excel e use Salvar como → CSV.", { icone: "info", duracao: 5000 });
      return;
    }
    var leitor = new FileReader();
    leitor.onload = function () {
      var texto = String(leitor.result);
      // Excel antigo salva em Windows-1252: se vierem caracteres quebrados, lê de novo assim
      if (texto.indexOf("�") !== -1) {
        var outro = new FileReader();
        outro.onload = function () {
          processar(String(outro.result));
        };
        outro.readAsText(arq, "windows-1252");
        return;
      }
      processar(texto);
    };
    leitor.readAsText(arq, "utf-8");
  }

  el.arquivo.addEventListener("change", function () {
    lerArquivo(el.arquivo.files[0]);
    el.arquivo.value = "";
  });

  ["dragenter", "dragover"].forEach(function (t) {
    el.zona.addEventListener(t, function (e) {
      e.preventDefault();
      el.zona.classList.add("arrastando");
    });
  });
  ["dragleave", "drop"].forEach(function (t) {
    el.zona.addEventListener(t, function (e) {
      e.preventDefault();
      el.zona.classList.remove("arrastando");
    });
  });
  el.zona.addEventListener("drop", function (e) {
    lerArquivo(e.dataTransfer.files[0]);
  });

  el.conferir.addEventListener("click", function () {
    if (!el.colar.value.trim()) return;
    processar(el.colar.value);
  });

  el.limpar.addEventListener("click", function () {
    conferidos = [];
    el.resultado.hidden = true;
    el.colar.value = "";
  });

  el.salvar.addEventListener("click", function () {
    var ok = conferidos.filter(function (a) {
      return !a.erros.length;
    }).map(function (a) {
      return { nome: a.nome, matricula: a.matricula, escola: a.escola, turma: a.turma, turmaId: a.turmaId };
    });
    if (!ok.length) return;
    Rede.salvarAlunosImportados(ok).then(function (r) {
      Layout.aviso(r.salvos + " aluno(s) cadastrado(s)!", { icone: "check", tipo: "sucesso" });
      el.resultado.hidden = true;
      el.colar.value = "";
      renderSalvos();
    });
  });

  el.apagarSalvos.addEventListener("click", function () {
    if (!confirm("Apagar os alunos cadastrados por planilha neste navegador? (só para testes)")) return;
    Rede.apagarImportados().then(renderSalvos);
  });

  Rede.turmasDaRede().then(function (t) {
    turmasDaRede = t;
  });
  renderSalvos();
})();
