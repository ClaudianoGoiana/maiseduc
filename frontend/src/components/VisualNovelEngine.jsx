import { useEffect, useMemo, useState } from 'react';
import './VisualNovelEngine.css';

const VELOCIDADE_DIGITACAO_MS = 22;

export default function VisualNovelEngine({ 
  idAluno = 1, 
  faseData = null, 
  onProxima = null,
  onHome = null,
  xp = { etica: 0, logica: 0, seguranca: 0 },
  registrarDecisao = null,
  enviando = false
}) {
  const [linhaAtual, setLinhaAtual] = useState(0);
  const [textoVisivel, setTextoVisivel] = useState('');
  const [digitando, setDigitando] = useState(true);
  const [mostrarEscolhas, setMostrarEscolhas] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Se não tiver faseData, retornar vazio (prevenção)
  if (!faseData || !faseData.dialogo || !faseData.escolhas) {
    return <div>Erro ao carregar fase</div>;
  }

  const dialogo = faseData.dialogo;
  const escolhas = faseData.escolhas;
  const fase = faseData;
  const linha = dialogo[linhaAtual];
  const ultimaLinha = linhaAtual === dialogo.length - 1;

  // Efeito "máquina de escrever"
  useEffect(() => {
    if (!linha) return;
    setTextoVisivel('');
    setDigitando(true);
    let i = 0;
    const intervalo = setInterval(() => {
      i += 1;
      setTextoVisivel(linha.texto.slice(0, i));
      if (i >= linha.texto.length) {
        clearInterval(intervalo);
        setDigitando(false);
        if (ultimaLinha) setMostrarEscolhas(true);
      }
    }, VELOCIDADE_DIGITACAO_MS);
    return () => clearInterval(intervalo);
  }, [linhaAtual]); // eslint-disable-line react-hooks/exhaustive-deps

  const avancarDialogo = () => {
    if (digitando) {
      // Clique durante a digitação revela o texto completo instantaneamente
      setTextoVisivel(linha.texto);
      setDigitando(false);
      if (ultimaLinha) setMostrarEscolhas(true);
      return;
    }
    if (!ultimaLinha) {
      setLinhaAtual((atual) => atual + 1);
    }
  };

  const escolher = async (escolha) => {
    if (enviando) return;
    
    // Mostrar feedback IMEDIATAMENTE (não esperar resposta do servidor)
    setFeedback(escolha);
    
    // Tentar registrar no servidor em background (não bloqueia UI)
    if (registrarDecisao) {
      registrarDecisao({ idFase: fase.id_fase, escolha })
        .then(() => {
          console.log('✓ Decisão registrada no servidor');
        })
        .catch((err) => {
          console.warn('⚠️ Erro ao registrar decisão (UI continua funcionando):', err.message);
          // UI já mostrou o feedback, então tudo bem se o servidor falhar
        });
    }
  };

  const irProxima = () => {
    console.log('🎮 Avançando para próxima fase...');
    // Chamar callback para mudar de fase
    if (onProxima) {
      onProxima(fase.id_fase);
    }
  };

  const classeCenario = useMemo(() => `cena cena--${fase.cenario || 'bolha'}`, [fase]);

  return (
    <div className={classeCenario}>
      <header className="hud">
        <span className="hud__item hud__item--total">XP TOTAL: {(xp.etica || 0) + (xp.logica || 0) + (xp.seguranca || 0)}</span>
        <span className="hud__item hud__item--etica">ÉTICA: {xp.etica}</span>
        <span className="hud__item hud__item--logica">LÓGICA: {xp.logica}</span>
        <span className="hud__item hud__item--seguranca">SEGURANÇA: {xp.seguranca}</span>
      </header>

      <div className="cena__overlay-grade" />

      {!feedback ? (
        <div className="caixa-dialogo" onClick={avancarDialogo}>
          <p className="caixa-dialogo__autor">{linha.autor}</p>
          <p className="caixa-dialogo__texto">
            {textoVisivel}
            {digitando && <span className="cursor-piscante">▌</span>}
          </p>
          {!digitando && !ultimaLinha && (
            <span className="caixa-dialogo__dica">clique para continuar ▶</span>
          )}

          {mostrarEscolhas && (
            <div className="escolhas">
              {escolhas.map((escolha) => (
                <button
                  key={escolha.id_decisao}
                  className="botao-decisao"
                  disabled={enviando}
                  onClick={(e) => {
                    e.stopPropagation();
                    escolher(escolha);
                  }}
                >
                  {escolha.texto}
                </button>
              ))}
            </div>
          )}

          {/* Erro já será tratado no componente pai se necessário */}
        </div>
      ) : (
        <div className={`caixa-feedback caixa-feedback--${feedback.classificacao}`}>
          <p className="caixa-feedback__titulo">
            {feedback.classificacao === 'correta' && 'BOLHA HACKEADA'}
            {feedback.classificacao === 'neutra' && 'SEM PROGRESSO'}
            {feedback.classificacao === 'catastrofica' && 'FALHA CRÍTICA'}
          </p>
          <p className="caixa-feedback__texto">{feedback.feedback}</p>
          <p className="caixa-feedback__pontos" style={{ marginTop: '10px', fontWeight: 'bold' }}>
            {feedback.pontos_ganhos > 0 ? `+${feedback.pontos_ganhos} Pontos ganhos!` : (feedback.pontos_ganhos < 0 ? `${feedback.pontos_ganhos} Pontos` : 'Nenhum ponto ganho.')}
          </p>
          <button className="botao-proxima-fase" onClick={irProxima}>
            PRÓXIMA FASE ▶
          </button>
        </div>
      )}
    </div>
  );
}
