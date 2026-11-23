/* =========================================================
   StudyFlow — assistente-respostas.js
   Respostas de DEMONSTRAÇÃO do Assistente de IA.
   Quando o servidor com IA de verdade estiver no ar, este
   arquivo é trocado por uma chamada à API.
   ========================================================= */
(function () {
  "use strict";

  var TEMAS = [
    {
      chaves: ["derivada parcial", "derivadas parciais", "derivada", "derivadas"],
      materia: "Matemática",
      titulo: "Derivadas Parciais",
      explicacao:
        "<h4>Sem problemas! Vamos simplificar o conceito:</h4>" +
        "<p>Uma derivada parcial mede a taxa de variação de uma função de várias variáveis em relação a apenas uma dessas variáveis, enquanto as outras são mantidas constantes.</p>" +
        "<ul><li><strong>Notação:</strong> Usamos o símbolo ∂ (del) em vez do d comum.</li>" +
        "<li><strong>Regra de Ouro:</strong> Trate todas as outras variáveis como números fixos ao derivar.</li></ul>" +
        "<pre class=\"formula\"><strong>Se f(x, y) = 3x²y + y³</strong>\n∂f/∂x = d/dx[3x²y] + 0  = 6xy</pre>",
      resumo:
        "<h3>O que é</h3><p>A derivada parcial de f(x, y) em relação a x mostra quanto f muda quando só x muda, com y parado.</p>" +
        "<h3>Como calcular</h3><ul><li>Escolha a variável (x ou y).</li><li>Trate as outras como constantes.</li><li>Derive normalmente com as regras de sempre (potência, produto, cadeia).</li></ul>" +
        "<h3>Exemplo resolvido</h3><p>f(x, y) = 3x²y + y³</p><ul><li>∂f/∂x = 6xy (y³ vira 0, pois é constante em x)</li><li>∂f/∂y = 3x² + 3y²</li></ul>" +
        "<h3>Pegadinhas de prova</h3><ul><li>Não esqueça que termos sem a variável derivam para 0.</li><li>Em produtos como x·y, a outra variável continua multiplicando.</li></ul>",
      flashcards: [
        ["O que a derivada parcial mede?", "A variação da função em relação a uma só variável, com as outras fixas."],
        ["Qual o símbolo da derivada parcial?", "∂ (lê-se “del” ou “d rond”)."],
        ["∂/∂x de 5xy²?", "5y²"],
        ["∂/∂y de x³ + 2y?", "2"],
      ],
      exercicios: ["Calcule ∂f/∂x e ∂f/∂y de f(x, y) = x²y + 4y.", "Calcule ∂f/∂x de f(x, y) = 2x³y² − 7x.", "Se g(x, y) = xy + y², quanto vale ∂g/∂y no ponto (1, 2)?"],
    },
    {
      chaves: ["newton", "segunda lei", "forca resultante", "f = m", "f=m.a", "inercia"],
      materia: "Física",
      titulo: "Segunda Lei de Newton",
      explicacao:
        "<h4>A Segunda Lei de Newton (Princípio Fundamental da Dinâmica)</h4>" +
        "<p>A força resultante sobre um corpo é igual à sua massa vezes a aceleração que ele ganha.</p>" +
        "<pre class=\"formula\"><strong>F = m · a</strong>\nF em newtons (N), m em kg, a em m/s²</pre>" +
        "<ul><li><strong>Mais força</strong> → mais aceleração.</li><li><strong>Mais massa</strong> → menos aceleração para a mesma força.</li></ul>" +
        "<p>Exemplo: empurrar um carrinho de 10 kg com 20 N dá a = 20 ÷ 10 = 2 m/s².</p>",
      resumo:
        "<h3>As 3 Leis de Newton</h3><ul><li><strong>1ª (Inércia):</strong> sem força resultante, o corpo fica parado ou em movimento retilíneo uniforme.</li><li><strong>2ª (Dinâmica):</strong> F = m · a.</li><li><strong>3ª (Ação e reação):</strong> toda ação tem uma reação de mesma intensidade e sentido oposto.</li></ul>" +
        "<h3>Dicas</h3><ul><li>Some as forças com sinal (direção importa).</li><li>Peso: P = m · g (g ≈ 10 m/s²).</li></ul>",
      flashcards: [
        ["Fórmula da 2ª Lei de Newton?", "F = m · a"],
        ["Unidade de força no SI?", "Newton (N) = kg·m/s²"],
        ["Força de 30 N em massa de 6 kg dá qual aceleração?", "5 m/s²"],
      ],
      exercicios: ["Uma força de 50 N age sobre um corpo de 10 kg. Qual a aceleração?", "Que força é preciso para acelerar 4 kg a 3 m/s²?", "Um corpo de 2 kg acelera a 8 m/s². Qual a força resultante?"],
    },
    {
      chaves: ["mitose", "meiose", "divisao celular"],
      materia: "Biologia",
      titulo: "Mitose vs Meiose",
      explicacao:
        "<h4>Mitose e meiose: as duas formas de a célula se dividir</h4>" +
        "<ul><li><strong>Mitose:</strong> 1 célula → 2 células iguais, com o mesmo número de cromossomos. Serve para crescer e regenerar tecidos.</li>" +
        "<li><strong>Meiose:</strong> 1 célula → 4 células com metade dos cromossomos. Forma os gametas (óvulo e espermatozoide).</li></ul>" +
        "<p>Dica para lembrar: <strong>MEIose</strong> divide o número de cromossomos ao MEIo.</p>",
      resumo:
        "<h3>Mitose</h3><ul><li>Fases: prófase, metáfase, anáfase, telófase.</li><li>Resultado: 2 células diploides (2n) idênticas.</li></ul>" +
        "<h3>Meiose</h3><ul><li>Duas divisões seguidas (meiose I e II).</li><li>Resultado: 4 células haploides (n) diferentes entre si.</li><li>Tem crossing-over, que aumenta a variabilidade genética.</li></ul>",
      flashcards: [
        ["Quantas células a mitose forma?", "2 células iguais (2n)."],
        ["Quantas células a meiose forma?", "4 células com metade dos cromossomos (n)."],
        ["Para que serve a meiose?", "Formar gametas."],
      ],
      exercicios: ["Cite duas diferenças entre mitose e meiose.", "Em qual fase os cromossomos se alinham no meio da célula?", "Por que a meiose aumenta a variabilidade genética?"],
    },
    {
      chaves: ["fotossintese", "clorofila"],
      materia: "Ciências",
      titulo: "Fotossíntese",
      explicacao:
        "<h4>Fotossíntese: como a planta faz seu próprio alimento</h4>" +
        "<p>Usando a luz do Sol, a planta transforma gás carbônico e água em glicose (energia) e libera oxigênio.</p>" +
        "<pre class=\"formula\"><strong>6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂</strong></pre>" +
        "<ul><li>Acontece nos <strong>cloroplastos</strong>, que têm clorofila (o pigmento verde).</li><li>É a base de quase todas as cadeias alimentares.</li></ul>",
      resumo:
        "<h3>Ingredientes</h3><ul><li>Luz solar, gás carbônico (CO₂) e água (H₂O).</li></ul><h3>Produtos</h3><ul><li>Glicose (alimento da planta) e oxigênio (O₂).</li></ul><h3>Onde</h3><ul><li>Nos cloroplastos das folhas.</li></ul>",
      flashcards: [
        ["Onde ocorre a fotossíntese?", "Nos cloroplastos."],
        ["Qual gás a planta libera?", "Oxigênio (O₂)."],
        ["Qual pigmento capta a luz?", "Clorofila."],
      ],
      exercicios: ["Escreva a equação geral da fotossíntese.", "Por que a fotossíntese é importante para os animais?", "O que aconteceria com uma planta mantida no escuro?"],
    },
    {
      chaves: ["equacao do segundo grau", "equacao do 2", "bhaskara", "baskara", "segundo grau"],
      materia: "Matemática",
      titulo: "Equação do 2º grau",
      explicacao:
        "<h4>Equação do 2º grau: ax² + bx + c = 0</h4>" +
        "<p>Para achar as raízes, usamos a fórmula de Bhaskara em dois passos:</p>" +
        "<pre class=\"formula\"><strong>Δ = b² − 4ac</strong>\nx = (−b ± √Δ) ÷ 2a</pre>" +
        "<ul><li><strong>Δ &gt; 0:</strong> duas raízes diferentes.</li><li><strong>Δ = 0:</strong> uma raiz (dupla).</li><li><strong>Δ &lt; 0:</strong> nenhuma raiz real.</li></ul>" +
        "<p>Exemplo: x² − 5x + 6 = 0 → Δ = 25 − 24 = 1 → x = (5 ± 1) ÷ 2 → x = 3 ou x = 2.</p>",
      resumo:
        "<h3>Forma geral</h3><p>ax² + bx + c = 0, com a ≠ 0.</p><h3>Passo a passo</h3><ul><li>Identifique a, b e c.</li><li>Calcule Δ = b² − 4ac.</li><li>Use x = (−b ± √Δ) ÷ 2a.</li></ul><h3>Atalho</h3><ul><li>Soma das raízes = −b/a; produto = c/a.</li></ul>",
      flashcards: [
        ["Fórmula do delta?", "Δ = b² − 4ac"],
        ["Se Δ < 0, quantas raízes reais?", "Nenhuma."],
        ["Soma das raízes?", "−b/a"],
      ],
      exercicios: ["Resolva x² − 7x + 10 = 0.", "Resolva 2x² − 8 = 0.", "Para que valor de c a equação x² + 4x + c = 0 tem uma raiz dupla?"],
    },
    {
      chaves: ["fracao", "fracoes"],
      materia: "Matemática",
      titulo: "Frações",
      explicacao:
        "<h4>Frações: partes de um inteiro</h4>" +
        "<p>Na fração a/b, <strong>b</strong> (denominador) diz em quantas partes o inteiro foi dividido e <strong>a</strong> (numerador) quantas partes pegamos.</p>" +
        "<ul><li><strong>Somar com denominadores iguais:</strong> soma só os numeradores. 1/5 + 2/5 = 3/5.</li><li><strong>Denominadores diferentes:</strong> use o MMC. 1/2 + 1/3 = 3/6 + 2/6 = 5/6.</li><li><strong>Multiplicar:</strong> numerador × numerador e denominador × denominador.</li><li><strong>Dividir:</strong> mantém a primeira e multiplica pelo inverso da segunda.</li></ul>",
      resumo:
        "<h3>Operações</h3><ul><li>Soma/subtração: iguale os denominadores (MMC).</li><li>Multiplicação: em linha reta.</li><li>Divisão: inverte a segunda e multiplica.</li></ul><h3>Simplificar</h3><p>Divida numerador e denominador pelo mesmo número (MDC).</p>",
      flashcards: [
        ["1/2 + 1/4 = ?", "3/4"],
        ["2/3 × 3/5 = ?", "6/15 = 2/5"],
        ["(1/2) ÷ (1/4) = ?", "2"],
      ],
      exercicios: ["Calcule 2/3 + 1/6.", "Simplifique 18/24.", "Calcule (3/4) ÷ (1/2)."],
    },
    {
      chaves: ["revolucao francesa", "bastilha"],
      materia: "História",
      titulo: "Revolução Francesa",
      explicacao:
        "<h4>Revolução Francesa (1789–1799)</h4>" +
        "<p>Movimento que derrubou a monarquia absolutista na França e espalhou os ideais de <strong>Liberdade, Igualdade e Fraternidade</strong>.</p>" +
        "<ul><li><strong>Causas:</strong> crise econômica, fome, impostos altos sobre o Terceiro Estado e ideias iluministas.</li><li><strong>Marco:</strong> Queda da Bastilha, em 14 de julho de 1789.</li><li><strong>Fases:</strong> Assembleia Nacional, Convenção (Terror) e Diretório, até o golpe de Napoleão.</li></ul>",
      resumo:
        "<h3>Sociedade</h3><ul><li>1º Estado: clero. 2º: nobreza. 3º: povo e burguesia (pagavam os impostos).</li></ul><h3>Linha do tempo</h3><ul><li>1789: Queda da Bastilha e Declaração dos Direitos do Homem.</li><li>1792–1794: República e período do Terror.</li><li>1799: Golpe do 18 Brumário (Napoleão).</li></ul>",
      flashcards: [
        ["Em que ano caiu a Bastilha?", "1789"],
        ["Lema da Revolução?", "Liberdade, Igualdade, Fraternidade."],
        ["Quem tomou o poder em 1799?", "Napoleão Bonaparte."],
      ],
      exercicios: ["Explique por que o Terceiro Estado estava insatisfeito.", "O que foi o período do Terror?", "Qual a importância da Declaração dos Direitos do Homem e do Cidadão?"],
    },
    {
      chaves: ["sujeito", "predicado", "oracao"],
      materia: "Português",
      titulo: "Sujeito e Predicado",
      explicacao:
        "<h4>Sujeito e predicado: as duas partes da oração</h4>" +
        "<ul><li><strong>Sujeito:</strong> o ser de quem se fala. Pergunte ao verbo “quem?” ou “o quê?”.</li><li><strong>Predicado:</strong> tudo o que se diz sobre o sujeito. Sempre tem verbo.</li></ul>" +
        "<p>Exemplo: <strong>A Idebinha</strong> (sujeito) <strong>estuda todos os dias</strong> (predicado).</p>",
      resumo:
        "<h3>Tipos de sujeito</h3><ul><li>Simples: um núcleo (O aluno estudou).</li><li>Composto: dois ou mais núcleos (Ana e Pedro estudaram).</li><li>Oculto: identificado pelo verbo (Estudamos muito).</li><li>Indeterminado e oração sem sujeito (Choveu ontem).</li></ul>",
      flashcards: [
        ["Como achar o sujeito?", "Pergunte ao verbo “quem?” ou “o quê?”."],
        ["Sujeito de “Choveu muito”?", "Oração sem sujeito."],
        ["Sujeito de “Fomos ao cinema”?", "Oculto (nós)."],
      ],
      exercicios: ["Classifique o sujeito: “Os alunos e a professora saíram cedo.”", "Separe sujeito e predicado: “A biblioteca da escola abriu hoje.”", "Crie uma frase com sujeito oculto."],
    },
  ];

  var TEMAS_CONHECIDOS = TEMAS.map(function (t) {
    return t.titulo;
  });

  function acharTema(texto) {
    var t = Util.semAcento(texto);
    for (var i = 0; i < TEMAS.length; i++) {
      for (var j = 0; j < TEMAS[i].chaves.length; j++) {
        if (t.indexOf(TEMAS[i].chaves[j]) !== -1) return TEMAS[i];
      }
    }
    return null;
  }

  function assuntoDoPedido(texto) {
    var m = texto.match(/(?:sobre|de|do|da)\s+(.+?)[.?!]*$/i);
    return m ? m[1].trim() : "";
  }

  function naoSei(texto) {
    var assunto = assuntoDoPedido(texto);
    return {
      html:
        "<p>Ainda estou em <strong>modo de demonstração</strong>" + (assunto ? " e não tenho uma resposta pronta sobre <strong>" + Util.escapar(assunto) + "</strong>" : "") +
        ". Quando a IA de verdade estiver ligada, vou poder responder qualquer pergunta!</p>" +
        "<p>Por enquanto, experimente perguntar sobre:</p><ul>" +
        TEMAS_CONHECIDOS.map(function (t) {
          return "<li>" + t + "</li>";
        }).join("") +
        "</ul>",
      titulo: assunto ? assunto.charAt(0).toUpperCase() + assunto.slice(1, 40) : null,
      materia: null,
    };
  }

  /**
   * pergunta: texto do aluno
   * contexto: título da conversa atual (para entender "isso", "esse assunto"...)
   */
  function responder(pergunta, contexto) {
    var texto = Util.semAcento(pergunta);

    if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|opa)\b/.test(texto) && texto.length < 25) {
      return {
        html: "<p>Oi! Que bom te ver por aqui. Me diga qual matéria você quer estudar, ou use uma das sugestões rápidas ao lado.</p>",
        titulo: null,
        materia: null,
      };
    }
    if (/^(obrigad|valeu|brigad)/.test(texto)) {
      return { html: "<p>Por nada! Bons estudos, e não esqueça de cuidar da Idebinha. 💜</p>", titulo: null, materia: null };
    }

    var tema = acharTema(pergunta) || (contexto ? acharTema(contexto) : null);
    if (!tema) return naoSei(pergunta);

    var base = { titulo: tema.titulo, materia: tema.materia };

    if (/resum/.test(texto)) {
      return Object.assign(base, {
        html: "<p>Claro, vou criar um resumo completo e organizado para você estudar " + tema.titulo.toLowerCase() + " e gabaritar a prova!</p>",
        resumo: { titulo: "Resumo sobre " + tema.titulo, html: tema.resumo },
      });
    }
    if (/flash ?card/.test(texto)) {
      return Object.assign(base, {
        html:
          "<h4>Flashcards de " + tema.titulo + "</h4><p>Leia a pergunta, tente responder e só depois confira:</p><ul>" +
          tema.flashcards.map(function (f) {
            return "<li><strong>" + f[0] + "</strong> " + f[1] + "</li>";
          }).join("") +
          "</ul>",
      });
    }
    if (/exercicio|questao|questoes|atividade/.test(texto)) {
      return Object.assign(base, {
        html:
          "<h4>Exercícios de " + tema.titulo + "</h4><ul>" +
          tema.exercicios.map(function (e) {
            return "<li>" + e + "</li>";
          }).join("") +
          "</ul><p>Quando terminar, me mande suas respostas que eu confiro com você!</p>",
      });
    }
    return Object.assign(base, { html: tema.explicacao });
  }

  window.Respostas = { responder: responder, TEMAS: TEMAS_CONHECIDOS };
})();
