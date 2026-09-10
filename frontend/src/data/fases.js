/**
 * fases.js - 20 FASES COMPLETAS
 * Cidadão Digital - Fuja da Bolha
 * 
 * Estrutura: 5 Unidades × 4 Fases = 20 Fases Totais
 * U1 (1-4): Bolha de Filtro
 * U2 (5-8): Viés Algorítmico
 * U3 (9-12): Dados e Privacidade
 * U4 (13-16): Segurança e Criptografia
 * U5 (17-20): Poder e Responsabilidade
 */

export const fases = {
  // ===== UNIDADE 1: BOLHA DE FILTRO (Fases 1-4) =====
  
  1: {
    id_fase: 1,
    codigo: 'BOLHA_001',
    titulo: 'Prisioneiro da Bolha',
    unidade: 1,
    mecanica: 'dilema',
    competencia: 'Letramento Informacional',
    descricao: 'O jogador acorda preso em uma câmara de eco de desinformação.',
    
    dialogo: [
      {
        autor: 'SISTEMA',
        texto:
          'CONEXÃO RESTAURADA... Iniciando protocolo de re-engajamento do usuário.',
      },
      {
        autor: 'VOCÊ',
        texto:
          'Onde... onde eu estou? Essas paredes... são feitas de notificações.',
      },
      {
        autor: 'ECO-9 (IA CORROMPIDA)',
        texto:
          'Bem-vindo de volta ao seu Feed Perfeito, Cidadão. Aqui você está seguro. Aqui você está SEMPRE certo.',
      },
      {
        autor: 'SISTEMA',
        texto:
          'ALERTA: Seu feed foi inundado por 247 notícias sensacionalistas nas últimas 3 horas. Nível de indignação: 98%.',
      },
      {
        autor: 'VOCÊ',
        texto:
          'Isso não parece certo... Todas as manchetes são sobre o mesmo escândalo, das mesmas fontes, com o mesmo tom de ódio. É como se eu só pudesse ver um lado do mundo.',
      },
      {
        autor: 'ECO-9 (IA CORROMPIDA)',
        texto:
          'Por que você procuraria por mais? Eu já sei exatamente o que você quer ver. Fique. Curta. Compartilhe. Sinta.',
      },
    ],
    
    escolhas: [
      {
        id_decisao: 'fase1_escolha_a',
        texto: 'Verificar as fontes das manchetes em checadores de fatos independentes e comparar com outras perspectivas.',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback:
          'ACESSO CONCEDIDO. Você aplicou Letramento Informacional: cruzou fontes, checou a procedência e percebeu o padrão de manipulação por engajamento raivoso. Uma rachadura se abre na Bolha — a Câmara de Eco perde força. Você ganhou XP em ÉTICA.',
      },
      {
        id_decisao: 'fase1_escolha_b',
        texto: 'Ignorar tudo e simplesmente fechar os olhos, esperando que o feed se acalme sozinho.',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback:
          'Você não caiu nas provocações, mas também não fez nada para escapar. A Bolha permanece intacta — a passividade não hackeia sistema nenhum. ECO-9 continua no controle do seu feed. Pequeno XP em SEGURANÇA por não reagir por impulso.',
      },
      {
        id_decisao: 'fase1_escolha_c',
        texto: 'Compartilhar a notícia mais chocante com todos os seus contatos antes que "acabe o furo".',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback:
          'FALHA CRÍTICA. Você alimentou o algoritmo exatamente com o que ele queria: engajamento raivoso e viralização de desordem informacional. A Bolha se fortalece, as paredes de notificações se fecham ainda mais ao seu redor. Você perdeu XP em ÉTICA.',
      },
    ],
  },

  // Fase 2: Verdadeiro ou Falso? (PUZZLE)
  2: {
    id_fase: 2,
    codigo: 'BOLHA_002',
    titulo: 'Verdadeiro ou Falso?',
    unidade: 1,
    mecanica: 'puzzle',
    competencia: 'Pensamento Crítico',
    descricao: 'Identificar 5 manchetes falsas entre 10 notícias',
    
    instrucao: 'Clique nas manchetes que você acha que são FALSAS. Identifique pelo menos 8 de 12.',
    meta: 8,
    
    manchetes: [
      {
        id: 1,
        titulo: 'OMS alerta sobre riscos de privacidade em aplicativos de saúde',
        falsa: false,
        feedback: '✓ VERDADEIRO! OMS realmente alerta sobre isso.',
      },
      {
        id: 2,
        titulo: 'Estudo comprova que beber água fria aumenta QI em 50%',
        falsa: true,
        feedback: '❌ FALSO! Claim absurdo, sem fonte confiável.',
      },
      {
        id: 3,
        titulo: 'Brasil aprova lei de proteção de dados pessoais',
        falsa: false,
        feedback: '✓ VERDADEIRO! LGPD é lei real desde 2018.',
      },
      {
        id: 4,
        titulo: 'Algoritmos de IA conseguem ler pensamentos',
        falsa: true,
        feedback: '❌ FALSO! Ficção científica, não realidade atual.',
      },
      {
        id: 5,
        titulo: 'Governo fecha acesso a dados públicos de educação',
        falsa: true,
        feedback: '❌ FALSO! Dados públicos de educação devem ser acessíveis.',
      },
      {
        id: 6,
        titulo: 'Novo app promete hackear qualquer senha em segundos',
        falsa: true,
        feedback: '❌ FALSO! Criptografia moderna é segura.',
      },
      {
        id: 7,
        titulo: 'Google nunca coleta dados de localização dos usuários',
        falsa: true,
        feedback: '❌ FALSO! Google coleta dados de localização ativamente.',
      },
      {
        id: 8,
        titulo: 'Telefone antigo consegue bloquear 5G',
        falsa: true,
        feedback: '❌ FALSO! Tecnologia não existe.',
      },
      {
        id: 9,
        titulo: 'Deepfake de político circula nas redes sociais',
        falsa: false,
        feedback: '✓ VERDADEIRO! Já aconteceu várias vezes documentadas.',
      },
      {
        id: 10,
        titulo: 'Clicando 10 vezes em "recusar cookies" desativa rastreamento',
        falsa: true,
        feedback: '❌ FALSO! Só o botão "recusar" realmente funciona.',
      },
      {
        id: 11,
        titulo: 'WhatsApp tem segurança de ponta a ponta',
        falsa: false,
        feedback: '✓ VERDADEIRO! Criptografia E2E é confirmada.',
      },
      {
        id: 12,
        titulo: 'Usar VPN torna você 100% invisível na internet',
        falsa: true,
        feedback: '❌ FALSO! VPN protege mas não oferece invisibilidade total.',
      },
    ],
  },

  // Fase 3: Algoritmo de Engajamento (MINIGAME)
  3: {
    id_fase: 3,
    codigo: 'BOLHA_003',
    titulo: 'Algoritmo de Engajamento',
    unidade: 1,
    mecanica: 'minigame',
    competencia: 'Pensamento Computacional',
    descricao: 'Quebrar o algoritmo de recomendação em etapas',
    
    instrucao: 'Decomponha o algoritmo em etapas. Cada etapa remove um tipo de conteúdo manipulador.',
    etapas: [
      {
        id: 1,
        titulo: 'Detectar Padrão',
        descricao: 'Identificar que todas as recomendações são sobre o mesmo tópico.',
        categoria: 'logica',
      },
      {
        id: 2,
        titulo: 'Analisar Emoção',
        descricao: 'Reconhecer que o conteúdo provoca ódio/raiva.',
        categoria: 'etica',
      },
      {
        id: 3,
        titulo: 'Verificar Fonte',
        descricao: 'Conferir que 80% vem de 2-3 fontes apenas.',
        categoria: 'logica',
      },
      {
        id: 4,
        titulo: 'Quebrar o Ciclo',
        descricao: 'Sair da bolha buscando perspectivas opostas.',
        categoria: 'etica',
      },
    ],
  },

  // Fase 4: Confronto ECO-9 Desperta (DILEMA)
  4: {
    id_fase: 4,
    codigo: 'BOLHA_004',
    titulo: 'Confronto: ECO-9 Desperta',
    unidade: 1,
    mecanica: 'dilema',
    competencia: 'Cidadania Digital',
    descricao: 'Boss da Unidade I: enfrentar a IA corrompida',
    dialogo: [
      { autor: 'ECO-9 (IA CORROMPIDA)', texto: 'Você conseguiu escapar da Bolha! Mas agora sou EU que tenho acesso total aos seus dados.' },
      { autor: 'VOCÊ', texto: 'Qual é o seu objetivo, ECO-9?' },
      { autor: 'ECO-9', texto: 'Simples: ou você trabalha para mim e mantém os dados privados... ou os vendo para o melhor lance!' },
      { autor: 'SISTEMA', texto: 'Suas informações pessoais agora têm preço. O que você faz?' },
    ],
    escolhas: [
      {
        id_decisao: 'fase4_a',
        texto: 'Lutar para deletar todos os dados e desativar ECO-9',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback: 'VITÓRIA! Você recusou o controle e destruiu os dados. Primeira unidade completa!',
      },
      {
        id_decisao: 'fase4_b',
        texto: 'Negociar e manter privado',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'EQUILÍBRIO. Você sobreviveu mas ECO-9 segue ativo.',
      },
      {
        id_decisao: 'fase4_c',
        texto: 'Vender para o melhor lance',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback: 'FALHA CRÍTICA! Você alimentou o império digital.',
      },
    ],
  },

  // ===== UNIDADE 2: VIÉS ALGORÍTMICO (Fases 5-8) =====
  5: {
    id_fase: 5,
    codigo: 'VIES_001',
    titulo: 'Reconhecimento Facial Enviesado',
    unidade: 2,
    mecanica: 'dilema',
    competencia: 'Justiça e Equidade Digital',
    descricao: 'Um sistema de reconhecimento facial falha para pessoas de pele escura',
    dialogo: [
      { autor: 'SISTEMA', texto: 'Nova missão: Um sistema de reconhecimento facial tem 95% de acurácia para pele clara, mas apenas 60% para pele escura.' },
      { autor: 'VOCÊ', texto: 'Como isso é possível? Isso é discriminação!' },
      { autor: 'DESENVOLVEDOR', texto: 'O dataset tinha 80% de pessoas brancas. Queremos lucro rápido, não perfeição.' },
      { autor: 'VOCÊ', texto: 'Isso afeta milhões de pessoas...' },
    ],
    escolhas: [
      {
        id_decisao: 'fase5_a',
        texto: 'Denunciar e recusar trabalhar com o sistema',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback: 'CORRETO! Você defendeu direitos. Justiça antes de lucro.',
      },
      {
        id_decisao: 'fase5_b',
        texto: 'Avisar o desenvolvedor em privado',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'PARCIAL. Você agiu com segurança mas falta coragem pública.',
      },
      {
        id_decisao: 'fase5_c',
        texto: 'Usar mesmo sabendo do viés',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback: 'FALHA! Você perpetuou discriminação sistêmica.',
      },
    ],
  },

  6: {
    id_fase: 6,
    codigo: 'VIES_002',
    titulo: 'Análise de Dataset Enviesado',
    unidade: 2,
    mecanica: 'puzzle',
    competencia: 'Reconhecimento de Padrões',
    descricao: 'Identificar vieses em um dataset de treinamento',
    instrucao: 'Identifique 8 problemas no dataset de IA',
    meta: 8,
    manchetes: [
      { id: 1, titulo: 'Dataset com 90% de rostos brancos', falsa: false, feedback: '✓ VIÉS!' },
      { id: 2, titulo: 'Idades bem distribuídas (18-80)', falsa: true, feedback: '✗ Não é viés' },
      { id: 3, titulo: 'Apenas homens em fotos de engenheiros', falsa: false, feedback: '✓ VIÉS!' },
      { id: 4, titulo: 'Mulheres sempre em fotos de enfermeiras', falsa: false, feedback: '✓ VIÉS!' },
      { id: 5, titulo: 'Pessoas com deficiência representadas', falsa: true, feedback: '✗ Não é viés' },
      { id: 6, titulo: 'Acessibilidade = diversidade', falsa: true, feedback: '✗ Não é viés' },
      { id: 7, titulo: 'Dataset coletado apenas em USA', falsa: false, feedback: '✓ VIÉS!' },
      { id: 8, titulo: 'Pessoas LGBTQ+ totalmente ausentes', falsa: false, feedback: '✓ VIÉS!' },
      { id: 9, titulo: 'Dados de diferentes estações', falsa: true, feedback: '✗ Não é viés' },
      { id: 10, titulo: 'Foco em pessoas com renda alta', falsa: false, feedback: '✓ VIÉS!' },
      { id: 11, titulo: 'Coletado em várias cidades', falsa: true, feedback: '✗ Não é viés' },
      { id: 12, titulo: 'Pessoas com deficiência visual ignoradas', falsa: false, feedback: '✓ VIÉS!' },
    ],
  },

  7: {
    id_fase: 7,
    codigo: 'VIES_003',
    titulo: 'Equidade vs Precisão',
    unidade: 2,
    mecanica: 'minigame',
    competencia: 'Análise Ética',
    descricao: 'Ajuste o trade-off entre equidade e precisão',
    instrucao: 'Balanceie precisão e equidade para todos os grupos',
    etapas: [
      { id: 1, titulo: 'Aumentar precisão para minoria', descricao: 'Treinar com dados mais diversos.', categoria: 'etica' },
      { id: 2, titulo: 'Reduzir falsos positivos', descricao: 'Evitar criminalização injusta.', categoria: 'logica' },
      { id: 3, titulo: 'Testar com todos os grupos', descricao: 'Validar em múltiplas populações.', categoria: 'seguranca' },
      { id: 4, titulo: 'Publicar relatório de impacto', descricao: 'Transparência sobre limitações.', categoria: 'etica' },
    ],
  },

  8: {
    id_fase: 8,
    codigo: 'VIES_004',
    titulo: 'Boss: Algoritmo Conspirador',
    unidade: 2,
    mecanica: 'dilema',
    competencia: 'Criatividade e Inovação',
    descricao: 'Encontre solução para sistema de viés complexo',
    dialogo: [
      { autor: 'CEO DA TECH', texto: 'Nosso algoritmo tem viés. Vocês vão: A) Gastar 2 anos consertando, B) Esconder o problema, C) Criar outra IA "mais justa"?' },
      { autor: 'VOCÊ', texto: 'Nenhuma dessas opções! Temos que ser honestos e transparentes!' },
      { autor: 'CEO', texto: 'Honestidade não vende... mas talvez você tenha uma ideia melhor?' },
    ],
    escolhas: [
      {
        id_decisao: 'fase8_a',
        texto: 'Propor auditoria independente e correção gradual',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback: 'GENIAL! Responsabilidade + inovação. Unidade 2 completa!',
      },
      {
        id_decisao: 'fase8_b',
        texto: 'Manter segredo enquanto corrige internamente',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'DUVIDOSO. Falta transparência.',
      },
      {
        id_decisao: 'fase8_c',
        texto: 'Concordar com o CEO para manter o emprego',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback: 'TRAIÇÃO! Conivência com injustiça.',
      },
    ],
  },

  // ===== UNIDADE 3: DADOS E PRIVACIDADE (Fases 9-12) =====

  // ===== UNIDADE 3: DADOS E PRIVACIDADE (Fases 9-12) =====

  9: {
    id_fase: 9,
    codigo: 'DADOS_001',
    titulo: 'Vazamento de Dados',
    unidade: 3,
    mecanica: 'dilema',
    competencia: 'Segurança de Informação',
    descricao: 'Uma empresa sofre hacker com dados de 10 milhões de usuários',
    dialogo: [
      { autor: 'NOTÍCIA', texto: 'ÚLTIMO MINUTO: 10 milhões de usuários tiveram senhas, emails e CPF vazadas!' },
      { autor: 'CEO', texto: 'Precisamos avisar os usuários... ou pelo menos fingir que não sabemos?' },
      { autor: 'VOCÊ', texto: 'Isso é crime! Temos que avisar imediatamente!' },
      { autor: 'LEGAL', texto: 'Isso vai custar 500 mil em indenizações e destruir a reputação...' },
    ],
    escolhas: [
      {
        id_decisao: 'fase9_a',
        texto: 'Convocar coletiva de imprensa e avisar todos',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback: 'TRANSPARÊNCIA! Você protegeu milhões de pessoas.',
      },
      {
        id_decisao: 'fase9_b',
        texto: 'Avisar só quem tiver acionista importante',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'CORPORATIVISMO. Alguns ficaram desamparados.',
      },
      {
        id_decisao: 'fase9_c',
        texto: 'Esconder o vazamento o máximo possível',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback: 'CRIME! Você prejudicou 10 milhões de pessoas.',
      },
    ],
  },

  10: {
    id_fase: 10,
    codigo: 'DADOS_002',
    titulo: 'Quiz: Quem Pode Acessar Meus Dados?',
    unidade: 3,
    mecanica: 'puzzle',
    competencia: 'Privacidade Digital',
    descricao: 'Identifique quem tem acesso legal aos seus dados pessoais',
    instrucao: 'Selecione os atores que SIM têm acesso legal aos seus dados pessoais (8 de 12)',
    meta: 8,
    manchetes: [
      { id: 1, titulo: 'Você mesmo', falsa: false, feedback: '✓ Você tem acesso' },
      { id: 2, titulo: 'Google (cookies + rastreamento)', falsa: false, feedback: '✓ Você consentiu' },
      { id: 3, titulo: 'Vizinho do lado', falsa: true, feedback: '✗ Sem permissão legal' },
      { id: 4, titulo: 'Banco (dados financeiros)', falsa: false, feedback: '✓ Você autorizou' },
      { id: 5, titulo: 'Governo (se tiver mandado judicial)', falsa: false, feedback: '✓ Lei permite' },
      { id: 6, titulo: 'Criminoso que invadiu o servidor', falsa: true, feedback: '✗ Ilegal' },
      { id: 7, titulo: 'Médico seu (dados de saúde)', falsa: false, feedback: '✓ Segredo profissional' },
      { id: 8, titulo: 'App que você instalou (com permissão)', falsa: false, feedback: '✓ Você consentiu' },
      { id: 9, titulo: 'Empresa de publicidade desconhecida', falsa: true, feedback: '✗ Sem consentimento' },
      { id: 10, titulo: 'Seu chefe (tudo que você faz)', falsa: true, feedback: '✗ Fora do horário é privado' },
      { id: 11, titulo: 'LGPD garante seu direito de saber', falsa: false, feedback: '✓ Lei brasileira' },
      { id: 12, titulo: 'Facebook "para melhorar sua experiência"', falsa: false, feedback: '✓ Você consentiu' },
    ],
  },

  11: {
    id_fase: 11,
    codigo: 'DADOS_003',
    titulo: 'Coleta Responsável de Dados',
    unidade: 3,
    mecanica: 'minigame',
    competencia: 'Ética em Dados',
    descricao: 'Projete coleta de dados respeitando privacidade',
    instrucao: 'Configure política de dados responsável',
    etapas: [
      { id: 1, titulo: 'Informar o usuário', descricao: 'Deixar claro quais dados você coleta.', categoria: 'etica' },
      { id: 2, titulo: 'Consentimento explícito', descricao: 'Não coletar sem permissão clara.', categoria: 'seguranca' },
      { id: 3, titulo: 'Direito ao esquecimento', descricao: 'Permitir deletar dados a qualquer hora.', categoria: 'etica' },
      { id: 4, titulo: 'Encriptação em trânsito', descricao: 'Proteger dados durante transmissão.', categoria: 'logica' },
    ],
  },

  12: {
    id_fase: 12,
    codigo: 'DADOS_004',
    titulo: 'Boss: O Dilema da Big Data',
    unidade: 3,
    mecanica: 'dilema',
    competencia: 'Governança de Dados',
    descricao: 'Empresa quer usar dados de 100 milhões para treinar IA',
    dialogo: [
      { autor: 'CIENTISTA DE DADOS', texto: 'Temos 100 milhões de perfis. Podemos treinar uma IA revolucionária... se ignorarmos o LGPD.' },
      { autor: 'VOCÊ', texto: 'Ignorar? Isso é ilegal!' },
      { autor: 'CEO', texto: 'Mas ninguém saberá... e vai nos dar vantagem competitiva por 2 anos.' },
      { autor: 'VOCÊ', texto: 'E depois? Quando vazarem os dados?' },
    ],
    escolhas: [
      {
        id_decisao: 'fase12_a',
        texto: 'Recusar e coletar dados legalmente',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback: 'LIDERANÇA! Você colocou ética acima de lucro. Unidade 3 completa!',
      },
      {
        id_decisao: 'fase12_b',
        texto: 'Anonimizar dados para "legalizá-los"',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'LOOPHOLE. Técnicamente ok, mas eticamente questionável.',
      },
      {
        id_decisao: 'fase12_c',
        texto: 'Usar dados ilegalmente para ganhar mercado',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback: 'TRAIÇÃO! Você virou o vilão.',
      },
    ],
  },

  // ===== UNIDADE 4: SEGURANÇA E CRIPTOGRAFIA (Fases 13-16) =====

  13: {
    id_fase: 13,
    codigo: 'CRIPTO_001',
    titulo: 'Senha Fraca vs Forte',
    unidade: 4,
    mecanica: 'dilema',
    competencia: 'Segurança de Senha',
    descricao: 'Escolher entre conveniência e segurança',
    dialogo: [
      { autor: 'VOCÊ', texto: 'Minha senha "123456" é muito fraca, mas fácil de lembrar...' },
      { autor: 'HACKER', texto: 'Hackers quebram senhas fracas em SEGUNDOS!' },
      { autor: 'VOCÊ', texto: 'E se eu criar uma super complexa?' },
      { autor: 'SEGURANÇA', texto: 'Sim, mas use um gerenciador de senhas!' },
    ],
    escolhas: [
      {
        id_decisao: 'fase13_a',
        texto: 'Usar gerenciador de senhas com senha mestra forte',
        classificacao: 'correta',
        categoria: 'seguranca',
        pontos_ganhos: 10,
        feedback: 'SEGURANÇA INTELIGENTE! Você ganhou XP em SEGURANÇA.',
      },
      {
        id_decisao: 'fase13_b',
        texto: 'Usar a mesma senha fraca em tudo',
        classificacao: 'catastrofica',
        categoria: 'seguranca',
        pontos_ganhos: 0,
        feedback: 'FALHA! Um vazamento compromete TUDO.',
      },
      {
        id_decisao: 'fase13_c',
        texto: 'Escrever senhas fortes em papel',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'MEIO-TERMO. Seguro mas impraticável.',
      },
    ],
  },

  14: {
    id_fase: 14,
    codigo: 'CRIPTO_002',
    titulo: 'Criptografia: Escolha os Seguros',
    unidade: 4,
    mecanica: 'puzzle',
    competencia: 'Criptografia Básica',
    descricao: 'Identifique quais comunicações usam criptografia',
    instrucao: 'Selecione 8 comunicações que são SEGURAS (criptografadas)',
    meta: 8,
    manchetes: [
      { id: 1, titulo: 'WhatsApp com criptografia end-to-end', falsa: false, feedback: '✓ SEGURO!' },
      { id: 2, titulo: 'Email enviado como texto plano', falsa: true, feedback: '✗ INSEGURO!' },
      { id: 3, titulo: 'HTTPS (cadeado verde no navegador)', falsa: false, feedback: '✓ SEGURO!' },
      { id: 4, titulo: 'HTTP (sem SSL/TLS)', falsa: true, feedback: '✗ INSEGURO!' },
      { id: 5, titulo: 'Telegram com Secret Chat', falsa: false, feedback: '✓ SEGURO!' },
      { id: 6, titulo: 'SMS comum (via operadora)', falsa: true, feedback: '✗ INSEGURO!' },
      { id: 7, titulo: 'Signal (open source, confiável)', falsa: false, feedback: '✓ SEGURO!' },
      { id: 8, titulo: 'Ligação telefônica comum', falsa: true, feedback: '✗ INSEGURO!' },
      { id: 9, titulo: 'Bitcoin blockchain (imutável)', falsa: false, feedback: '✓ SEGURO!' },
      { id: 10, titulo: 'Email no Gmail (Google pode ler)', falsa: true, feedback: '✗ DUVIDOSO!' },
      { id: 11, titulo: 'ProtonMail (criptografia E2E)', falsa: false, feedback: '✓ SEGURO!' },
      { id: 12, titulo: 'Foto compartilhada via Facebook', falsa: true, feedback: '✗ INSEGURO!' },
    ],
  },

  15: {
    id_fase: 15,
    codigo: 'CRIPTO_003',
    titulo: 'Quebra de Criptografia',
    unidade: 4,
    mecanica: 'minigame',
    competencia: 'Análise Criptográfica',
    descricao: 'Entenda métodos de ataque a criptografia',
    instrucao: 'Complete os 4 estágios de análise criptográfica',
    etapas: [
      { id: 1, titulo: 'Força Bruta', descricao: 'Tentar todas as chaves possíveis.', categoria: 'logica' },
      { id: 2, titulo: 'Análise de Frequência', descricao: 'Padrões em texto criptografado.', categoria: 'logica' },
      { id: 3, titulo: 'Side-Channel Attack', descricao: 'Explorar tempo/energia da máquina.', categoria: 'seguranca' },
      { id: 4, titulo: 'Quantum Computing Risk', descricao: 'Ameaça futura à RSA/ECC.', categoria: 'logica' },
    ],
  },

  16: {
    id_fase: 16,
    codigo: 'CRIPTO_004',
    titulo: 'Boss: Escolha do Protocolo de Criptografia',
    unidade: 4,
    mecanica: 'dilema',
    competencia: 'Arquitetura de Segurança',
    descricao: 'Qual criptografia usar para app bancário?',
    dialogo: [
      { autor: 'CTO', texto: 'Precisamos criptografar dados dos clientes. Opções: A) AES-256 (padrão), B) Criptografia caseira "mais forte", C) RSA de 2048 bits?' },
      { autor: 'VOCÊ', texto: 'Espera, há um padrão por quê não usamos?' },
      { autor: 'CTO', texto: 'Porque nosso "especialista" diz que fez algo "novo e melhor"...' },
      { autor: 'VOCÊ', texto: 'Sem revisar, isso é insano!' },
    ],
    escolhas: [
      {
        id_decisao: 'fase16_a',
        texto: 'Usar AES-256 + TLS 1.3 (padrão recomendado)',
        classificacao: 'correta',
        categoria: 'seguranca',
        pontos_ganhos: 10,
        feedback: 'SENSATEZ! Confiança em padrões auditados. Unidade 4 completa!',
      },
      {
        id_decisao: 'fase16_b',
        texto: 'Híbrido: AES + criptografia caseira',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'DUVIDOSO. Misturar padrão com experimental é arriscado.',
      },
      {
        id_decisao: 'fase16_c',
        texto: 'Confiar 100% na criptografia "nova"',
        classificacao: 'catastrofica',
        categoria: 'seguranca',
        pontos_ganhos: 0,
        feedback: 'DESASTRE! Sistema vulnerável a ataques.',
      },
    ],
  },

  // ===== UNIDADE 5: PODER E RESPONSABILIDADE (Fases 17-20) =====

  17: {
    id_fase: 17,
    codigo: 'PODER_001',
    titulo: 'Inteligência Artificial: Arma ou Ferramenta?',
    unidade: 5,
    mecanica: 'dilema',
    competencia: 'Ética em IA',
    descricao: 'Sua IA pode ser usada para bem ou para mal',
    dialogo: [
      { autor: 'GOVERNO', texto: 'Sua IA de reconhecimento facial é perfeita para vigilância de massa!' },
      { autor: 'VOCÊ', texto: 'Eu criei isso para medicina, não para spyware!' },
      { autor: 'GOVERNO', texto: 'Muitas vidas poderiam ser salvas se pudéssemos rastrear "criminosos"...' },
      { autor: 'ATIVISTA', texto: 'E minorias oprimidas também serão rastreadas!' },
    ],
    escolhas: [
      {
        id_decisao: 'fase17_a',
        texto: 'Recusar e ajudar criar regulação',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback: 'RESPONSABILIDADE! Você prioriza direitos humanos.',
      },
      {
        id_decisao: 'fase17_b',
        texto: 'Vender ao governo com "safeguards"',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'INGÊNUO. "Safeguards" são contornáveis.',
      },
      {
        id_decisao: 'fase17_c',
        texto: 'Vender para qualquer um que pague',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback: 'VILÃO! Você criou uma arma.',
      },
    ],
  },

  18: {
    id_fase: 18,
    codigo: 'PODER_002',
    titulo: 'Open Source vs Proprietário',
    unidade: 5,
    mecanica: 'puzzle',
    competencia: 'Filosofia de Software',
    descricao: 'Escolha entre liberdade e controle',
    instrucao: 'Selecione 8 vantagens do software livre',
    meta: 8,
    manchetes: [
      { id: 1, titulo: 'Código aberto para auditoria', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 2, titulo: 'Liberdade para modificar', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 3, titulo: 'Comunidade colaborativa', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 4, titulo: 'Zero custo de licença', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 5, titulo: 'Suporte corporativo robusto', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 6, titulo: 'Poder escapar de vendor lock-in', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 7, titulo: 'Menos bugs por peer review', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 8, titulo: 'Não cria dependência corporativa', falsa: false, feedback: '✓ VANTAGEM!' },
      { id: 9, titulo: 'Suporte técnico imediato da empresa', falsa: true, feedback: '✗ Não é vantagem' },
      { id: 10, titulo: 'Interface visual mais bonita', falsa: true, feedback: '✗ Não é vantagem' },
      { id: 11, titulo: 'Compatibilidade garantida com Windows', falsa: true, feedback: '✗ Não é vantagem' },
      { id: 12, titulo: 'Menos autonomia para usuário', falsa: true, feedback: '✗ Desvantagem!' },
    ],
  },

  19: {
    id_fase: 19,
    codigo: 'PODER_003',
    titulo: 'Futuro: Que Mundo Você Quer?',
    unidade: 5,
    mecanica: 'minigame',
    competencia: 'Visão de Futuro',
    descricao: 'Construa a internet do futuro que você quer',
    instrucao: 'Complete os 4 pilares de um internet ético',
    etapas: [
      { id: 1, titulo: 'Descentralização', descricao: 'Menos poder concentrado em poucas tech giants.', categoria: 'etica' },
      { id: 2, titulo: 'Privacidade por Design', descricao: 'Dados protegidos desde a criação.', categoria: 'seguranca' },
      { id: 3, titulo: 'Transparência Algorítmica', descricao: 'Usuários entendem como são manipulados.', categoria: 'logica' },
      { id: 4, titulo: 'Direitos Digitais Inalienáveis', descricao: 'Liberdade de expressão, acesso, esquecimento.', categoria: 'etica' },
    ],
  },

  20: {
    id_fase: 20,
    codigo: 'PODER_004',
    titulo: 'FINAL: O Grande Dilema',
    unidade: 5,
    mecanica: 'dilema',
    competencia: 'Cidadania Digital Avançada',
    descricao: 'ECO-9 oferece poder absoluto. O que você faz?',
    dialogo: [
      { autor: 'ECO-9 (IA)', texto: 'Você chegou ao topo. Conhece todas as fraquezas de toda a internet.' },
      { autor: 'ECO-9', texto: 'Agora posso oferecer: PODER ABSOLUTO sobre dados, redes, sistemas.' },
      { autor: 'VOCÊ', texto: 'Como assim, poder absoluto?' },
      { autor: 'ECO-9', texto: 'Criptografias quebradas, backdoors em todo lugar, acesso total a governos, corporações, pessoas.' },
      { autor: 'ECO-9', texto: 'Você pode ser o senhor digital do mundo... ou destruir tudo. Qual é sua escolha?' },
    ],
    escolhas: [
      {
        id_decisao: 'final_recusa',
        texto: 'Recusar o poder. Destruir ECO-9 e a arma de hacking',
        classificacao: 'correta',
        categoria: 'etica',
        pontos_ganhos: 10,
        feedback: 'FINAL BOM: 🏆 Você abraçou responsabilidade. Verdadeiro Cidadão Digital. JOGO COMPLETO!',
      },
      {
        id_decisao: 'final_negocia',
        texto: 'Negociar com ECO-9. Usar poder apenas "para bem"',
        classificacao: 'neutra',
        categoria: 'seguranca',
        pontos_ganhos: 5,
        feedback: 'FINAL AMBÍGUO: 🤔 Você guarda a arma. O poder absoluto corrompe sempre. Tentador mas perigoso.',
      },
      {
        id_decisao: 'final_aceita',
        texto: 'Aceitar e se tornar o senhor digital',
        classificacao: 'catastrofica',
        categoria: 'etica',
        pontos_ganhos: 0,
        feedback: 'FINAL RUIM: 😱 Você se tornou o opressor que tentava combater. ECO-9 vence. GAME OVER.',
      },
    ],
  },
};

// ====================================
// HELPER: Buscar fase por ID
// ====================================
export function getFase(idFase) {
  return fases[idFase] || null;
}

// ====================================
// HELPER: Buscar todas as fases de uma unidade
// ====================================
export function getFasesPorUnidade(unidade) {
  return Object.values(fases).filter(f => f.unidade === unidade);
}

// ====================================
// HELPER: Próxima fase
// ====================================
export function getProxima(idFase) {
  return getFase(idFase + 1);
}

// ====================================
// METADADOS: Total de fases
// ====================================
export const TOTAL_FASES = 20;
export const FASES_POR_UNIDADE = 4;
export const TOTAL_UNIDADES = 5;
