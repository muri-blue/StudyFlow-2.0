/* =========================================================
   StudyFlow — calendario.js
   ========================================================= */
(function () {
  "use strict";

  var el = {
    titulo: document.getElementById("titulo-pagina"),
    subtitulo: document.getElementById("subtitulo-pagina"),
    tituloCard: document.getElementById("titulo-card"),
    subCard: document.getElementById("subtitulo-card"),
    grade: document.getElementById("grade"),
    anterior: document.getElementById("btn-anterior"),
    proximo: document.getElementById("btn-proximo"),
    hoje: document.getElementById("btn-hoje"),
    novo: document.getElementById("btn-novo"),
    visoes: document.querySelectorAll("[data-visao]"),
    agendaData: document.getElementById("agenda-data"),
    agendaLista: document.getElementById("agenda-lista"),
    modal: document.getElementById("modal-evento"),
    modalTitulo: document.getElementById("modal-titulo"),
    form: document.getElementById("form-evento"),
    erro: document.getElementById("ev-erro"),
    campos: {
      titulo: document.getElementById("ev-titulo"),
      data: document.getElementById("ev-data"),
      hora: document.getElementById("ev-hora"),
      materia: document.getElementById("ev-materia"),
      tipo: document.getElementById("ev-tipo"),
      prioridade: document.getElementById("ev-prioridade"),
    },
  };

  var estado = {
    visao: "mes",
    cursor: Util.hoje(),
    editando: null, // id do evento em edição
    direcao: "", // "frente" ou "tras" na próxima troca de mês/semana
  };

  function classeGrade(base) {
    var c = base + (estado.direcao ? " grade--ir-" + estado.direcao : "");
    estado.direcao = "";
    return c;
  }

  var ICONE_TIPO = { tarefa: "checkSquare", trabalho: "fileText", prova: "clipboardCheck" };

  /* ---------------- Grade ---------------- */
  function htmlEventosDoDia(eventos, limite, detalhado) {
    var h = "";
    eventos.slice(0, limite).forEach(function (ev) {
      var texto = detalhado ? (ev.hora ? ev.hora + " " : "") + ev.titulo : Eventos.TIPOS[ev.tipo];
      h +=
        '<span class="evento evento--' + ev.tipo + '" title="' + Util.escapar((ev.hora ? ev.hora + " · " : "") + ev.titulo) + '">' +
        "<span>" + Util.escapar(texto) + "</span></span>";
    });
    if (eventos.length > limite) h += '<span class="dia__mais">+' + (eventos.length - limite) + " mais</span>";
    return h;
  }

  function celula(data, foraDoMes, detalhado) {
    var iso = Util.iso(data);
    var eventos = Eventos.doDia(iso);
    var classes = "dia";
    if (foraDoMes) classes += " dia--fora";
    if (iso === Util.hojeISO()) classes += " dia--hoje";
    var rotulo = data.getDate() + " de " + Util.MESES[data.getMonth()] + (eventos.length ? ", " + eventos.length + " evento(s)" : "");
    return (
      '<button type="button" class="' + classes + '" data-data="' + iso + '" aria-label="' + rotulo + '"' +
      (iso === Util.hojeISO() ? ' aria-current="date"' : "") + ">" +
      '<span class="dia__numero">' + data.getDate() + "</span>" +
      '<span class="dia__eventos">' + htmlEventosDoDia(eventos, detalhado ? 6 : 2, detalhado) + "</span>" +
      "</button>"
    );
  }

  function renderMes() {
    var c = estado.cursor;
    var primeiro = new Date(c.getFullYear(), c.getMonth(), 1);
    var ultimo = new Date(c.getFullYear(), c.getMonth() + 1, 0);
    var inicio = Util.inicioSemana(primeiro);
    var fim = Util.somarDias(Util.inicioSemana(ultimo), 6);
    var html = "";
    for (var d = inicio; d <= fim; d = Util.somarDias(d, 1)) {
      html += celula(d, d.getMonth() !== c.getMonth(), false);
    }
    el.grade.className = classeGrade("grade");
    el.grade.innerHTML = html;

    var nomeMes = Util.MESES[c.getMonth()] + " " + c.getFullYear();
    el.tituloCard.textContent = nomeMes;
    el.titulo.textContent = nomeMes;
    el.subCard.textContent = "Calendário acadêmico";
  }

  function renderSemana() {
    var inicio = Util.inicioSemana(estado.cursor);
    var html = "";
    for (var i = 0; i < 7; i++) {
      var d = Util.somarDias(inicio, i);
      html += celula(d, false, true);
    }
    el.grade.className = classeGrade("grade grade--semana");
    el.grade.innerHTML = html;

    var fim = Util.somarDias(inicio, 6);
    var titulo = inicio.getDate() + " – " + Util.dataCurta(fim) + " " + fim.getFullYear();
    el.tituloCard.textContent = titulo;
    el.titulo.textContent = Util.MESES[estado.cursor.getMonth()] + " " + estado.cursor.getFullYear();
    el.subCard.textContent = "Semana";
  }

  function renderSubtitulo() {
    var n = Eventos.doDia(Util.hojeISO()).length;
    el.subtitulo.textContent = "Calendário • " + (n === 0 ? "nenhum evento hoje" : n === 1 ? "1 evento hoje" : n + " eventos hoje");
  }

  /* ---------------- Agenda de hoje ---------------- */
  function renderAgenda() {
    var hoje = Util.hoje();
    el.agendaData.textContent = Util.dataCurta(hoje);
    var eventos = Eventos.doDia(Util.iso(hoje));
    if (!eventos.length) {
      el.agendaLista.innerHTML = '<li class="vazio">Nenhum evento para hoje.<br />Aproveite para adiantar os estudos!</li>';
      return;
    }
    el.agendaLista.innerHTML = eventos
      .map(function (ev) {
        var detalhe = [ev.hora, ev.materia].filter(Boolean).join(" • ");
        if (ev.daTurma) {
          // Evento do professor: o aluno vê, mas não edita nem apaga
          return (
            '<li class="agenda__item agenda__item--turma">' +
            '<span class="agenda__icone agenda__icone--' + ev.tipo + '"><span data-icone="' + ICONE_TIPO[ev.tipo] + '" data-tamanho="18"></span></span>' +
            '<div class="agenda__texto"><strong>' + Util.escapar(ev.titulo) + "</strong><span>" +
            Util.escapar((detalhe ? detalhe + " • " : "") + "por " + (ev.professor || "Professor(a)")) + "</span></div>" +
            '<span class="selo-turma"><span data-icone="users" data-tamanho="12"></span>Turma</span>' +
            "</li>"
          );
        }
        return (
          '<li class="agenda__item" data-id="' + ev.id + '">' +
          '<span class="agenda__icone agenda__icone--' + ev.tipo + '"><span data-icone="' + ICONE_TIPO[ev.tipo] + '" data-tamanho="18"></span></span>' +
          '<button type="button" class="agenda__texto" data-editar="' + ev.id + '" title="Editar evento">' +
          "<strong>" + Util.escapar(ev.titulo) + "</strong><span>" + Util.escapar(detalhe || Eventos.TIPOS[ev.tipo]) + "</span></button>" +
          '<span class="prioridade prioridade--' + ev.prioridade + '">' + Eventos.PRIORIDADES[ev.prioridade] + "</span>" +
          '<button type="button" class="botao-icone agenda__remover" data-remover="' + ev.id + '" aria-label="Apagar evento ' + Util.escapar(ev.titulo) + '"><span data-icone="x" data-tamanho="14"></span></button>' +
          "</li>"
        );
      })
      .join("");
  }

  function render() {
    if (estado.visao === "semana") renderSemana();
    else renderMes();
    renderSubtitulo();
    renderAgenda();
    el.visoes.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-visao") === estado.visao));
    });
  }

  /* ---------------- Modal ---------------- */
  function abrirModal(dataISO, evento) {
    estado.editando = evento ? evento.id : null;
    el.modalTitulo.textContent = evento ? "Editar evento" : "Novo evento";
    el.erro.hidden = true;
    var c = el.campos;
    c.titulo.value = evento ? evento.titulo : "";
    c.data.value = evento ? evento.data : dataISO || Util.hojeISO();
    c.hora.value = evento ? evento.hora : "08:00";
    c.materia.value = evento ? evento.materia : "";
    c.tipo.value = evento ? evento.tipo : "tarefa";
    c.prioridade.value = evento ? evento.prioridade : "media";
    Layout.abrirModal(el.modal);
    setTimeout(function () {
      c.titulo.focus();
    }, 30);
  }

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    var c = el.campos;
    var dados = {
      titulo: c.titulo.value.trim(),
      data: c.data.value,
      hora: c.hora.value,
      materia: c.materia.value.trim(),
      tipo: c.tipo.value,
      prioridade: c.prioridade.value,
    };
    if (!dados.titulo) {
      el.erro.textContent = "Dê um título ao evento.";
      el.erro.hidden = false;
      c.titulo.focus();
      return;
    }
    if (!dados.data) {
      el.erro.textContent = "Escolha a data do evento.";
      el.erro.hidden = false;
      c.data.focus();
      return;
    }
    if (estado.editando) {
      Eventos.atualizar(estado.editando, dados);
      Layout.aviso("Evento atualizado.", { icone: "check", tipo: "sucesso" });
    } else {
      Eventos.adicionar(dados);
      Layout.aviso("Evento criado!", { icone: "check", tipo: "sucesso" });
    }
    Layout.fecharModal(el.modal);
    // Mostra o mês do evento salvo
    estado.cursor = Util.data(dados.data);
    render();
  });

  /* ---------------- Ações ---------------- */
  el.grade.addEventListener("click", function (e) {
    var dia = e.target.closest(".dia");
    if (dia) abrirModal(dia.getAttribute("data-data"));
  });

  el.agendaLista.addEventListener("click", function (e) {
    var rem = e.target.closest("[data-remover]");
    if (rem) {
      var ev = Eventos.buscar(rem.getAttribute("data-remover"));
      if (ev && confirm('Apagar o evento "' + ev.titulo + '"?')) {
        Eventos.remover(ev.id);
        render();
      }
      return;
    }
    var ed = e.target.closest("[data-editar]");
    if (ed) abrirModal(null, Eventos.buscar(ed.getAttribute("data-editar")));
  });

  el.anterior.addEventListener("click", function () {
    estado.direcao = "tras";
    var c = estado.cursor;
    estado.cursor = estado.visao === "semana" ? Util.somarDias(c, -7) : new Date(c.getFullYear(), c.getMonth() - 1, 1);
    render();
  });

  el.proximo.addEventListener("click", function () {
    estado.direcao = "frente";
    var c = estado.cursor;
    estado.cursor = estado.visao === "semana" ? Util.somarDias(c, 7) : new Date(c.getFullYear(), c.getMonth() + 1, 1);
    render();
  });

  el.hoje.addEventListener("click", function () {
    var hoje = Util.hoje();
    if (Util.iso(hoje) !== Util.iso(estado.cursor)) estado.direcao = hoje > estado.cursor ? "frente" : "tras";
    estado.cursor = hoje;
    render();
  });

  el.visoes.forEach(function (b) {
    b.addEventListener("click", function () {
      estado.visao = b.getAttribute("data-visao");
      try {
        sessionStorage.setItem("studyflow:visao", estado.visao);
      } catch (e) {}
      render();
    });
  });

  el.novo.addEventListener("click", function () {
    abrirModal(Util.hojeISO());
  });

  try {
    estado.visao = sessionStorage.getItem("studyflow:visao") || "mes";
  } catch (e) {}

  render();
})();
