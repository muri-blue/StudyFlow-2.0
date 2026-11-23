/* =========================================================
   StudyFlow — secretaria.js (Painel da rede)
   Só números agregados (sem nomes de alunos). Dados vêm do
   js/rede.js — com o servidor, esta tela não precisa mudar.
   ========================================================= */
(function () {
  "use strict";

  var el = {
    aviso: document.getElementById("aviso-exemplo"),
    kpis: document.getElementById("kpis"),
    barras: document.getElementById("barras"),
    apoio: document.getElementById("apoio"),
    escolas: document.getElementById("escolas"),
    exportar: document.getElementById("btn-exportar"),
  };

  var dados = null;
  var abertas = {};

  el.aviso.hidden = !Rede.EXEMPLO;

  function num(n) {
    return String(n).replace(".", ",");
  }

  function kpi(icone, rotulo, valor, detalhe) {
    return (
      '<div class="kpi"><span class="kpi__rotulo"><span data-icone="' + icone + '" data-tamanho="15"></span>' + rotulo + "</span>" +
      '<span class="kpi__valor">' + valor + "</span>" +
      '<span class="kpi__detalhe">' + detalhe + "</span></div>"
    );
  }

  function barraMini(pct) {
    return '<div class="barra-mini"><div class="barra-mini__trilho"><div class="barra-mini__cheio" style="width:' + pct + "%" + (pct < 60 ? ";background:#f59e0b" : "") + '"></div></div><span>' + pct + "%</span></div>";
  }

  function render() {
    var r = dados.rede;
    el.kpis.innerHTML =
      kpi("school", "Escolas", String(dados.escolas.length), dados.totalTurmas + " turmas no StudyFlow") +
      kpi("users", "Alunos cadastrados", String(r.alunos), r.nuncaEntraram + " ainda não entraram") +
      kpi("chart", "Ativos na semana", r.ativosPct + "%", r.ativos + " alunos nos últimos 7 dias") +
      kpi("clock", "Sessões de foco", String(r.sessoesFoco), num(r.focoPorAluno) + " por aluno");

    el.barras.innerHTML = dados.escolas
      .slice()
      .sort(function (a, b) {
        return b.ativosPct - a.ativosPct;
      })
      .map(function (e) {
        return (
          '<div class="barras__linha"><span class="barras__nome" title="' + Util.escapar(e.nome) + '">' + Util.escapar(e.nome.replace(" (exemplo)", "")) + "</span>" +
          '<div class="barras__trilho" role="img" aria-label="' + e.ativosPct + '% ativos"><div class="barras__cheio' + (e.ativosPct < 60 ? " barras__cheio--baixo" : "") + '" style="width:' + e.ativosPct + '%"></div></div>' +
          '<span class="barras__valor">' + e.ativosPct + "%</span></div>"
        );
      })
      .join("");

    var turmas = [];
    dados.escolas.forEach(function (e) {
      e.turmas.forEach(function (t) {
        turmas.push(Object.assign({ escola: e.nome }, t));
      });
    });
    el.apoio.innerHTML = turmas
      .sort(function (a, b) {
        return a.ativosPct - b.ativosPct;
      })
      .slice(0, 5)
      .map(function (t) {
        return (
          "<li>" +
          '<span class="lista-eventos__data"><strong>' + t.ativosPct + '%</strong><small>ativos</small></span>' +
          '<span class="lista-eventos__texto"><strong>' + Util.escapar(t.nome) + "</strong><span>" +
          Util.escapar(t.escola.replace(" (exemplo)", "") + " • " + t.professor + " • " + t.alunos + " alunos") + "</span></span>" +
          "</li>"
        );
      })
      .join("");

    renderEscolas();
  }

  function renderEscolas() {
    el.escolas.innerHTML = dados.escolas
      .map(function (e) {
        var aberta = !!abertas[e.id];
        var linha =
          "<tr>" +
          '<td><button type="button" class="link-acao" data-escola="' + e.id + '" aria-expanded="' + aberta + '">' +
          (aberta ? "▾ " : "▸ ") + Util.escapar(e.nome) + "</button></td>" +
          '<td class="numero">' + e.turmas.length + "</td>" +
          '<td class="numero">' + e.alunos + "</td>" +
          "<td>" + barraMini(e.ativosPct) + "</td>" +
          '<td class="numero">' + e.nuncaEntraram + "</td>" +
          '<td class="numero">' + num(e.focoPorAluno) + "</td>" +
          '<td class="numero">' + e.progressoMedio + "%</td>" +
          '<td class="numero">' + e.perguntas + "</td>" +
          "</tr>";
        if (aberta) {
          linha += e.turmas
            .map(function (t) {
              return (
                '<tr class="linha-turma">' +
                '<td style="padding-left:28px">' + Util.escapar(t.nome) + "<br /><small>" + Util.escapar(t.professor) + "</small></td>" +
                '<td class="numero">—</td>' +
                '<td class="numero">' + t.alunos + "</td>" +
                "<td>" + barraMini(t.ativosPct) + "</td>" +
                '<td class="numero">' + t.nuncaEntraram + "</td>" +
                '<td class="numero">' + num(t.focoPorAluno) + "</td>" +
                '<td class="numero">' + t.progressoMedio + "%</td>" +
                '<td class="numero">' + t.perguntas + "</td>" +
                "</tr>"
              );
            })
            .join("");
        }
        return linha;
      })
      .join("");
  }

  el.escolas.addEventListener("click", function (e) {
    var b = e.target.closest("[data-escola]");
    if (!b) return;
    var id = b.getAttribute("data-escola");
    abertas[id] = !abertas[id];
    renderEscolas();
  });

  /* ---------------- Planilha (CSV para Excel) ---------------- */
  el.exportar.addEventListener("click", function () {
    if (!dados) return;
    var linhas = [["Escola", "Turma", "Professor(a)", "Alunos", "Ativos na semana", "Ativos (%)", "Nunca entraram", "Sessões de foco", "Foco por aluno", "Planos (média %)", "Perguntas ao assistente"]];
    dados.escolas.forEach(function (e) {
      e.turmas.forEach(function (t) {
        linhas.push([e.nome, t.nome, t.professor, t.alunos, t.ativos, t.ativosPct, t.nuncaEntraram, t.sessoesFoco, num(t.focoPorAluno), t.progressoMedio, t.perguntas]);
      });
      linhas.push([e.nome, "TOTAL DA ESCOLA", "", e.alunos, e.ativos, e.ativosPct, e.nuncaEntraram, e.sessoesFoco, num(e.focoPorAluno), e.progressoMedio, e.perguntas]);
    });
    // ";" e BOM: o Excel em português abre direto, com acentos certos
    var csv = "﻿" + linhas.map(function (l) {
      return l.map(function (c) {
        var s = String(c);
        return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(";");
    }).join("\r\n");
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "studyflow-rede-" + Util.hojeISO() + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  });

  Rede.resumoDaRede().then(function (r) {
    dados = r;
    render();
  });
})();
