import { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// Subdomínio de produção do backend Laravel; sobrescrevível via VITE_API_URL (ex.: build de staging)
const PRODUCTION_API_URL = 'https://api.resetprint.com.br';

const getApiCandidates = (endpoint) => {
  const path = String(endpoint || '').replace(/^\/+/, '');
  const cleanPath = path.replace(/^api\//, '');

  const isDev = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const baseUrl = import.meta.env?.VITE_API_URL
    || (isDev ? 'http://localhost:8000' : PRODUCTION_API_URL);

  return [`${baseUrl}/api/${cleanPath}`];
};

async function fetchWithFallback(endpoint, options = {}) {
  const candidates = getApiCandidates(endpoint);
  let lastResponse = null;
  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 404) {
        return response;
      }
      lastResponse = response;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error('Servidor não encontrado (HTTP 404). Verifique se a API Laravel está no ar.');
}

const formatarXp = (valor) => {
  const num = Number(valor || 0);
  return num % 1 === 0 ? String(num) : num.toFixed(1);
};

function Login({ onEntrar }) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false); // false, 'solicitar', 'redefinir'
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [tokenGerado, setTokenGerado] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const nome = dados.get('nome');
    const escola = dados.get('escola');
    const email = dados.get('email');
    const senha = dados.get('senha');

    setErro('');
    setSucesso('');
    setEnviando(true);

    try {
      const endpoint = modoCadastro ? 'professor?acao=cadastro' : 'professor?acao=login';
      const corpo = modoCadastro
        ? { nome, email, escola, senha }
        : { email, senha };

      const resposta = await fetchWithFallback(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });

      const textoResposta = await resposta.text();
      let resultado = {};
      try {
        resultado = JSON.parse(textoResposta);
      } catch (e) {
        resultado = {
          error: `Erro no servidor (HTTP ${resposta.status}): ${textoResposta.replace(/<[^>]*>?/gm, '').trim().substring(0, 150)}`,
        };
      }

      if (!resposta.ok) {
        const msg =
          resultado.error ||
          resultado.message ||
          (modoCadastro
            ? `Não foi possível concluir o cadastro (HTTP ${resposta.status}).`
            : `E-mail ou senha incorretos (HTTP ${resposta.status}).`);
        throw new Error(msg);
      }

      localStorage.setItem('professor_sessao', JSON.stringify(resultado.data.professor));
      onEntrar(resultado.data.professor);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

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

  async function solicitarRecuperacao(evento) {
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
        body: JSON.stringify({ email: emailInput, tipo: 'professor' }),
      });
      const texto = await resposta.text();
      let resultado = {};
      try { resultado = JSON.parse(texto); } catch { resultado = { error: `Erro no servidor (HTTP ${resposta.status}): ${texto.replace(/<[^>]*>?/gm, '').trim().substring(0, 150)}` }; }
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível solicitar a recuperação.');

      setEmailRecuperacao(emailInput);
      setSucesso(resultado.data?.mensagem || 'Um e-mail com o link de recuperação foi enviado para ' + emailInput + '. Verifique sua caixa de entrada.');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function redefinirSenha(evento) {
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
          tipo: 'professor',
        }),
      });
      const texto = await resposta.text();
      let resultado = {};
      try { resultado = JSON.parse(texto); } catch { resultado = { error: `Erro no servidor (HTTP ${resposta.status}): ${texto.replace(/<[^>]*>?/gm, '').trim().substring(0, 150)}` }; }
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível redefinir a senha.');

      setSucesso(resultado.data?.mensagem || 'Senha redefinida com sucesso! Faça o login.');
      setModoRecuperacao(false);
      setModoCadastro(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="acesso">
      <section className="acesso__marca">
        <span>◈</span>
        <p>CIDADAO<br /><strong>DIGITAL</strong></p>
      </section>
      <section className="acesso__painel">
        <p className="kicker">PORTAL PEDAGOGICO</p>
        <h1>
          {modoRecuperacao === 'solicitar' && 'Recuperar Senha'}
          {modoRecuperacao === 'redefinir' && 'Criar Nova Senha'}
          {!modoRecuperacao && (modoCadastro ? 'Crie sua conta de professor' : 'Acompanhe sua turma')}
        </h1>
        <p className="acesso__texto">
          {modoRecuperacao === 'solicitar' && 'Informe o seu e-mail cadastrado para gerar o código de recuperação.'}
          {modoRecuperacao === 'redefinir' && 'Cole o código recebido por e-mail ou gerado pelo sistema e defina sua nova senha.'}
          {!modoRecuperacao && (modoCadastro
            ? 'Comece a organizar suas turmas e acompanhar o desenvolvimento dos alunos.'
            : 'Entre para consultar o progresso e as atividades dos seus alunos.')}
        </p>

        {modoRecuperacao === 'solicitar' ? (
          <form onSubmit={solicitarRecuperacao}>
            <input name="email" type="email" placeholder="E-mail cadastrado" autoComplete="email" required />
            <button type="submit" disabled={enviando}>
              {enviando ? 'ENVIANDO CÓDIGO...' : 'GERAR CÓDIGO DE RECUPERAÇÃO'}
            </button>
          </form>
        ) : modoRecuperacao === 'redefinir' ? (
          <form onSubmit={redefinirSenha}>
            <input name="email" type="email" defaultValue={emailRecuperacao} placeholder="E-mail cadastrado" required />
            <input name="token" defaultValue={tokenGerado} placeholder="Código / Token de recuperação (64 caracteres)" required />
            <input name="nova_senha" type="password" placeholder="Nova senha (mínimo 8 caracteres)" minLength={8} required />
            <button type="submit" disabled={enviando}>
              {enviando ? 'REDEFININDO SENHA...' : 'SALVAR NOVA SENHA'}
            </button>
          </form>
        ) : (
          <form onSubmit={enviar}>
            {modoCadastro && <input name="nome" placeholder="Nome completo" autoComplete="name" required />}
            {modoCadastro && <input name="escola" placeholder="Escola / Instituição" autoComplete="organization" />}
            <input name="email" type="email" placeholder="E-mail institucional" autoComplete="email" required />
            <input
              name="senha"
              type="password"
              placeholder="Senha (mínimo 8 caracteres)"
              autoComplete={modoCadastro ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
            <button type="submit" disabled={enviando}>
              {enviando ? (modoCadastro ? 'CRIANDO CONTA...' : 'ENTRANDO...') : (modoCadastro ? 'CRIAR CONTA' : 'ENTRAR NO PORTAL')}
            </button>
          </form>
        )}

        {sucesso && <p className="sucesso">{sucesso}</p>}
        {erro && <p className="erro">{erro}</p>}

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {modoRecuperacao ? (
            <button className="link" onClick={() => { setModoRecuperacao(false); setErro(''); setSucesso(''); }}>
              ← Voltar ao login
            </button>
          ) : (
            <>
              <button className="link" onClick={() => { setModoCadastro(!modoCadastro); setErro(''); setSucesso(''); }}>
                {modoCadastro ? 'Já tenho uma conta (Entrar)' : 'Criar cadastro de professor'}
              </button>
              {!modoCadastro && (
                <button className="link" onClick={() => { setModoRecuperacao('solicitar'); setErro(''); setSucesso(''); }}>
                  Esqueceu sua senha?
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Painel({ professor, onSair }) {
  const [aba, setAba] = useState('Visao geral');
  const [turma, setTurma] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviandoTurma, setEnviandoTurma] = useState(false);
  const [erroTurma, setErroTurma] = useState('');
  const [sucessoTurma, setSucessoTurma] = useState('');
  const [excluindoId, setExcluindoId] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  
  // Filtros de Alunos e Relatórios
  const [filtroTurmaAluno, setFiltroTurmaAluno] = useState('todas');
  const [buscaAluno, setBuscaAluno] = useState('');
  const [filtroTurmaRelatorio, setFiltroTurmaRelatorio] = useState('todas');

  // Carrega turmas e alunos
  async function carregarDados() {
    if (!professor?.id_professor) return;
    try {
      setCarregando(true);
      const [resTurmas, resAlunos] = await Promise.all([
        fetchWithFallback(`turma?acao=listar&id_professor=${professor.id_professor}`),
        fetchWithFallback(`aluno?acao=listar&id_professor=${professor.id_professor}`),
      ]);

      const [envelopeTurmas, envelopeAlunos] = await Promise.all([
        resTurmas.json().catch(() => ({ data: { turmas: [] } })),
        resAlunos.json().catch(() => ({ data: { alunos: [] } })),
      ]);

      const dadosTurmas = envelopeTurmas?.data ?? {};
      const dadosAlunos = envelopeAlunos?.data ?? {};

      if (Array.isArray(dadosTurmas.turmas)) {
        setTurmas(dadosTurmas.turmas);
      }
      if (Array.isArray(dadosAlunos.alunos)) {
        setAlunos(dadosAlunos.alunos);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do professor:', err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [professor?.id_professor]);

  // Criação de nova turma
  async function criarTurma(evento) {
    evento.preventDefault();
    const nome = turma.trim();
    if (!nome) return;

    setErroTurma('');
    setSucessoTurma('');
    setEnviandoTurma(true);

    try {
      const resposta = await fetchWithFallback('turma?acao=criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_professor: professor.id_professor,
          nome_turma: nome,
        }),
      });

      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        throw new Error(resultado.error || 'Não foi possível criar a turma.');
      }

      setTurmas((atual) => [resultado.data.turma, ...atual]);
      setTurma('');
      setSucessoTurma(`Turma "${resultado.data.turma.nome}" criada com sucesso! Código: ${resultado.data.turma.codigo}`);
      setTimeout(() => setSucessoTurma(''), 5000);
    } catch (err) {
      setErroTurma(err.message);
    } finally {
      setEnviandoTurma(false);
    }
  }

  // Exclusão de turma
  async function excluirTurma(idTurma, nomeTurma) {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir a turma "${nomeTurma}"? Os alunos vinculados continuarão cadastrados, mas ficarão sem turma.`);
    if (!confirmacao) return;

    setExcluindoId(idTurma);
    try {
      const resposta = await fetchWithFallback('turma?acao=excluir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_professor: professor.id_professor,
          id_turma: idTurma,
        }),
      });

      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        if (resposta.status === 404) {
          throw new Error('O endpoint da API (/api/turma?acao=excluir) não foi encontrado no servidor. Envie os novos arquivos da pasta backend/api/ para a sua hospedagem.');
        }
        throw new Error(resultado.error || `Erro ${resposta.status}: Não foi possível excluir a turma.`);
      }

      setTurmas((atual) => atual.filter((t) => t.id_turma !== idTurma));
      // Atualiza também os alunos locais
      setAlunos((atual) => atual.filter((a) => a.id_turma !== idTurma));
      setSucessoTurma(`Turma "${nomeTurma}" excluída com sucesso.`);
      setTimeout(() => setSucessoTurma(''), 4000);
    } catch (err) {
      alert(`Aviso: ${err.message}`);
    } finally {
      setExcluindoId(null);
    }
  }

  // Copiar código da turma
  function copiarCodigo(codigo, id) {
    navigator.clipboard.writeText(codigo);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2500);
  }

  // Alunos Filtrados para a aba Alunos
  const alunosFiltrados = useMemo(() => {
    return alunos.filter((a) => {
      const matchTurma = filtroTurmaAluno === 'todas' || String(a.id_turma) === String(filtroTurmaAluno);
      const termo = buscaAluno.toLowerCase();
      const matchBusca = !termo || a.nome.toLowerCase().includes(termo) || a.email.toLowerCase().includes(termo);
      return matchTurma && matchBusca;
    });
  }, [alunos, filtroTurmaAluno, buscaAluno]);

  // Alunos Filtrados para Relatórios
  const alunosRelatorio = useMemo(() => {
    return alunos.filter((a) => {
      return filtroTurmaRelatorio === 'todas' || String(a.id_turma) === String(filtroTurmaRelatorio);
    });
  }, [alunos, filtroTurmaRelatorio]);

  // Estatísticas calculadas para os Relatórios
  const statsRelatorio = useMemo(() => {
    const total = alunosRelatorio.length;
    if (total === 0) {
      return { total: 0, mediaEtica: 0, mediaLogica: 0, mediaSeguranca: 0, mediaLinguagens: 0, mediaTotal: 0 };
    }
    const somaEtica = alunosRelatorio.reduce((acc, a) => acc + (a.xp_etica || 0), 0);
    const somaLogica = alunosRelatorio.reduce((acc, a) => acc + (a.xp_logica || 0), 0);
    const somaSeguranca = alunosRelatorio.reduce((acc, a) => acc + (a.xp_seguranca || 0), 0);
    const somaLinguagens = alunosRelatorio.reduce((acc, a) => acc + (a.xp_linguagens || 0), 0);
    const somaTotal = alunosRelatorio.reduce((acc, a) => acc + (a.xp_total || 0), 0);

    return {
      total,
      mediaEtica: Number((somaEtica / total).toFixed(1)),
      mediaLogica: Number((somaLogica / total).toFixed(1)),
      mediaSeguranca: Number((somaSeguranca / total).toFixed(1)),
      mediaLinguagens: Number((somaLinguagens / total).toFixed(1)),
      mediaTotal: Number((somaTotal / total).toFixed(1)),
    };
  }, [alunosRelatorio]);

  // Exportar Relatório em CSV
  function exportarCsv() {
    if (alunosRelatorio.length === 0) {
      alert('Nenhum aluno encontrado para exportar.');
      return;
    }

    const cabecalho = ['ID Aluno', 'Nome do Aluno', 'E-mail', 'WhatsApp', 'Turma', 'Código Turma', 'XP Ética', 'XP Lógica', 'XP Segurança', 'XP Linguagens', 'XP Total', 'Nível', 'Cadastrado em'];
    const linhas = alunosRelatorio.map((a) => [
      a.id_aluno,
      `"${(a.nome || '').replace(/"/g, '""')}"`,
      `"${a.email || ''}"`,
      `"${a.whatsapp || ''}"`,
      `"${(a.nome_turma || 'Sem Turma').replace(/"/g, '""')}"`,
      `"${a.codigo_acesso || ''}"`,
      formatarXp(a.xp_etica),
      formatarXp(a.xp_logica),
      formatarXp(a.xp_seguranca),
      formatarXp(a.xp_linguagens),
      formatarXp(a.xp_total),
      a.nivel || 1,
      `"${a.criado_em || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nomeArquivo = `Relatorio_Turma_${filtroTurmaRelatorio === 'todas' ? 'Geral' : filtroTurmaRelatorio}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Imprimir Relatório
  function imprimirRelatorio() {
    window.print();
  }

  // Métricas gerais do topo
  const totalAlunosGeral = turmas.reduce((acc, t) => acc + (Number(t.total_alunos) || 0), 0) || alunos.length;
  // Média calculada direto sobre os alunos (evita "média de médias" quando há várias turmas de tamanhos diferentes)
  const mediaGeral = alunos.length > 0
    ? formatarXp(alunos.reduce((acc, a) => acc + (Number(a.xp_total) || 0), 0) / alunos.length)
    : '0';

  const metricasDinamicas = [
    ['Turmas ativas', String(turmas.length), turmas.length > 0 ? 'Turmas cadastradas' : 'Crie sua primeira turma'],
    ['Alunos vinculados', String(totalAlunosGeral), totalAlunosGeral > 0 ? 'Alunos ativos nas turmas' : 'Aguardando convites'],
    ['Média de XP', `${mediaGeral} pts`, 'Ética, lógica, linguagens e segurança'],
    ['Total de cadastros', `${alunos.length}`, 'Alunos no painel'],
  ];

  return (
    <main className="portal">
      <aside className="sidebar">
        <div className="marca">
          <span>◈</span>
          <p>CIDADAO<br /><strong>DIGITAL</strong></p>
        </div>
        <p className="sidebar__rotulo">MENU DO PROFESSOR</p>
        {['Visao geral', 'Turmas', 'Alunos', 'Relatorios'].map((item) => (
          <button key={item} className={aba === item ? 'ativo' : ''} onClick={() => setAba(item)}>
            {item === 'Visao geral' ? 'Visão Geral' : item === 'Relatorios' ? 'Relatórios' : item}
          </button>
        ))}
        <button className="sidebar__sair" onClick={onSair}>Sair do portal</button>
      </aside>

      <section className="conteudo">
        <header className="topo">
          <div>
            <p className="kicker">{aba === 'Relatorios' ? 'RELATÓRIOS PEDAGÓGICOS' : aba.toUpperCase()}</p>
            <h1>{aba === 'Visao geral' ? 'Olá, ' : ''}{professor.nome}</h1>
          </div>
          <div className="professor">
            <span>{professor.nome ? professor.nome.slice(0, 1).toUpperCase() : 'P'}</span>
            <p>{professor.nome}<small>{professor.escola || 'Professor(a)'}</small></p>
          </div>
        </header>

        {/* ABA: VISÃO GERAL */}
        {aba === 'Visao geral' && (
          <>
            <div className="metricas">
              {metricasDinamicas.map(([titulo, valor, detalhe]) => (
                <article key={titulo}>
                  <p>{titulo}</p>
                  <strong>{valor}</strong>
                  <small>{detalhe}</small>
                </article>
              ))}
            </div>

            {turmas.length === 0 ? (
              <section className="bloco vazio">
                <p className="kicker">ATIVIDADE RECENTE</p>
                <h2>Nenhuma turma criada ainda</h2>
                <p>Crie sua primeira turma, compartilhe o código de acesso com seus alunos e acompanhe as decisões, missões e pontuações em tempo real.</p>
                <button onClick={() => setAba('Turmas')}>CRIAR PRIMEIRA TURMA</button>
              </section>
            ) : (
              <section className="bloco">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <p className="kicker" style={{ margin: 0 }}>TURMAS EM ANDAMENTO</p>
                    <h2 style={{ margin: '4px 0 0' }}>Visão rápida das turmas</h2>
                  </div>
                  <button className="botao-secundario" onClick={() => setAba('Turmas')}>Gerenciar Turmas</button>
                </div>
                <div className="lista-turmas">
                  {turmas.map((item) => (
                    <article key={item.id_turma || item.codigo}>
                      <div>
                        <strong>{item.nome}</strong>
                        <small>{item.total_alunos || 0} alunos vinculados // Média: {item.media_pontuacao || 0} pts</small>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <code title="Código de acesso da turma">{item.codigo}</code>
                        <button 
                          className="botao-icone" 
                          title="Copiar código de acesso" 
                          onClick={() => copiarCodigo(item.codigo, item.id_turma)}
                        >
                          {copiadoId === item.id_turma ? '✓ Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ABA: TURMAS */}
        {aba === 'Turmas' && (
          <section className="bloco">
            <p className="kicker">GERENCIAR TURMAS</p>
            <h2>Crie e Organize suas Turmas</h2>
            <p>Os alunos usam o <strong>código de acesso</strong> para se vincular à sua turma durante o cadastro ou no perfil.</p>
            
            <form className="criar-turma" onSubmit={criarTurma}>
              <input
                value={turma}
                onChange={(evento) => setTurma(evento.target.value)}
                placeholder="Ex.: 9º ano B - Informática / Matutino"
                required
              />
              <button type="submit" disabled={enviandoTurma}>
                {enviandoTurma ? 'CRIANDO...' : '+ CRIAR TURMA'}
              </button>
            </form>

            {erroTurma && <p className="erro" style={{ marginTop: '14px' }}>{erroTurma}</p>}
            {sucessoTurma && <p className="sucesso" style={{ marginTop: '14px' }}>{sucessoTurma}</p>}

            <h3 style={{ marginTop: '36px', marginBottom: '14px', fontSize: '1.2rem' }}>Turmas Ativas ({turmas.length})</h3>

            {carregando ? (
              <p className="sem-dados">Carregando turmas...</p>
            ) : turmas.length === 0 ? (
              <p className="sem-dados">Nenhuma turma cadastrada. Crie uma turma no campo acima.</p>
            ) : (
              <div className="lista-turmas">
                {turmas.map((item) => (
                  <article key={item.id_turma || item.codigo} className="turma-card">
                    <div className="turma-detalhes">
                      <strong>{item.nome}</strong>
                      <small>
                        👥 {item.total_alunos || 0} alunos vinculados &nbsp;|&nbsp; 
                        ⭐ Média: {item.media_pontuacao || 0} pts &nbsp;|&nbsp; 
                        📅 Criada em: {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : 'Hoje'}
                      </small>
                    </div>
                    
                    <div className="turma-acoes">
                      <code title="Código de acesso">{item.codigo}</code>
                      <button 
                        className="botao-icone" 
                        title="Copiar código de acesso" 
                        onClick={() => copiarCodigo(item.codigo, item.id_turma)}
                      >
                        {copiadoId === item.id_turma ? '✓ Copiado!' : 'Copiar Código'}
                      </button>
                      <button 
                        className="botao-relatorio-link" 
                        onClick={() => { setFiltroTurmaRelatorio(String(item.id_turma)); setAba('Relatorios'); }}
                      >
                        📊 Relatório
                      </button>
                      <button 
                        className="botao-excluir" 
                        disabled={excluindoId === item.id_turma}
                        onClick={() => excluirTurma(item.id_turma, item.nome)}
                        title="Excluir turma"
                      >
                        {excluindoId === item.id_turma ? 'Excluindo...' : '🗑️ Excluir'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ABA: ALUNOS */}
        {aba === 'Alunos' && (
          <section className="bloco">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p className="kicker">ALUNOS VINCULADOS</p>
                <h2 style={{ margin: 0 }}>Acompanhamento Individual</h2>
              </div>

              {/* Filtros */}
              <div className="filtros-container">
                <select 
                  className="select-filtro" 
                  value={filtroTurmaAluno} 
                  onChange={(e) => setFiltroTurmaAluno(e.target.value)}
                >
                  <option value="todas">Todas as Turmas ({alunos.length})</option>
                  {turmas.map((t) => (
                    <option key={t.id_turma} value={String(t.id_turma)}>
                      {t.nome} ({alunos.filter((a) => String(a.id_turma) === String(t.id_turma)).length})
                    </option>
                  ))}
                </select>

                <input 
                  className="input-busca" 
                  placeholder="Buscar por nome ou email..." 
                  value={buscaAluno} 
                  onChange={(e) => setBuscaAluno(e.target.value)} 
                />
              </div>
            </div>

            {carregando ? (
              <p className="sem-dados">Carregando alunos...</p>
            ) : alunosFiltrados.length === 0 ? (
              <div className="bloco vazio" style={{ padding: '24px 0', border: 'none', background: 'transparent' }}>
                <p>Nenhum aluno encontrado {buscaAluno || filtroTurmaAluno !== 'todas' ? 'com os filtros aplicados.' : 'no momento. Compartilhe o código da turma com seus alunos.'}</p>
              </div>
            ) : (
              <div className="lista-alunos" style={{ marginTop: '24px' }}>
                {alunosFiltrados.map((a) => (
                  <article key={a.id_aluno} className="aluno-card">
                    <div className="aluno-info">
                      <strong>{a.nome}</strong>
                      <small>
                        ✉️ {a.email} 
                        {a.whatsapp && (
                          <a 
                            href={`https://wa.me/55${a.whatsapp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ marginLeft: '10px', color: '#25D366', textDecoration: 'none' }}
                          >
                            💬 WhatsApp ({a.whatsapp})
                          </a>
                        )}
                      </small>
                      <div className="pilares-xp-badges">
                        <span className="badge-pilar etica">Ética: {formatarXp(a.xp_etica)} XP</span>
                        <span className="badge-pilar logica">Lógica: {formatarXp(a.xp_logica)} XP</span>
                        <span className="badge-pilar seguranca">Segurança: {formatarXp(a.xp_seguranca)} XP</span>
                        {Number(a.xp_linguagens || 0) > 0 && (
                          <span className="badge-pilar linguagens">Linguagens: {formatarXp(a.xp_linguagens)} XP</span>
                        )}
                      </div>
                    </div>
                    <div className="aluno-stats">
                      <span className="aluno-turma">{a.nome_turma || 'Sem Turma'}</span>
                      <span 
                        className="aluno-xp" 
                        title={`Pontuação Total: ${formatarXp(a.xp_total)} XP`}
                      >
                        {formatarXp(a.xp_total)} XP
                      </span>
                      <small>Nível {a.nivel || 1}</small>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ABA: RELATÓRIOS */}
        {aba === 'Relatorios' && (
          <section className="bloco relatorio-imprimivel">
            <div className="relatorio-cabecalho">
              <div>
                <p className="kicker">RELATÓRIOS PEDAGÓGICOS</p>
                <h2>Desempenho e Indicadores BNCC</h2>
                <p style={{ margin: '4px 0 0', color: '#9db4c0' }}>
                  Escola: <strong>{professor.escola || 'Instituição de Ensino'}</strong> &nbsp;|&nbsp; 
                  Professor(a): <strong>{professor.nome}</strong> &nbsp;|&nbsp; 
                  Emissão: {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Ações do Relatório */}
              <div className="relatorio-acoes no-print">
                <select 
                  className="select-filtro" 
                  value={filtroTurmaRelatorio} 
                  onChange={(e) => setFiltroTurmaRelatorio(e.target.value)}
                >
                  <option value="todas">Todas as Turmas (Consolidado Geral)</option>
                  {turmas.map((t) => (
                    <option key={t.id_turma} value={String(t.id_turma)}>
                      Turma: {t.nome}
                    </option>
                  ))}
                </select>

                <button className="botao-acao exportar" onClick={exportarCsv} title="Baixar dados em planilha Excel / CSV">
                  📥 Exportar CSV
                </button>
                <button className="botao-acao imprimir" onClick={imprimirRelatorio} title="Imprimir ou Salvar em PDF">
                  🖨️ Imprimir / PDF
                </button>
              </div>
            </div>

            {/* Cards de Métricas do Relatório */}
            <div className="relatorio-metricas-grid">
              <div className="relatorio-card-stat">
                <span className="stat-label">Total de Alunos</span>
                <strong className="stat-value">{statsRelatorio.total}</strong>
                <small className="stat-desc">Alunos avaliados</small>
              </div>
              <div className="relatorio-card-stat etica-border">
                <span className="stat-label">Média Ética Digital</span>
                <strong className="stat-value">{statsRelatorio.mediaEtica} pts</strong>
                <small className="stat-desc">Cidadania e reflexão</small>
              </div>
              <div className="relatorio-card-stat logica-border">
                <span className="stat-label">Média Pensamento Lógico</span>
                <strong className="stat-value">{statsRelatorio.mediaLogica} pts</strong>
                <small className="stat-desc">Resolução de problemas</small>
              </div>
              <div className="relatorio-card-stat seguranca-border">
                <span className="stat-label">Média Segurança Digital</span>
                <strong className="stat-value">{statsRelatorio.mediaSeguranca} pts</strong>
                <small className="stat-desc">Proteção de dados e senhas</small>
              </div>
              <div className="relatorio-card-stat total-border">
                <span className="stat-label">Média Geral da Turma</span>
                <strong className="stat-value">{statsRelatorio.mediaTotal} pts</strong>
                <small className="stat-desc">Score geral consolidado</small>
              </div>
            </div>

            {/* Tabela Detalhada do Relatório */}
            <h3 style={{ marginTop: '36px', marginBottom: '16px', fontSize: '1.25rem' }}>
              Quadro de Desempenho dos Alunos ({alunosRelatorio.length})
            </h3>

            {alunosRelatorio.length === 0 ? (
              <p className="sem-dados">Nenhum aluno vinculado à turma selecionada para exibição de relatório.</p>
            ) : (
              <div className="tabela-container">
                <table className="tabela-relatorio">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Turma</th>
                      <th>Ética</th>
                      <th>Lógica</th>
                      <th>Segurança</th>
                      <th>Linguagens</th>
                      <th>XP Total</th>
                      <th>Nível</th>
                      <th>Classificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunosRelatorio.map((aluno) => {
                      const total = Number(aluno.xp_total || 0);
                      let status = 'Iniciante';
                      let statusClasse = 'badge-iniciante';
                      if (total >= 100) {
                        status = 'Cidadão Digital Pleno';
                        statusClasse = 'badge-pleno';
                      } else if (total >= 40) {
                        status = 'Em Evolução';
                        statusClasse = 'badge-evolucao';
                      }

                      return (
                        <tr key={aluno.id_aluno}>
                          <td>
                            <strong>{aluno.nome}</strong>
                            <small style={{ display: 'block', color: '#829ba8', fontSize: '0.78rem' }}>{aluno.email}</small>
                          </td>
                          <td>{aluno.nome_turma || 'Sem Turma'}</td>
                          <td className="col-num">{formatarXp(aluno.xp_etica)}</td>
                          <td className="col-num">{formatarXp(aluno.xp_logica)}</td>
                          <td className="col-num">{formatarXp(aluno.xp_seguranca)}</td>
                          <td className="col-num">{formatarXp(aluno.xp_linguagens)}</td>
                          <td className="col-num xp-destaque">{formatarXp(aluno.xp_total)} XP</td>
                          <td style={{ textAlign: 'center' }}>{aluno.nivel || 1}</td>
                          <td>
                            <span className={`status-badge ${statusClasse}`}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

function App() {
  const [professor, setProfessor] = useState(() => {
    try {
      const salvo = localStorage.getItem('professor_sessao');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const handleSair = () => {
    localStorage.removeItem('professor_sessao');
    setProfessor(null);
  };

  return professor ? (
    <Painel professor={professor} onSair={handleSair} />
  ) : (
    <Login onEntrar={setProfessor} />
  );
}

createRoot(document.getElementById('root')).render(<App />);