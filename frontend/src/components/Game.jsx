import { createContext, useContext, useEffect, useState } from 'react';
import VisualNovelEngine from './VisualNovelEngine';
import PuzzleRecognition from './PuzzleRecognition';
import { getFase, TOTAL_FASES } from '../data/fases';
import { useGameProgress } from '../hooks/useGameProgress';
import { fetchWithFallback } from '../utils/api';
import './Game.css';
import c from '../trilhas-por-linguagem/c.json';
import csharp from '../trilhas-por-linguagem/csharp.json';
import cpp from '../trilhas-por-linguagem/cpp.json';
import css from '../trilhas-por-linguagem/css.json';
import go from '../trilhas-por-linguagem/go.json';
import html from '../trilhas-por-linguagem/html.json';
import java from '../trilhas-por-linguagem/java.json';
import javascript from '../trilhas-por-linguagem/js.json';
import kotlin from '../trilhas-por-linguagem/kotlin.json';
import php from '../trilhas-por-linguagem/php.json';
import python from '../trilhas-por-linguagem/python.json';
import sql from '../trilhas-por-linguagem/sql.json';

const missoesLinguagens = [
  ['⚙️', 'C', 'A Raiz do Sistema', 'Gerencie a memória e entenda as engrenagens que fazem os computadores funcionarem.'],
  ['🎮', 'C#', 'O Arsenal de Realidades', 'Crie mundos virtuais e aplicações onde cada linha de código pode alterar a realidade.'],
  ['🚀', 'C++', 'Poder de Fogo Pesado', 'Otimize motores gráficos e desenvolva sistemas de altíssima performance.'],
  ['🎨', 'CSS', 'A Arte da Camuflagem', 'Crie interfaces imersivas com neon, estilo e animações fluidas.'],
  ['⚡', 'Go (Golang)', 'Velocidade e Concorrência', 'Domine processos simultâneos e gerencie milhares de conexões com eficiência.'],
  ['🧱', 'HTML', 'O Esqueleto da Rede', 'Estruture informações e construa o terreno de qualquer página web.'],
  ['☕', 'Java', 'A Máquina Universal', 'Construa aplicações robustas para Android, sistemas bancários e outras plataformas.'],
  ['⚡', 'JavaScript', 'O Motor da Interatividade', 'Controle comportamentos em tempo real e crie experiências dinâmicas no front-end.'],
  ['📱', 'Kotlin', 'A Vanguarda Mobile', 'Escreva códigos modernos para dispositivos móveis e elimine bugs.'],
  ['🐘', 'PHP', 'O Núcleo do Servidor', 'Proteja o back-end e blinde a comunicação entre usuário e sistema central.'],
  ['🐍', 'Python', 'Automação e Inteligência', 'Automatize tarefas, processe dados e crie lógicas para neutralizar ameaças.'],
  ['🗄️', 'SQL', 'O Cofre de Dados', 'Faça consultas precisas e mantenha informações confidenciais a salvo.'],
];

const trilhasLinguagens = [c, csharp, cpp, css, go, html, java, javascript, kotlin, php, python, sql];
const SessaoContext = createContext({ aluno: null, sair: () => { } });

function calcularPontuacaoDasLinguagens() {
  return trilhasLinguagens.reduce((total, trilha) => {
    const progresso = carregarProgressoDaTrilha(trilha.id);
    const notaDaTrilha = Object.values(progresso.notaPorModulo ?? {})
      .reduce((soma, nota) => {
        let val = Number(nota) || 0;
        if (val > 0 && val <= 1.0) val = val * 10;
        return soma + Math.min(10, val);
      }, 0);
    return total + notaDaTrilha;
  }, 0);
}

function PontuacaoMenu({ xp }) {
  const total = (xp.etica || 0) + (xp.logica || 0) + (xp.seguranca || 0);
  // Usa Number().toString() implicitamente: se for inteiro mostra 30, se tiver fração mostra 30.3
  return (
    <div className="menu-pontuacao" aria-label="Pontuação atual">
      <span><strong>XP TOTAL: {Number(total)}</strong></span>
      <span>ÉTICA: {Number(xp.etica || 0)}</span>
      <span>LÓGICA: {Number(xp.logica || 0)}</span>
      <span>SEGURANÇA: {Number(xp.seguranca || 0)}</span>
    </div>
  );
}

function MenuSite({ onTela, paginaAtiva, xp, mostrarPontuacao = false, classe = '' }) {
  const { aluno, sair } = useContext(SessaoContext);

  return (
    <>
      <header className={`home-header ${classe}`}>
        <button className="home-logo" onClick={() => onTela('home')} aria-label="Ir para Home">
          <span className="home-logo__mark">◈</span><span>Cidadão<br /><strong>Digital</strong></span>
        </button>
        <nav className="home-nav" aria-label="Navegação principal">
          {['home', 'jogos', 'desafios', 'sobre', 'contato'].map((item) => (
            <button key={item} className={paginaAtiva === item ? 'home-nav__ativo' : ''} onClick={() => onTela(item)}>{item.toUpperCase()}</button>
          ))}
        </nav>
        <div className="home-conta">
          {aluno ? (
            <>
              <span className="home-conta__usuario" title={aluno.email}>{aluno.nome}</span>
              <button className="home-botao home-botao--outline" onClick={() => onTela('turma')}>
                {aluno.nome_turma ? aluno.nome_turma.toUpperCase() : 'MINHA TURMA'}
              </button>
              <button className="home-botao home-botao--outline" onClick={sair}>SAIR</button>
            </>
          ) : (
            <>
              <button className="home-botao home-botao--outline" onClick={() => onTela('login')}>ENTRAR</button>
              <button className="home-botao home-botao--outline home-botao--rosa" onClick={() => onTela('cadastro')}>CADASTRAR-SE</button>
            </>
          )}
        </div>
      </header>
      {mostrarPontuacao && <PontuacaoMenu xp={xp} />}
    </>
  );
}

function MenuJogo({ onTela, xp, mostrarPontuacao = false }) {
  return <MenuSite onTela={onTela} paginaAtiva="jogos" xp={xp} mostrarPontuacao={mostrarPontuacao} classe="game-site-header" />;
}

function TelaDeJogo({ children, onTela, xp, mostrarPontuacao = false }) {
  return <div className="game-shell"><MenuJogo onTela={onTela} xp={xp} mostrarPontuacao={mostrarPontuacao} />{children}</div>;
}

function CyberMestre({ onTela, xp }) {
  const [dificuldade, setDificuldade] = useState(null);
  const [resposta, setResposta] = useState(null);
  const configuracoes = {
    facil: { nome: 'Fácil', pergunta: 'Qual atitude protege melhor os dados de uma conta?', opcoes: ['Usar uma senha forte e autenticação em dois fatores.', 'Anotar a senha em um post-it público.', 'Usar a mesma senha em todos os sites.'], correta: 0 },
    medio: { nome: 'Médio', pergunta: 'Você identifica um vazamento de dados. Qual é a primeira ação?', opcoes: ['Ignorar o alerta para não criar preocupação.', 'Investigar a origem, proteger a conta e avisar os responsáveis.', 'Compartilhar os dados vazados para pedir ajuda.'], correta: 1 },
    dificil: { nome: 'Difícil', pergunta: 'Um sistema coleta dados além do necessário. Qual decisão é mais segura?', opcoes: ['Manter tudo para usar no futuro.', 'Vender os dados para financiar a segurança.', 'Limitar a coleta, proteger o acesso e apagar o que não for necessário.'], correta: 2 },
  };
  const desafio = dificuldade ? configuracoes[dificuldade] : null;

  return (
    <TelaDeJogo onTela={onTela} xp={xp} mostrarPontuacao>
      <main className="desafio-container cyber-container">
        <section className="desafio-painel cyber-painel">
          <button className="desafio-voltar" onClick={() => onTela('home')}>← VOLTAR PARA HOME</button>
          <p className="home-kicker">♙ CYBER MESTRE // DEFESA DE DADOS</p>
          {!dificuldade ? (
            <>
              <h1>Escolha a dificuldade</h1>
              <p className="desafio-pergunta">Prepare sua missão de uma fase. Quanto maior a dificuldade, mais complexa será a decisão.</p>
              <div className="dificuldade-opcoes">
                {Object.entries(configuracoes).map(([chave, item]) => <button key={chave} className={`dificuldade-card dificuldade-card--${chave}`} onClick={() => setDificuldade(chave)}><strong>{item.nome}</strong><span>{chave === 'facil' ? 'Defesa básica' : chave === 'medio' ? 'Resposta a incidentes' : 'Estratégia avançada'}</span></button>)}
              </div>
            </>
          ) : (
            <>
              <span className="dificuldade-atual">DIFICULDADE: {desafio.nome.toUpperCase()}</span>
              <h1>Fase única: Proteja o sistema</h1>
              <p className="desafio-pergunta">{desafio.pergunta}</p>
              <div className="desafio-opcoes">
                {desafio.opcoes.map((opcao, indice) => <button key={opcao} className={resposta === indice ? (indice === desafio.correta ? 'opcao correta' : 'opcao incorreta') : 'opcao'} onClick={() => setResposta(indice)}>{String.fromCharCode(65 + indice)}. {opcao}</button>)}
              </div>
              {resposta !== null && <div className={`desafio-feedback ${resposta === desafio.correta ? 'feedback-correto' : 'feedback-incorreto'}`}><strong>{resposta === desafio.correta ? 'MISSÃO CONCLUÍDA' : 'SISTEMA EM RISCO'}</strong><p>{resposta === desafio.correta ? 'Você protegeu os dados e concluiu o Cyber Mestre.' : 'Essa decisão deixa os dados vulneráveis. Escolha outra alternativa.'}</p>{resposta === desafio.correta && <button className="home-botao home-botao--principal" onClick={() => onTela('home')}>FINALIZAR</button>}</div>}
            </>
          )}
        </section>
      </main>
    </TelaDeJogo>
  );
}

