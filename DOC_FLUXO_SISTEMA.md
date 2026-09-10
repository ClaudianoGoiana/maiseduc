# Documento de Fluxo do Sistema
**Projeto:** Cidadão Digital

## 1. Fluxo de Sessão do Usuário

O diagrama abaixo elucida a trajetória do jogador desde seu início em uma fase, a decisão perante um dilema, até a finalização e roteamento para o cálculo de perfil.

```mermaid
sequenceDiagram
    actor Aluno
    participant React UI (Frontend)
    participant Engine Narrativo (Hook)
    participant API Backend (Laravel)
    participant Banco (MySQL)
    
    Aluno->>React UI (Frontend): Inicia Sessão
    React UI (Frontend)->>React UI (Frontend): Carrega dados do arquivo da Fase (fase1.js)
    
    loop Leitura de Diálogos
        Aluno->>React UI (Frontend): Clica para avançar texto
        React UI (Frontend)->>React UI (Frontend): Apresenta próximo bloco do Typewriter
    end
    
    React UI (Frontend)-->>Aluno: Exibe Dilema e Botões de Escolhas
    Aluno->>React UI (Frontend): Clica em Alternativa (Ex: Verifica Fontes)
    
    React UI (Frontend)->>Engine Narrativo (Hook): useGameProgress.registrarDecisao(escolha)
    Engine Narrativo (Hook)->>API Backend (Laravel): POST /api/decision
    
    API Backend (Laravel)->>Banco (MySQL): Valida e Executa INSERT log_decisoes
    API Backend (Laravel)->>Banco (MySQL): UPDATE alunos (adiciona XP)
    Banco (MySQL)-->>API Backend (Laravel): Confirma transação
    API Backend (Laravel)-->>Engine Narrativo (Hook): Retorna sucesso e novos valores XP
    
    Engine Narrativo (Hook)-->>React UI (Frontend): Atualiza Estado Local (HUD)
    React UI (Frontend)-->>Aluno: Feedback da Escolha (Ganha XP)
    
    alt Se Fase == Final de Unidade (Boss)
        React UI (Frontend)->>API Backend (Laravel): POST /api/profile
        API Backend (Laravel)->>Banco (MySQL): Lê todo histórico log_decisoes
        API Backend (Laravel)->>API Backend (Laravel): Roda Matriz de Perfil (8 tipos)
        API Backend (Laravel)->>Banco (MySQL): INSERT perfil_aluno
        API Backend (Laravel)-->>React UI (Frontend): Retorna Resultados de Perfil
        React UI (Frontend)-->>Aluno: Renderiza Tela de Perfil Completa <PerfilAluno />
    else Se Fase Comum
        React UI (Frontend)-->>Aluno: Apresenta Botão "Próxima Fase"
    end
```

## 2. Fluxo da Lógica de Cálculo de Perfil (Motor Pedagógico)

```mermaid
flowchart TD
    A[Disparo: Conclusão Fase Milestone] --> B[Obter Histórico Total de Decisões do Aluno]
    B --> C{Há Decisões Suficientes?}
    C -- Sim --> D[Mapeamento Decisão X Dimensões]
    C -- Não --> Z[Reter Classificação Atual / Default]
    D --> E[Somar Pontos para Cada Tipo: Critico, Etico...]
    E --> F[Normalizar (0-100%)]
    F --> G[Encontrar Top Score (Tipo Dominante)]
    G --> H[Calcular Deltas (Grau de Confiança)]
    H --> I[Montar Objeto de Recomendação]
    I --> J[Persistir Perfil em Banco (Tabela perfil_aluno)]
    J --> K[Devolver JSON formatado para Interface]
```

## 3. Fluxo Excepcional (Erro de Conectividade)
Caso haja falha de conexão do frontend com a API no momento em que a decisão é enviada, o sistema aborta a progressão da fase temporariamente, garantindo que o `xp` no frontend nunca destoe severamente da integridade do backend. A interface propõe uma repetição da ação HTTP sem perda da linha de diálogo.
