# StudyFlow — Lista de tarefas

Atualizada conforme as tarefas forem resolvidas.
Legenda: `[x]` feito · `[ ]` a fazer · `[~]` em andamento

Última atualização: 23/11/2026

---

## Fase atual: o que dá para fazer SEM servidor, banco e IA

### A. Ajustes rápidos (antes da apresentação de 7/12)
- [x] **A1. Sessão fecha com o navegador** — feito em 23/11/2026.
- [x] **A2. Cartão da prefeitura no menu lateral** — feito em 23/11/2026.
- [x] **A3. Menu da engrenagem** — feito em 23/11/2026.
- [x] **A4. Dados de exemplo** — feito em 23/11/2026.
- [x] **A5. Leitores de PDF e Word e fontes sem site externo** — feito em 23/11/2026.

### B. Navegação no celular
> Decisão de 23/11/2026: o projeto será **só web** (sem app instalável/PWA). Em troca, a experiência no celular pelo navegador tem que ser tão boa quanto a de um app.
- [x] **B1. Barra de navegação inferior** — feito em 23/11/2026.
- [x] **B2. Barra do topo enxuta** — feito em 23/11/2026.
- [x] **B3. Revisar cada tela no celular** — feito em 23/11/2026.
- [x] **B4. Lembretes** — feito em 23/11/2026.

### C. LGPD e textos legais (rascunhos para o jurídico da prefeitura revisar)
- [x] **C1. Termo de uso** — rascunho feito em 23/11/2026 (`termos.html`). Falta revisão jurídica.
- [x] **C2. Política de privacidade** — rascunho feito em 23/11/2026 (`privacidade.html`). Falta revisão jurídica e do Encarregado (DPO).
- [x] **C3. Aceite no primeiro acesso** + modelo de autorização dos responsáveis — feito em 23/11/2026 (`js/aceite.js`, `autorizacao-responsaveis.html`).
- [ ] **C4. Preencher os trechos em amarelo** dos três textos (depende da Prefeitura): CNPJ e endereço, Encarregado (DPO) com contato, contato da Secretaria, comarca, prazos de guarda, endereço do site, fornecedores de servidor e de IA, confirmação da base legal.

### D. Telas para a apresentação (com dados de exemplo, prontas para ligar no banco depois)
- [x] **D1. Painel do professor** — feito em 23/11/2026 (`professor.html`).
- [x] **D2. Painel da Secretaria de Educação** — feito em 23/11/2026 (`secretaria.html`).
- [x] **D3. Cadastro de alunos em lote** — feito em 23/11/2026 (`cadastro.html`).

### E. Qualidade
- [ ] **E1. Acessibilidade** — navegação só pelo teclado e teste com leitor de tela (NVDA).
- [~] **E2. Teste em celulares** (Android e iPhone) e navegadores (Chrome, Edge, Firefox, Safari). iPhone/Safari ok em 23/11/2026; falta Android e Firefox.
- [ ] **E3. Preparar a troca para o banco** — deixar a camada `Dados` (js/auth.js) pronta para trocar o `localStorage` por chamadas ao servidor sem mexer nas telas.

---

## Aguardando servidor, banco e IA (quando estiverem prontos)
- [ ] Criar as tabelas no Supabase (região São Paulo).
- [ ] Login real com senha protegida; apagar `data/contas.js`.
- [ ] "Esqueceu a senha?" e "Alterar senha" funcionando.
- [ ] Trocar o `localStorage` pelo banco (dados do aluno em qualquer aparelho).
- [ ] IA de verdade no Assistente (Edge Function), com limites de uso e regras para menores; anexo de arquivos no chat.
- [ ] Ligar os painéis (D1, D2, D3) ao banco: trocar o miolo de `js/rede.js` por chamadas ao Supabase e criar as regras de acesso (professor só vê as próprias turmas; Secretaria só vê números agregados).
- [ ] Colocar online (Vercel + endereço `.gov.br`).
- [ ] Piloto com uma turma.

## Pendências com a prefeitura
- [ ] Data da apresentação.
- [ ] Quem paga as contas (servidor e IA).
- [ ] Endereço `studyflow.santarosadosul.sc.gov.br`.
- [ ] Responsável pela LGPD.
- [ ] Brasão oficial em alta resolução e versão oficial da Idebinha.

---