function CodigoEnigmatico({ onTela, xp }) {
  const [dificuldade, setDificuldade] = useState(null);
  const [resposta, setResposta] = useState(null);
  const configuracoes = {
    facil: { nome: 'Fácil', pergunta: 'Qual sequência representa melhor um algoritmo?', opcoes: ['Planejar, executar e testar.', 'Clicar aleatoriamente até funcionar.', 'Ignorar o problema e repetir a mesma ação.'], correta: 0 },
    medio: { nome: 'Médio', pergunta: 'Um programa precisa repetir uma ação até uma condição mudar. Qual estrutura faz mais sentido?', opcoes: ['Uma variável sem valor.', 'Um laço de repetição com condição.', 'Um comentário no código.'], correta: 1 },
    dificil: { nome: 'Difícil', pergunta: 'Um algoritmo ficou lento ao procurar dados em uma lista ordenada. Qual estratégia pode melhorar a busca?', opcoes: ['Verificar todos os itens sempre.', 'Duplicar todos os dados sem critério.', 'Usar busca binária, dividindo o espaço de busca.'], correta: 2 },
  };
  const desafio = dificuldade ? configuracoes[dificuldade] : null;

  return (
    <TelaDeJogo onTela={onTela} xp={xp} mostrarPontuacao>
      <main className="desafio-container cyber-container">
        <section className="desafio-painel cyber-painel">
          <button className="desafio-voltar" onClick={() => onTela('home')}>← VOLTAR PARA HOME</button>
          <p className="home-kicker">⌘ CÓDIGO ENIGMÁTICO // DESAFIOS DE LÓGICA</p>
          {!dificuldade ? (
            <>
              <h1>Escolha a dificuldade</h1>
              <p className="desafio-pergunta">Resolva uma única missão de lógica. Escolha o nível antes de começar.</p>
              <div className="dificuldade-opcoes">
                {Object.entries(configuracoes).map(([chave, item]) => <button key={chave} className={`dificuldade-card dificuldade-card--${chave}`} onClick={() => setDificuldade(chave)}><strong>{item.nome}</strong><span>{chave === 'facil' ? 'Raciocínio básico' : chave === 'medio' ? 'Estruturas de código' : 'Algoritmos eficientes'}</span></button>)}
              </div>
            </>
          ) : (
            <>
              <span className="dificuldade-atual">DIFICULDADE: {desafio.nome.toUpperCase()}</span>
              <h1>Fase única: decifre a lógica</h1>
              <p className="desafio-pergunta">{desafio.pergunta}</p>
              <div className="desafio-opcoes">
                {desafio.opcoes.map((opcao, indice) => <button key={opcao} className={resposta === indice ? (indice === desafio.correta ? 'opcao correta' : 'opcao incorreta') : 'opcao'} onClick={() => setResposta(indice)}>{String.fromCharCode(65 + indice)}. {opcao}</button>)}
              </div>
              {resposta !== null && <div className={`desafio-feedback ${resposta === desafio.correta ? 'feedback-correto' : 'feedback-incorreto'}`}><strong>{resposta === desafio.correta ? 'ENIGMA RESOLVIDO' : 'LÓGICA INCOMPLETA'}</strong><p>{resposta === desafio.correta ? 'Você identificou a melhor estratégia para resolver o problema.' : 'Analise a sequência e tente outra alternativa.'}</p>{resposta === desafio.correta && <button className="home-botao home-botao--principal" onClick={() => onTela('home')}>FINALIZAR</button>}</div>}
            </>
          )}
        </section>
      </main>
    </TelaDeJogo>
  );
}

function DilemasEticos({ onTela, xp }) {
  const [dificuldade, setDificuldade] = useState(null);
  const [resposta, setResposta] = useState(null);
  const configuracoes = {
    facil: { nome: 'Fácil', pergunta: 'Você encontra uma imagem falsa circulando na turma. O que faz?', opcoes: ['Verifica a fonte antes de compartilhar.', 'Compartilha porque todo mundo está falando.', 'Altera a imagem para ficar mais chamativa.'], correta: 0 },
    medio: { nome: 'Médio', pergunta: 'Um aplicativo pede acesso a dados que não precisa para funcionar. Qual decisão é mais ética?', opcoes: ['Aceitar sem ler para terminar rápido.', 'Recusar o acesso desnecessário e procurar uma alternativa.', 'Compartilhar os dados de outra pessoa também.'], correta: 1 },
    dificil: { nome: 'Difícil', pergunta: 'Uma plataforma quer usar um algoritmo que prejudica um grupo para aumentar o lucro. Qual atitude é responsável?', opcoes: ['Esconder o problema para lançar o produto.', 'Usar o algoritmo porque ele é mais barato.', 'Exigir uma avaliação de impacto e corrigir o viés antes do lançamento.'], correta: 2 },
  };
  const desafio = dificuldade ? configuracoes[dificuldade] : null;

  return (
    <TelaDeJogo onTela={onTela} xp={xp} mostrarPontuacao>
      <main className="desafio-container cyber-container">
        <section className="desafio-painel cyber-painel">
          <button className="desafio-voltar" onClick={() => onTela('home')}>← VOLTAR PARA HOME</button>
          <p className="home-kicker">⚖ DILEMAS ÉTICOS // ESCOLHAS DIGITAIS</p>
          {!dificuldade ? (
            <>
              <h1>Escolha a dificuldade</h1>
              <p className="desafio-pergunta">Uma única decisão pode mudar o impacto de uma tecnologia. Escolha o nível da missão.</p>
              <div className="dificuldade-opcoes">
                {Object.entries(configuracoes).map(([chave, item]) => <button key={chave} className={`dificuldade-card dificuldade-card--${chave}`} onClick={() => setDificuldade(chave)}><strong>{item.nome}</strong><span>{chave === 'facil' ? 'Escolhas conscientes' : chave === 'medio' ? 'Privacidade e respeito' : 'Impacto e justiça'}</span></button>)}
              </div>
            </>
          ) : (
            <>
              <span className="dificuldade-atual">DIFICULDADE: {desafio.nome.toUpperCase()}</span>
              <h1>Fase única: escolha com responsabilidade</h1>
              <p className="desafio-pergunta">{desafio.pergunta}</p>
              <div className="desafio-opcoes">
                {desafio.opcoes.map((opcao, indice) => <button key={opcao} className={resposta === indice ? (indice === desafio.correta ? 'opcao correta' : 'opcao incorreta') : 'opcao'} onClick={() => setResposta(indice)}>{String.fromCharCode(65 + indice)}. {opcao}</button>)}
              </div>
              {resposta !== null && <div className={`desafio-feedback ${resposta === desafio.correta ? 'feedback-correto' : 'feedback-incorreto'}`}><strong>{resposta === desafio.correta ? 'ESCOLHA CONCLUÍDA' : 'REVEJA O IMPACTO'}</strong><p>{resposta === desafio.correta ? 'Você considerou as pessoas afetadas e escolheu uma atitude ética.' : 'Pense no impacto da decisão sobre outras pessoas e tente novamente.'}</p>{resposta === desafio.correta && <button className="home-botao home-botao--principal" onClick={() => onTela('home')}>FINALIZAR</button>}</div>}
            </>
          )}
        </section>
      </main>
    </TelaDeJogo>
  );
}

