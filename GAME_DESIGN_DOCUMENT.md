# Cidadão Digital - Game Design Document (GDD)
## 20 Fases Baseadas em "Moderna Plus Educação Digital Ensino Médio"

---

## 📌 Visão Geral

**Título do Jogo:** Cidadão Digital - Fuja da Bolha  
**Público:** Estudantes Ensino Médio (15-17 anos)  
**Duração:** ~2-3 horas (20 fases × 6-9 min cada)  
**Plataforma:** Web (React + PHP + MySQL)  
**Tom:** Cyberpunk, luta contra sistemas corrompidos, agência do jogador

---

## 🎯 Competências BNCC Alinhadas

O jogo desenvolve as **Competências Gerais da BNCC**:

1. **Conhecimento** - Exploração de conteúdos digitais
2. **Pensamento Científico** - Análise crítica de dados
3. **Repertório Cultural** - Compreensão de múltiplas perspectivas
4. **Comunicação** - Expressão e argumentação
5. **Cultura Digital** - ⭐ Foco principal
6. **Trabalho e Projeto de Vida** - Decisões conscientes
7. **Argumentação** - Justificação de escolhas
8. **Autoconhecimento** - Reflexão sobre valores
9. **Empatia e Cooperação** - Impacto social

---

## 🗺️ Estrutura de 20 Fases em 5 Unidades

### **UNIDADE I: BOLHA E DESINFORMAÇÃO** (Fases 1-4)
**Tema:** Câmara de Eco, Algoritmos de Recomendação, Letramento Informacional

| Fase | Tipo | Mecânica | Objetivo Pedagógico |
|------|------|----------|-------------------|
| 1️⃣ Prisioneiro da Bolha | Dilema | Escolha narrativa | Introducir conceito de "bubble filter" |
| 2️⃣ Verdadeiro ou Falso? | Puzzle | Reconhecer padrões | Identificar fake news por elementos (título, fonte, data) |
| 3️⃣ Algoritmo de Engajamento | Minigame | Decomposição | Entender como algoritmos manipulam comportamento |
| 4️⃣ ECO-9 Desperta (Boss) | Dilema Chained | 3 dilemas + consequências | Síntese: escolher prioridade (privacidade vs liberdade) |

**XP Foco:** Ética ↑↑, Segurança ↑, Lógica ↑

---

### **UNIDADE II: VIÉS E DISCRIMINAÇÃO** (Fases 5-8)
**Tema:** IA Enviesada, Justiça Digital, Reconhecimento Facial

| Fase | Tipo | Mecânica | Objetivo Pedagógico |
|------|------|----------|-------------------|
| 5️⃣ Reconhecimento Facial Enviesado | Dilema | Ação/Reação | Reconhecer discriminação algorítmica |
| 6️⃣ Análise de Dataset Enviesado | Puzzle | Análise visual | Identificar representação desigual em dados |
| 7️⃣ Desenhando um Algoritmo Justo | Minigame | Ajustar parâmetros | Entender trade-off: precisão vs equidade |
| 8️⃣ Lucro vs Justiça (Boss) | Dilema Chained | Dilema corporativo | Teste: você denuncia ou fica quieto? |

**XP Foco:** Ética ↑↑, Lógica ↑↑, Segurança ↑

---

### **UNIDADE III: DEEPFAKES E MANIPULAÇÃO** (Fases 9-12)
**Tema:** IA Generativa, Análise de Mídia, Autenticidade Digital

| Fase | Tipo | Mecânica | Objetivo Pedagógico |
|------|------|----------|-------------------|
| 9️⃣ Vídeo Deepfake Viral | Dilema | Resposta emocional | Reconhecer urgência artificial |
| 🔟 Detectando Artefatos de GAN | Puzzle | Análise visual interativa | Identificar sinais de manipulação (piscar, sombra, textura) |
| 1️⃣1️⃣ Análise Forense Digital | Minigame | Técnicas de verificação | Usar metadados e análise de frequência |
| 1️⃣2️⃣ Guerra de Informação (Boss) | Dilema Chained | Escolher a "verdade" | Teste: qual deepfake é "mais real"? Impossível saber! |

**XP Foco:** Lógica ↑↑, Ética ↑↑, Segurança ↑↑

---