## Feito
### 23/11/2026
- **A1. Sessão fecha com o navegador** — a sessão saiu do `localStorage` e foi para o `sessionStorage` (`js/auth.js`). Fechou o navegador, precisa entrar de novo. Os dados do aluno continuam salvos. Efeito colateral: abrir o app numa aba nova também pede login.
- **A2. Cartão da prefeitura** — brasão, "Prefeitura Municipal de Santa Rosa do Sul" e a faixa vermelho-amarelo-vermelho, acima do cartão do usuário (`js/layout.js`, `css/app.css`). No celular ele fica escondido (o menu vira barra no topo).
- **A3. Menu da engrenagem** — Meu perfil, Configurações, Modo escuro (com interruptor) e Sair. Funciona com mouse e teclado (setas, Home/End, Esc devolve o foco). Fecha ao clicar fora.
- **A4. Dados de exemplo só na conta de demonstração** — contas com `demo: true` em `data/contas.js` (a `admin`) começam com eventos, planos, metas, conversas e a Idebinha no nível 8. As outras começam vazias, com a Idebinha no nível 1 e os 3 itens grátis. Criada a conta de teste `aluno` (senha em `data/contas.js`) para ver o app como aluno novo.
- **A5. Nada de sites externos** — `pdf.js` 3.11.174, `mammoth` 1.6.0 e as fontes Inter e Outfit (que vinham do Google Fonts) agora ficam na pasta `vendor/`, com as licenças (Apache-2.0, BSD-2 e SIL OFL). O app não faz mais nenhuma requisição fora do próprio endereço: funciona sem internet (base para o PWA) e não envia o IP do aluno a terceiros. Testado: leitura de PDF e de Word funcionando.
- **Decisão: projeto só web, sem PWA** — o antigo bloco B (manifest, service worker) saiu; virou "Navegação no celular".
- **B1. Barra de navegação inferior** — no celular (até 760 px) os 4 itens ficam numa barra fixa embaixo, com ícone, nome ("Assistente" no lugar de "Assistente de IA") e um tracinho em cima do item ativo. Respeita a área da barra de gestos do iPhone. O conteúdo e os avisos sobem para não ficar atrás dela. No computador nada mudou.
- **B2. Barra do topo enxuta** — no celular: logo + "StudyFlow" à esquerda, avatar (abre o perfil) e engrenagem (abre o menu da conta) à direita. A barra antiga, que rolava para o lado, saiu.
- **B3. Revisão das telas no celular** — novo arquivo `css/celular.css`, carregado por último em todas as páginas (vale para celular e tablet de toque):
  - Tudo o que se toca tem pelo menos 44 × 44 px (filtros, "Comprar", "Resgatar", enviar/anexar do chat, interruptores, "x" do histórico...). Links de texto ("← Mascote", "Ver todas", "Esqueceu a senha?") ganharam uma área de toque invisível maior, sem mudar o visual.
  - Campos com letra de 16 px: o iPhone não dá mais zoom sozinho ao tocar num campo.
  - Janelas (modais) usam a altura real da tela (desconta a barra de endereço), ocupam a largura toda e rolam por dentro quando são altas.
  - Assistente: corrigido um bug em que o chat encolhia para 232 px no celular e no tablet. Agora o chat preenche a tela entre as duas barras, com o campo de digitar sempre visível.
  - Conferido em 360, 375 e 414 px: nenhuma tela vaza para o lado. Os dias do calendário ficam com 38 × 69 px (a largura vem das 7 colunas). No computador nada mudou.
- **Testado num iPhone de verdade** pelo Wi-Fi (`http://192.168.0.111:5500`) — funcionando.
- **Idebinha redesenhada como capivara** (estava parecendo um ursinho) — `js/idebinha.js`: cabeça quadradona, focinho largo e mais escuro quase da largura da cabeça, narinas grandes no alto do focinho, boca em "Y", orelhas pequenas no alto e olhos com pálpebra meio caída (o olhar tranquilo de capivara). Corpo e acessórios da loja continuam nos mesmos lugares; conferidos todos os 21 itens. Muda em todas as telas (Mascote, Loja, Perfil).
- **Idebinha com visual 3D** (estilo "massinha") — luz vindo do alto à esquerda, degradês que dão volume à cabeça, corpo, focinho, orelhas e patas, sombra da cabeça no corpo e do focinho na cara, brilhos no alto da cabeça e nos olhos, bochechas esfumadas, sombra no chão e uma sombrinha embaixo de cada acessório. Continua sendo desenho em SVG: leve, funciona em qualquer celular e os 21 acessórios seguem funcionando. Conferido no tema claro e escuro.
  - **Mais feminina** — saiu o olhar de pálpebra caída (parecia brava/masculina). Agora: olhos grandes e brilhantes com cílios, bochechas mais rosadas, narinas menores, boquinha delicada com linguinha rosa, pelo num tom mais claro e quente e uma florzinha rosa na orelha (fica por baixo dos chapéus da loja).