function Home({ onComecar, onTela, xp }) {
  return (
    <main className="home-container">
      <MenuSite onTela={onTela} paginaAtiva="home" xp={xp} mostrarPontuacao />

      <section className="home-hero">
        <div className="home-visual" aria-hidden="true">
          <img src="/boy.webp" alt="Jovem estudando tecnologia em um ambiente digital" />
        </div>
        <div className="home-hero__copy">
          <p className="home-kicker">PLATAFORMA DE APRENDIZAGEM DIGITAL</p>
          <h1>DOMINE O MUNDO DIGITAL.<br /><span>JOGUE E APRENDA.</span></h1>
          <p className="home-subtitulo">Desafios de <strong>ÉTICA, LÓGICA E SEGURANÇA.</strong><br />Conquiste pontos e suba de nível!</p>
          <button className="home-botao home-botao--principal" onClick={onComecar}>COMEÇAR AGORA <span>›</span></button>
        </div>
      </section>

      <section className="home-desafios" aria-label="Desafios disponíveis">
        <article className="desafio-card" onClick={() => onTela('cyber-mestre')}><span className="desafio-card__icone">♙</span><div><h2>CYBER MESTRE</h2><p>DEFESA DE DADOS</p><small>Ética</small></div><button onClick={(evento) => { evento.stopPropagation(); onTela('cyber-mestre'); }} aria-label="Jogar Cyber Mestre">▶</button></article>
        <article className="desafio-card" onClick={() => onTela('codigo-enigmatico')}><span className="desafio-card__icone">⌘</span><div><h2>CÓDIGO ENIGMÁTICO</h2><p>DESAFIOS DE LÓGICA</p><small>Lógica</small></div><button onClick={(evento) => { evento.stopPropagation(); onTela('codigo-enigmatico'); }} aria-label="Jogar Código Enigmático">▶</button></article>
        <article className="desafio-card" onClick={() => onTela('dilemas-eticos')}><span className="desafio-card__icone">⚖</span><div><h2>DILEMAS ÉTICOS</h2><p>ESCOLHAS DIGITAIS</p><small>Segurança</small></div><button onClick={(evento) => { evento.stopPropagation(); onTela('dilemas-eticos'); }} aria-label="Jogar Dilemas Éticos">▶</button></article>
      </section>
    </main>
  );
}

