/* =========================================================
   StudyFlow — contas de acesso (fase de testes)

   ATENÇÃO: esta lista fica no navegador e qualquer pessoa
   pode lê-la. Serve só para testes. Quando o servidor estiver
   no ar, o login deve ser conferido lá, e este arquivo sai.

   demo: true → a conta já começa com eventos, planos, metas,
   conversas e a Idebinha no nível 8 (bom para apresentar).
   Sem "demo", a conta começa vazia, como um aluno novo.

   acessos: telas de gestão que a conta pode abrir
     "professor"  → Minhas turmas (professor.html)
     "secretaria" → Painel da rede e Cadastro de alunos
   turmaId / turmas: ligam a conta às turmas de exemplo de
   js/rede.js (o evento que a professora cria para o 8º ano A
   aparece no calendário do aluno "aluno").
   ========================================================= */
window.CONTAS = [
  {
    matricula: "admin",
    senha: "SantaRosa@2026",
    nome: "Admin Teste",
    papel: "Administrador",
    turma: null,
    escola: null,
    demo: true,
    acessos: ["professor", "secretaria"],
    turmas: ["pedroivo-8a", "pedroivo-8b"],
  },
  {
    matricula: "aluno",
    senha: "Aluno@2026",
    nome: "Aluno Teste",
    papel: "Aluno(a)",
    turma: "8º ano A",
    turmaId: "pedroivo-8a",
    escola: "EMEB Governador Pedro Ivo Campos",
  },
  {
    matricula: "professor",
    senha: "Professor@2026",
    nome: "Professora Teste",
    papel: "Professor(a)",
    turma: null,
    escola: "EMEB Governador Pedro Ivo Campos",
    acessos: ["professor"],
    turmas: ["pedroivo-8a", "pedroivo-8b"],
  },
];