- **Idebinha — estilo final escolhido: "Ovinho"** (substitui o 3D e as versões anteriores). Escolhido numa página de prévia (`previa-idebinha.html`, pode ser apagada) entre 4 estilos e depois 4 formatos. Contorno escuro e cores chapadas, no mesmo estilo do mascote do Figma; cabeça em forma de ovo, focinho oval com narinas no alto, olhos grandes com cílios, bochechas rosadas, orelhinhas com o rosa de dentro e laço rosa fixo (some quando ela usa o "Laço rosa" da loja). Todos os 21 acessórios conferidos.
  - `previa-idebinha.html` apagado depois da escolha.
  - Ideia para depois: um modelo 3D de verdade (que gira) exigiria modelagem por um artista e refazer os acessórios em 3D — vale considerar junto com a versão oficial da Idebinha.
- **B4. Lembretes** — novo `js/lembretes.js`, em todas as telas internas. Funciona enquanto o StudyFlow estiver aberto em alguma aba:
  - **Resumo do dia**: na primeira abertura do dia, "Hoje você tem N compromissos" com os nomes.
  - **Antes de cada evento** com horário: "Daqui a 30 minutos: Prova de Matemática — Prova • Matemática • às 08:00". Antecedência escolhida nas Configurações (10 min a 2 horas).
  - **Fim do Pomodoro** mesmo com o aluno em outra tela ("Abra Estudar para ganhar as moedas").
  - Com a aba visível: aviso dentro do site + bipe (se o som estiver ligado). Com a aba escondida: notificação do navegador, se o aluno permitir (botão "Permitir" nas Configurações).
  - Cada lembrete aparece uma vez só, mesmo com várias abas abertas.
  - Configurações → nova seção "Lembretes": ligar/desligar, antecedência, permissão de notificação (mostra se está permitida, bloqueada ou indisponível) e botão "Testar". Vem ligado por padrão.
  - **Limite conhecido**: notificações fora do site só funcionam em endereço seguro (https ou localhost). No celular pelo IP do Wi-Fi (`http://192.168.0.111`) e no iPhone (que só libera notificação para app instalado) os lembretes aparecem **dentro do site**. Quando o site estiver no ar com https, funciona no Android e no computador.
  - Não testado: a notificação do sistema de verdade (o navegador de testes bloqueia). Testados: aviso no site, resumo do dia, antecedência, fim do Pomodoro em outra tela e não repetir.
- **Bloco C — textos de LGPD (rascunhos para o jurídico)**. Todos com o aviso "Rascunho para revisão jurídica" e os trechos que só a Prefeitura sabe destacados em amarelo. Abrem sem login, funcionam no celular e no tema escuro.
  - **`termos.html` — Termos de Uso**: resumo fácil para o aluno + 10 itens (o que é, quem pode usar, conta e senha, uso adequado/bullying, Assistente pode errar e hoje é demonstração, moedas sem valor em dinheiro, materiais enviados, disponibilidade, mudanças, contato e leis — ECA, LGPD, Marco Civil).
  - **`privacidade.html` — Política de Privacidade**: resumo fácil + controlador e Encarregado, tabela de dados usados, o que NÃO coletamos, finalidades, base legal (LGPD art. 7º III e 23, melhor interesse art. 14), onde os dados ficam hoje (só no aparelho, sem scripts de terceiros) e quando houver servidor/IA, compartilhamento, prazos, segurança, direitos do art. 18 (já com os botões Baixar/Apagar), mudanças.
  - **`autorizacao-responsaveis.html` — termo para os pais**, pronto para imprimir (botão "Imprimir"; o aviso de rascunho não sai na impressão): ciência + autorização separada para o StudyFlow e para o Assistente com IA, revogável.
  - **Aceite no primeiro acesso** (`js/aceite.js`): janela de boas-vindas com 4 regrinhas, links para os textos e a caixa "Li e concordo… meu responsável sabe que eu uso o StudyFlow". Não fecha com Esc nem clicando fora; "Começar" só libera com a caixa marcada; "Sair" encerra a sessão. Guarda versão e data do aceite; se a versão dos Termos mudar (`VERSAO` em `js/aceite.js`), todo mundo aceita de novo com o título "Os Termos foram atualizados". Os lembretes esperam o aceite.
  - Links: tela de login (rodapé "Termos de Uso · Privacidade") e Configurações → Privacidade e dados.
  - Importante: são rascunhos técnicos; a validade jurídica depende da revisão da Procuradoria da Prefeitura.