### **UNIDADE IV: PRIVACIDADE E CRIPTOGRAFIA** (Fases 13-16)
**Tema:** Dados Pessoais, Segurança, Vigilância Digital

| Fase | Tipo | Mecânica | Objetivo Pedagógico |
|------|------|----------|-------------------|
| 1️⃣3️⃣ Rastreamento Digital | Dilema | Escolha ativa | Reconhecer coleta de dados invisível |
| 1️⃣4️⃣ Quebrando Senhas Fracas | Puzzle | Força bruta simplificada | Entender complexidade de senhas |
| 1️⃣5️⃣ Criptografia Moderna | Minigame | Caesar → RSA/AES | Evolução: simplicidade vs segurança |
| 1️⃣6️⃣ Guardião de Dados (Boss) | Dilema Chained | Whistleblower dilema | Teste: denunciar ou trabalhar por dentro? |

**XP Foco:** Segurança ↑↑, Lógica ↑, Ética ↑

---

### **UNIDADE V: PODER E RESPONSABILIDADE** (Fases 17-20)
**Tema:** Monopólio Tech, Ativismo Digital, Software Livre, Síntese

| Fase | Tipo | Mecânica | Objetivo Pedagógico |
|------|------|----------|-------------------|
| 1️⃣7️⃣ Monopólio das Big Techs | Dilema | Voto consciente | Mercado vs Regulação |
| 1️⃣8️⃣ Teia de Poder Corporativa | Puzzle | Network mapping | Ver conexões de influência |
| 1️⃣9️⃣ Software Livre vs Proprietário | Minigame | Construir app | Escolher dependências com consciência |
| 2️⃣0️⃣ O Grande Dilema (FINAL) | Dilema Chained x5 | Todas as competências | ECO-9 oferece poder. Você aceita? |

**XP Foco:** Ética ↑↑↑, Lógica ↑↑, Segurança ↑

---

## 🎭 Sistema de Análise de Perfil do Aluno

A **análise contínua** transforma o jogo em uma ferramenta pedagógica de **autoconhecimento**.

### Oito Arquétipos de "Cidadão Digital"

```
         Crítico 🔍          Investigador 🔎
              \              /
               \            /
                \          /
        Ético ⚖️ ---- Ativista ✊
                /        \
               /          \
              /            \
      Hacker ⚙️ ---- Engenheiro 🛠️
      
      Pragmático ⚡
      Passivo 😴
```

### Como Funciona

1. **Coleta:** Cada decisão é registrada com tipo (verifica_fontes, questiona_autoridade, etc.)
2. **Scoring:** Algoritmo Bayesiano simples soma pontos para cada perfil
3. **Análise:** A cada 5 fases (~milestones), o sistema recalcula o perfil dominante
4. **Feedback:** Aluno vê seu perfil + recomendações personalizadas
5. **Relatório ao Professor:** Tab "Analytics" mostra evolução por aluno/turma

### Exemplos de Padrões

| Padrão de Escolha | Tipo Aluno Provável | Risco/Desvio |
|------------------|-------------------|-------------|
| Sempre verifica fontes, questiona | **Crítico** | Paralisia analítica |
| Rejeita escolhas antiéticas | **Ético** | Idealismo ingênuo |
| Toma ações visíveis, mobiliza | **Ativista** | Ação impulsiva |
| Explora vulnerabilidades | **Hacker** | Curiosidade sem ética |
| Otimiza, negocia trade-offs | **Engenheiro** | Negligência ética |
| Ignora dilemas, segue maioria | **Passivo** | Fácil de manipular |
| Equilibra tudo | **Pragmático** | Falta de posicionamento |
| Conecta pontos, investiga | **Investigador** | Teorias da conspiração |

---

## 🎮 Mecânicas por Tipo de Fase

### 1. **Dilema Narrativo** (Tipo: Escolha Moral)
- Apresenta um cenário cyberpunk
- 3 opções: correta, neutra, catastrófica
- **Impacto:** Muda o estado emocional de ECO-9, afeta XP

### 2. **Puzzle Lógico** (Tipo: Análise Crítica)
- Reconhecer padrões, identificar erros
- **Exemplos:** Manchetes falsas, artefatos de GAN, senhas fracas
- **Impacto:** XP em Lógica, unlock de ferramentas