function Sobre({ onVoltar, onComecar, onTela, xp }) {
  return (
    <main className="sobre-container">
      <MenuSite onTela={onTela} paginaAtiva="sobre" xp={xp} mostrarPontuacao />
      <section className="sobre-intro">
        <div>
          <p className="home-kicker">SOBRE A PLATAFORMA</p>
          <h1>Aprender a viver<br /><span>no mundo digital.</span></h1>
          <p className="home-subtitulo">Cidadão Digital é uma experiência educativa interativa que transforma escolhas do cotidiano em desafios para pensar, questionar e agir com responsabilidade.</p>
          <button className="home-botao home-botao--principal" onClick={onComecar}>EXPLORAR O JOGO <span>›</span></button>
        </div>
        <div className="sobre-imagem">
          <img src="/boy.webp" alt="Estudante explorando tecnologia" />
          <span>CONHECIMENTO // RESPONSABILIDADE // FUTURO</span>
        </div>
      </section>
      <section className="sobre-desenvolvedor">
        <div>
          <p className="home-kicker">SOBRE QUEM CRIOU</p>
          <h2>Desenvolvido por<br /><span>Claudiano Goiana dos Santos</span></h2>
        </div>
        <div className="sobre-motivo">
          <p className="home-kicker">POR QUE ESTE SISTEMA FOI CRIADO?</p>
          <p>O Cidadão Digital foi criado para transformar o aprendizado sobre tecnologia em uma experiência prática, interativa e significativa. O sistema ajuda estudantes a desenvolver pensamento crítico, compreender linguagens de programação e tomar decisões mais éticas, lógicas e seguras no mundo digital.</p>
          <p>Por meio de jogos, missões e escolhas, a plataforma aproxima o conhecimento da realidade e mostra que cada pessoa também participa da construção de uma internet mais responsável.</p>
        </div>
      </section>
      <section className="sobre-principios">
        <article><strong>01</strong><h2>ÉTICA</h2><p>Reflita sobre impacto, respeito, justiça e responsabilidade nas suas escolhas.</p></article>
        <article><strong>02</strong><h2>LÓGICA</h2><p>Investigue informações, reconheça padrões e resolva problemas passo a passo.</p></article>
        <article><strong>03</strong><h2>SEGURANÇA</h2><p>Proteja dados, identifique riscos e construa hábitos digitais mais conscientes.</p></article>
      </section>
      <section className="sobre-processo">
        <p className="home-kicker">COMO FUNCIONA</p>
        <h2>Você joga. O sistema acompanha sua evolução.</h2>
        <p>São muitas fases com dilemas, puzzles e desafios. Cada decisão gera pontos nas três competências e ajuda a revelar seu perfil de cidadão digital.</p>
      </section>
      <section className="sobre-linguagens">
        <div className="sobre-linguagens__cabecalho">
          <div><p className="home-kicker">AS LINGUAGENS COMO MISSÕES</p><h2>Escolha sua próxima batalha digital.</h2></div>
        </div>
        <div className="missoes-grid">
          {missoesLinguagens.map(([icone, nome, titulo, descricao], indice) => (
            <article className="missao-card" key={nome}>
              <div className="missao-card__topo"><span className="missao-card__icone">{icone}</span><span className="missao-card__numero">MISSÃO {String(indice + 1).padStart(2, '0')}</span></div>
              <h3>{nome}</h3><h4>{titulo}</h4><p>{descricao}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Contato({ onTela, xp }) {
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const enviarMensagem = async (evento) => {
    evento.preventDefault();
    const form = evento.currentTarget;
    const dados = new FormData(form);
    setEnviando(true);
    setEnviado(false);
    setErro('');
    try {
      const resposta = await fetchWithFallback('util?acao=send_contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: dados.get('nome'),
          email: dados.get('email'),
          mensagem: dados.get('mensagem'),
        }),
      });
      const resultado = await resposta.json();
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível enviar a mensagem.');
      setEnviado(true);
      form.reset();
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="contato-container">
      <MenuSite onTela={onTela} paginaAtiva="contato" xp={xp} mostrarPontuacao />
      <section className="contato-intro">
        <div>
          <p className="home-kicker">FALE COM A GENTE</p>
          <h1>Vamos criar soluções digitais.</h1>
          <p>Estamos prontos para desenvolver projetos educacionais, jogos interativos e sistemas digitais como este.</p>
          <div className="contato-canais">
            <div className="contato-canal">
              <strong>WHATSAPP</strong><span>+55 83 99950-5906</span>
              <a className="contato-whatsapp" href="https://wa.me/5583999505906" target="_blank" rel="noreferrer">ABRIR WHATSAPP</a>
            </div>
            <a href="mailto:resetprint@gmail.com"><strong>E-MAIL</strong><span>resetprint@gmail.com</span></a>
          </div>
        </div>
        <div className="contato-formulario">
          <p className="home-kicker">ENVIE UMA MENSAGEM</p>
          <form onSubmit={enviarMensagem}>
            <input type="text" name="nome" placeholder="Seu nome" aria-label="Seu nome" required />
            <input type="email" name="email" placeholder="Seu e-mail" aria-label="Seu e-mail" required />
            <textarea name="mensagem" placeholder="Como podemos ajudar?" aria-label="Mensagem" rows="5" required />
            <button className="home-botao home-botao--principal" type="submit" disabled={enviando}>{enviando ? 'ENVIANDO...' : 'ENVIAR MENSAGEM'} <span>›</span></button>
          </form>
          <p className="contato-aviso">A mensagem será enviada diretamente para resetprint@gmail.com.</p>
          {enviado && <p className="contato-confirmacao">Mensagem enviada com sucesso.</p>}
          {erro && <p className="contato-erro">{erro}</p>}
        </div>
      </section>
      <section className="contato-desenvolvedor">
        <p className="home-kicker">SOBRE O DESENVOLVEDOR</p>
        <h2>Claudiano Goiana dos Santos</h2>
        <p>Estudante do 4º período de Ciência da Computação, com formação complementar em cursos do Curso em Vídeo, do professor Gustavo Guanabara, e da Hashtag. O objetivo é transformar conhecimento em experiências digitais úteis, educativas e acessíveis.</p>
      </section>
    </main>
  );
}

function Catalogo({ tipo, onTela, onComecar, xp }) {
  const jogos = tipo === 'jogos';
  const desafios = jogos
    ? [{ numero: 1, titulo: 'Prisioneiro da Bolha', detalhe: 'A primeira fase da trilha Cidadão Digital. Comece sua jornada enfrentando a desinformação.', tipo: 'Trilha única' }]
    : [
      { numero: 'A', titulo: 'Ética Digital', detalhe: 'Escolhas responsáveis, respeito e justiça no mundo conectado.', tipo: '' },
      { numero: 'B', titulo: 'Lógica e Pensamento', detalhe: 'Padrões, algoritmos e problemas para resolver passo a passo.', tipo: '' },
      { numero: 'C', titulo: 'Segurança e Privacidade', detalhe: 'Proteção de dados, senhas e decisões conscientes.', tipo: '' },
    ];

  return (
    <main className="catalogo-container">
      <MenuSite onTela={onTela} paginaAtiva={jogos ? 'jogos' : 'desafios'} xp={xp} mostrarPontuacao />
      <section className="catalogo-intro">
        <p className="home-kicker">{jogos ? 'CENTRAL DE JOGOS' : 'CENTRAL DE DESAFIOS'}</p>
        <h1>{jogos ? 'Sua trilha de aprendizagem.' : 'Escolha sua competência.'}</h1>
        <p>{jogos ? 'Uma única trilha de aprendizagem com 20 fases. Comece pela Fase 1 e avance a cada decisão.' : 'Desenvolva ética, lógica e segurança em missões interativas.'}</p>
      </section>
      <section className={`catalogo-grid catalogo-grid--${jogos ? 'jogos' : 'desafios'}`}>
        {desafios.map((item) => (
          <article className="catalogo-card" key={item.numero} onClick={() => !jogos && onTela(`desafio-${item.numero}`)}>
            <span className="catalogo-card__numero">{jogos ? `FASE ${String(item.numero).padStart(2, '0')}` : `ÁREA ${item.numero}`}</span>
            <h2>{item.titulo}</h2><p>{item.detalhe}</p>{item.tipo && <small>{item.tipo}</small>}
            <button className="home-botao home-botao--principal" onClick={() => jogos ? onComecar() : onTela(`desafio-${item.numero}`)}>{jogos ? 'INICIAR TRILHA' : 'EXPLORAR DESAFIOS'} <span>›</span></button>
          </article>
        ))}
      </section>
      {jogos && (
        <section className="trilha-linguagens">
          <div className="trilha-linguagens__cabecalho">
            <div><p className="home-kicker">TRILHA DE LINGUAGENS</p><h2>12 jogos para dominar o código.</h2></div>
            <p>Cada linguagem abre uma jornada independente com módulos e missões próprias.</p>
          </div>
          <div className="linguagens-grid">
            {trilhasLinguagens.map((trilha) => (
              <article className="linguagem-card" key={trilha.id} onClick={() => onTela(`linguagem-${trilha.id}`)}>
                <span className="linguagem-card__icone">{trilha.icon}</span>
                <div><span className="linguagem-card__tag">JOGO DE LINGUAGEM</span><h3>{trilha.name}</h3><p>{trilha.modules.length} módulos · {trilha.modules.reduce((total, modulo) => total + modulo.missions.length, 0)} missões</p></div>
                <button className="linguagem-card__abrir" onClick={(evento) => { evento.stopPropagation(); onTela(`linguagem-${trilha.id}`); }} aria-label={`Abrir jogo de ${trilha.name}`}>›</button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function shuffleOptions(opcoes) {
  const lista = [...opcoes];
  for (let indice = lista.length - 1; indice > 0; indice -= 1) {
    const sorteio = Math.floor(Math.random() * (indice + 1));
    [lista[indice], lista[sorteio]] = [lista[sorteio], lista[indice]];
  }
  return lista;
}

function carregarProgressoDaTrilha(trilhaId) {
  try {
    return JSON.parse(localStorage.getItem(`cidadao-digital:trilha:${trilhaId}`) || '{}');
  } catch {
    return {};
  }
}

function JogoLinguagem({ trilhaId, onTela, xp, idAluno, autenticado }) {
  const trilha = trilhasLinguagens.find((item) => item.id === trilhaId);
  const [moduloAtivo, setModuloAtivo] = useState(null);
  const [moduloIniciado, setModuloIniciado] = useState(false);
  const [missaoAtiva, setMissaoAtiva] = useState(null);
  const [desafioIniciado, setDesafioIniciado] = useState(false);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [respostaVerificada, setRespostaVerificada] = useState(false);
  const [resultadoResposta, setResultadoResposta] = useState(null);
  const [tentativas, setTentativas] = useState(0);
  const [errosMissao, setErrosMissao] = useState(0);
  const [opcoesErradas, setOpcoesErradas] = useState([]);
  const [notaPorModulo, setNotaPorModulo] = useState(() => carregarProgressoDaTrilha(trilhaId).notaPorModulo ?? {});
  const [conclusoesPorModulo, setConclusoesPorModulo] = useState(() => carregarProgressoDaTrilha(trilhaId).conclusoesPorModulo ?? {});
  const [opcoesMissao, setOpcoesMissao] = useState([]);
  const [progressoPorModulo, setProgressoPorModulo] = useState(() => carregarProgressoDaTrilha(trilhaId).progressoPorModulo ?? {});

  if (!trilha) return null;

  const totalMissoes = trilha.modules.reduce((total, modulo) => total + modulo.missions.length, 0);
  const iconesModulos = ['🧠', '💎', '🧮', '🔁', '📚', '🧩', '🧪', '💾', '🧱', '🐍', '🛠️', '🏁'];
  const cards = trilha.modules.map((modulo, indice) => ({
    ...modulo,
    icon: iconesModulos[indice] || '✨',
    progresso: `${progressoPorModulo[indice] ?? 0}/${modulo.missions.length}`,
    nota: `${(Number(notaPorModulo[indice] ?? 0) <= 10.0 && Number(notaPorModulo[indice] ?? 0) > 0 ? Number(notaPorModulo[indice] ?? 0).toFixed(0) : Number(notaPorModulo[indice] ?? 0).toFixed(0))}/10`,
    concluida: 0,
    status: indice === 0 || (conclusoesPorModulo[indice - 1] ?? 0) > 0 ? 'ativo' : 'bloqueado',
    titulo: modulo.name.replace(/^\d+\.\s*/, ''),
  }));

  const moduloSelecionado = moduloAtivo !== null ? cards[moduloAtivo] : null;
  const missaoAtual = moduloSelecionado && missaoAtiva !== null ? moduloSelecionado.missions[missaoAtiva] : null;
  const desafioAtual = missaoAtual?.challenges?.[0] ?? null;

  useEffect(() => {
    if (!desafioAtual) {
      setOpcoesMissao([]);
      return;
    }

    setOpcoesMissao(shuffleOptions([desafioAtual.keyword, ...desafioAtual.distractors]));
  }, [moduloAtivo, missaoAtiva]);

  useEffect(() => {
    localStorage.setItem(`cidadao-digital:trilha:${trilhaId}`, JSON.stringify({
      notaPorModulo,
      conclusoesPorModulo,
      progressoPorModulo,
    }));
    window.dispatchEvent(new Event('pontuacao-linguagens-atualizada'));
  }, [conclusoesPorModulo, notaPorModulo, progressoPorModulo, trilhaId]);

  const resetarEstadoMissao = () => {
    setDesafioIniciado(false);
    setRespostaSelecionada(null);
    setRespostaVerificada(false);
    setResultadoResposta(null);
    setTentativas(0);
    setErrosMissao(0);
    setOpcoesErradas([]);
  };

  const abrirModulo = (indice) => {
    const missoesConcluidas = progressoPorModulo[indice] ?? 0;
    const moduloJaConcluido = missoesConcluidas >= trilha.modules[indice].missions.length;

    setModuloAtivo(indice);
    setModuloIniciado(false);
    setMissaoAtiva(moduloJaConcluido ? 0 : missoesConcluidas);
    if (moduloJaConcluido) {
      setProgressoPorModulo((atual) => ({ ...atual, [indice]: 0 }));
      setNotaPorModulo((atual) => ({ ...atual, [indice]: '0.0' }));
    }
    resetarEstadoMissao();
  };

  const voltarMapa = () => {
    setModuloAtivo(null);
    setModuloIniciado(false);
    setMissaoAtiva(null);
    resetarEstadoMissao();
  };

  const avancarMissao = () => {
    if (!moduloSelecionado || missaoAtiva === null) {
      voltarMapa();
      return;
    }

    if (missaoAtiva < moduloSelecionado.missions.length - 1) {
      setMissaoAtiva((atual) => atual + 1);
      resetarEstadoMissao();
      return;
    }

    if (moduloAtivo !== null && moduloAtivo < cards.length - 1) {
      setConclusoesPorModulo((atual) => ({
        ...atual,
        [moduloAtivo]: (atual[moduloAtivo] ?? 0) + 1,
      }));
      const proximoModulo = moduloAtivo + 1;
      setModuloAtivo(proximoModulo);
      setModuloIniciado(false);
      setMissaoAtiva(0);
      resetarEstadoMissao();
      return;
    }

    if (moduloAtivo !== null) {
      setConclusoesPorModulo((atual) => ({
        ...atual,
        [moduloAtivo]: (atual[moduloAtivo] ?? 0) + 1,
      }));
    }
    voltarMapa();
  };

  const notaAtualMissao = Number(Math.max(0, 1.0 - errosMissao * 0.25)).toFixed(1);

  const registrarErro = (opcao) => {
    const novoErro = errosMissao + 1;
    const notaRestante = Math.max(0, 1.0 - novoErro * 0.25);

    setErrosMissao(novoErro);
    setTentativas(novoErro);
    setResultadoResposta('incorreta');
    setRespostaSelecionada(opcao);
    setRespostaVerificada(false);
    setOpcoesErradas((atual) => (atual.includes(opcao) ? atual : [...atual, opcao]));

    if (novoErro >= 3) {
      setResultadoResposta('ultima-chance');
    }

    return notaRestante;
  };

  const verificarResposta = () => {
    if (!desafioAtual || !respostaSelecionada) return;

    if (respostaSelecionada === desafioAtual.keyword) {
      const notaMissaoConcluida = Math.max(0, 1.0 - errosMissao * 0.25);
      setProgressoPorModulo((atual) => ({
        ...atual,
        [moduloAtivo]: Math.max(atual[moduloAtivo] ?? 0, (missaoAtiva ?? 0) + 1),
      }));

      let proximaNotaModulo = 0;
      setNotaPorModulo((atual) => {
        let totalAtual = Number(atual[moduloAtivo] ?? 0);
        const proximoTotal = Math.min(10.0, Number((totalAtual + notaMissaoConcluida).toFixed(1)));
        proximaNotaModulo = proximoTotal;
        return { ...atual, [moduloAtivo]: Number(proximoTotal).toFixed(1) };
      });
      setResultadoResposta('correta');
      setRespostaVerificada(true);

      if (autenticado && (idAluno || aluno?.email)) {
        let emailEnvio = aluno?.email || '';
        if (!emailEnvio) {
          try {
            const sessao = JSON.parse(localStorage.getItem('cidadao-digital:aluno') || '{}');
            emailEnvio = sessao.email || '';
          } catch {}
        }
        fetchWithFallback('progresso?acao=salvar_progresso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_aluno: idAluno,
            email: emailEnvio,
            linguagem: trilhaId,
            id_modulo: String(moduloAtivo),
            numero_missao: (missaoAtiva ?? 0) + 1,
            resposta_escolhida: respostaSelecionada,
            resposta_correta: desafioAtual.keyword,
            correta: true,
            tentativa: tentativas + 1,
            pontos_obtidos: Number(notaMissaoConcluida.toFixed(1)),
            nota_modulo: Number(proximaNotaModulo.toFixed(1)),
            missoes_concluidas: (missaoAtiva ?? 0) + 1,
          }),
        }).catch((e) => console.warn('Falha ao auditar missão de linguagem:', e));
      }

      return;
    }

    registrarErro(respostaSelecionada);
  };

  const iniciarModulo = () => {
    setModuloIniciado(true);
    setDesafioIniciado(true);
    setRespostaSelecionada(null);
    setRespostaVerificada(false);
    setResultadoResposta(null);
    setTentativas(0);
    setErrosMissao(0);
    setOpcoesErradas([]);
  };

  return (
    <div className="linguagem-page">
      <div className="linguagem-page__content">
        <h1 className="linguagem-page__title">Missões {trilha.name}</h1>

        {!moduloSelecionado ? (
          <>
            <div className="linguagem-page__status-bar">
              <span>Missões concluídas: {Object.values(progressoPorModulo).reduce((total, concluidas) => total + concluidas, 0)}/{totalMissoes}</span>
            </div>

            <div className="modulos-grid">
              {cards.map((modulo, indice) => (
                <article className={`modulo-card ${modulo.status}`} key={modulo.id}>
                  <div className="modulo-card__topo">
                    <span className="modulo-card__icon">{modulo.icon}</span>
                    <div className="modulo-card__titulo-grupo">
                      <h2>{modulo.titulo}</h2>
                    </div>
                  </div>

                  <div className="modulo-card__stats">
                    <div>
                      <span>Progresso:</span>
                      <strong>{modulo.progresso}</strong>
                    </div>
                    <div>
                      <span>Nota:</span>
                      <strong>{Number(notaPorModulo[indice] ?? 0).toFixed(0)}/10</strong>
                    </div>
                    <div>
                      <span>Concluída:</span>
                      <strong>{conclusoesPorModulo[indice] ?? modulo.concluida}x</strong>
                    </div>
                  </div>

                  <div className="modulo-card__mensagem">
                    {modulo.status === 'ativo' ? 'Pode começar agora.' : 'Complete o módulo anterior para desbloquear.'}
                  </div>

                  <button
                    className={`modulo-card__botao ${modulo.status === 'ativo' ? 'modulo-card__botao--principal' : ''}`}
                    type="button"
                    onClick={() => modulo.status === 'ativo' && abrirModulo(indice)}
                    disabled={modulo.status !== 'ativo'}
                  >
                    Começar
                  </button>
                </article>
              ))}
            </div>
          </>
        ) : !moduloIniciado ? (
          <div className="modulo-preview">
            <div className="modulo-preview__top">
              <button className="missao-screen__voltar" type="button" onClick={voltarMapa}>Voltar ao mapa</button>
            </div>

            <div className="modulo-preview__body">
              <div className="modulo-preview__icon">🧠</div>
              <h2 className="modulo-preview__title">{moduloSelecionado.titulo}</h2>

              <div className="modulo-preview__meta">
                <div>Progresso: {`${progressoPorModulo[moduloAtivo] ?? 0}/${moduloSelecionado.missions.length}`}</div>
                <div>Nota atual: {`${notaAtualMissao}/10`}</div>
                <div>Concluída: 0x</div>
              </div>

              <div className="modulo-preview__barra">
                <span style={{ width: `${((progressoPorModulo[moduloAtivo] ?? 0) / moduloSelecionado.missions.length) * 100}%` }} />
              </div>

              <button className="modulo-preview__botao modulo-preview__botao--primary" type="button" onClick={iniciarModulo}>
                Começar
              </button>
            </div>
          </div>
        ) : missaoAtual && desafioAtual && respostaVerificada ? (
          <div className="missao-screen missao-screen--success">
            <div className="missao-screen__top">
              <button className="missao-screen__voltar" type="button" onClick={voltarMapa}>Voltar ao mapa</button>
              <span className="missao-screen__meta">{trilha.name} | Missao {missaoAtual.number}/10</span>
            </div>

            <div className="missao-screen__content missao-screen__content--success">
              <div className="missao-screen__emoji missao-screen__emoji--success">🎉</div>
              <h2 className="missao-screen__titulo missao-screen__titulo--success">Missao Concluida</h2>
              <div className="missao-screen__estrelas">★ ★ ★</div>

              <div className="missao-screen__ensino missao-screen__ensino--success">
                <h3>Aprendizado</h3>
                <ul>
                  {missaoAtual.learn.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <button className="missao-screen__botao missao-screen__botao--primary" type="button" onClick={avancarMissao}>
                Proxima Missao
              </button>
            </div>
          </div>
        ) : missaoAtual && desafioAtual ? (
          <div className="missao-screen">
            <div className="missao-screen__top">
              <button className="missao-screen__voltar" type="button" onClick={voltarMapa}>Voltar ao mapa</button>
              <span className="missao-screen__meta">{trilha.name} | Missao {missaoAtual.number}/10</span>
            </div>

            {!desafioIniciado ? (
              <div className="missao-screen__content">
                <div className="missao-screen__emoji">🧠</div>
                <h2 className="missao-screen__titulo">{missaoAtual.title}</h2>
                <p className="missao-screen__objetivo"><span>Objetivo:</span> {missaoAtual.objective}</p>

                <div className="missao-screen__ensino">
                  <h3>Ensino</h3>
                  <p>{missaoAtual.teaching}</p>
                </div>

                <button className="missao-screen__botao" type="button" onClick={() => setDesafioIniciado(true)}>
                  Aceitar Desafio
                </button>
              </div>
            ) : (
              <div className="missao-screen__content missao-screen__content--quiz">
                <div className="missao-screen__emoji missao-screen__emoji--quiz">🤔</div>
                <h2 className="missao-screen__titulo missao-screen__titulo--quiz">Escolha a resposta correta</h2>

                {(resultadoResposta === 'incorreta' || resultadoResposta === 'ultima-chance') && (
                  <div className="missao-screen__erro">
                    <div className="missao-screen__erro-icone">✕</div>
                    <div className="missao-screen__erro-texto">
                      <strong>{resultadoResposta === 'ultima-chance' ? 'Última chance!' : 'Resposta incorreta!'}</strong>
                      <p>Você perdeu {Number(Math.min(10, errosMissao * 2.5)).toFixed(1)} ponto{errosMissao === 1 ? '' : 's'} da missão.</p>
                      <p>Nota atual: {notaAtualMissao}/10</p>
                      <p>Dica da resposta:</p>
                      <p className="missao-screen__erro-pergunta">{desafioAtual.hint}</p>
                    </div>
                  </div>
                )}

                <div className="missao-screen__pergunta">{desafioAtual.hint}</div>

                <div className="missao-screen__opcoes">
                  {opcoesMissao.map((opcao) => {
                    const ehCorreta = opcao === desafioAtual.keyword && respostaVerificada;
                    const selecionada = respostaSelecionada === opcao;
                    const opcaoErrada = opcoesErradas.includes(opcao);
                    const bloqueada = opcaoErrada || (resultadoResposta === 'ultima-chance' && opcao !== desafioAtual.keyword);

                    return (
                      <button
                        key={opcao}
                        type="button"
                        className={`missao-screen__opcao ${selecionada ? 'is-selected' : ''} ${ehCorreta ? 'is-correct' : ''} ${opcaoErrada ? 'is-wrong' : ''}`}
                        onClick={() => {
                          if (respostaVerificada || bloqueada) return;
                          if (opcao === desafioAtual.keyword) {
                            setRespostaSelecionada(opcao);
                            return;
                          }
                          registrarErro(opcao);
                        }}
                        disabled={bloqueada}
                      >
                        {opcaoErrada ? '✕ ' : ''}{opcao}
                      </button>
                    );
                  })}
                </div>

                <button className="missao-screen__botao missao-screen__botao--primary" type="button" onClick={verificarResposta}>
                  {resultadoResposta === 'ultima-chance' ? 'Tentar a última resposta' : 'Verificar Resposta'}
                </button>
              </div>
            )}
          </div>
        ) : null}

        <button className="linguagem-page__voltar" type="button" onClick={() => onTela('jogos')}>
          Voltar para Linguagens
        </button>
      </div>
    </div>
  );
}

function DesafioArea({ area, onTela }) {
  const desafios = {
    A: { nome: 'Ética Digital', cor: 'ética', pergunta: 'Você recebe uma notícia duvidosa sobre um colega. Qual é a atitude mais responsável?', opcoes: ['Compartilhar para alertar todo mundo.', 'Verificar a informação antes de divulgar.', 'Publicar o nome do colega nos comentários.'], correta: 1, explicacao: 'Verificar antes de divulgar protege a pessoa e evita espalhar desinformação.' },
    B: { nome: 'Lógica e Pensamento', cor: 'lógica', pergunta: 'Qual sequência representa melhor um algoritmo para resolver um problema?', opcoes: ['Chutar, executar e ignorar o resultado.', 'Observar, planejar, executar e testar.', 'Executar várias ações ao mesmo tempo sem ordem.'], correta: 1, explicacao: 'Um algoritmo precisa de etapas organizadas e deve ser testado para validar o resultado.' },
    C: { nome: 'Segurança e Privacidade', cor: 'segurança', pergunta: 'Qual escolha ajuda a proteger sua conta?', opcoes: ['Usar a mesma senha em todos os serviços.', 'Compartilhar a senha com um amigo próximo.', 'Usar senha forte e autenticação em dois fatores.'], correta: 2, explicacao: 'Uma senha forte combinada com autenticação em dois fatores reduz o risco de invasão.' },
  }[area];
  const [resposta, setResposta] = useState(null);

  return (
    <main className="desafio-container">
      <MenuSite onTela={onTela} paginaAtiva="desafios" />
      <section className="desafio-painel">
        <button className="desafio-voltar" onClick={() => onTela('desafios')}>← VOLTAR PARA DESAFIOS</button>
        <p className="home-kicker">ÁREA {area} // MISSÃO INTERATIVA</p>
        <h1>{desafios.nome}</h1>
        <p className="desafio-pergunta">{desafios.pergunta}</p>
{resposta !== null && <div className={`desafio-feedback ${resposta === desafios.correta ? 'feedback-correto' : 'feedback-incorreto'}`}><strong>{resposta === desafios.correta ? 'DESAFIO CONCLUÍDO' : 'TENTE NOVAMENTE'}</strong><p>{resposta === desafios.correta ? desafios.explicacao : 'Essa escolha pode aumentar o risco. Analise a situação e escolha outra alternativa.'}</p>{resposta === desafios.correta && <button className="home-botao home-botao--principal" onClick={() => onTela('desafios')}>VOLTAR ÀS ÁREAS</button>}</div>}
      </section>
    </main>
  );
}

function Conta({ tipo, onVoltar, onTela, xp, onEntrar }) {
  const cadastro = tipo === 'cadastro';
  const [modoRecuperacao, setModoRecuperacao] = useState(false); // false, 'solicitar', 'redefinir'
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [tokenGerado, setTokenGerado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const enviarCadastro = async (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchWithFallback('aluno?acao=cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: dados.get('nome'),
          email: dados.get('email'),
          whatsapp: dados.get('whatsapp'),
          turma: dados.get('turma'),
          senha: dados.get('senha'),
        }),
      });
      const texto = await resposta.text();
      let resultado = {};
      try { resultado = JSON.parse(texto); } catch { resultado = { error: `Erro no servidor (HTTP ${resposta.status}): ${texto.replace(/<[^>]*>?/gm, '').trim().substring(0, 150)}` }; }
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível concluir o cadastro.');

      formulario.reset();
      setSucesso('Cadastro realizado com sucesso. Agora você pode entrar no jogo.');
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenUrl = params.get('token');
      const emailUrl = params.get('email');
      if (tokenUrl) {
        setModoRecuperacao('redefinir');
        setTokenGerado(tokenUrl);
        if (emailUrl) setEmailRecuperacao(emailUrl);
      }
    }
  }, []);

  const solicitarRecuperacao = async (evento) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const emailInput = dados.get('email');

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchWithFallback('aluno?acao=solicitar_recuperacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, tipo: 'aluno' }),
      });
      const texto = await resposta.text();
      let resultado = {};
      try { resultado = JSON.parse(texto); } catch { resultado = { error: `Erro no servidor (HTTP ${resposta.status}): ${texto.replace(/<[^>]*>?/gm, '').trim().substring(0, 150)}` }; }
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível solicitar a recuperação.');

      setEmailRecuperacao(emailInput);
      setSucesso(resultado.data?.mensagem || 'Um e-mail com o link de recuperação de senha foi enviado para ' + emailInput + '. Acesse sua caixa de entrada.');
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  const redefinirSenha = async (evento) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchWithFallback('aluno?acao=redefinir_senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: dados.get('email'),
          token: dados.get('token'),
          nova_senha: dados.get('nova_senha'),
          tipo: 'aluno',
        }),
      });
      const texto = await resposta.text();
      let resultado = {};
      try { resultado = JSON.parse(texto); } catch { resultado = { error: `Erro no servidor (HTTP ${resposta.status}): ${texto.replace(/<[^>]*>?/gm, '').trim().substring(0, 150)}` }; }
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível redefinir a senha.');

      setSucesso(resultado.data?.mensagem || 'Senha redefinida com sucesso! Faça o login.');
      setModoRecuperacao(false);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  const enviarLogin = async (evento) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchWithFallback('aluno?acao=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: dados.get('email'),
          senha: dados.get('senha'),
        }),
      });
      const texto = await resposta.text();
      let resultado = {};
      try { resultado = JSON.parse(texto); } catch { resultado = { error: `Erro no servidor (HTTP ${resposta.status}): ${texto.replace(/<[^>]*>?/gm, '').trim().substring(0, 150)}` }; }
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível entrar no jogo.');

      onEntrar(resultado.data.aluno);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="home-container conta-container">
      <MenuSite onTela={onTela} xp={xp} mostrarPontuacao />
      <section className="conta-painel">
        <p className="home-kicker">CIDADÃO DIGITAL</p>
        <h1>
          {modoRecuperacao === 'solicitar'
            ? 'Recuperar Senha'
            : modoRecuperacao === 'redefinir'
            ? 'Redefinir Senha'
            : cadastro
            ? 'Criar cadastro'
            : 'Entrar no jogo'}
        </h1>

        {modoRecuperacao === 'solicitar' && (
          <form onSubmit={solicitarRecuperacao}>
            <input type="email" name="email" defaultValue={emailRecuperacao} placeholder="Digite seu e-mail cadastrado" aria-label="E-mail" required />
            <button className="home-botao home-botao--principal" type="submit" disabled={enviando}>
              {enviando ? 'SOLICITANDO...' : 'SOLICITAR RECUPERAÇÃO'}
            </button>
            <button type="button" className="link-home" style={{ marginTop: '12px' }} onClick={() => setModoRecuperacao(false)}>
              ← Cancelar e voltar ao login
            </button>
          </form>
        )}

        {modoRecuperacao === 'redefinir' && (
          <form onSubmit={redefinirSenha}>
            <input type="email" name="email" defaultValue={emailRecuperacao} placeholder="Seu e-mail" aria-label="E-mail" required />
            <input type="text" name="token" defaultValue={tokenGerado} placeholder="Código / Token de verificação" aria-label="Código de verificação" required />
            <input type="password" name="nova_senha" placeholder="Digite a nova senha (mínimo 6 caracteres)" aria-label="Nova senha" minLength="6" required />
            <button className="home-botao home-botao--principal" type="submit" disabled={enviando}>
              {enviando ? 'REDEFININDO...' : 'SALVAR NOVA SENHA'}
            </button>
            <button type="button" className="link-home" style={{ marginTop: '12px' }} onClick={() => setModoRecuperacao(false)}>
              ← Cancelar e voltar ao login
            </button>
          </form>
        )}

        {!modoRecuperacao && (
          <form onSubmit={cadastro ? enviarCadastro : enviarLogin}>
            {cadastro && <input type="text" name="nome" placeholder="Nome completo" aria-label="Nome completo" minLength="3" maxLength="120" required />}
            <input type="email" name="email" placeholder="E-mail" aria-label="E-mail" required />
            {cadastro && <input type="tel" name="whatsapp" placeholder="WhatsApp com DDD" aria-label="WhatsApp com DDD" inputMode="tel" required />}
            {cadastro && (
              <input
                type="text"
                name="turma"
                placeholder="Número ou código da turma (ex.: 1 ou CD-4SW2S5)"
                aria-label="Número da turma"
                required
              />
            )}
            <input type="password" name="senha" placeholder="Senha" aria-label="Senha" minLength={cadastro ? "6" : undefined} required />
            <button className="home-botao home-botao--principal" type="submit" disabled={enviando}>
              {enviando ? (cadastro ? 'CADASTRANDO...' : 'ENTRANDO...') : cadastro ? 'CRIAR CADASTRO' : 'ENTRAR'}
            </button>
            {!cadastro && (
              <button
                type="button"
                className="link-home"
                style={{ marginTop: '14px', fontSize: '0.9rem' }}
                onClick={() => { setErro(''); setSucesso(''); setModoRecuperacao('solicitar'); }}
              >
                Esqueceu sua senha?
              </button>
            )}
          </form>
        )}

        {sucesso && <p className="conta-confirmacao">{sucesso}</p>}
        {erro && <p className="conta-erro">{erro}</p>}
        <button className="link-home" onClick={onVoltar}>← Voltar para Home</button>
      </section>
    </main>
  );
}

