import { useEffect, useState } from 'react';
import { fetchWithFallback } from '../utils/api';
import './PerfilAluno.css';

export default function PerfilAluno({ idAluno, faseAlcancada }) {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!idAluno || !faseAlcancada) return;

    fetchWithFallback('progresso?acao=calcular_perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_aluno: idAluno, fase_alcancada: faseAlcancada }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPerfil(data.data);
        } else {
          setErro(data.error || 'Erro ao calcular perfil');
        }
      })
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, [idAluno, faseAlcancada]);

  if (carregando) return <div className="perfil-carregando">Analisando seu perfil...</div>;
  if (erro) return <div className="perfil-erro">{erro}</div>;
  if (!perfil) return null;

  const emoji_map = {
    critico: '🔍',
    etico: '⚖️',
    ativista: '✊',
    hacker: '⚙️',
    engenheiro: '🛠️',
    passivo: '😴',
    pragmatico: '⚡',
    investigador: '🔎',
  };

  const emoji = emoji_map[perfil.tipo_aluno] || '🎮';

  return (
    <div className="perfil-container">
      <section className="perfil-cabecalho">
        <h2>Seu Perfil de Cidadão Digital</h2>
        <div className="perfil-tipo">
          <span className="emoji">{emoji}</span>
          <div>
            <h3>{perfil.descricao}</h3>
            <p className="confianca">Confiança: {perfil.confianca}%</p>
          </div>
        </div>
      </section>

      <section className="perfil-scores">
        <h4>Sua Composição Digital</h4>
        <div className="scores-grid">
          {[
            'critico',
            'etico',
            'ativista',
            'hacker',
            'engenheiro',
            'passivo',
            'pragmatico',
            'investigador',
          ].map((tipo) => (
            <div key={tipo} className="score-item">
              <div className="score-label">{tipo}</div>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{ width: `${perfil.scores[tipo] || 0}%` }}
                />
              </div>
              <div className="score-valor">{perfil.scores[tipo] || 0}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="perfil-recomendacoes">
        <h4>Recomendações para o Seu Desenvolvimento</h4>
        <ul className="recomendacoes-lista">
          {perfil.recomendacoes.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </section>

      <section className="perfil-insights">
        <p className="insight-label">💡 Insight do Sistema</p>
        <p className="insight-texto">
          Baseado em suas escolhas nas fases, você é um <strong>{perfil.descricao}</strong>.
          Isso significa que você tende a {perfil.tipo_aluno === 'critico' ? 'questionar e analisar profundamente'
            : perfil.tipo_aluno === 'etico' ? 'priorizar valores morais'
            : perfil.tipo_aluno === 'ativista' ? 'tomar ação contra injustiças'
            : perfil.tipo_aluno === 'hacker' ? 'explorar como sistemas funcionam'
            : perfil.tipo_aluno === 'engenheiro' ? 'construir soluções práticas'
            : perfil.tipo_aluno === 'investigador' ? 'investigar a fundo'
            : perfil.tipo_aluno === 'passivo' ? 'aceitar o status quo'
            : 'buscar equilíbrio'} no mundo digital.
        </p>
      </section>

      <section className="perfil-professor">
        <p className="professor-nota">
          📊 Seu professor receberá um relatório detalhado sobre seu estilo de
          aprendizagem e poderá personalizar futuras atividades.
        </p>
      </section>
    </div>
  );
}
