/* =========================================================
   StudyFlow — gerador-estudo.js
   "IA" de DEMONSTRAÇÃO que monta o planejamento de estudo:
   para cada dia, uma explicação, exercícios com resposta,
   atividades práticas e o checklist.

   Funciona 100% no navegador, de dois jeitos:
   1. Com fontes (PDF, Word, textos): lê o conteúdo, divide em
      partes, acha palavras-chave e frases principais e cria
      exercícios a partir delas.
   2. Sem fontes: usa a base de conteúdos do 9º ano abaixo.

   Quando a IA de verdade estiver no ar, basta trocar a função
   GeradorEstudo.gerar() por uma chamada ao servidor que devolva
   o mesmo formato.
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     Base de conteúdos (sem fontes)
     t = título · e = explicação · f = fórmula · x = exercícios
     [pergunta, resposta] · a = atividade prática
     ======================================================= */
  var BASE = {
    matematica: [
      {
        t: "Equação do 2º grau",
        e: [
          "Uma equação do 2º grau tem a forma ax² + bx + c = 0, com a ≠ 0. Resolver a equação é achar os valores de x (as raízes) que deixam a igualdade verdadeira.",
          "O caminho mais usado é a fórmula de Bhaskara: primeiro calcule o delta (Δ) e depois use a fórmula das raízes.",
          "O sinal do delta já diz quantas raízes existem: Δ > 0 → duas raízes reais diferentes; Δ = 0 → uma raiz (dupla); Δ < 0 → nenhuma raiz real.",
        ],
        f: "Δ = b² − 4ac\nx = (−b ± √Δ) ÷ 2a",
        x: [
          ["Resolva x² − 5x + 6 = 0.", "Δ = 25 − 24 = 1 → x = (5 ± 1) ÷ 2 → x = 3 ou x = 2."],
          ["Resolva x² − 9 = 0.", "x² = 9 → x = 3 ou x = −3."],
          ["Quantas raízes reais tem x² + 2x + 5 = 0?", "Δ = 4 − 20 = −16. Como Δ < 0, nenhuma raiz real."],
          ["Na equação 2x² − 8x + 6 = 0, quanto vale a soma das raízes?", "Soma = −b/a = 8/2 = 4 (as raízes são 1 e 3)."],
        ],
        a: "Monte uma tabela com 3 equações do seu livro e anote a, b, c, Δ e as raízes de cada uma.",
      },
      {
        t: "Função do 1º grau",
        e: [
          "A função do 1º grau (ou função afim) tem a forma f(x) = ax + b. O gráfico dela é sempre uma reta.",
          "O número a é a taxa de variação: diz quanto f(x) muda quando x aumenta 1. Se a > 0 a função é crescente; se a < 0, decrescente.",
          "O número b é onde a reta corta o eixo y. A raiz (ou zero) é o valor de x que faz f(x) = 0.",
        ],
        f: "f(x) = ax + b\nRaiz: x = −b ÷ a",
        x: [
          ["Se f(x) = 2x + 3, quanto vale f(4)?", "f(4) = 2·4 + 3 = 11."],
          ["Qual é a raiz de f(x) = 3x − 12?", "3x − 12 = 0 → x = 4."],
          ["A função f(x) = −x + 5 é crescente ou decrescente?", "Decrescente, porque a = −1 é negativo."],
          ["Um táxi cobra R$ 5,00 fixos mais R$ 2,50 por km. Escreva a função e calcule o preço de 8 km.", "f(x) = 2,5x + 5 → f(8) = 20 + 5 = R$ 25,00."],
        ],
        a: "Desenhe no caderno o gráfico de f(x) = 2x − 1 marcando os pontos para x = −1, 0, 1 e 2.",
      },
      {
        t: "Teorema de Pitágoras",
        e: [
          "Em todo triângulo retângulo (que tem um ângulo de 90°), o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.",
          "A hipotenusa é o maior lado, sempre oposto ao ângulo reto. Os outros dois lados são os catetos.",
          "Ele serve para descobrir um lado que falta quando você conhece os outros dois.",
        ],
        f: "a² = b² + c²\n(a = hipotenusa; b e c = catetos)",
        x: [
          ["Os catetos de um triângulo retângulo medem 6 cm e 8 cm. Quanto mede a hipotenusa?", "a² = 36 + 64 = 100 → a = 10 cm."],
          ["A hipotenusa mede 13 m e um cateto 5 m. Quanto mede o outro cateto?", "169 = 25 + c² → c² = 144 → c = 12 m."],
          ["Uma escada de 5 m está apoiada num muro, alcançando 4 m de altura. A que distância do muro está o pé da escada?", "25 = 16 + d² → d² = 9 → d = 3 m."],
        ],
        a: "Meça a diagonal da tela do celular ou do caderno com uma régua e confira com Pitágoras usando a largura e a altura.",
      },
      {
        t: "Potências e raízes",
        e: [
          "Potência é uma multiplicação de fatores iguais: 2⁴ = 2 · 2 · 2 · 2 = 16. A base é o número que se repete e o expoente diz quantas vezes.",
          "Propriedades importantes: aᵐ · aⁿ = aᵐ⁺ⁿ; aᵐ ÷ aⁿ = aᵐ⁻ⁿ; (aᵐ)ⁿ = aᵐ·ⁿ; a⁰ = 1 (com a ≠ 0); a⁻ⁿ = 1 ÷ aⁿ.",
          "A raiz é a operação inversa: √144 = 12 porque 12² = 144.",
        ],
        f: "aᵐ · aⁿ = aᵐ⁺ⁿ   ·   (aᵐ)ⁿ = aᵐ·ⁿ   ·   a⁻ⁿ = 1/aⁿ",
        x: [
          ["Calcule 2³ · 2⁴.", "2⁷ = 128."],
          ["Quanto vale 5⁰?", "1 (todo número diferente de zero elevado a 0 dá 1)."],
          ["Calcule √144 + √81.", "12 + 9 = 21."],
          ["Simplifique (10²)³.", "10⁶ = 1 000 000."],
        ],
        a: "Faça um cartão-resumo com as 5 propriedades das potências e um exemplo de cada.",
      },
      {
        t: "Porcentagem e juros simples",
        e: [
          "Porcentagem é uma fração de denominador 100: 25% = 25/100 = 0,25. Para calcular x% de um valor, multiplique o valor por x/100.",
          "Aumentos e descontos: um desconto de 15% significa pagar 85% do preço (multiplicar por 0,85).",
          "Nos juros simples, os juros são calculados sempre sobre o valor inicial (capital).",
        ],
        f: "J = C · i · t\n(C = capital, i = taxa, t = tempo)",
        x: [
          ["Quanto é 20% de 150?", "0,20 · 150 = 30."],
          ["Um tênis de R$ 80,00 está com 15% de desconto. Quanto custa?", "80 · 0,85 = R$ 68,00."],
          ["Quanto rendem R$ 1.000,00 a juros simples de 2% ao mês durante 5 meses?", "J = 1000 · 0,02 · 5 = R$ 100,00."],
        ],
        a: "Procure 3 promoções em panfletos ou sites e calcule o preço final de cada uma.",
      },
      {
        t: "Sistemas de equações",
        e: [
          "Um sistema é um conjunto de equações que precisam ser verdadeiras ao mesmo tempo. Com duas incógnitas (x e y), precisamos de duas equações.",
          "Método da substituição: isole uma incógnita numa equação e substitua na outra.",
          "Método da adição: some as equações (ou multiplique uma delas antes) para cancelar uma das incógnitas.",
        ],
        f: null,
        x: [
          ["Resolva: x + y = 10 e x − y = 2.", "Somando: 2x = 12 → x = 6 e y = 4."],
          ["Resolva: 2x + y = 7 e x − y = 2.", "Somando: 3x = 9 → x = 3 e y = 1."],
          ["Num sítio há 30 animais entre galinhas e coelhos, com 80 patas no total. Quantos são de cada?", "g + c = 30 e 2g + 4c = 80 → c = 10 coelhos e g = 20 galinhas."],
        ],
        a: "Invente um problema com dois preços (ex.: lanche e suco) e resolva com um sistema.",
      },
    ],

    ciencias: [
      {
        t: "Fotossíntese",
        e: [
          "Fotossíntese é o processo em que as plantas, as algas e algumas bactérias produzem o próprio alimento (glicose) usando a energia da luz.",
          "Os ingredientes são gás carbônico (do ar) e água (do solo). Os produtos são glicose, que vira energia e matéria para a planta, e oxigênio, que é liberado.",
          "Acontece nos cloroplastos, que têm clorofila, o pigmento verde que capta a luz.",
        ],
        f: "6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂",
        x: [
          ["Em qual organela acontece a fotossíntese?", "Nos cloroplastos."],
          ["Quais são os reagentes da fotossíntese?", "Gás carbônico (CO₂), água (H₂O) e energia luminosa."],
          ["Verdadeiro ou falso: as plantas só respiram à noite.", "Falso. Elas respiram de dia e de noite; de dia a fotossíntese costuma ser maior que a respiração."],
        ],
        a: "Desenhe uma planta e indique com setas o que entra (luz, água, CO₂) e o que sai (O₂, glicose).",
      },
      {
        t: "A célula e suas organelas",
        e: [
          "A célula é a menor unidade viva. Células procariontes (bactérias) não têm núcleo organizado; células eucariontes (animais, plantas, fungos) têm.",
          "Partes principais: membrana plasmática (controla o que entra e sai), citoplasma (onde ficam as organelas) e núcleo (guarda o DNA).",
          "Organelas importantes: mitocôndria (respiração celular, energia), ribossomo (produz proteínas). Células vegetais também têm parede celular e cloroplastos.",
        ],
        f: null,
        x: [
          ["Qual organela é responsável pela respiração celular?", "A mitocôndria."],
          ["Cite duas estruturas que a célula vegetal tem e a animal não.", "Parede celular e cloroplastos (e também um vacúolo grande)."],
          ["Qual a diferença entre célula procarionte e eucarionte?", "A procarionte não tem núcleo organizado (o DNA fica solto no citoplasma); a eucarionte tem núcleo com membrana."],
        ],
        a: "Faça uma tabela comparando célula animal e vegetal com o nome e a função de cada organela.",
      },
      {
        t: "Mitose e meiose",
        e: [
          "Mitose: uma célula se divide em 2 células iguais, com o mesmo número de cromossomos. Serve para crescer e regenerar tecidos.",
          "Meiose: uma célula se divide em 4 células com metade dos cromossomos. Forma os gametas (óvulos e espermatozoides).",
          "Na meiose acontece o crossing-over, troca de pedaços entre cromossomos que aumenta a variabilidade genética.",
        ],
        f: null,
        x: [
          ["Quantas células a mitose forma e como elas são?", "2 células iguais à célula-mãe (2n)."],
          ["Para que serve a meiose?", "Para formar gametas, com metade dos cromossomos (n)."],
          ["Por que a meiose aumenta a variabilidade genética?", "Por causa do crossing-over e da separação ao acaso dos cromossomos."],
        ],
        a: "Desenhe as fases da mitose (prófase, metáfase, anáfase, telófase) numa folha, como uma historinha em quadrinhos.",
      },
      {
        t: "Estados físicos da matéria",
        e: [
          "A matéria pode estar nos estados sólido (forma e volume fixos), líquido (volume fixo, forma do recipiente) e gasoso (sem forma e sem volume fixos).",
          "As mudanças de estado dependem de ganhar ou perder calor: fusão (sólido → líquido), vaporização (líquido → gasoso), condensação (gasoso → líquido), solidificação (líquido → sólido) e sublimação (sólido → gasoso direto).",
          "Na água pura ao nível do mar, a fusão acontece a 0 °C e a ebulição a 100 °C.",
        ],
        f: null,
        x: [
          ["Como se chama a passagem do líquido para o sólido?", "Solidificação."],
          ["Gotinhas por fora de um copo gelado são exemplo de qual mudança de estado?", "Condensação: o vapor de água do ar vira líquido ao encostar no copo frio."],
          ["Dê um exemplo de sublimação.", "Naftalina ou gelo-seco passando direto para gás."],
        ],
        a: "Observe a cozinha de casa e anote 3 mudanças de estado que acontecem no dia a dia.",
      },
      {
        t: "Ecossistemas e cadeias alimentares",
        e: [
          "Ecossistema é o conjunto dos seres vivos de um lugar e do ambiente onde eles vivem, com todas as relações entre eles.",
          "Na cadeia alimentar há produtores (fazem fotossíntese), consumidores (primários, secundários...) e decompositores (fungos e bactérias que reciclam a matéria).",
          "A energia passa num só sentido e diminui a cada nível: só cerca de 10% passa para o nível seguinte.",
        ],
        f: null,
        x: [
          ["Qual é o papel dos decompositores?", "Decompor restos de seres vivos e devolver nutrientes ao solo."],
          ["Na cadeia capim → gafanhoto → sapo → cobra, quem é o consumidor secundário?", "O sapo."],
          ["Por que as cadeias alimentares costumam ter poucos níveis?", "Porque a energia diminui muito a cada nível (cerca de 90% se perde)."],
        ],
        a: "Monte uma teia alimentar com 6 seres vivos da região de Santa Rosa do Sul (Mata Atlântica).",
      },
      {
        t: "Sistema digestório",
        e: [
          "O sistema digestório transforma os alimentos em partes pequenas que o corpo consegue absorver.",
          "Na boca começa a digestão do amido (saliva). No estômago, o suco gástrico (ácido e pepsina) digere proteínas. No intestino delgado termina a digestão e acontece a absorção dos nutrientes.",
          "O intestino grosso absorve água e forma as fezes. Fígado e pâncreas ajudam com a bile e o suco pancreático.",
        ],
        f: null,
        x: [
          ["Onde acontece a maior parte da absorção dos nutrientes?", "No intestino delgado."],
          ["Qual a função da bile?", "Ajudar a digerir as gorduras (separa a gordura em gotinhas)."],
          ["Qual órgão absorve a maior parte da água?", "O intestino grosso."],
        ],
        a: "Desenhe o caminho de um pedaço de pão pelo sistema digestório, dizendo o que acontece em cada órgão.",
      },
    ],

    historia: [
      {
        t: "Revolução Industrial",
        e: [
          "A Revolução Industrial começou na Inglaterra no século XVIII e trocou a produção manual pelas máquinas.",
          "A máquina a vapor foi a grande inovação: movia fábricas, trens e navios. Surgiram as fábricas e a classe operária.",
          "As condições de trabalho eram duras (jornadas de até 16 horas, trabalho infantil), o que levou ao surgimento dos sindicatos e de movimentos por direitos.",
        ],
        f: null,
        x: [
          ["Em que país e século começou a Revolução Industrial?", "Na Inglaterra, no século XVIII."],
          ["Qual foi a principal inovação técnica da Primeira Revolução Industrial?", "A máquina a vapor."],
          ["Por que surgiram os sindicatos?", "Para os operários lutarem juntos por melhores salários e condições de trabalho."],
        ],
        a: "Compare numa tabela o trabalho artesanal e o trabalho na fábrica (quem faz, como, onde e quanto produz).",
      },
      {
        t: "Revolução Francesa",
        e: [
          "A Revolução Francesa (1789–1799) derrubou a monarquia absolutista na França e espalhou os ideais de Liberdade, Igualdade e Fraternidade.",
          "Causas: crise econômica, fome, impostos pagos só pelo Terceiro Estado e as ideias do Iluminismo.",
          "Marcos: Queda da Bastilha (14 de julho de 1789), Declaração dos Direitos do Homem e do Cidadão, período do Terror e golpe de Napoleão (1799).",
        ],
        f: null,
        x: [
          ["Qual era o lema da Revolução Francesa?", "Liberdade, Igualdade, Fraternidade."],
          ["Por que o Terceiro Estado estava insatisfeito?", "Pagava quase todos os impostos e não tinha privilégios, enquanto clero e nobreza tinham."],
          ["Que acontecimento é considerado o início da Revolução?", "A Queda da Bastilha, em 14 de julho de 1789."],
        ],
        a: "Faça uma linha do tempo de 1789 a 1799 com 5 acontecimentos da Revolução.",
      },
      {
        t: "Independência do Brasil",
        e: [
          "Em 1808 a família real portuguesa veio para o Brasil, que em 1815 virou Reino Unido a Portugal e Algarves.",
          "Com a volta de D. João VI a Portugal, as Cortes queriam que o Brasil voltasse a ser colônia. Em 9 de janeiro de 1822, D. Pedro decidiu ficar (Dia do Fico).",
          "Em 7 de setembro de 1822, D. Pedro proclamou a independência e virou D. Pedro I. Portugal só reconheceu em 1825, com o pagamento de uma indenização.",
        ],
        f: null,
        x: [
          ["Em que data foi proclamada a Independência do Brasil?", "7 de setembro de 1822."],
          ["O que foi o Dia do Fico?", "O dia (9/1/1822) em que D. Pedro decidiu ficar no Brasil, contrariando as Cortes portuguesas."],
          ["A independência mudou a vida das pessoas escravizadas? Explique.", "Não: a escravidão continuou até 1888. A independência manteve a elite no poder."],
        ],
        a: "Escreva uma notícia de jornal de 1822 contando a independência, com título e lide.",
      },
      {
        t: "Primeira Guerra Mundial",
        e: [
          "A Primeira Guerra Mundial (1914–1918) opôs a Tríplice Entente (França, Reino Unido, Rússia) à Tríplice Aliança (Alemanha, Áustria-Hungria e, no início, Itália).",
          "O estopim foi o assassinato do arquiduque Francisco Ferdinando em Sarajevo, mas as causas eram a disputa por colônias, o nacionalismo e a corrida armamentista.",
          "Ficou marcada pela guerra de trincheiras. Terminou com o Tratado de Versalhes (1919), muito duro com a Alemanha.",
        ],
        f: null,
        x: [
          ["Qual foi o estopim da Primeira Guerra?", "O assassinato do arquiduque Francisco Ferdinando em Sarajevo (1914)."],
          ["Cite duas causas profundas da guerra.", "Disputa imperialista por colônias, nacionalismo, alianças militares e corrida armamentista."],
          ["Que tratado encerrou a guerra e qual foi sua consequência para a Alemanha?", "O Tratado de Versalhes: a Alemanha perdeu territórios, foi desarmada e pagou indenizações."],
        ],
        a: "Desenhe um mapa simples da Europa de 1914 pintando os países de cada aliança.",
      },
      {
        t: "Era Vargas",
        e: [
          "Getúlio Vargas chegou ao poder com a Revolução de 1930 e governou até 1945 (e voltou eleito em 1951).",
          "Em 1937 deu um golpe e criou o Estado Novo, uma ditadura com censura e sem eleições.",
          "Também criou leis trabalhistas: salário mínimo (1940) e a CLT (1943), além de estimular a indústria (Companhia Siderúrgica Nacional).",
        ],
        f: null,
        x: [
          ["Como Vargas chegou ao poder em 1930?", "Pela Revolução de 1930, que impediu a posse de Júlio Prestes."],
          ["O que foi o Estado Novo?", "A ditadura de Vargas de 1937 a 1945, com censura e poder concentrado."],
          ["Cite uma conquista trabalhista da Era Vargas.", "A CLT (1943) ou o salário mínimo (1940)."],
        ],
        a: "Pergunte a um familiar o que ele sabe sobre a carteira de trabalho e ligue isso à CLT.",
      },
      {
        t: "Segunda Guerra Mundial",
        e: [
          "A Segunda Guerra Mundial (1939–1945) começou com a invasão da Polônia pela Alemanha nazista.",
          "De um lado o Eixo (Alemanha, Itália, Japão); do outro os Aliados (Reino Unido, URSS, EUA, França e outros). O Brasil enviou a FEB para lutar na Itália.",
          "Teve o Holocausto, o assassinato de milhões de judeus e outros grupos. Terminou em 1945, após as bombas atômicas em Hiroshima e Nagasaki; no mesmo ano foi criada a ONU.",
        ],
        f: null,
        x: [
          ["Que acontecimento iniciou a Segunda Guerra?", "A invasão da Polônia pela Alemanha, em setembro de 1939."],
          ["Quais países formavam o Eixo?", "Alemanha, Itália e Japão."],
          ["Qual organização foi criada em 1945 para tentar evitar novas guerras?", "A ONU (Organização das Nações Unidas)."],
        ],
        a: "Pesquise e escreva 5 linhas sobre a participação da FEB (Força Expedicionária Brasileira).",
      },
    ],

    portugues: [
      {
        t: "Sujeito e predicado",
        e: [
          "Sujeito é o termo de quem se fala na oração. Para achar, pergunte ao verbo “quem?” ou “o quê?”. Predicado é tudo o que se diz do sujeito, e sempre tem verbo.",
          "Tipos de sujeito: simples (um núcleo), composto (dois ou mais núcleos), oculto (identificado pela terminação do verbo), indeterminado e oração sem sujeito (ex.: “Choveu muito”).",
        ],
        f: null,
        x: [
          ["Classifique o sujeito: “Ana e Pedro estudaram juntos.”", "Sujeito composto (núcleos: Ana, Pedro)."],
          ["Qual o sujeito de “Fomos ao cinema ontem”?", "Sujeito oculto (nós)."],
          ["Separe sujeito e predicado: “A biblioteca da escola abriu cedo.”", "Sujeito: A biblioteca da escola. Predicado: abriu cedo."],
        ],
        a: "Copie 5 frases de uma notícia e sublinhe o sujeito de cada uma.",
      },
      {
        t: "Figuras de linguagem",
        e: [
          "Figuras de linguagem são recursos que dão mais expressividade ao texto.",
          "Metáfora: comparação sem “como” (“Ela é uma flor”). Comparação: com “como” (“forte como um touro”). Hipérbole: exagero (“chorei rios”). Personificação: dar ações humanas a coisas (“o vento sussurrava”). Ironia: dizer o contrário do que se pensa.",
        ],
        f: null,
        x: [
          ["Que figura há em “Já te disse um milhão de vezes”?", "Hipérbole (exagero)."],
          ["Que figura há em “O sol sorria para nós”?", "Personificação (prosopopeia)."],
          ["Qual a diferença entre metáfora e comparação?", "A comparação usa conectivo (como, tal qual); a metáfora compara diretamente, sem conectivo."],
        ],
        a: "Procure 3 figuras de linguagem em letras de música que você gosta e identifique cada uma.",
      },
      {
        t: "Concordância verbal",
        e: [
          "Na concordância verbal, o verbo concorda em número e pessoa com o sujeito: “Os alunos chegaram”.",
          "Casos que caem em prova: sujeito composto antes do verbo vai para o plural; verbo “haver” no sentido de existir fica no singular (“Havia muitas pessoas”); verbo “fazer” indicando tempo também (“Faz dois anos”).",
        ],
        f: null,
        x: [
          ["Corrija: “Haviam muitos alunos na sala.”", "Havia muitos alunos na sala (haver = existir fica no singular)."],
          ["Complete: “Fazem/Faz três meses que não chove.”", "Faz três meses (fazer indicando tempo é impessoal)."],
          ["Complete: “O professor e a diretora ___ (chegar).”", "chegaram (sujeito composto antes do verbo)."],
        ],
        a: "Escreva 5 frases com “haver” e “fazer” impessoais e confira a concordância.",
      },
    ],

    geografia: [
      {
        t: "Globalização",
        e: [
          "Globalização é a integração cada vez maior entre os países na economia, na cultura, na comunicação e na política.",
          "Foi acelerada pelos avanços nos transportes e na internet. Trouxe mais comércio e troca de informações, mas também desigualdade e dependência entre países.",
        ],
        f: null,
        x: [
          ["O que é globalização?", "A integração econômica, cultural e tecnológica entre os países do mundo."],
          ["Cite dois fatores que aceleraram a globalização.", "Internet/telecomunicações e meios de transporte mais rápidos."],
          ["Cite um ponto negativo da globalização.", "Aumento da desigualdade, perda de culturas locais ou dependência econômica."],
        ],
        a: "Olhe as etiquetas de 5 objetos em casa e anote em que país cada um foi feito.",
      },
      {
        t: "Placas tectônicas e relevo",
        e: [
          "A crosta terrestre é dividida em placas tectônicas que se movem lentamente sobre o manto.",
          "Quando se afastam, se aproximam ou deslizam, formam montanhas, vulcões e terremotos. O Brasil fica no meio da Placa Sul-Americana, por isso tem poucos terremotos fortes.",
          "O relevo também é modelado por agentes externos: chuva, rios, vento e ser humano (erosão).",
        ],
        f: null,
        x: [
          ["Por que o Brasil tem poucos terremotos fortes?", "Porque fica no centro da Placa Sul-Americana, longe das bordas."],
          ["Cite dois agentes externos que modelam o relevo.", "Chuva, rios, vento, mar ou ação humana."],
          ["O que acontece quando duas placas se chocam?", "Podem se formar cordilheiras (como os Andes), vulcões e terremotos."],
        ],
        a: "Observe o relevo da região de Santa Rosa do Sul (serra, planície) e descreva-o em 5 linhas.",
      },
      {
        t: "Biomas brasileiros",
        e: [
          "O Brasil tem seis biomas: Amazônia, Cerrado, Caatinga, Mata Atlântica, Pantanal e Pampa.",
          "A Mata Atlântica, onde fica Santa Rosa do Sul, é um dos biomas mais ameaçados: restam poucos por cento da vegetação original.",
          "A Caatinga é o bioma do semiárido, só existe no Brasil. O Pantanal é a maior planície alagável do mundo.",
        ],
        f: null,
        x: [
          ["Quais são os seis biomas brasileiros?", "Amazônia, Cerrado, Caatinga, Mata Atlântica, Pantanal e Pampa."],
          ["Qual bioma existe só no Brasil?", "A Caatinga."],
          ["Por que a Mata Atlântica é tão ameaçada?", "Porque fica onde vive a maior parte da população, com cidades, agricultura e desmatamento."],
        ],
        a: "Faça um cartaz com uma planta e um animal típico de cada bioma.",
      },
    ],

    ingles: [
      {
        t: "Simple Present",
        e: [
          "O Simple Present fala de hábitos, rotinas e verdades: “I study every day”.",
          "Com he/she/it o verbo ganha -s ou -es: “She studies”, “He watches”. Negativa e pergunta usam do/does: “Does she study?” “She doesn't study.”",
        ],
        f: null,
        x: [
          ["Complete: She ___ (play) soccer on Sundays.", "plays."],
          ["Passe para a negativa: “He likes pizza.”", "He doesn't like pizza."],
          ["Faça a pergunta: “They live in Brazil.”", "Do they live in Brazil?"],
        ],
        a: "Escreva 6 frases sobre a sua rotina em inglês usando o Simple Present.",
      },
      {
        t: "Simple Past",
        e: [
          "O Simple Past fala de ações terminadas no passado: “I visited my grandma yesterday”.",
          "Verbos regulares ganham -ed (play → played). Os irregulares têm forma própria (go → went, eat → ate, see → saw). Na negativa e na pergunta usa-se did.",
        ],
        f: null,
        x: [
          ["Qual o passado de “go”?", "went."],
          ["Complete: I ___ (watch) a movie last night.", "watched."],
          ["Faça a pergunta: “She ate pizza.”", "Did she eat pizza?"],
        ],
        a: "Conte o seu último fim de semana em 5 frases no Simple Past.",
      },
      {
        t: "Modal verbs",
        e: [
          "Modal verbs dão sentido de habilidade, permissão, conselho ou obrigação. O verbo depois deles fica na forma base (sem to).",
          "can = poder/conseguir; could = podia/poderia; should = deveria (conselho); must = dever (obrigação forte).",
        ],
        f: null,
        x: [
          ["Traduza: “You should study more.”", "Você deveria estudar mais."],
          ["Complete com can/must: “You ___ wear a seatbelt.”", "must (obrigação)."],
          ["Corrija: “She can to swim.”", "She can swim (sem “to” depois do modal)."],
        ],
        a: "Escreva 4 conselhos para um colega que vai fazer prova, usando “should”.",
      },
    ],

    fisica: [
      {
        t: "Velocidade média",
        e: [
          "Velocidade média é a distância percorrida dividida pelo tempo gasto.",
          "No Sistema Internacional a unidade é metro por segundo (m/s). Para passar de km/h para m/s, divida por 3,6.",
        ],
        f: "vₘ = Δs ÷ Δt",
        x: [
          ["Um carro percorre 180 km em 2 h. Qual a velocidade média?", "180 ÷ 2 = 90 km/h."],
          ["Converta 72 km/h para m/s.", "72 ÷ 3,6 = 20 m/s."],
          ["Andando a 5 km/h, quanto tempo leva para percorrer 2,5 km?", "Δt = 2,5 ÷ 5 = 0,5 h = 30 minutos."],
        ],
        a: "Cronometre quanto tempo você leva para andar 50 m e calcule sua velocidade média.",
      },
      {
        t: "Leis de Newton",
        e: [
          "1ª lei (inércia): sem força resultante, um corpo continua parado ou em movimento retilíneo uniforme.",
          "2ª lei: a força resultante é igual à massa vezes a aceleração. 3ª lei (ação e reação): toda ação tem uma reação de mesma intensidade e sentido contrário.",
        ],
        f: "F = m · a",
        x: [
          ["Uma força de 50 N age em um corpo de 10 kg. Qual a aceleração?", "a = 50 ÷ 10 = 5 m/s²."],
          ["Por que somos jogados para frente quando o ônibus freia?", "Por inércia: o corpo tende a continuar em movimento."],
          ["Dê um exemplo de ação e reação.", "Ao nadar, empurramos a água para trás e ela nos empurra para frente."],
        ],
        a: "Empurre objetos de massas diferentes com a mesma força e observe qual acelera mais.",
      },
      {
        t: "Energia mecânica",
        e: [
          "Energia cinética é a energia do movimento; depende da massa e da velocidade. Energia potencial gravitacional depende da altura.",
          "Sem atrito, a energia mecânica (cinética + potencial) se conserva: uma se transforma na outra.",
        ],
        f: "Ec = m · v² ÷ 2\nEp = m · g · h",
        x: [
          ["Qual a energia cinética de uma bola de 2 kg a 3 m/s?", "Ec = 2 · 9 ÷ 2 = 9 J."],
          ["Qual a energia potencial de 5 kg a 4 m de altura (g = 10 m/s²)?", "Ep = 5 · 10 · 4 = 200 J."],
          ["Numa montanha-russa, onde a energia cinética é maior?", "No ponto mais baixo, onde a velocidade é maior."],
        ],
        a: "Solte uma bolinha de alturas diferentes e anote como muda a altura do quique.",
      },
    ],

    quimica: [
      {
        t: "O átomo",
        e: [
          "O átomo tem um núcleo com prótons (carga +) e nêutrons (sem carga), e uma eletrosfera com elétrons (carga −).",
          "Número atômico (Z) = número de prótons e identifica o elemento. Número de massa (A) = prótons + nêutrons.",
        ],
        f: "A = Z + n",
        x: [
          ["O que o número atômico indica?", "O número de prótons do átomo, que identifica o elemento."],
          ["Um átomo tem Z = 11 e A = 23. Quantos nêutrons ele tem?", "n = 23 − 11 = 12."],
          ["Qual partícula tem carga negativa?", "O elétron."],
        ],
        a: "Desenhe o modelo de Rutherford-Bohr para o átomo de sódio (Z = 11): 2, 8 e 1 elétrons.",
      },
      {
        t: "Tabela periódica",
        e: [
          "Os elementos ficam organizados em ordem crescente de número atômico.",
          "Linhas são períodos (indicam o número de camadas); colunas são grupos ou famílias, com propriedades parecidas. Ex.: grupo 1 = metais alcalinos; grupo 18 = gases nobres.",
        ],
        f: null,
        x: [
          ["Como os elementos estão ordenados na tabela?", "Pelo número atômico crescente."],
          ["Como se chama a família do grupo 18?", "Gases nobres."],
          ["O que os elementos de uma mesma coluna têm em comum?", "Propriedades químicas parecidas (mesmo número de elétrons na última camada)."],
        ],
        a: "Escolha 5 elementos que você usa no dia a dia (ex.: ferro, oxigênio) e ache cada um na tabela.",
      },
      {
        t: "Substâncias e misturas",
        e: [
          "Substância pura tem composição fixa (água, ouro). Mistura junta duas ou mais substâncias.",
          "Mistura homogênea tem uma fase só (água com sal). Heterogênea tem duas ou mais fases (água com óleo).",
          "Separação de misturas: filtração, decantação, destilação, catação, evaporação.",
        ],
        f: null,
        x: [
          ["Água e óleo formam mistura homogênea ou heterogênea?", "Heterogênea (duas fases)."],
          ["Qual método separa o sal da água do mar?", "Evaporação (ou destilação, se quiser recuperar a água)."],
          ["Qual método é usado no coador de café?", "Filtração."],
        ],
        a: "Faça em casa uma filtração simples com areia, água e um filtro de papel.",
      },
    ],

    biologia: [
      {
        t: "Genética básica",
        e: [
          "Genes são trechos do DNA que guardam informações das características. Recebemos metade dos genes do pai e metade da mãe.",
          "Alelo dominante (A) se manifesta mesmo com um só; o recessivo (a) só aparece em dose dupla (aa). No cruzamento Aa × Aa, a proporção esperada é 3 dominantes : 1 recessivo.",
        ],
        f: "Aa × Aa → 1 AA : 2 Aa : 1 aa",
        x: [
          ["O que é um alelo recessivo?", "O que só se manifesta em dose dupla (aa)."],
          ["No cruzamento Aa × Aa, qual a chance de nascer aa?", "1/4 (25%)."],
          ["Quem é considerado o pai da genética?", "Gregor Mendel."],
        ],
        a: "Faça o quadro de Punnett para Aa × aa e calcule as proporções.",
      },
      {
        t: "Evolução",
        e: [
          "Evolução é a mudança das espécies ao longo de muitas gerações.",
          "Darwin explicou pela seleção natural: indivíduos com características mais vantajosas no ambiente sobrevivem e se reproduzem mais, passando essas características adiante.",
        ],
        f: null,
        x: [
          ["O que é seleção natural?", "O ambiente favorece quem tem características vantajosas, que sobrevivem e se reproduzem mais."],
          ["Quem propôs a teoria da seleção natural?", "Charles Darwin (junto com Alfred Wallace)."],
          ["Por que bactérias resistentes a antibióticos são exemplo de evolução?", "O antibiótico mata as sensíveis e as resistentes sobrevivem e se multiplicam."],
        ],
        a: "Explique a um familiar, com suas palavras, por que é importante tomar o antibiótico até o fim.",
      },
      {
        t: "Sistema imunológico e vacinas",
        e: [
          "O sistema imunológico defende o corpo contra vírus, bactérias e outros invasores. Os glóbulos brancos e os anticorpos são as principais defesas.",
          "A vacina apresenta ao corpo uma forma enfraquecida ou uma parte do invasor. Assim o corpo cria memória e reage rápido se encontrar o invasor de verdade.",
        ],
        f: null,
        x: [
          ["O que são anticorpos?", "Proteínas produzidas pelo corpo que reconhecem e combatem invasores."],
          ["Como a vacina protege?", "Ensinando o sistema imunológico a reconhecer o invasor e criar memória."],
          ["Vacina e soro são a mesma coisa? Explique.", "Não. A vacina estimula o corpo a produzir defesa (prevenção); o soro já traz anticorpos prontos (tratamento)."],
        ],
        a: "Confira sua carteira de vacinação e anote quais vacinas você já tomou.",
      },
    ],
  };

  /* Etapas de um trabalho escolar */
  var ETAPAS_TRABALHO = [
    {
      t: "Pesquisa e fontes",
      e: [
        "Comece entendendo bem o tema e o que o professor pediu. Escreva numa frase qual é a pergunta que o seu trabalho vai responder.",
        "Use fontes confiáveis: livro didático, sites de universidades, museus e órgãos oficiais. Anote sempre de onde tirou cada informação.",
      ],
      x: [
        ["Qual é a pergunta principal que o seu trabalho vai responder?", "Resposta pessoal. Ex.: “Como a Revolução Industrial mudou a vida dos trabalhadores?”"],
        ["Liste 3 fontes confiáveis que você pode usar.", "Resposta pessoal. Ex.: livro didático, site de museu, reportagem de jornal conhecido."],
      ],
      a: "Faça uma lista com 5 informações importantes sobre o tema e a fonte de cada uma.",
      c: ["Entender o que o professor pediu", "Escrever a pergunta do trabalho", "Separar pelo menos 3 fontes"],
    },
    {
      t: "Roteiro do trabalho",
      e: [
        "Antes de escrever, monte o esqueleto: introdução (o que vai ser apresentado), desenvolvimento (as partes do tema) e conclusão (o que você aprendeu).",
        "Divida o desenvolvimento em 2 a 4 subtítulos. Cada subtítulo responde a uma parte da pergunta principal.",
      ],
      x: [
        ["Quais serão os subtítulos do desenvolvimento?", "Resposta pessoal. Ex.: Causas · Como era o trabalho · Consequências."],
        ["Que imagem ou gráfico pode ajudar a explicar o tema?", "Resposta pessoal."],
      ],
      a: "Escreva o roteiro em tópicos numa folha: introdução, subtítulos e conclusão.",
      c: ["Definir os subtítulos", "Montar o roteiro em tópicos", "Escolher imagens ou gráficos"],
    },
    {
      t: "Escrita: introdução e desenvolvimento",
      e: [
        "Na introdução, apresente o tema e diga o objetivo do trabalho em poucas linhas.",
        "No desenvolvimento, escreva com suas palavras. Não copie e cole: leia, entenda e explique. Use um parágrafo para cada ideia.",
      ],
      x: [
        ["Resuma em 2 linhas o objetivo do seu trabalho.", "Resposta pessoal."],
        ["Reescreva com suas palavras um parágrafo que você leu numa fonte.", "Resposta pessoal: confira se a ideia continua a mesma."],
      ],
      a: "Escreva a introdução e o primeiro subtítulo do desenvolvimento.",
      c: ["Escrever a introdução", "Escrever o desenvolvimento", "Conferir se está com suas palavras"],
    },
    {
      t: "Conclusão e referências",
      e: [
        "Na conclusão, retome a pergunta do início e responda com o que você descobriu. Pode dar sua opinião com argumentos.",
        "Nas referências, liste as fontes usadas. Ex.: SOBRENOME, Nome. Título. Cidade: Editora, ano. Para sites, inclua o endereço e a data de acesso.",
      ],
      x: [
        ["Qual é a resposta para a pergunta do seu trabalho?", "Resposta pessoal."],
        ["Escreva a referência de uma das suas fontes.", "Resposta pessoal no formato SOBRENOME, Nome. Título. Cidade: Editora, ano."],
      ],
      a: "Escreva a conclusão e monte a lista de referências.",
      c: ["Escrever a conclusão", "Montar as referências", "Ler o trabalho inteiro em voz alta"],
    },
    {
      t: "Visual e apresentação",
      e: [
        "Capriche na capa (escola, título, nome, turma, data) e na organização: títulos destacados, imagens com legenda.",
        "Se tiver apresentação, prepare tópicos curtos para falar e treine cronometrando o tempo.",
      ],
      x: [
        ["Quais 3 ideias você não pode esquecer de falar na apresentação?", "Resposta pessoal."],
        ["Quanto tempo a sua apresentação deve durar?", "Resposta pessoal: confira com o professor."],
      ],
      a: "Treine a apresentação em voz alta para alguém de casa.",
      c: ["Fazer a capa", "Colocar imagens com legenda", "Treinar a apresentação"],
    },
  ];

  /* =======================================================
     Utilidades de texto
     ======================================================= */
  var PARADAS = (
    "a o e é de do da dos das em no na nos nas um uma uns umas para por com sem que se não mais mas como ao aos à às ou " +
    "seu sua seus suas ele ela eles elas isso isto esse essa este esta esses essas aquele aquela também já foi era são ser " +
    "está estão estava tem têm ter há pelo pela pelos pelas entre sobre quando onde muito muita muitos muitas pode podem " +
    "assim então depois antes ainda cada todo toda todos todas outro outra outros outras mesmo mesma sua lhe nos vos " +
    "você vocês eu tu nós qual quais quem porque pois desde até após durante tanto tão sendo sido fazer faz feito ano anos " +
    "vez vezes forma parte partes exemplo grande grandes primeiro primeira segundo segunda além seja maior menor apenas " +
    "dessa desse deste desta nessa nesse neste nesta pelo the and of to in is for figura tabela página capítulo"
  ).split(" ");
  var PARADAS_SET = {};
  PARADAS.forEach(function (p) {
    PARADAS_SET[Util.semAcento(p)] = true;
  });

  function frasesDe(texto) {
    return String(texto)
      .replace(/\s*\n\s*/g, " ")
      .split(/(?<=[.!?…])\s+(?=["“(]?[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9])/)
      .map(function (f) {
        return f.trim();
      })
      .filter(function (f) {
        return f.length >= 25;
      });
  }

  function palavrasDe(texto) {
    return String(texto).match(/[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'-]*/g) || [];
  }

  function contarPalavras(texto) {
    var cont = {};
    var forma = {};
    palavrasDe(texto).forEach(function (p) {
      var k = Util.semAcento(p);
      if (k.length < 4 || PARADAS_SET[k]) return;
      cont[k] = (cont[k] || 0) + 1;
      forma[k] = forma[k] || {};
      forma[k][p] = (forma[k][p] || 0) + 1;
    });
    return { cont: cont, forma: forma };
  }

  function formaComum(formas, k) {
    var f = formas[k];
    var melhor = k;
    var n = -1;
    for (var p in f) {
      // prefere minúscula quando empata (evita "Fotossíntese" no meio da frase)
      var peso = f[p] + (p === p.toLowerCase() ? 0.5 : 0);
      if (peso > n) {
        n = peso;
        melhor = p;
      }
    }
    return melhor;
  }

  function maiuscula(t) {
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }

  function cortar(t, n) {
    t = String(t).trim();
    return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t;
  }

  /** Gerador de números "aleatórios" previsível (mesmo texto → mesmos exercícios) */
  function sorteador(semente) {
    var s = semente % 2147483647 || 1;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function escapeRegex(t) {
    return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* =======================================================
     Leitura das fontes: seções e partes
     ======================================================= */
  function ehTitulo(linha, proxima) {
    var l = linha.trim();
    if (l.length < 3 || l.length > 80) return false;
    if (/[.,;:]$/.test(l)) return false;
    if (l.split(/\s+/).length > 11) return false;
    if (!proxima || proxima.trim().length < 40) return false;
    if (/^(cap[ií]tulo|unidade|aula|m[oó]dulo|parte|se[cç][aã]o|tema|t[oó]pico|lição)\b/i.test(l)) return true;
    if (/^\d{1,2}(\.\d{1,2})*[.)]?\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(l)) return true;
    var letras = l.replace(/[^A-Za-zÀ-ÿ]/g, "");
    return letras.length >= 4 && letras === letras.toUpperCase();
  }

  function limparTitulo(t) {
    t = t
      .replace(/^(cap[ií]tulo|unidade|aula|m[oó]dulo|parte|lição|li[cç][aã]o|se[cç][aã]o|tema|t[oó]pico)\s+[\dIVXLivxl]+\s*[-–—:.)]?\s*/i, "")
      .replace(/^\d{1,2}(\.\d{1,2})*[.)]?\s+/, "")
      .trim();
    if (t === t.toUpperCase()) t = t.toLowerCase();
    return maiuscula(cortar(t, 60));
  }

  function secoesDe(fonte) {
    var linhas = fonte.texto.split("\n");
    var secoes = [];
    var atual = { titulo: null, texto: "", fonte: fonte.nome };
    for (var i = 0; i < linhas.length; i++) {
      if (ehTitulo(linhas[i], linhas[i + 1])) {
        if (atual.texto.trim().length > 0 || atual.titulo) secoes.push(atual);
        atual = { titulo: limparTitulo(linhas[i]), texto: "", fonte: fonte.nome };
      } else {
        atual.texto += linhas[i] + "\n";
      }
    }
    secoes.push(atual);
    // junta seções curtas demais na anterior
    var final = [];
    secoes.forEach(function (s) {
      if (s.texto.trim().length < 300 && final.length) {
        final[final.length - 1].texto += "\n" + (s.titulo ? s.titulo + ". " : "") + s.texto;
      } else if (s.texto.trim().length > 0) {
        final.push(s);
      }
    });
    return final;
  }

  /** Divide o material em "n" partes de tamanho parecido */
  function partesDe(fontes, n) {
    var secoes = [];
    fontes.forEach(function (f) {
      secoes = secoes.concat(secoesDe(f));
    });
    if (!secoes.length) return [];

    // quebra seções grandes em pedaços (por frases) até ter partes suficientes
    while (secoes.length < n) {
      var maior = 0;
      secoes.forEach(function (s, i) {
        if (s.texto.length > secoes[maior].texto.length) maior = i;
      });
      var frases = frasesDe(secoes[maior].texto);
      if (frases.length < 4) break;
      var meio = Math.ceil(frases.length / 2);
      var s0 = secoes[maior];
      var a = { titulo: s0.titulo, texto: frases.slice(0, meio).join(" "), fonte: s0.fonte };
      var b = { titulo: s0.titulo ? s0.titulo + " (continuação)" : null, texto: frases.slice(meio).join(" "), fonte: s0.fonte };
      secoes.splice(maior, 1, a, b);
    }

    // junta seções em excesso, mantendo a ordem e equilibrando o tamanho
    if (secoes.length > n) {
      var total = secoes.reduce(function (s, x) {
        return s + x.texto.length;
      }, 0);
      var alvo = total / n;
      var grupos = [];
      var g = null;
      secoes.forEach(function (s, i) {
        var restantes = secoes.length - i;
        var faltam = n - grupos.length;
        if (!g || (g.tam >= alvo * 0.8 && faltam > 0) || restantes <= faltam - (g ? 1 : 0)) {
          if (g) grupos.push(g);
          g = { titulos: [], texto: "", fonte: s.fonte, tam: 0 };
        }
        if (s.titulo) g.titulos.push(s.titulo);
        g.texto += "\n" + s.texto;
        g.tam += s.texto.length;
        if (g.fonte !== s.fonte && g.fonte.indexOf(s.fonte) === -1) g.fonte += ", " + s.fonte;
      });
      if (g) grupos.push(g);
      while (grupos.length > n) {
        var ult = grupos.pop();
        var pen = grupos[grupos.length - 1];
        pen.titulos = pen.titulos.concat(ult.titulos);
        pen.texto += ult.texto;
      }
      return grupos.map(function (x) {
        var tit = null;
        if (x.titulos.length === 1) tit = x.titulos[0];
        else if (x.titulos.length === 2) tit = x.titulos[0] + " · " + x.titulos[1];
        else if (x.titulos.length > 2) tit = x.titulos[0] + " · " + x.titulos[1] + " e +" + (x.titulos.length - 2);
        return { titulo: tit ? cortar(tit, 70) : null, texto: x.texto, fonte: x.fonte };
      });
    }
    return secoes;
  }

  /* =======================================================
     Criação do conteúdo de um dia a partir de um texto
     ======================================================= */
  function analisarParte(parte, contGlobal, indice, tipo) {
    var sorte = sorteador(indice * 7919 + parte.texto.length);
    var local = contarPalavras(parte.texto);

    // peso = frequência aqui × raridade no material todo
    var pesos = {};
    Object.keys(local.cont).forEach(function (k) {
      var global = contGlobal.cont[k] || local.cont[k];
      pesos[k] = local.cont[k] * (1 + Math.log(1 + local.cont[k])) / Math.sqrt(global);
      if (local.cont[k] < 2) pesos[k] *= 0.4;
      // palavras com cara de verbo pesam menos (produzem, usando, mostra...)
      if (/(ando|endo|indo|aram|eram|iram|avam|ava|am|em|ou|ar|er|ir)$/.test(k)) pesos[k] *= 0.45;
    });
    var chaves = Object.keys(pesos)
      .sort(function (a, b) {
        return pesos[b] - pesos[a];
      })
      .slice(0, 12);

    // Expressões de duas palavras que aparecem juntas (ex.: "cadeia alimentar")
    var tokens = palavrasDe(parte.texto);
    var pares = {};
    for (var t = 0; t < tokens.length - 1; t++) {
      var k1 = Util.semAcento(tokens[t]);
      var k2 = Util.semAcento(tokens[t + 1]);
      if (k1.length < 4 || k2.length < 4 || PARADAS_SET[k1] || PARADAS_SET[k2]) continue;
      var chavePar = k1 + " " + k2;
      pares[chavePar] = pares[chavePar] || { n: 0, formas: {} };
      pares[chavePar].n++;
      var formaPar = tokens[t] + " " + tokens[t + 1];
      pares[chavePar].formas[formaPar] = (pares[chavePar].formas[formaPar] || 0) + 1;
    }
    var cobertas = {};
    var palavras = [];
    chaves.forEach(function (k) {
      if (cobertas[k] || palavras.length >= 8) return;
      var melhor = null;
      Object.keys(pares).forEach(function (par) {
        var partes2 = par.split(" ");
        if (partes2.indexOf(k) === -1 || pares[par].n < 2 || pares[par].n < 0.6 * local.cont[k]) return;
        if (!melhor || pares[par].n > pares[melhor].n) melhor = par;
      });
      if (melhor) {
        melhor.split(" ").forEach(function (x) {
          cobertas[x] = true;
        });
        var fp = pares[melhor].formas;
        var escolhida = Object.keys(fp).sort(function (a, b) {
          return fp[b] - fp[a] || (a === a.toLowerCase() ? -1 : 1);
        })[0];
        palavras.push(escolhida.charAt(0) === escolhida.charAt(0).toUpperCase() && escolhida.toLowerCase() !== escolhida && fp[escolhida.toLowerCase()] ? escolhida.toLowerCase() : escolhida);
      } else {
        cobertas[k] = true;
        palavras.push(formaComum(local.forma, k));
      }
    });

    var frases = frasesDe(parte.texto).filter(function (f) {
      return f.length <= 400;
    });
    var notas = frases.map(function (f, i) {
      var vistas = {};
      var nota = 0;
      palavrasDe(f).forEach(function (p) {
        var k = Util.semAcento(p);
        if (pesos[k] && !vistas[k]) {
          vistas[k] = true;
          nota += pesos[k];
        }
      });
      return { f: f, i: i, nota: nota / Math.sqrt(palavrasDe(f).length || 1) };
    });
    var principais = notas
      .slice()
      .sort(function (a, b) {
        return b.nota - a.nota;
      })
      .slice(0, 5)
      .sort(function (a, b) {
        return a.i - b.i;
      })
      .map(function (n) {
        return n.f;
      });

    var titulo = parte.titulo || (palavras.length >= 2 ? maiuscula(palavras[0]) + " e " + palavras[1] : "Parte " + (indice + 1));

    /* ---------- Exercícios ---------- */
    var exercicios = [];
    var usadas = {};

    // 1) Definição: "X é ...", "X são ..."
    var reDef = /^(.{3,60}?)\s+(é|são|significa|consiste em|corresponde a|refere-se a|define-se como|chama-se)\s+(.{15,})$/i;
    for (var d = 0; d < frases.length && exercicios.length < 1; d++) {
      var m = frases[d].match(reDef);
      if (!m) continue;
      var termo = m[1].replace(/^(o|a|os|as|um|uma)\s+/i, "").replace(/[,;:]+$/, "").trim();
      // termo curto e "limpo": sem vírgula, sem "que", até 4 palavras
      if (/[,;()]/.test(termo) || /(^|\s)que(\s|$)/i.test(termo) || termo.split(/\s+/).length > 4) continue;
      if (/^(isso|isto|ele|ela|eles|elas|este|esta|esse|essa)$/i.test(termo)) continue;
      var plural = /^(são)$/i.test(m[2]);
      // mantém o artigo: "O que é a fotossíntese?", "O que são os planetas?"
      var artigo = m[1].match(/^(o|a|os|as)\s+/i);
      var termoFinal = (artigo ? artigo[1].toLowerCase() + " " : "") + (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]/.test(termo) && termo.split(/\s+/).length > 1 ? termo.charAt(0).toLowerCase() + termo.slice(1) : termo);
      exercicios.push({ tipo: "definicao", pergunta: (plural ? "O que são " : "O que é ") + termoFinal + "?", resposta: frases[d] });
      usadas[frases[d]] = true;
    }

    // 2) Complete a lacuna (cada palavra só vira resposta uma vez)
    var respostasUsadas = {};
    principais.forEach(function (f) {
      if (exercicios.filter(function (e) { return e.tipo === "lacuna"; }).length >= 2 || usadas[f]) return;
      for (var c = 0; c < chaves.length; c++) {
        var palavraForma = null;
        var re = null;
        palavrasDe(f).some(function (p) {
          if (Util.semAcento(p) === chaves[c] && p.length >= 5 && !respostasUsadas[chaves[c]]) {
            palavraForma = p;
            return true;
          }
          return false;
        });
        if (!palavraForma) continue;
        re = new RegExp("(^|[^A-Za-zÀ-ÿ])" + escapeRegex(palavraForma) + "(?![A-Za-zÀ-ÿ])");
        exercicios.push({ tipo: "lacuna", pergunta: "Complete a lacuna: “" + f.replace(re, "$1_____") + "”", resposta: palavraForma });
        respostasUsadas[chaves[c]] = true;
        usadas[f] = true;
        break;
      }
    });

    // 3) Verdadeiro ou falso
    var candidatasVF = principais.filter(function (f) {
      return !usadas[f];
    });
    if (candidatasVF.length) {
      var fvf = candidatasVF[Math.floor(sorte() * candidatasVF.length)];
      // Afirmação falsa feita pela negação do verbo (sempre sai gramatical):
      // "O Sol é uma estrela" → "O Sol não é uma estrela"; e o contrário se já tiver "não".
      var VERBOS = "é|são|está|estão|foi|foram|tem|têm|possui|possuem|acontece|acontecem|ocorre|ocorrem|produz|produzem|forma|formam|fica|ficam|reflete|giram|gira|libera|mantém|mantem|causa|causam|dura|vive|vivem|pode|podem|serve|servem";
      var reVerbo = new RegExp("(^|\\s)(" + VERBOS + ")(\\s)", "i");
      var falsa = null;
      if (sorte() < 0.6) {
        if (/(^|\s)não\s/i.test(fvf)) falsa = fvf.replace(/(^|\s)não\s/i, "$1");
        else if (reVerbo.test(fvf)) falsa = fvf.replace(reVerbo, "$1não $2$3");
      }
      if (falsa && falsa !== fvf) {
        exercicios.push({ tipo: "vf", pergunta: "Verdadeiro ou falso? “" + falsa + "”", resposta: "Falso. O correto é: “" + fvf + "”" });
      } else {
        exercicios.push({ tipo: "vf", pergunta: "Verdadeiro ou falso? “" + fvf + "”", resposta: "Verdadeiro." });
      }
      usadas[fvf] = true;
    }

    // 4) Dissertativa
    if (palavras.length >= 2) {
      exercicios.push({
        tipo: "aberta",
        pergunta: tipo === "trabalho"
          ? "Escreva um parágrafo para o seu trabalho explicando “" + palavras[0] + "” e como se relaciona com “" + palavras[1] + "”."
          : "Explique com suas palavras a relação entre “" + palavras[0] + "” e “" + palavras[1] + "”.",
        resposta: "Resposta pessoal. Para conferir, releia: “" + (principais[0] || frases[0] || "") + "”",
      });
    }

    var atividades = [
      "Leia o trecho “" + titulo + "” em “" + parte.fonte + "” e grife: " + palavras.slice(0, 4).join(", ") + ".",
      palavras.length >= 3
        ? "Faça um mapa mental com “" + palavras[0] + "” no centro ligando a: " + palavras.slice(1, 6).join(", ") + "."
        : "Faça um resumo de 5 linhas do trecho com suas palavras.",
      tipo === "trabalho"
        ? "Anote 2 ideias deste trecho que vão entrar no seu trabalho, com a fonte."
        : "Crie 3 flashcards (pergunta na frente, resposta atrás) sobre este trecho.",
    ];

    var nEx = exercicios.length;
    return {
      titulo: titulo,
      topicos: [
        "Ler o trecho na fonte (" + cortar(parte.fonte, 30) + ")",
        "Estudar o resumo e as palavras-chave",
        nEx ? "Resolver os " + nEx + " exercícios" : "Fazer as atividades",
        "Atividade: " + (palavras.length >= 3 ? "mapa mental" : "resumo"),
      ],
      conteudo: {
        origem: "fontes",
        resumo: ["Neste dia você estuda “" + titulo + "”. Estes são os pontos principais da sua fonte:"],
        pontos: principais,
        formula: null,
        palavras: palavras,
        exercicios: exercicios,
        atividades: atividades,
        fontes: parte.fonte.split(", "),
      },
    };
  }

  /* =======================================================
     Conteúdo da base (sem fontes)
     ======================================================= */
  function diaDaBase(topico, revisao) {
    var ex = topico.x.map(function (x) {
      return { tipo: "aberta", pergunta: x[0], resposta: x[1] };
    });
    return {
      titulo: (revisao ? "Revisão: " : "") + topico.t,
      topicos: [
        revisao ? "Reler a explicação sem olhar as anotações" : "Estudar a explicação",
        "Resolver os " + ex.length + " exercícios",
        "Atividade prática",
      ],
      conteudo: {
        origem: "base",
        resumo: topico.e.slice(),
        pontos: [],
        formula: topico.f || null,
        palavras: [],
        exercicios: ex,
        atividades: [topico.a, revisao ? "Refaça os exercícios sem consultar e confira as respostas no final." : "Faça 1 Pomodoro de 25 minutos só com este conteúdo."],
        fontes: [],
      },
    };
  }

  function topicosGenericos(materia, assunto) {
    var nome = assunto || materia;
    return [1, 2, 3, 4, 5, 6].map(function (i) {
      return {
        t: nome + " — parte " + i,
        e: [
          "Separe o conteúdo de " + nome + " do seu caderno ou livro e estude a parte " + i + ".",
          "Dica: adicione fontes (o PDF do livro, fotos do caderno ou um texto colado) para a IA criar explicações e exercícios sobre o seu conteúdo de verdade.",
        ],
        f: null,
        x: [
          ["Quais são as 3 ideias mais importantes desta parte?", "Resposta pessoal: confira com o caderno ou o livro."],
          ["Escreva uma pergunta que poderia cair na prova sobre esta parte e responda.", "Resposta pessoal."],
        ],
        a: "Faça um resumo de uma página desta parte com suas palavras.",
      };
    });
  }

  function escolherTopicos(materia, assunto) {
    var lista = BASE[Util.semAcento(materia).replace(/\s+/g, " ").trim()];
    if (!lista) return topicosGenericos(materia, assunto);
    lista = lista.slice();
    if (assunto) {
      var a = Util.semAcento(assunto);
      var idx = -1;
      lista.forEach(function (t, i) {
        var ti = Util.semAcento(t.t);
        if (idx === -1 && (ti.indexOf(a) !== -1 || a.indexOf(ti) !== -1)) idx = i;
      });
      if (idx > 0) lista = [lista[idx]].concat(lista.slice(0, idx), lista.slice(idx + 1));
      if (idx === -1) return topicosGenericos(materia, assunto);
    }
    return lista;
  }

  function diasDeTrabalho(n, apoio) {
    // escolhe etapas: sempre começa na pesquisa; o último dia é a revisão final
    var etapas = ETAPAS_TRABALHO.slice(0, Math.max(1, n - 1));
    while (etapas.length < n - 1) etapas.push(ETAPAS_TRABALHO[2]);
    return etapas.map(function (et, i) {
      var resumo = et.e.slice();
      if (i === 0 && apoio) resumo.push("Material de apoio — " + apoio.t + ": " + apoio.e.join(" "));
      return {
        titulo: et.t,
        topicos: et.c.slice(),
        conteudo: {
          origem: "base",
          resumo: resumo,
          pontos: [],
          formula: null,
          palavras: [],
          exercicios: et.x.map(function (x) {
            return { tipo: "aberta", pergunta: x[0], resposta: x[1] };
          }),
          atividades: [et.a],
          fontes: [],
        },
      };
    });
  }

  /* =======================================================
     Último dia: revisão geral e simulado
     ======================================================= */
  function diaRevisao(diasAnteriores, tipo) {
    var questoes = [];
    for (var rodada = 0; rodada < 2 && questoes.length < 8; rodada++) {
      diasAnteriores.forEach(function (d) {
        var e = d.conteudo.exercicios[rodada];
        if (e && questoes.length < 8) questoes.push(e);
      });
    }
    var trabalho = tipo === "trabalho";
    return {
      titulo: trabalho ? "Revisão final e entrega" : "Revisão geral e simulado",
      topicos: trabalho
        ? ["Reler o trabalho inteiro", "Conferir capa, títulos e referências", "Preparar a entrega/apresentação"]
        : ["Revisar os resumos de todos os dias", "Fazer o simulado (" + questoes.length + " questões)", "Refazer o que errou"],
      conteudo: {
        origem: diasAnteriores[0] ? diasAnteriores[0].conteudo.origem : "base",
        resumo: trabalho
          ? ["Último dia! Leia o trabalho do começo ao fim, de preferência em voz alta, e confira se ele responde à pergunta do início.", "Etapas que você fez:"]
          : ["Último dia antes da prova! Revise o que estudou em cada dia e faça o simulado sem consultar. Depois confira as respostas.", "O que você estudou:"],
        pontos: diasAnteriores.map(function (d, i) {
          return "Dia " + (i + 1) + ": " + d.titulo;
        }),
        formula: null,
        palavras: [],
        exercicios: trabalho
          ? [
              { tipo: "aberta", pergunta: "O trabalho responde à pergunta do início? Em que parte?", resposta: "Resposta pessoal." },
              { tipo: "aberta", pergunta: "As referências estão completas?", resposta: "Confira: autor, título, editora/site, ano e data de acesso." },
            ]
          : questoes,
        atividades: trabalho
          ? ["Peça para alguém ler e dizer o que entendeu.", "Confira a data e a forma de entrega com o professor."]
          : ["Explique em voz alta, sem olhar, o tema de cada dia.", "Durma bem na véspera: o cérebro guarda o que você estudou enquanto dorme."],
        fontes: [],
      },
    };
  }

  /* =======================================================
     Função principal
     ======================================================= */
  /**
   * opcoes = { materia, tipo: "prova"|"trabalho", dias, assunto, fontes: [{ nome, texto }] }
   * Retorna { origem: "fontes"|"base", dias: [{ titulo, topicos: [texto], conteudo }] }
   */
  function gerar(opcoes) {
    var n = Math.max(1, Math.min(12, opcoes.dias || 5));
    var tipo = opcoes.tipo === "trabalho" ? "trabalho" : "prova";
    var comTexto = (opcoes.fontes || []).filter(function (f) {
      return f.texto && f.texto.trim().length > 200;
    });
    var nEstudo = n > 1 ? n - 1 : 1;
    var dias;
    var origem;

    if (comTexto.length) {
      origem = "fontes";
      var tudo = comTexto.map(function (f) {
        return f.texto;
      }).join("\n");
      var global = contarPalavras(tudo);
      var partes = partesDe(comTexto, nEstudo);
      dias = partes.map(function (p, i) {
        return analisarParte(p, global, i, tipo);
      });
      // material curto: completa com dias de prática
      var base = dias.length;
      for (var k = 0; dias.length < nEstudo && base > 0; k++) {
        var orig = dias[k % base];
        dias.push({
          titulo: "Prática: " + orig.titulo,
          topicos: ["Refazer os exercícios sem consultar", "Explicar o trecho em voz alta", "Criar 2 exercícios novos"],
          conteudo: Object.assign({}, orig.conteudo, {
            resumo: ["Dia de praticar “" + orig.titulo + "”. Tente responder sem olhar o resumo e depois confira."],
            atividades: ["Invente 2 exercícios novos sobre este trecho e troque com um colega."],
          }),
        });
      }
    } else {
      origem = "base";
      if (tipo === "trabalho") {
        var apoio = escolherTopicos(opcoes.materia, opcoes.assunto)[0];
        dias = diasDeTrabalho(n, apoio);
      } else {
        var topicos = escolherTopicos(opcoes.materia, opcoes.assunto);
        dias = [];
        for (var i = 0; i < nEstudo; i++) {
          dias.push(diaDaBase(topicos[i % topicos.length], i >= topicos.length));
        }
      }
    }

    if (n > 1) dias.push(diaRevisao(dias, tipo));
    return { origem: origem, dias: dias.slice(0, n) };
  }

  window.GeradorEstudo = { gerar: gerar };
})();