function VincularTurma({ onTela, xp, onAtualizarAluno }) {
  const { aluno } = useContext(SessaoContext);
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const enviarCodigo = async (evento) => {
    evento.preventDefault();
    if (!aluno) return;

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchWithFallback('turma?acao=vincular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_aluno: aluno.id_aluno,
          codigo_turma: codigo,
        }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível vincular a turma.');

      onAtualizarAluno({
        ...aluno,
        id_turma: resultado.data.turma.id_turma,
        nome_turma: resultado.data.turma.nome_turma,
      });
      setSucesso(`Você entrou na turma "${resultado.data.turma.nome_turma}".`);
      setCodigo('');
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="home-container conta-container">
      <MenuSite onTela={onTela} xp={xp} mostrarPontuacao />
      <section className="conta-painel">
        <p className="home-kicker">CIDADÃO DIGITAL</p>
        <h1>Minha turma</h1>
        {aluno?.nome_turma ? (
          <p className="conta-confirmacao">Você está vinculado à turma "{aluno.nome_turma}".</p>
        ) : (
          <p>Peça o código de acesso ao seu professor e digite abaixo para vincular sua conta à turma.</p>
        )}
        <form onSubmit={enviarCodigo}>
          <input
            type="text"
            name="codigo_turma"
            placeholder="Código da turma (ex.: CD-4SW2S5)"
            aria-label="Código da turma"
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
            minLength="4"
            maxLength="20"
            required
          />
          <button className="home-botao home-botao--principal" type="submit" disabled={enviando}>
            {enviando ? 'VINCULANDO...' : aluno?.nome_turma ? 'TROCAR TURMA' : 'VINCULAR TURMA'}
          </button>
        </form>
        {sucesso && <p className="conta-confirmacao">{sucesso}</p>}
        {erro && <p className="conta-erro">{erro}</p>}
        <button className="link-home" onClick={() => onTela('home')}>← Voltar para Home</button>
      </section>
    </main>
  );
}

