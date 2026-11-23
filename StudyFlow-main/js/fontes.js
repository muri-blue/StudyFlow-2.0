/* =========================================================
   StudyFlow — fontes.js
   Fontes de estudo (como no NotebookLM): o aluno anexa PDFs,
   documentos do Word, textos e anotações, e o gerador de plano
   usa o conteúdo para criar explicações e exercícios.

   - O texto de cada fonte fica no IndexedDB do navegador
     (aguenta muito mais que o localStorage).
   - PDF e Word são lidos por bibliotecas carregadas só quando
     precisa (pdf.js e mammoth).
   ========================================================= */
(function () {
  "use strict";

  // Guardadas no próprio projeto (pasta vendor/): funcionam sem internet
  // e não enviam nada para sites de terceiros (LGPD).
  // pdf.js 3.11.174 (Apache-2.0) e mammoth 1.6.0 (BSD-2) — licenças na pasta.
  var PDF_JS = "vendor/pdfjs/pdf.min.js";
  var PDF_WORKER = "vendor/pdfjs/pdf.worker.min.js";
  var MAMMOTH = "vendor/mammoth/mammoth.browser.min.js";

  var TAMANHO_MAXIMO = 25 * 1024 * 1024; // 25 MB por arquivo
  var TEXTO_MAXIMO = 300000; // caracteres guardados por fonte
  var PAGINAS_MAXIMAS = 200;

  var ACEITOS = ".pdf,.docx,.txt,.md,.csv,.html,.htm,.rtf,image/*";

  /* ---------------- Tipos ---------------- */
  function tipoDe(nome, mime) {
    var ext = (String(nome).split(".").pop() || "").toLowerCase();
    if (ext === "pdf" || mime === "application/pdf") return "pdf";
    if (ext === "docx") return "docx";
    if (/^image\//.test(mime || "") || ["png", "jpg", "jpeg", "gif", "webp", "bmp"].indexOf(ext) !== -1) return "imagem";
    if (["txt", "md", "csv", "rtf"].indexOf(ext) !== -1 || /^text\/plain/.test(mime || "")) return "texto";
    if (ext === "html" || ext === "htm") return "html";
    if (ext === "doc" || ext === "ppt" || ext === "pptx" || ext === "xls" || ext === "xlsx") return "nao-suportado";
    return "desconhecido";
  }

  var ROTULO = { pdf: "PDF", docx: "Word", texto: "Texto", html: "Página", imagem: "Imagem", colado: "Anotação" };
  var ICONE = { pdf: "fileText", docx: "fileText", texto: "fileText", html: "globe", imagem: "image", colado: "clipboard" };

  function tamanhoLegivel(b) {
    if (!b) return "";
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return Math.round(b / 1024) + " KB";
    return (b / 1024 / 1024).toFixed(1).replace(".", ",") + " MB";
  }

  function limpar(txt) {
    return String(txt || "")
      .replace(/\r/g, "")
      .replace(/[ \t ]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, TEXTO_MAXIMO);
  }

  /* ---------------- Bibliotecas sob demanda ---------------- */
  var carregando = {};
  function carregarScript(url) {
    if (!carregando[url]) {
      carregando[url] = new Promise(function (ok, erro) {
        var s = document.createElement("script");
        s.src = url;
        s.onload = ok;
        s.onerror = function () {
          delete carregando[url];
          erro(new Error("Não consegui abrir o leitor de arquivos. Recarregue a página e tente de novo."));
        };
        document.head.appendChild(s);
      });
    }
    return carregando[url];
  }

  function lerPDF(arquivo) {
    return carregarScript(PDF_JS)
      .then(function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
        return arquivo.arrayBuffer();
      })
      .then(function (buf) {
        return window.pdfjsLib.getDocument({ data: buf }).promise;
      })
      .then(function (doc) {
        var total = Math.min(doc.numPages, PAGINAS_MAXIMAS);
        var paginas = [];
        var cadeia = Promise.resolve();
        for (var i = 1; i <= total; i++) {
          (function (n) {
            cadeia = cadeia
              .then(function () {
                return doc.getPage(n);
              })
              .then(function (pag) {
                return pag.getTextContent();
              })
              .then(function (conteudo) {
                paginas.push(
                  conteudo.items
                    .map(function (it) {
                      return it.str + (it.hasEOL ? "\n" : " ");
                    })
                    .join("")
                );
              });
          })(i);
        }
        return cadeia.then(function () {
          var texto = paginas.join("\n\n");
          return {
            texto: texto,
            paginas: doc.numPages,
            aviso: limpar(texto).length < 50 ? "Este PDF parece ser só imagem (escaneado). Na demonstração não dá para ler o texto dele." : "",
          };
        });
      });
  }

  function lerDOCX(arquivo) {
    return carregarScript(MAMMOTH)
      .then(function () {
        return arquivo.arrayBuffer();
      })
      .then(function (buf) {
        return window.mammoth.extractRawText({ arrayBuffer: buf });
      })
      .then(function (r) {
        return { texto: r.value };
      });
  }

  function lerTexto(arquivo) {
    return arquivo.text().then(function (t) {
      return { texto: t };
    });
  }

  function lerHTML(arquivo) {
    return arquivo.text().then(function (t) {
      var doc = new DOMParser().parseFromString(t, "text/html");
      doc.querySelectorAll("script,style,nav,footer").forEach(function (n) {
        n.remove();
      });
      return { texto: doc.body ? doc.body.innerText || doc.body.textContent : "" };
    });
  }

  /** Lê um arquivo e devolve { nome, tipo, tamanho, texto, paginas, aviso } */
  function ler(arquivo) {
    var tipo = tipoDe(arquivo.name, arquivo.type);
    var base = { id: Util.id(), nome: arquivo.name, tipo: tipo, tamanho: arquivo.size };
    if (arquivo.size > TAMANHO_MAXIMO) return Promise.reject(new Error("Arquivo grande demais (máximo 25 MB)."));
    if (tipo === "nao-suportado") return Promise.reject(new Error("Esse formato ainda não é aceito. Salve como PDF ou .docx."));
    if (tipo === "desconhecido") return Promise.reject(new Error("Formato não reconhecido. Use PDF, Word (.docx), TXT ou imagem."));

    var leitor =
      tipo === "pdf" ? lerPDF :
      tipo === "docx" ? lerDOCX :
      tipo === "html" ? lerHTML :
      tipo === "imagem" ? function () {
        return Promise.resolve({ texto: "", aviso: "Imagem anexada. A leitura de imagens chega com a IA de verdade." });
      } :
      lerTexto;

    return leitor(arquivo).then(function (r) {
      var texto = limpar(r.texto);
      return Object.assign(base, { texto: texto, caracteres: texto.length, paginas: r.paginas || null, aviso: r.aviso || "" });
    });
  }

  function deTexto(titulo, texto) {
    var t = limpar(texto);
    return {
      id: Util.id(),
      nome: (titulo || "").trim() || "Anotação colada",
      tipo: "colado",
      tamanho: t.length,
      texto: t,
      caracteres: t.length,
      paginas: null,
      aviso: "",
    };
  }

  /* ---------------- Armazenamento (IndexedDB) ---------------- */
  function nomeBanco() {
    var u = Auth.usuario();
    return "studyflow-fontes-" + (u ? u.matricula : "anonimo");
  }

  var bancoAberto = null;
  function banco() {
    if (!bancoAberto) {
      bancoAberto = new Promise(function (ok, erro) {
        var req = indexedDB.open(nomeBanco(), 1);
        req.onupgradeneeded = function () {
          req.result.createObjectStore("fontes", { keyPath: "id" });
        };
        req.onsuccess = function () {
          ok(req.result);
        };
        req.onerror = function () {
          erro(req.error);
        };
      });
    }
    return bancoAberto;
  }

  function transacao(modo, acao) {
    return banco().then(function (db) {
      return new Promise(function (ok, erro) {
        var tx = db.transaction("fontes", modo);
        var resultado = acao(tx.objectStore("fontes"));
        tx.oncomplete = function () {
          ok(resultado && "result" in resultado ? resultado.result : undefined);
        };
        tx.onerror = function () {
          erro(tx.error);
        };
      });
    });
  }

  /** Guarda o texto e devolve só os dados leves (sem o texto) para salvar no plano. */
  function guardar(fonte) {
    return transacao("readwrite", function (st) {
      st.put({ id: fonte.id, nome: fonte.nome, texto: fonte.texto || "" });
    }).then(function () {
      return metadados(fonte);
    });
  }

  function metadados(f) {
    return { id: f.id, nome: f.nome, tipo: f.tipo, tamanho: f.tamanho, caracteres: f.caracteres || 0, paginas: f.paginas || null, aviso: f.aviso || "" };
  }

  function textos(ids) {
    return Promise.all(
      (ids || []).map(function (id) {
        return transacao("readonly", function (st) {
          return st.get(id);
        }).catch(function () {
          return null;
        });
      })
    ).then(function (lista) {
      return lista.filter(Boolean);
    });
  }

  function remover(id) {
    return transacao("readwrite", function (st) {
      st.delete(id);
    }).catch(function () {});
  }

  function apagarTudo() {
    bancoAberto = null;
    return new Promise(function (ok) {
      var req = indexedDB.deleteDatabase(nomeBanco());
      req.onsuccess = req.onerror = req.onblocked = function () {
        ok();
      };
    });
  }

  /* ---------------- Componente: seletor de fontes ---------------- */
  /**
   * Monta a área de upload + lista de fontes dentro de "alvo".
   * opcoes.aoMudar(): chamado quando a lista muda.
   * Retorna { itens(), prontos(), lendo(), limpar() }
   */
  function criarSeletor(alvo, opcoes) {
    opcoes = opcoes || {};
    var itens = [];
    var idCampo = "arquivo-" + Util.id();

    alvo.classList.add("fontes");
    if (opcoes.compacto) alvo.classList.add("fontes--compacto");
    alvo.innerHTML =
      // Área de soltar: caixa tracejada, nuvem, "ou" e botão em pílula
      '<div class="fontes__zona">' +
      '<input id="' + idCampo + '" type="file" multiple accept="' + ACEITOS + '" class="sr-only" tabindex="-1" />' +
      '<div class="fontes__zona-borda">' +
      '<span class="fontes__nuvem" data-icone="cloudUpload" data-tamanho="' + (opcoes.compacto ? 40 : 48) + '" data-traco="2.4"></span>' +
      '<strong class="fontes__zona-titulo">' + (opcoes.titulo || "Arraste e solte arquivos aqui") + "</strong>" +
      '<span class="fontes__zona-ou">ou</span>' +
      '<button type="button" class="fontes__escolher">Escolher arquivos</button>' +
      '<span class="fontes__zona-dica">PDF, Word, TXT ou imagens · até 25 MB</span>' +
      "</div>" +
      "</div>" +
      (opcoes.semColar ? "" : '<button type="button" class="fontes__colar-abrir"><span data-icone="clipboard" data-tamanho="15"></span>Colar texto ou anotação</button>') +
      '<div class="fontes__colar" hidden>' +
      '<input type="text" class="entrada" maxlength="60" placeholder="Título (ex.: Anotações da aula)" />' +
      '<textarea class="entrada" rows="5" placeholder="Cole aqui o texto do livro, do caderno ou da aula..."></textarea>' +
      '<div class="fontes__colar-acoes"><button type="button" class="botao-secundario" data-colar="cancelar">Cancelar</button>' +
      '<button type="button" class="botao-primario" data-colar="adicionar">Adicionar fonte</button></div>' +
      "</div>" +
      '<ul class="fontes__lista"></ul>';

    var zona = alvo.querySelector(".fontes__zona");
    var campo = alvo.querySelector('input[type="file"]');
    var lista = alvo.querySelector(".fontes__lista");
    var colar = alvo.querySelector(".fontes__colar");
    var abrirColar = alvo.querySelector(".fontes__colar-abrir");

    function render() {
      lista.innerHTML = itens
        .map(function (f) {
          var info;
          if (f.status === "lendo") info = '<span class="fontes__status"><span class="girando" data-icone="loader" data-tamanho="12"></span>Lendo…</span>';
          else if (f.status === "erro") info = '<span class="fontes__status fontes__status--erro">' + Util.escapar(f.erro) + "</span>";
          else {
            var partes = [ROTULO[f.tipo] || "Arquivo"];
            if (f.paginas) partes.push(f.paginas + (f.paginas === 1 ? " página" : " páginas"));
            if (f.caracteres) partes.push(Math.max(1, Math.round(f.caracteres / 6)).toLocaleString("pt-BR") + " palavras");
            else if (f.tamanho) partes.push(tamanhoLegivel(f.tamanho));
            info = "<span>" + partes.join(" · ") + "</span>" + (f.aviso ? '<span class="fontes__aviso">' + Util.escapar(f.aviso) + "</span>" : "");
          }
          return (
            '<li class="fonte fonte--' + f.tipo + (f.status ? " fonte--" + f.status : "") + '">' +
            '<span class="fonte__icone" data-icone="' + (ICONE[f.tipo] || "fileText") + '" data-tamanho="16"></span>' +
            '<div class="fonte__texto"><strong title="' + Util.escapar(f.nome) + '">' + Util.escapar(f.nome) + "</strong>" + info + "</div>" +
            '<button type="button" class="botao-icone botao-icone--pequeno" data-tirar="' + f.id + '" aria-label="Tirar ' + Util.escapar(f.nome) + '"><span data-icone="x" data-tamanho="13"></span></button>' +
            "</li>"
          );
        })
        .join("");
      if (opcoes.aoMudar) opcoes.aoMudar();
    }

    function adicionarArquivos(arquivos) {
      Array.prototype.forEach.call(arquivos, function (arq) {
        var item = { id: Util.id(), nome: arq.name, tipo: tipoDe(arq.name, arq.type), tamanho: arq.size, status: "lendo" };
        itens.push(item);
        ler(arq)
          .then(function (f) {
            Object.assign(item, f, { id: item.id, status: "" });
            // Quem usa o seletor pode "pegar" o arquivo assim que ele é lido
            if (opcoes.aoPronto) {
              opcoes.aoPronto(item);
              itens = itens.filter(function (x) {
                return x !== item;
              });
            }
          })
          .catch(function (e) {
            item.status = "erro";
            item.erro = e.message || "Não consegui ler este arquivo.";
          })
          .then(render);
      });
      render();
    }

    campo.addEventListener("change", function () {
      adicionarArquivos(campo.files);
      campo.value = "";
    });

    // Clicar no botão ou em qualquer parte da área abre o seletor de arquivos
    zona.addEventListener("click", function () {
      campo.click();
    });

    // Contador evita "piscar" quando o arquivo passa por cima dos elementos de dentro
    var profundidade = 0;
    zona.addEventListener("dragenter", function (e) {
      e.preventDefault();
      profundidade++;
      zona.classList.add("fontes__zona--arrastando");
    });
    zona.addEventListener("dragover", function (e) {
      e.preventDefault();
    });
    zona.addEventListener("dragleave", function () {
      profundidade = Math.max(0, profundidade - 1);
      if (!profundidade) zona.classList.remove("fontes__zona--arrastando");
    });
    zona.addEventListener("drop", function (e) {
      e.preventDefault();
      profundidade = 0;
      zona.classList.remove("fontes__zona--arrastando");
      zona.classList.add("fontes__zona--recebeu");
      setTimeout(function () {
        zona.classList.remove("fontes__zona--recebeu");
      }, 600);
    });
    zona.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) adicionarArquivos(e.dataTransfer.files);
    });

    if (abrirColar) abrirColar.addEventListener("click", function () {
      colar.hidden = false;
      if (abrirColar) abrirColar.hidden = true;
      colar.querySelector("textarea").focus();
    });

    colar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-colar]");
      if (!b) return;
      var titulo = colar.querySelector("input");
      var texto = colar.querySelector("textarea");
      if (b.getAttribute("data-colar") === "adicionar") {
        if (texto.value.trim().length < 20) {
          texto.focus();
          return Layout.aviso("Cole um texto um pouco maior (pelo menos uma frase).", { icone: "info" });
        }
        itens.push(Object.assign(deTexto(titulo.value, texto.value), { status: "" }));
        render();
      }
      titulo.value = "";
      texto.value = "";
      colar.hidden = true;
      if (abrirColar) abrirColar.hidden = false;
    });

    lista.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tirar]");
      if (!b) return;
      var id = b.getAttribute("data-tirar");
      itens = itens.filter(function (f) {
        return f.id !== id;
      });
      render();
    });

    return {
      itens: function () {
        return itens.slice();
      },
      /** Fontes lidas com sucesso (com texto em memória) */
      prontos: function () {
        return itens.filter(function (f) {
          return !f.status;
        });
      },
      lendo: function () {
        return itens.some(function (f) {
          return f.status === "lendo";
        });
      },
      limpar: function () {
        itens = [];
        colar.hidden = true;
        if (abrirColar) abrirColar.hidden = false;
        render();
      },
    };
  }

  window.Fontes = {
    ACEITOS: ACEITOS,
    ROTULO: ROTULO,
    ICONE: ICONE,
    tamanhoLegivel: tamanhoLegivel,
    ler: ler,
    deTexto: deTexto,
    guardar: guardar,
    metadados: metadados,
    textos: textos,
    remover: remover,
    apagarTudo: apagarTudo,
    criarSeletor: criarSeletor,
  };
})();
