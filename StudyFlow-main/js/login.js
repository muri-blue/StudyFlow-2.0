/* =========================================================
   StudyFlow — login.js (index.html)
   ========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("form-login");
  var campoMatricula = document.getElementById("matricula");
  var campoSenha = document.getElementById("senha");
  var mensagem = document.getElementById("mensagem");
  var botao = document.getElementById("botao-login");
  var esqueceu = document.getElementById("esqueceu");

  var cartao = document.querySelector(".login__card");

  function tremer() {
    cartao.classList.remove("tremer");
    void cartao.offsetWidth;
    cartao.classList.add("tremer");
  }

  function mostrar(texto, tipo) {
    if ((tipo || "erro") === "erro") tremer();
    mensagem.textContent = texto;
    mensagem.setAttribute("data-tipo", tipo || "erro");
    mensagem.hidden = false;
  }

  function limparErros() {
    mensagem.hidden = true;
    campoMatricula.removeAttribute("aria-invalid");
    campoSenha.removeAttribute("aria-invalid");
  }

  campoMatricula.addEventListener("input", limparErros);
  campoSenha.addEventListener("input", limparErros);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    limparErros();

    var matricula = campoMatricula.value.trim();
    var senha = campoSenha.value;

    if (!matricula) {
      campoMatricula.setAttribute("aria-invalid", "true");
      campoMatricula.focus();
      return mostrar("Digite sua matrícula.");
    }
    if (!senha) {
      campoSenha.setAttribute("aria-invalid", "true");
      campoSenha.focus();
      return mostrar("Digite sua senha.");
    }

    botao.disabled = true;
    botao.textContent = "Entrando...";

    // Pequena pausa só para o botão mostrar que algo aconteceu
    setTimeout(function () {
      var usuario = Auth.entrar(matricula, senha);
      if (usuario) {
        window.location.href = "calendario.html";
        return;
      }
      botao.disabled = false;
      botao.textContent = "Login";
      campoSenha.value = "";
      campoMatricula.setAttribute("aria-invalid", "true");
      campoSenha.setAttribute("aria-invalid", "true");
      campoSenha.focus();
      mostrar("Matrícula ou senha incorretas. Confira e tente de novo.");
    }, 350);
  });

  esqueceu.addEventListener("click", function () {
    mostrar("Para criar uma nova senha, procure a secretaria da sua escola.", "info");
  });

  // Se o brasão não carregar, esconde a imagem quebrada
  var brasao = document.querySelector(".prefeitura-login img");
  if (brasao) {
    var esconder = function () {
      brasao.hidden = true;
    };
    brasao.addEventListener("error", esconder);
    if (brasao.complete && brasao.naturalWidth === 0) esconder();
  }
})();
