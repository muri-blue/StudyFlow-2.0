/* =========================================================
   StudyFlow — idebinha.js
   Desenho da Idebinha (capivara mascote de Santa Rosa do Sul)
   e catálogo de acessórios da loja.
   ========================================================= */
(function () {
  "use strict";

  /* (As cores e formas da capivara ficam junto do desenho, mais abaixo.) */

  /* ---------------- Lugares do corpo ---------------- */
  var LUGARES = {
    cabeca: { nome: "Chapéus", icone: "graduationCap" },
    rosto: { nome: "Óculos", icone: "glasses" },
    pescoco: { nome: "Pescoço", icone: "award" },
    mao: { nome: "Nas mãos", icone: "hand" },
  };

  var RARIDADES = {
    comum: { nome: "Comum", ordem: 1 },
    rara: { nome: "Rara", ordem: 2 },
    epica: { nome: "Épica", ordem: 3 },
    lendaria: { nome: "Lendária", ordem: 4 },
  };

  function coracao(cx, cy, s, cor) {
    return (
      '<path d="M' + cx + " " + (cy + s * 0.9) +
      " C" + (cx - s * 1.6) + " " + (cy - s * 0.1) + "," + (cx - s * 0.8) + " " + (cy - s * 1.2) + "," + cx + " " + (cy - s * 0.35) +
      " C" + (cx + s * 0.8) + " " + (cy - s * 1.2) + "," + (cx + s * 1.6) + " " + (cy - s * 0.1) + "," + cx + " " + (cy + s * 0.9) +
      ' Z" fill="' + cor + '" stroke="#b91c1c" stroke-width="2"/>'
    );
  }

  /* ---------------- Catálogo ---------------- */
  var CATALOGO = [
    /* Chapéus */
    {
      id: "capelo", nome: "Chapéu de formatura", lugar: "cabeca", preco: 0, raridade: "comum",
      svg: '<path d="M70 36h60v12q-30 10-60 0z" fill="#312e81"/><polygon points="100,6 162,26 100,46 38,26" fill="#1e1b4b"/><circle cx="100" cy="26" r="3" fill="#fbbf24"/><path d="M100 26 L150 32 L150 52" stroke="#fbbf24" stroke-width="3" fill="none"/><circle cx="150" cy="55" r="4.5" fill="#fbbf24"/>',
    },
    {
      id: "bone", nome: "Boné azul", lugar: "cabeca", preco: 30, raridade: "comum",
      svg: '<path d="M56 50 Q100 2 144 50 Z" fill="#3b82f6"/><path d="M100 44 h56 q8 6 -2 11 h-54 z" fill="#1d4ed8"/><circle cx="100" cy="22" r="4" fill="#1e40af"/><path d="M100 22 L100 48" stroke="#2563eb" stroke-width="2"/>',
    },
    {
      id: "gorro", nome: "Gorro de inverno", lugar: "cabeca", preco: 40, raridade: "comum",
      svg: '<path d="M52 54 Q52 6 100 6 Q148 6 148 54 Z" fill="#ef4444"/><path d="M70 20 L70 50 M90 10 L90 50 M110 10 L110 50 M130 20 L130 50" stroke="#dc2626" stroke-width="3"/><rect x="48" y="44" width="104" height="14" rx="7" fill="#f8fafc"/><circle cx="100" cy="6" r="10" fill="#f8fafc"/>',
    },
    {
      id: "laco", nome: "Laço rosa", lugar: "cabeca", preco: 60, raridade: "rara",
      svg: '<path d="M128 36 L152 22 L154 50 Z" fill="#ec4899"/><path d="M128 36 L104 22 L102 50 Z" fill="#ec4899"/><circle cx="128" cy="36" r="7" fill="#be185d"/>',
    },
    {
      id: "palha", nome: "Chapéu de palha", lugar: "cabeca", preco: 80, raridade: "rara",
      svg: '<ellipse cx="100" cy="42" rx="74" ry="13" fill="#eab308"/><path d="M64 42 Q66 4 100 4 Q134 4 136 42 Z" fill="#facc15"/><rect x="64" y="30" width="72" height="9" fill="#dc2626"/>',
    },
    {
      id: "fones", nome: "Fones de ouvido", lugar: "cabeca", preco: 150, raridade: "epica",
      svg: '<path d="M50 80 Q50 18 100 18 Q150 18 150 80" stroke="#8b5cf6" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="36" y="64" width="20" height="34" rx="9" fill="#6d28d9"/><rect x="144" y="64" width="20" height="34" rx="9" fill="#6d28d9"/>',
    },
    {
      id: "coroa", nome: "Coroa dourada", lugar: "cabeca", preco: 300, raridade: "lendaria",
      svg: '<polygon points="62,46 64,12 82,30 100,6 118,30 136,12 138,46" fill="#fbbf24" stroke="#d97706" stroke-width="2.5" stroke-linejoin="round"/><circle cx="100" cy="36" r="5" fill="#ef4444"/><circle cx="78" cy="39" r="3.5" fill="#3b82f6"/><circle cx="122" cy="39" r="3.5" fill="#10b981"/>',
    },

    /* Óculos */
    {
      id: "oculos-leitura", nome: "Óculos de leitura", lugar: "rosto", preco: 0, raridade: "comum",
      svg: '<circle cx="79" cy="72" r="15" fill="rgba(103,232,249,.35)" stroke="#475569" stroke-width="4"/><circle cx="121" cy="72" r="15" fill="rgba(103,232,249,.35)" stroke="#475569" stroke-width="4"/><path d="M94 71 Q100 65 106 71" stroke="#475569" stroke-width="4" fill="none"/><path d="M64 70 L50 64 M136 70 L150 64" stroke="#475569" stroke-width="4" stroke-linecap="round"/>',
    },
    {
      id: "oculos-sol", nome: "Óculos escuros", lugar: "rosto", preco: 70, raridade: "rara",
      svg: '<rect x="61" y="62" width="34" height="21" rx="9" fill="#111827"/><rect x="105" y="62" width="34" height="21" rx="9" fill="#111827"/><path d="M95 68 L105 68" stroke="#111827" stroke-width="4"/><path d="M61 66 L50 62 M139 66 L150 62" stroke="#111827" stroke-width="4" stroke-linecap="round"/><path d="M67 68 L75 68 M111 68 L119 68" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>',
    },
    {
      id: "oculos-coracao", nome: "Óculos de coração", lugar: "rosto", preco: 120, raridade: "epica",
      svg: coracao(79, 72, 12, "#f43f5e") + coracao(121, 72, 12, "#f43f5e") + '<path d="M93 70 L107 70" stroke="#b91c1c" stroke-width="3"/>',
    },
    {
      id: "monoculo", nome: "Monóculo chique", lugar: "rosto", preco: 140, raridade: "epica",
      svg: '<circle cx="121" cy="72" r="14" fill="rgba(255,255,255,.3)" stroke="#d4a017" stroke-width="3.5"/><path d="M134 78 Q146 102 132 124" stroke="#d4a017" stroke-width="2" fill="none"/>',
    },

    /* Pescoço */
    {
      id: "cachecol", nome: "Cachecol vermelho", lugar: "pescoco", preco: 35, raridade: "comum",
      svg: '<rect x="54" y="124" width="92" height="18" rx="9" fill="#dc2626"/><rect x="116" y="132" width="15" height="34" rx="5" fill="#b91c1c"/><path d="M118 152 h11 M118 158 h11" stroke="#fca5a5" stroke-width="2"/>',
    },
    {
      id: "gravata", nome: "Gravata borboleta", lugar: "pescoco", preco: 55, raridade: "rara",
      svg: '<path d="M100 137 L82 127 L82 147 Z" fill="#4f46e5"/><path d="M100 137 L118 127 L118 147 Z" fill="#4f46e5"/><circle cx="100" cy="137" r="5" fill="#3730a3"/>',
    },
    {
      id: "colar-flores", nome: "Colar de flores", lugar: "pescoco", preco: 75, raridade: "rara",
      svg: (function () {
        var cores = ["#f472b6", "#facc15", "#a78bfa", "#34d399"];
        var h = "";
        for (var i = 0; i < 7; i++) {
          var x = 64 + i * 12;
          var y = 130 + Math.round(Math.sin((i / 6) * Math.PI) * 8);
          h += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="' + cores[i % 4] + '"/><circle cx="' + x + '" cy="' + y + '" r="2.2" fill="#fff7ed"/>';
        }
        return h;
      })(),
    },
    {
      id: "medalha", nome: "Medalha de honra", lugar: "pescoco", preco: 130, raridade: "epica",
      svg: '<path d="M84 126 L100 150 L116 126" stroke="#3b82f6" stroke-width="6" fill="none" stroke-linejoin="round"/><circle cx="100" cy="157" r="10" fill="#fbbf24" stroke="#d97706" stroke-width="2.5"/><path d="M100 151 l2 4 4.5 .6-3.3 3 .8 4.4-4-2.2-4 2.2.8-4.4-3.3-3 4.5-.6z" fill="#fff7ed"/>',
    },

    /* Nas mãos */
    {
      id: "livro", nome: "Livro", lugar: "mao", preco: 0, raridade: "comum",
      patas: [[64, 168], [136, 168]],
      svg: '<path d="M100 150 L60 139 L60 183 L100 194 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="2.5" stroke-linejoin="round"/><path d="M100 150 L140 139 L140 183 L100 194 Z" fill="#5eead4" stroke="#0f766e" stroke-width="2.5" stroke-linejoin="round"/><path d="M76 156 L76 178 M86 158 L86 182 M114 158 L114 182 M124 156 L124 178" stroke="#0f766e" stroke-width="3" stroke-linecap="round"/>',
    },
    {
      id: "banana", nome: "Banana", lugar: "mao", preco: 20, raridade: "comum",
      svg: '<path d="M70 168 Q100 198 134 158 Q106 184 74 162 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2.5" stroke-linejoin="round"/><path d="M134 158 l4 -5" stroke="#713f12" stroke-width="3" stroke-linecap="round"/>',
    },
    {
      id: "lapis", nome: "Lápis gigante", lugar: "mao", preco: 25, raridade: "comum",
      svg: '<g transform="rotate(-18 100 166)"><rect x="66" y="159" width="62" height="14" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/><polygon points="128,159 146,166 128,173" fill="#fde68a"/><polygon points="141,164 146,166 141,168" fill="#1f2937"/><rect x="56" y="159" width="10" height="14" rx="2" fill="#f472b6"/></g>',
    },
    {
      id: "calculadora", nome: "Calculadora", lugar: "mao", preco: 60, raridade: "rara",
      patas: [[80, 174], [120, 174]],
      svg: (function () {
        var h = '<rect x="80" y="144" width="40" height="48" rx="6" fill="#334155"/><rect x="85" y="149" width="30" height="10" rx="2" fill="#a7f3d0"/>';
        for (var l = 0; l < 3; l++) for (var c = 0; c < 3; c++) h += '<rect x="' + (86 + c * 10) + '" y="' + (163 + l * 9) + '" width="7" height="6" rx="1.5" fill="#cbd5e1"/>';
        return h;
      })(),
    },
    {
      id: "cuia", nome: "Cuia de chimarrão", lugar: "mao", preco: 90, raridade: "rara",
      patas: [[82, 174], [118, 174]],
      svg: '<path d="M118 154 L130 122" stroke="#cbd5e1" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="100" cy="172" rx="20" ry="22" fill="#4d7c0f"/><ellipse cx="100" cy="153" rx="15" ry="5" fill="#365314"/><ellipse cx="100" cy="153" rx="11" ry="3" fill="#a3e635"/><path d="M86 168 Q100 176 114 168" stroke="#65a30d" stroke-width="2" fill="none"/>',
    },
    {
      id: "trofeu", nome: "Troféu de campeã", lugar: "mao", preco: 250, raridade: "lendaria",
      patas: [[80, 160], [120, 160]],
      svg: '<path d="M80 152 q-12 0 -10 10 q2 8 12 8 M120 152 q12 0 10 10 q-2 8 -12 8" stroke="#d97706" stroke-width="3" fill="none"/><path d="M80 142 h40 v14 q0 18 -20 20 q-20 -2 -20 -20 z" fill="#fbbf24" stroke="#d97706" stroke-width="2.5"/><rect x="96" y="175" width="8" height="8" fill="#d97706"/><rect x="85" y="183" width="30" height="8" rx="2" fill="#b45309"/><path d="M100 150 l2.4 4.8 5.3.8-3.8 3.7.9 5.2-4.8-2.5-4.8 2.5.9-5.2-3.8-3.7 5.3-.8z" fill="#fff7ed"/>',
    },
  ];

  var PORID = {};
  CATALOGO.forEach(function (i) {
    PORID[i.id] = i;
  });

  /* ---------------- Desenho ---------------- */
  /**
   * opcoes:
   *  - equipados: { cabeca, rosto, pescoco, mao } (ids do catálogo)
   *  - triste: true para cara tristinha
   *  - semSombra: true para não desenhar a sombra
   */
  /* Estilo escolhido em 23/11/2026: "Ovinho" — contorno escuro, cores
     chapadas (como o mascote do Figma), cabeça em forma de ovo, focinho
     oval, olhos grandes com cílios e laço rosa fixo. */
  var CONTORNO = "#4a2f18";
  var PELO = "#c98d55";
  var FOCINHO_COR = "#b27744";
  var BARRIGA = "#f2d4a8";
  var ESCURO_PELO = "#9a6538";

  var CABECA = "M100 28 C136 28 156 52 156 86 C156 120 134 141 100 141 C66 141 44 120 44 86 C44 52 64 28 100 28 Z";
  var FOCINHO = "M100 80 C125 80 140 92 140 110 C140 128 123 137 100 137 C77 137 60 128 60 110 C60 92 75 80 100 80 Z";

  function elipse(x, y, rx, ry, cor, giro, semTraco) {
    return (
      '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + cor + '"' +
      (semTraco ? "" : ' stroke="' + CONTORNO + '" stroke-width="3"') +
      (giro ? ' transform="rotate(' + giro + " " + x + " " + y + ')"' : "") +
      "/>"
    );
  }

  // Olho grande e brilhante, com três cílios para o lado de fora (lado: -1 esquerdo, +1 direito)
  function olho(cx, lado) {
    var cy = 70;
    var fora = cx + lado * 7;
    return (
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="6.4" ry="7.4" fill="#2b1a0e"/>' +
      '<circle cx="' + (cx + 2.1) + '" cy="' + (cy - 2.6) + '" r="2.6" fill="#fff"/>' +
      '<circle cx="' + (cx - 2.2) + '" cy="' + (cy + 3) + '" r="1.15" fill="#fff" opacity=".85"/>' +
      '<path d="M' + fora + " " + (cy - 2.6) + " l" + lado * 4.4 + " -2.4 M" + (cx + lado * 4.5) + " " + (cy - 5.9) + " l" + lado * 3.2 +
      " -3.6 M" + (cx + lado * 1.3) + " " + (cy - 7.5) + " l" + lado * 1.6 + ' -4" stroke="' + CONTORNO + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
    );
  }

  function lacoFixo(cx, cy) {
    var lado = function (s) {
      return (
        '<path d="M' + cx + " " + cy + " L" + (cx + s * 13) + " " + (cy - 9) + " Q" + (cx + s * 17) + " " + cy + " " + (cx + s * 13) + " " + (cy + 9) +
        ' Z" fill="#f472b6" stroke="#be185d" stroke-width="2" stroke-linejoin="round"/>'
      );
    };
    return '<g class="idebinha__laco">' + lado(-1) + lado(1) + '<circle cx="' + cx + '" cy="' + cy + '" r="4.2" fill="#be185d"/></g>';
  }

  function svg(opcoes) {
    opcoes = opcoes || {};
    var eq = opcoes.equipados || {};
    function item(lugar) {
      var i = PORID[eq[lugar]];
      return i && i.lugar === lugar ? i : null;
    }

    var mao = item("mao");
    var pes = item("pescoco");
    var ros = item("rosto");
    var cab = item("cabeca");

    var boca = opcoes.triste
      ? '<path d="M100 100 V107 M91 117 Q100 110 109 117" stroke="' + CONTORNO + '" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<path d="M100 100 V107 M100 107 Q95 113 90 110 M100 107 Q105 113 110 110" stroke="' + CONTORNO + '" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M97.5 110.6 Q100 114.6 102.5 110.6 Z" fill="#f47a8c"/>';

    var bracos = mao
      ? (mao.patas || [[66, 170], [134, 170]]).map(function (p) {
          return elipse(p[0], p[1], 12, 11, ESCURO_PELO);
        }).join("")
      : elipse(54, 162, 10, 18, ESCURO_PELO, 14) + elipse(146, 162, 10, 18, ESCURO_PELO, -14);

    function acessorio(lugar, i) {
      return i ? '<g class="idebinha__item" data-lugar="' + lugar + '">' + i.svg + "</g>" : "";
    }

    return (
      '<svg class="idebinha" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Idebinha, a capivara">' +
      (opcoes.semSombra ? "" : '<ellipse cx="100" cy="203" rx="58" ry="6" fill="rgba(15,23,42,.1)"/>') +
      // pés e corpo
      elipse(74, 197, 15, 7, ESCURO_PELO) + elipse(126, 197, 15, 7, ESCURO_PELO) +
      '<ellipse cx="100" cy="162" rx="54" ry="40" fill="' + PELO + '" stroke="' + CONTORNO + '" stroke-width="3.5"/>' +
      // orelhas pequenas, com o rosinha de dentro
      elipse(64, 38, 9, 7, ESCURO_PELO, -30) + elipse(65, 39, 4, 2.6, "#f4a6b8", -30, true) +
      elipse(136, 38, 9, 7, ESCURO_PELO, 30) + elipse(135, 39, 4, 2.6, "#f4a6b8", 30, true) +
      // cabeça em forma de ovo
      '<path d="' + CABECA + '" fill="' + PELO + '" stroke="' + CONTORNO + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      // barriga (fica por cima do contorno do corpo, por baixo do queixo)
      '<ellipse cx="100" cy="170" rx="33" ry="25" fill="' + BARRIGA + '"/>' +
      // tufinho de pelo
      '<path d="M95 33 q3 -8 6 -1 q3 -7 6 1" stroke="' + CONTORNO + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      // focinho oval com narinas no alto
      '<path d="' + FOCINHO + '" fill="' + FOCINHO_COR + '" stroke="' + CONTORNO + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<ellipse cx="90.5" cy="94" rx="3.4" ry="2.1" fill="' + CONTORNO + '" transform="rotate(-22 90.5 94)"/>' +
      '<ellipse cx="109.5" cy="94" rx="3.4" ry="2.1" fill="' + CONTORNO + '" transform="rotate(22 109.5 94)"/>' +
      boca +
      // bochechas
      '<ellipse cx="56" cy="97" rx="8" ry="5" fill="#f9a8b8"/><ellipse cx="144" cy="97" rx="8" ry="5" fill="#f9a8b8"/>' +
      '<g class="idebinha__olhos">' + olho(79, -1) + olho(121, 1) + "</g>" +
      // laço rosa fixo (some se ela estiver com o "Laço rosa" da loja, para não ficar com dois)
      (cab && cab.id === "laco" ? "" : lacoFixo(136, 36)) +
      // acessórios
      acessorio("pescoco", pes) +
      acessorio("mao", mao) +
      bracos +
      acessorio("rosto", ros) +
      acessorio("cabeca", cab) +
      "</svg>"
    );
  }
  function render(alvo, opcoes) {
    if (alvo) alvo.innerHTML = svg(opcoes);
  }

  window.Idebinha = {
    CATALOGO: CATALOGO,
    LUGARES: LUGARES,
    RARIDADES: RARIDADES,
    item: function (id) {
      return PORID[id] || null;
    },
    svg: svg,
    render: render,
  };
})();