function Minigame({ fase, xp, onTela, onProxima, registrarDecisao, enviando }) {
  const [ordem, setOrdem] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const etapas = fase.etapas || [];
  const proximaEtapa = etapas[ordem.length];
  const concluido = ordem.length === etapas.length;

  const selecionarEtapa = (etapa) => {
    if (concluido || enviando) return;
    if (etapa.id !== proximaEtapa.id) {
      setMensagem(`Analise a sequência: a próxima etapa deve ser "${proximaEtapa.titulo}".`);
      return;
    }
    setOrdem((atual) => [...atual, etapa.id]);
    setMensagem(null);
  };

  const finalizar = async () => {
    if (!concluido || enviando) return;
    try {
      await registrarDecisao({
        idFase: fase.id_fase,
        escolha: {
          id_decisao: `fase_${fase.id_fase}_minigame`,
          texto: `Organizou corretamente as etapas de ${fase.titulo}`,
          categoria: etapas[0]?.categoria || 'logica',
          classificacao: 'correta',
          pontos_ganhos: 10,
          feedback: 'Você organizou todas as etapas corretamente.',
        },
      });
    } catch (e) {
      console.warn('Erro ao salvar decisão:', e);
    } finally {
      onProxima(fase.id_fase);
    }
  };

  return (
    <TelaDeJogo onTela={onTela} xp={xp}>
      <main className="desafio-container minigame-container">
        <section className="desafio-painel minigame-painel">
          <p className="home-kicker">🎮 FASE {fase.id_fase} // MINIGAME</p>
          <h1>{fase.titulo}</h1>
          <p className="desafio-pergunta">{fase.instrucao}</p>
          <p className="minigame-progresso">ETAPAS ORGANIZADAS: {ordem.length}/{etapas.length}</p>
          <div className="minigame-etapas">
            {etapas.map((etapa) => {
              const posicao = ordem.indexOf(etapa.id);
              return <button key={etapa.id} className={`minigame-etapa ${posicao >= 0 ? 'minigame-etapa--selecionada' : ''}`} onClick={() => selecionarEtapa(etapa)}><span>{posicao >= 0 ? posicao + 1 : '?'}</span><strong>{etapa.titulo}</strong><small>{etapa.descricao}</small></button>;
            })}
          </div>
          {mensagem && <p className="minigame-mensagem">{mensagem}</p>}
          {concluido && <div className="desafio-feedback feedback-correto"><strong>ALGORITMO ORGANIZADO</strong><p>Você concluiu o minigame. Todas as etapas estão na ordem correta.</p><button className="home-botao home-botao--principal" onClick={finalizar} disabled={enviando}>{enviando ? 'REGISTRANDO...' : 'CONCLUIR FASE'}</button></div>}
        </section>
      </main>
    </TelaDeJogo>
  );
}