### 3. **Minigame** (Tipo: Pensamento Computacional)
- Decomposição, abstração, algoritmo
- **Exemplos:** Quebrar algoritmo em etapas, criptografia César→RSA
- **Impacto:** XP em Lógica + Segurança

### 4. **Boss Dilema** (Tipo: Dilemas Encadeados)
- 3-5 dilemas ligados logicamente
- Cada escolha afeta as próximas
- **Impacto:** Culminação da unidade, pode mudar alinhamento de ECO-9

---

## 📊 Dashboard do Professor

**Tab: "Análise de Turma"**

- Gráfico: Distribuição de tipos de aluno (% crítico, etico, etc.)
- Tabela: Cada aluno com tipo, confiança, erros principais
- Heatmap: Quais fases mais alunos erraram?
- Recomendação: "Turma passa mal em Unidade II (viés). Considere debate."

**Tab: "Aluno Individual"**

- Evolução de perfil (gráfico de linha)
- Histórico de decisões (tabela com feedback)
- Recomendação personalizada (atividades complementares)

---

## 📚 Alinhamento com "Moderna Plus Educação Digital"

### Pilar 1: Cidadania Digital
- **Fases:** 1, 4, 8, 12, 16, 20
- **Estratégia:** Dilemas éticos contínuos + consequências visíveis

### Pilar 2: Letramento Informacional
- **Fases:** 2, 5, 6, 9, 10, 13, 14, 17, 18
- **Estratégia:** Puzzle + análise + verificação de fontes

### Pilar 3: Pensamento Computacional
- **Fases:** 3, 7, 11, 15, 19
- **Estratégia:** Minigames + abstração + algoritmos

### Pilar 4: Segurança Digital
- **Fases:** 4, 8, 12, 13, 14, 15, 16, 19, 20
- **Estratégia:** XP compartilhado, consequências de escolhas inseguras

---

## 🎓 Roteiro Pedagógico Recomendado

**Semana 1: Unidade I** (Bolha)
- Aula sobre algoritmos de recomendação
- Alunos jogam Fases 1-4
- Debate: "Como você sai da sua bolha?"

**Semana 2: Unidade II** (Viés)
- Aula sobre discriminação algorítmica
- Alunos jogam Fases 5-8
- Projeto: Análise de dataset da escola/cidade

**Semana 3: Unidade III** (Deepfakes)
- Aula sobre IA Generativa
- Alunos jogam Fases 9-12
- Atividade: Criar um "detection kit" para deepfakes

**Semana 4: Unidade IV** (Privacidade)
- Aula sobre criptografia
- Alunos jogam Fases 13-16
- Laboratório: Quebrar senhas, testar VPN

**Semana 5: Unidade V** (Poder)
- Aula sobre monopólio tech
- Alunos jogam Fases 17-20
- Seminário: Apresentar posição sobre regulação

**Semana 6: Síntese**
- Alunos veem seu perfil de Cidadão Digital
- Debate em grupo sobre tipos diferentes
- Projeto final: Proposta de "lei digital" para a escola

---

## 🛠️ Tecnologia

- **Front-end:** React 18, Vite, CSS3 (cyberpunk theme)
- **Back-end:** PHP 8.4, RESTful API
- **Banco:** MySQL 8.0 (schema: alunos, fases, log_decisoes, perfil_aluno, recomendacoes_professor)
- **Deploy:** Hostinger (hospedagem compartilhada)

---

## 📈 Métricas de Sucesso

1. **Engajamento:** % de alunos que terminam as 20 fases
2. **Aprendizado:** Comparação pré/pós teste de letramento digital
3. **Diversidade de Perfil:** Turma gera múltiplos tipos (bom sinal)
4. **Transferência:** Alunos aplicam conhecimento em projetos reais?

---

## 🚀 Roadmap (Pós-MVP)

- [ ] Fase 21+: Campanhas de ativismo digital
- [ ] Multiplayer: Competir em decisões
- [ ] Integração com LMS (Google Classroom, Classroom)
- [ ] Certificado digital de "Cidadão Digital Certificado"
- [ ] API pública: Escolas desenvolvem suas próprias fases

---

**Criado:** 02/09/2026  
**Versão:** 1.0 (MVP 20 Fases)  
**Status:** Pronto para Hostinger