- **Bloco D — telas de gestão** (com dados de exemplo, prontas para ligar no banco):
  - **Perfis de acesso** (`data/contas.js` → `acessos`): conta nova `professor` (senha no mesmo arquivo) com "Minhas turmas"; a `admin` tem também "Painel da rede" e "Cadastro de alunos". O `aluno` agora é do 5º ano A da EM Ipê Amarelo (exemplo). Menu: seção "Gestão" na lateral (computador) e no menu da engrenagem (celular). Quem não tem acesso volta ao calendário (`Auth.exigir`) — **só conferência no navegador; a segurança de verdade virá das regras do banco**.
  - **`js/rede.js`** — única fonte de dados das telas de gestão: 5 escolas, 20 turmas e ~390 alunos **fictícios** (sempre os mesmos), todas as funções já devolvem Promise como um banco. Com o Supabase, troca-se só este arquivo. O "Aluno Teste" aparece no 5º ano A com a atividade real dele neste navegador.
  - **D1 `professor.html` — Minhas turmas**: troca de turma, indicadores (ativos na semana, precisam de atenção, sessões de foco, progresso médio), tabela de alunos ordenada por quem precisa de atenção (nunca entrou / 7+ dias sem entrar / planos atrasados / em dia) com filtro, e **evento para a turma**: aparece no calendário e nos lembretes de todos os alunos da turma, com selo "Turma" e sem poder apagar. Professor cancela pela lista. Testado ponta a ponta (professor cria → aluno vê na agenda e recebe lembrete).
  - **D2 `secretaria.html` — Painel da rede**: só números agregados, sem nomes (LGPD). Indicadores da rede, barras de alunos ativos por escola (laranja abaixo de 60%), "turmas que precisam de apoio", tabela por escola que abre as turmas, e **Baixar planilha** (CSV que abre direto no Excel em português).
  - **D3 `cadastro.html` — Cadastro em lote**: baixar modelo, enviar CSV (arrastar ou escolher) ou colar linhas. Aceita `;` `,` ou tab, aspas, arquivo do Excel em UTF-8 ou Windows-1252, títulos com ou sem acento. Confere: campos vazios, matrícula inválida/repetida/já cadastrada, escola fora da rede, turma que não existe na escola (e lista as que existem), aviso de nome incompleto. Salva só as linhas prontas. Hoje guarda no navegador; com o servidor, cria as contas e senhas.
  - Também: o último acesso de cada conta é registrado (aparece para o professor); corrigido o "Nível 1" que aparecia na conta de demonstração no primeiro carregamento.
- **Escolas reais da rede** em `js/rede.js`: EMEB Governador Pedro Ivo Campos, EMEB Alzira Ramos de Souza, EMEB Professor Hercílio de Faveri e EMEB Ana Régis Arantes, com turmas do 1º ao 9º ano (40 turmas, ~870 alunos). **As turmas, professores e alunos continuam fictícios** até o banco chegar (a quantidade real de turmas por escola precisa vir da Secretaria). Contas de teste `aluno` e `professor` agora são do 8º ano da EMEB Pedro Ivo.
- **Ranking da turma** (`ranking.html`, `js/ranking.js`, `css/ranking.css`) — **nova aba do app** (5ª do menu: Calendário, Mascote, Assistente, Estudar, Ranking; no celular, 5 itens na barra de baixo):
  - **Cada turma tem o seu ranking**: só os colegas da mesma turma competem entre si, sem misturar turmas ou escolas. O aluno vê o da turma dele; o professor escolhe entre as turmas dele.
  - (A primeira versão era por série, juntando turmas e escolas; foi trocada a pedido em 23/11/2026.)
  - Pontos só por estudo: sessão de foco +10, dia de plano concluído +15, conquista +20, meta da semana +5, cada dia da sequência +5 (perguntas ao Assistente não contam).
  - Pódio com os 3 primeiros, lista até o 10º e a posição do aluno com "faltam X pontos para passar Fulano".
  - **Cuidado com menores**: só primeiro nome + inicial ("Maria S."); não mostra "de N alunos" para ninguém se ver como último; quem nunca entrou não aparece; o aluno pode **sair do ranking** em Configurações → Privacidade ("Aparecer no ranking").
  - Para decidir com a Prefeitura: zerar os pontos a cada bimestre (mais justo para quem chega depois) e se o ranking vale prêmio/reconhecimento na escola.