function ConteudoDoJogo({ idAluno, autenticado, onEntrar }) {
  const [tela, setTela] = useState('home');
  const [faseAtual, setFaseAtual] = useState(1);
  const { xp, registrarDecisao, enviando } = useGameProgress(idAluno, autenticado);
  const [pontuacaoLinguagens, setPontuacaoLinguagens] = useState(calcularPontuacaoDasLinguagens);
  const xpTotal = {
    ...xp,
    logica: Number(((xp.logica || 0) + pontuacaoLinguagens).toFixed(1)),
  };

  useEffect(() => {
    const atualizarPontuacao = () => setPontuacaoLinguagens(calcularPontuacaoDasLinguagens());

    window.addEventListener('pontuacao-linguagens-atualizada', atualizarPontuacao);
    return () => window.removeEventListener('pontuacao-linguagens-atualizada', atualizarPontuacao);
  }, []);

  useEffect(() => {
    if (!idAluno || !autenticado) return;

    let timer = null;
    const sincronizarComServidor = () => {
      const todasAsTrilhas = {};
      let totalPontos = 0;

      trilhasLinguagens.forEach((trilha) => {
        const prog = carregarProgressoDaTrilha(trilha.id);
        const notasNormalizadas = {};
        let somaTrilha = 0;
        Object.entries(prog.notaPorModulo ?? {}).forEach(([modKey, nota]) => {
          let val = Number(nota) || 0;
          if (val > 0 && val <= 1.0) val = val * 10;
          const normalizado = Number(Math.min(10.0, val).toFixed(1));
          notasNormalizadas[modKey] = normalizado;
          somaTrilha += normalizado;
        });
        totalPontos += somaTrilha;
        if (prog && (Object.keys(prog.notaPorModulo ?? {}).length > 0 || Object.keys(prog.progressoPorModulo ?? {}).length > 0)) {
          todasAsTrilhas[trilha.id] = {
            ...prog,
            notaPorModulo: notasNormalizadas,
          };
        }
      });

      let emailEnvio = '';
      try {
        const sessao = JSON.parse(localStorage.getItem('cidadao-digital:aluno') || '{}');
        emailEnvio = sessao.email || '';
      } catch {}

      fetchWithFallback('progresso?acao=salvar_progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_aluno: idAluno,
          email: emailEnvio,
          acao: 'sincronizar_todas',
          pontuacao_total: Number(totalPontos.toFixed(1)),
          trilhas: todasAsTrilhas,
        }),
      })
        .then((res) => res.json())
        .then((dados) => {
          if (dados?.success) {
            console.log('✓ Pontuação de linguagens sincronizada com sucesso para a professora:', dados);
          }
        })
        .catch((err) => console.warn('⚠️ Erro ao sincronizar pontuação de linguagens:', err));
    };

    // Sincroniza imediatamente na entrada/login
    sincronizarComServidor();

    // Sincroniza quando novas notas de módulos forem geradas
    const handleAtualizacao = () => {
      clearTimeout(timer);
      timer = setTimeout(sincronizarComServidor, 600);
    };

    window.addEventListener('pontuacao-linguagens-atualizada', handleAtualizacao);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pontuacao-linguagens-atualizada', handleAtualizacao);
    };
  }, [idAluno, autenticado]);

  const handleProxima = (faseConcluida) => {
    console.log(`📍 Fase ${faseConcluida} concluída. Total de fases: ${TOTAL_FASES}`);
    // Vai para próxima fase se existir
    if (faseConcluida < TOTAL_FASES) {
      const proxima = faseConcluida + 1;
      console.log(`➡️ Avançando para fase ${proxima}`);
      setFaseAtual(proxima);
    } else {
      // Jogo completo!
      console.log('🎊 JOGO COMPLETO!');
      setFaseAtual('fim');
    }
  };

  const irParaHome = () => setTela('home');

  const fase = getFase(faseAtual);

  if (tela === 'home') return <Home onComecar={() => setTela('jogo')} onTela={setTela} xp={xpTotal} />;
  if (tela === 'cyber-mestre') return <CyberMestre onTela={setTela} xp={xpTotal} />;
  if (tela === 'codigo-enigmatico') return <CodigoEnigmatico onTela={setTela} xp={xpTotal} />;
  if (tela === 'dilemas-eticos') return <DilemasEticos onTela={setTela} xp={xpTotal} />;
  if (tela === 'jogos' || tela === 'desafios') return <Catalogo tipo={tela} onTela={setTela} onComecar={() => setTela('jogo')} xp={xpTotal} />;
  if (tela.startsWith('linguagem-')) return <JogoLinguagem trilhaId={tela.replace('linguagem-', '')} onTela={setTela} xp={xpTotal} idAluno={idAluno} autenticado={autenticado} />;
  if (tela === 'desafio-A' || tela === 'desafio-B' || tela === 'desafio-C') return <DesafioArea area={tela.at(-1)} onTela={setTela} />;
  if (tela === 'sobre') return <Sobre onVoltar={() => setTela('home')} onComecar={() => setTela('jogo')} onTela={setTela} xp={xpTotal} />;
  if (tela === 'contato') return <Contato onTela={setTela} xp={xpTotal} />;
  if (tela === 'login' || tela === 'cadastro') return <Conta tipo={tela} onVoltar={() => setTela('home')} onTela={setTela} xp={xpTotal} onEntrar={(aluno) => { onEntrar(aluno); setTela('home'); }} />;
  if (tela === 'turma') return <VincularTurma onTela={setTela} xp={xpTotal} onAtualizarAluno={onEntrar} />;

  // Renderizar a fase apropriada baseado na mecânica
  if (faseAtual === 'fim') {
    return (
      <TelaDeJogo onTela={setTela} xp={xpTotal}>
        <div className="game-container">
          <div className="menu-fases">
            <h1>🎮 JOGO COMPLETO!</h1>
            <p>Você terminou todas as 20 fases!</p>
            <p>Seu perfil de Cidadão Digital foi calculado.</p>
            <button onClick={() => setFaseAtual(1)}>← Recomeçar</button>
          </div>
        </div>
      </TelaDeJogo>
    );
  }

  if (!fase) {
    return (
      <TelaDeJogo onTela={setTela} xp={xpTotal}>
        <div className="game-container">
          <div className="menu-fases">
            <h1>⚠️ Fase não encontrada</h1>
            <p>Fase {faseAtual} ainda não está implementada.</p>
            <button onClick={() => setFaseAtual(Math.max(1, faseAtual - 1))}>← Voltar</button>
          </div>
        </div>
      </TelaDeJogo>
    );
  }

  // Renderizar baseado no tipo de mecânica
  if (fase.mecanica === 'dilema' || fase.mecanica === 'dilema_chained') {
    return (
      <TelaDeJogo onTela={setTela} xp={xpTotal}>
        <VisualNovelEngine
          idAluno={idAluno}
          faseData={fase}
          onProxima={handleProxima}
          onHome={irParaHome}
          xp={xpTotal}
          registrarDecisao={registrarDecisao}
          enviando={enviando}
        />
      </TelaDeJogo>
    );
  }

  if (fase.mecanica === 'puzzle') {
    return (
      <TelaDeJogo onTela={setTela} xp={xpTotal}>
        <PuzzleRecognition
          idAluno={idAluno}
          faseData={fase}
          onProxima={handleProxima}
          onHome={irParaHome}
          xp={xpTotal}
          registrarDecisao={registrarDecisao}
          enviando={enviando}
        />
      </TelaDeJogo>
    );
  }

  return <Minigame fase={fase} xp={xpTotal} onTela={setTela} onProxima={handleProxima} registrarDecisao={registrarDecisao} enviando={enviando} />;
}

export default function Game({ idAluno = 1 }) {
  const [aluno, setAluno] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cidadao-digital:aluno') || 'null');
    } catch {
      return null;
    }
  });

  const atualizarAluno = (novoAluno) => {
    setAluno(novoAluno);
    if (novoAluno) {
      localStorage.setItem('cidadao-digital:aluno', JSON.stringify(novoAluno));
    } else {
      localStorage.removeItem('cidadao-digital:aluno');
    }
  };

  return (
    <SessaoContext.Provider value={{ aluno, sair: () => atualizarAluno(null) }}>
      <ConteudoDoJogo idAluno={aluno?.id_aluno ?? idAluno} autenticado={Boolean(aluno)} onEntrar={atualizarAluno} />
    </SessaoContext.Provider>
  );
}
