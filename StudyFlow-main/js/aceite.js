/* =========================================================
   StudyFlow — aceite.js
   No primeiro acesso (e quando os Termos mudarem de versão),
   pede que o aluno leia e aceite os Termos de Uso e a Política
   de Privacidade antes de usar o StudyFlow.

   O aceite fica guardado nos dados do aluno ("aceite").
   Quando houver servidor, deve ser registrado lá também
   (data, versão e quem aceitou).
   ========================================================= */
(function () {
  "use strict";

  // Mude a versão quando os Termos ou a Política mudarem: todos aceitam de novo
  var VERSAO = "2026-11-23";

  if (!window.Auth || !Auth.usuario()) return;
  var aceite = Dados.ler("aceite", null);
  if (aceite && aceite.versao === VERSAO) return;

  var nome = Auth.nomeExibido().split(" ")[0];
  var atualizacao = !!aceite; // já tinha aceitado uma versão anterior

  var dialog = document.createElement("dialog");
  dialog.className = "modal aceite";
  dialog.setAttribute("aria-labelledby", "aceite-titulo");
  dialog.setAttribute("data-obrigatorio", ""); // não fecha com Esc nem clicando fora
  dialog.innerHTML =
    '<form class="modal__form" method="dialog">' +
    '<div class="aceite__topo">' +
    '<img src="assets/brasao.webp" alt="" width="34" height="53" onerror="this.hidden=true" />' +
    "<div>" +
    '<h2 id="aceite-titulo" class="modal__titulo">' +
    (atualizacao ? "Os Termos foram atualizados" : "Boas-vindas ao StudyFlow, " + Util.escapar(nome) + "!") +
    "</h2>" +
    '<p class="modal__sub">' + (atualizacao ? "Leia as mudanças e aceite para continuar." : "Antes de começar, combine estas regrinhas com a gente:") + "</p>" +
    "</div></div>" +
    '<ul class="aceite__lista">' +
    '<li><span data-icone="lock" data-tamanho="18"></span><span>Sua senha é só sua. Em computador da escola, use <strong>Sair</strong> ao terminar.</span></li>' +
    '<li><span data-icone="heart" data-tamanho="18"></span><span>Respeito sempre, inclusive no Assistente. Nada de dados pessoais seus ou de colegas por lá.</span></li>' +
    '<li><span data-icone="sparkles" data-tamanho="18"></span><span>O Assistente pode errar. Na dúvida, pergunte ao professor.</span></li>' +
    '<li><span data-icone="shield" data-tamanho="18"></span><span>Seus dados servem só para seus estudos: sem propaganda e sem venda de dados.</span></li>' +
    "</ul>" +
    '<p class="aceite__links">Leia tudo (pode mostrar para sua família): ' +
    '<a href="termos.html" target="_blank" rel="noopener">Termos de Uso</a> e ' +
    '<a href="privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>.</p>' +
    '<label class="aceite__check"><input type="checkbox" id="aceite-ok" />' +
    "<span>Li e concordo com os Termos de Uso e a Política de Privacidade. Se tenho menos de 18 anos, meu responsável sabe que eu uso o StudyFlow.</span></label>" +
    '<div class="modal__acoes">' +
    '<button type="button" class="botao-secundario" id="aceite-sair">Sair</button>' +
    '<button type="submit" class="botao-primario" id="aceite-continuar" disabled>Começar</button>' +
    "</div>" +
    "</form>";

  document.body.appendChild(dialog);

  var check = dialog.querySelector("#aceite-ok");
  var continuar = dialog.querySelector("#aceite-continuar");

  check.addEventListener("change", function () {
    continuar.disabled = !check.checked;
  });

  dialog.querySelector("#aceite-sair").addEventListener("click", function () {
    Auth.sair();
  });

  dialog.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!check.checked) return;
    Dados.salvar("aceite", { versao: VERSAO, em: new Date().toISOString() });
    if (window.Layout) Layout.fecharModal(dialog);
    else dialog.close();
  });

  // Abre depois que a página terminou de aparecer
  setTimeout(function () {
    if (window.Layout) Layout.abrirModal(dialog);
    else if (dialog.showModal) dialog.showModal();
  }, 350);

  window.Aceite = { VERSAO: VERSAO };
})();
