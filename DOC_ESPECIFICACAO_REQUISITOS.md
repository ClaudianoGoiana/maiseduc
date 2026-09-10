# Especificação de Requisitos
**Projeto:** Cidadão Digital

## 1. Visão Geral

O sistema é um Jogo Educativo Web, concebido para avaliar e desenvolver o senso crítico de alunos perante desafios do mundo digital moderno, aderente às diretrizes da BNCC (Base Nacional Comum Curricular).

## 2. Requisitos Funcionais (RF)

- **RF01 - Engine de Diálogos:** O sistema deve apresentar narrativas interativas com mecânica de digitação progressiva (typewriter effect) contendo cenários de decisão (dilemas).
- **RF02 - Árvore de Decisões:** O sistema deve permitir ao usuário (aluno) escolher entre 3 diferentes alternativas ao final de cada diálogo ou dilema da fase.
- **RF03 - Cálculo de Pontuação (XP):** A cada decisão tomada, o sistema deve calcular e somar pontos de experiência nas áreas de Ética, Lógica e Segurança.
- **RF04 - Histórico de Decisões:** O sistema deve persistir em banco de dados todas as decisões tomadas por um aluno, relacionando a fase jogada e a categoria da decisão.
- **RF05 - Análise de Perfil Inteligente:** O sistema deve conter um algoritmo que processe o histórico de decisões e categorize o aluno em um de 8 tipos (Crítico, Ético, Ativista, Hacker, Engenheiro, Passivo, Pragmático, Investigador).
- **RF06 - Exibição de Feedback e Perfil:** O aluno deve poder consultar os resultados de sua análise de perfil após a conclusão de ciclos definidos (ex: Unidades ou Boss Fights), visualizando percentuais e conselhos de desenvolvimento.
- **RF07 - Relatórios do Professor (Dashboard):** O sistema deve disponibilizar um portal/visão para os professores onde seja possível analisar um mapa de calor e distribuições dos tipos de alunos.
- **RF08 - Exportação de Dados:** O sistema deve permitir a exportação dos perfis dos alunos para formato CSV/Excel a fim de realizar análises externas.

## 3. Requisitos Não Funcionais (RNF)

- **RNF01 - Usabilidade:** A interface deve ser simples, limpa e seguir a temática cyberpunk pré-estabelecida nas definições de Design, focada em jovens.
- **RNF02 - Desempenho e Velocidade:** O carregamento da SPA (React) não deve demorar mais do que 2 segundos. Transições entre diálogos precisam ser em tempo real (instantâneas).
- **RNF03 - Hospedagem (Portabilidade):** O sistema deve ser capaz de ser inteiramente hospedado num ambiente compartilhado de baixo custo (Hostinger) sem depender de microsserviços pesados. O uso deve ser 100% via navegador.
- **RNF04 - Segurança de Banco de Dados:** Nenhuma query SQL poderá ser construída concatenando dados de entrada (obrigatório o uso de Prepared Statements).
- **RNF05 - Isolamento de Ambiente:** O arquivo de credenciais do ambiente backend (`.env`) deve ser inacessível através de rotas públicas web (`.htaccess`).

## 4. Regras de Negócio (RN)

- **RN01 - Progressão de Unidades:** O jogo conta com 20 fases divididas em 5 unidades temáticas (Bolha, Viés, Manipulação, Privacidade, Responsabilidade).
- **RN02 - Cálculo de Confiança (Profiling):** O sistema deverá determinar não apenas o "Tipo de Aluno", mas um "Grau de Confiança" daquela análise. Este grau é baseado na diferença de pontuação do tipo dominante perante os tipos secundários.
- **RN03 - Fechamento de Unidade (Fases Boss):** A cada quarta fase, o aluno enfrentará uma "Boss Fight" que consiste em dilemas encadeados sem feedback imediato (Feedback catártico final).
- **RN04 - Personalização da Pedagogia:** Recomendações automáticas dadas a alunos (e dicas aos professores) devem ser exclusivamente geradas a partir do tipo dominante atual calculado pelo sistema.
