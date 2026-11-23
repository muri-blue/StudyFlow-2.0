/* =========================================================
   StudyFlow — assistente.js
   Chat com o assistente (modo demonstração) e histórico.
   ========================================================= */
(function () {
  "use strict";

  var el = {
    mensagens: document.getElementById("mensagens"),
    form: document.getElementById("form-chat"),
    pergunta: document.getElementById("pergunta"),
    enviar: document.getElementById("btn-enviar"),
    anexo: document.getElementById("btn-anexo"),
    historico: document.getElementById("historico"),
    nova: document.getElementById("btn-nova"),
    modal: document.getElementById("modal-resumo"),
    resumoTitulo: document.getElementById("resumo-titulo"),
    resumoCorpo: document.getElementById("resumo-corpo"),
  };

  var atual = null; // conversa aberta
  var ocupado = false;

  /* ---------------- Conversas salvas ---------------- */
  function saudacao() {
    var nome = Auth.nomeExibido().split(" ")[0];
    return {
      autor: "ia",
      html:
        "<p>Olá " + Util.escapar(nome) + "! Como posso te ajudar nos estudos hoje? Podemos revisar alguma matéria, praticar com exercícios ou resumir um conteúdo difícil.</p>",
    };
  }

  function criarConversa(dataISO) {
    return { id: Util.id(), titulo: null, materia: null, data: dataISO || Util.hojeISO(), atualizado: Date.now(), mensagens: [saudacao()] };
  }

  function conversaExemplo(perguntas, diasAtras) {
    var c = criarConversa(Util.iso(Util.somarDias(Util.hoje(), -diasAtras)));
    c.atualizado = Date.now() - diasAtras * 86400000;
    perguntas.forEach(function (p) {
      var r = Respostas.responder(p, c.titulo);
      c.mensagens.push({ autor: "usuario", texto: p });
      c.mensagens.push({ autor: "ia", html: r.html, resumo: r.resumo || null });
      c.titulo = c.titulo || r.titulo;
      c.materia = c.materia || r.materia;
    });
    return c;
  }

  function lerConversas() {
    var lista = Dados.ler("conversas", null);
    if (lista === null && !Auth.ehDemo()) lista = Dados.salvar("conversas", []);
    if (lista === null) {
      lista = Dados.salvar("conversas", [
        conversaExemplo(["Preciso de ajuda para entender derivadas parciais", "Pode criar um resumo para estudar? Tenho uma prova sobre isso amanhã"], 0),
        conversaExemplo(["Me explica a segunda lei de Newton?"], 1),
        conversaExemplo(["Qual a diferença entre mitose e meiose?"], 6),
      ]);
    }
    return lista;
  }

  function salvarAtual() {
    if (!atual || atual.mensagens.length < 2) return; // não salva conversa vazia
    atual.atualizado = Date.now();
    var lista = lerConversas().filter(function (c) {
      return c.id !== atual.id;
    });
    lista.unshift(atual);
    Dados.salvar("conversas", lista.slice(0, 30));
  }

  /* ---------------- Mensagens ---------------- */
  function htmlMensagem(m, indice) {
    if (m.autor === "usuario") {
      var nome = Auth.nomeExibido();
      return (
        '<div class="mensagem mensagem--usuario">' +
        '<span class="mensagem__avatar" style="background:' + Util.escapar(Auth.corAvatar()) + '" aria-hidden="true">' + Util.escapar(Util.iniciais(nome)) + "</span>" +
        '<div class="mensagem__balao">' + Util.escapar(m.texto) + "</div></div>"
      );
    }
    var anexo = "";
    if (m.resumo) {
      anexo =
        '<div class="anexo"><span data-icone="fileText" data-tamanho="26" data-traco="1.8"></span>' +
        '<span class="anexo__nome">' + Util.escapar(m.resumo.titulo) + "</span>" +
        '<button type="button" class="anexo__abrir" data-resumo="' + indice + '">Abrir</button></div>';
    }
    return (
      '<div class="mensagem mensagem--ia">' +
      '<span class="mensagem__avatar" aria-hidden="true"><span data-icone="sparkles" data-tamanho="18"></span></span>' +
      '<div class="mensagem__balao">' + m.html + anexo + "</div></div>"
    );
  }

  function rolarParaFim() {
    el.mensagens.scrollTo({ top: el.mensagens.scrollHeight, behavior: "instant" });
  }

  function renderMensagens() {
    el.mensagens.innerHTML = atual.mensagens.map(htmlMensagem).join("");
    el.mensagens.classList.remove("trocando");
    void el.mensagens.offsetWidth;
    el.mensagens.classList.add("trocando");
    rolarParaFim();
  }

  /** Acrescenta só a última mensagem, com animação de entrada. */
  function adicionarUltima() {
    var i = atual.mensagens.length - 1;
    var tmp = document.createElement("div");
    tmp.innerHTML = htmlMensagem(atual.mensagens[i], i);
    var nova = tmp.firstChild;
    nova.classList.add("mensagem--nova");
    el.mensagens.appendChild(nova);
    el.mensagens.scrollTo({ top: el.mensagens.scrollHeight, behavior: Layout.semAnimacao() ? "auto" : "smooth" });
  }

  /* ---------------- Histórico ---------------- */
  function renderHistorico() {
    var lista = lerConversas();
    if (!lista.length) {
      el.historico.innerHTML = '<li class="vazio">Suas conversas vão aparecer aqui.</li>';
      return;
    }
    el.historico.innerHTML = lista
      .slice(0, 8)
      .map(function (c) {
        var detalhe = Util.dataRelativa(c.data) + (c.materia ? " • " + c.materia : "");
        var ativo = atual && atual.id === c.id;
        return (
          '<li class="' + (ativo ? "ativo" : "") + '"><button type="button" data-conversa="' + c.id + '"' + (ativo ? ' aria-current="true"' : "") + ">" +
          "<strong>" + Util.escapar(c.titulo || "Conversa") + "</strong><span>" + Util.escapar(detalhe) + "</span></button>" +
          '<button type="button" class="botao-icone botao-icone--pequeno historico__remover" data-apagar="' + c.id + '" aria-label="Apagar conversa"><span data-icone="x" data-tamanho="12"></span></button></li>'
        );
      })
      .join("");
  }

  el.historico.addEventListener("click", function (e) {
    var ap = e.target.closest("[data-apagar]");
    if (ap) {
      var id = ap.getAttribute("data-apagar");
      Dados.salvar("conversas", lerConversas().filter(function (c) {
        return c.id !== id;
      }));
      if (atual && atual.id === id) {
        atual = criarConversa();
        renderMensagens();
      }
      renderHistorico();
      return;
    }
    var b = e.target.closest("[data-conversa]");
    if (!b || ocupado) return;
    var conversa = lerConversas().filter(function (c) {
      return c.id === b.getAttribute("data-conversa");
    })[0];
    if (conversa) {
      atual = conversa;
      renderMensagens();
      renderHistorico();
    }
  });

  el.nova.addEventListener("click", function () {
    if (ocupado) return;
    atual = criarConversa();
    renderMensagens();
    renderHistorico();
    el.pergunta.focus();
  });

  /* ---------------- Enviar pergunta ---------------- */
  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    var texto = el.pergunta.value.trim();
    if (!texto || ocupado) return;
    ocupado = true;
    el.enviar.disabled = true;
    el.pergunta.value = "";

    atual.mensagens.push({ autor: "usuario", texto: texto });
    adicionarUltima();

    var digitando = document.createElement("div");
    digitando.className = "mensagem mensagem--ia mensagem--digitando mensagem--nova";
    digitando.innerHTML =
      '<span class="mensagem__avatar" aria-hidden="true"><span data-icone="sparkles" data-tamanho="18"></span></span>' +
      '<div class="mensagem__balao" aria-label="O assistente está digitando"><span></span><span></span><span></span></div>';
    el.mensagens.appendChild(digitando);
    rolarParaFim();

    setTimeout(function () {
      var r = Respostas.responder(texto, atual.titulo);
      digitando.remove();
      atual.mensagens.push({ autor: "ia", html: r.html, resumo: r.resumo || null });
      if (!atual.titulo && r.titulo) atual.titulo = r.titulo;
      if (!atual.materia && r.materia) atual.materia = r.materia;
      if (!atual.titulo) atual.titulo = texto.length > 32 ? texto.slice(0, 30) + "…" : texto;
      salvarAtual();
      adicionarUltima();
      renderHistorico();

      Conquistas.registrar("perguntas");
      EstadoMascote.ganhar({ sabedoria: 1, xp: 5 });

      ocupado = false;
      el.enviar.disabled = false;
      el.pergunta.focus();
    }, 700 + Math.random() * 600);
  });

  /* ---------------- Resumo anexado ---------------- */
  el.mensagens.addEventListener("click", function (e) {
    var b = e.target.closest("[data-resumo]");
    if (!b) return;
    var m = atual.mensagens[+b.getAttribute("data-resumo")];
    if (!m || !m.resumo) return;
    el.resumoTitulo.textContent = m.resumo.titulo;
    el.resumoCorpo.innerHTML = m.resumo.html;
    Layout.abrirModal(el.modal);
  });

  /* ---------------- Atalhos da lateral ---------------- */
  document.querySelectorAll(".sugestao").forEach(function (b) {
    b.addEventListener("click", function () {
      el.pergunta.value = b.getAttribute("data-modelo");
      el.pergunta.focus();
      el.pergunta.setSelectionRange(el.pergunta.value.length, el.pergunta.value.length);
    });
  });

  document.querySelectorAll(".chip").forEach(function (b) {
    b.addEventListener("click", function () {
      var materia = b.getAttribute("data-materia");
      var v = el.pergunta.value;
      if (/(sobre|de)\s$/.test(v)) el.pergunta.value = v + materia + ": ";
      else if (!v.trim()) el.pergunta.value = "Quero estudar " + materia + ". ";
      else el.pergunta.value = v.replace(/\s*$/, " ") + "(" + materia + ")";
      el.pergunta.focus();
    });
  });

  el.anexo.addEventListener("click", function () {
    Layout.aviso("Enviar arquivos vai funcionar quando a IA de verdade estiver no ar.", { icone: "info" });
  });

  /* ---------------- Início ---------------- */
  var lista = lerConversas();
  atual = lista.length ? lista[0] : criarConversa();
  renderMensagens();
  renderHistorico();
})();
