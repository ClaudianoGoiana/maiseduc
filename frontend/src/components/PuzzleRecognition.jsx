import { useState } from 'react';
import './PuzzleRecognition.css';

/**
 * PuzzleRecognition.jsx
 * Renderiza puzzles de identificação (Verdadeiro/Falso)
 */
export default function PuzzleRecognition({ 
  idAluno = 1, 
  faseData = null, 
  onProxima = null,
  onHome = null,
  xp = { etica: 0, logica: 0, seguranca: 0 },
  registrarDecisao = null,
  enviando = false
}) {
  const [selecionadas, setSelecionadas] = useState(new Set());
  const [respondido, setRespondido] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [acertos, setAcertos] = useState(0);

  if (!faseData || !faseData.manchetes) {
    return <div>Erro ao carregar fase</div>;
  }

  const fase = faseData;
  const manchetes = fase.manchetes;
  const meta = fase.meta || 5;

  const toggle = (id) => {
    if (respondido) return; // Não permite mudar após responder
    const novo = new Set(selecionadas);
    if (novo.has(id)) {
      novo.delete(id);
    } else {
      novo.add(id);
    }
    setSelecionadas(novo);
  };

  const verificar = async () => {
    if (enviando) return;
    
    let count = 0;
    for (const id of selecionadas) {
      const m = manchetes.find(x => x.id === id);
      if (m && m.falsa) count++;
    }

    const acertou = count >= meta;
    const classificacao = acertou ? 'correta' : 'catastrofica';
    const pontos = acertou ? 10 : 0;

    try {
      // Salvar decisão - criar objeto escolha no formato esperado
      await registrarDecisao({
        idFase: fase.id_fase,
        escolha: {
          id_decisao: `puzzle_${fase.id_fase}_${count}_falsas`,
          texto: `Identificou ${count} manchetes falsas`,
          categoria: 'logica',
          classificacao: classificacao,
          pontos_ganhos: pontos,
          feedback: acertou 
            ? `✓ EXCELENTE! Você identificou ${count}/${manchetes.filter(m => m.falsa).length} manchetes falsas!`
            : `✗ Você identificou ${count}/${manchetes.filter(m => m.falsa).length} falsas. Precisa de ${meta}.`
        }
      });
    } catch (erro) {
      console.error('Erro ao salvar decisão:', erro);
    }

    // Atualizar estado independentemente do resultado do servidor
    setResultado({
      classificacao,
      mensagem: acertou
        ? `✓ EXCELENTE! Você identificou ${count}/${manchetes.filter(m => m.falsa).length} manchetes falsas!`
        : `✗ Você identificou ${count}/${manchetes.filter(m => m.falsa).length} falsas. Precisa de ${meta}.`
    });
    setAcertos(count);
    setRespondido(true);
  };

  const irProxima = () => {
    if (onProxima) {
      onProxima(fase.id_fase);
    }
  };

  return (
    <div className="puzzle-container">
      <header className="hud">
        <span className="hud__item hud__item--total">XP TOTAL: {(xp.etica || 0) + (xp.logica || 0) + (xp.seguranca || 0)}</span>
        <span className="hud__item hud__item--etica">ÉTICA: {xp.etica}</span>
        <span className="hud__item hud__item--logica">LÓGICA: {xp.logica}</span>
        <span className="hud__item hud__item--seguranca">SEGURANÇA: {xp.seguranca}</span>
      </header>

      <div className="puzzle-conteudo">
        <h2 className="puzzle-titulo">🔍 {fase.titulo.toUpperCase()}</h2>
        <p className="puzzle-instrucao">
          {fase.instrucao}
        </p>

        <div className="manchetes-grid">
          {manchetes.map(m => (
            <div
              key={m.id}
              className={`manchete ${selecionadas.has(m.id) ? 'selecionada' : ''} ${respondido ? (m.falsa ? 'falsa' : 'verdadeira') : ''}`}
              onClick={() => toggle(m.id)}
            >
              <p className="manchete-numero">#{m.id}</p>
              <p className="manchete-titulo">{m.titulo}</p>
              {respondido && (
                <p className="manchete-resultado">
                  {m.falsa ? '❌ FALSO' : '✓ VERDADEIRO'}
                </p>
              )}
            </div>
          ))}
        </div>

        {!respondido ? (
          <button 
            className="botao-verificar" 
            onClick={verificar}
            disabled={enviando || selecionadas.size === 0}
          >
            {enviando ? 'Verificando...' : `Verificar (${selecionadas.size} selecionadas)`}
          </button>
        ) : (
          <div className={`resultado ${resultado.classificacao}`}>
            <p className="resultado-titulo">
              {resultado.classificacao === 'correta' ? '✓ PUZZLE RESOLVIDO' : '✗ PUZZLE FALHOU'}
            </p>
            <p className="resultado-texto">{resultado.mensagem}</p>
            <button className="botao-proxima-fase" onClick={irProxima}>
              PRÓXIMA FASE ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
