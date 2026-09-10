import { useCallback, useState, useEffect } from 'react';
import { fetchWithFallback } from '../utils/api';

const CATEGORIAS = ['etica', 'logica', 'seguranca'];

function calcularPontosPorCategoria(escolha) {
  const pontos = Number(escolha.pontos_ganhos) || 0;
  const apoio = escolha.classificacao === 'correta' ? 5 : escolha.classificacao === 'neutra' ? 2 : -5;

  return CATEGORIAS.reduce((resultado, categoria) => {
    resultado[categoria] = categoria === escolha.categoria ? pontos : apoio;
    return resultado;
  }, {});
}

/**
 * Hook responsável pelo estado de progresso do jogador (XP por categoria)
 * e pela persistência das decisões narrativas no back-end PHP.
 */
export function useGameProgress(idAluno, autenticado = false, emailAluno = '') {
  const [xp, setXp] = useState({ etica: 0, logica: 0, seguranca: 0 });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  // Buscar XP inicial do servidor
  useEffect(() => {
    if (!idAluno || !autenticado) {
      setXp({ etica: 0, logica: 0, seguranca: 0 });
      console.log('⚠️ idAluno não definido:', idAluno);
      return;
    }
    
    console.log('📡 Buscando XP inicial para aluno:', idAluno);
    fetchWithFallback(`progresso?acao=get_student_progress&id_aluno=${idAluno}`)
      .then((res) => res.json())
      .then((envelope) => {
        const data = envelope?.data ?? {};
        console.log('✓ Resposta recebida:', data);
        if (data.xp) {
          const novoXp = {
            etica: Number(data.xp.xp_etica || 0),
            logica: Number(data.xp.xp_logica || 0),
            seguranca: Number(data.xp.xp_seguranca || 0),
          };
          console.log('✓ Atualizando XP local:', novoXp);
          setXp(novoXp);
        }
        if (data.trilhas && typeof data.trilhas === 'object') {
          let houveRestauracao = false;
          Object.entries(data.trilhas).forEach(([trilhaId, dados]) => {
            const chave = `cidadao-digital:trilha:${trilhaId}`;
            try {
              const local = JSON.parse(localStorage.getItem(chave) || '{}');
              const localPontos = Object.values(local.notaPorModulo ?? {}).reduce((s, n) => s + (Number(n) || 0), 0);
              const serverPontos = Object.values(dados.notaPorModulo ?? {}).reduce((s, n) => s + (Number(n) || 0), 0);
              if (serverPontos > localPontos || !local.notaPorModulo) {
                localStorage.setItem(chave, JSON.stringify({
                  notaPorModulo: { ...(local.notaPorModulo ?? {}), ...(dados.notaPorModulo ?? {}) },
                  conclusoesPorModulo: { ...(local.conclusoesPorModulo ?? {}), ...(dados.conclusoesPorModulo ?? {}) },
                  progressoPorModulo: { ...(local.progressoPorModulo ?? {}), ...(dados.progressoPorModulo ?? {}) },
                }));
                houveRestauracao = true;
              }
            } catch (e) {
              console.warn('Erro ao restaurar trilha local:', e);
            }
          });
          if (houveRestauracao) {
            window.dispatchEvent(new Event('pontuacao-linguagens-atualizada'));
          }
        }
      })
      .catch((err) => console.warn('⚠️ Erro ao buscar XP:', err.message));
  }, [idAluno, autenticado]);

  const registrarDecisao = useCallback(
    async ({ idFase, escolha }) => {
      setEnviando(true);
      setErro(null);
      const pontosPorCategoria = escolha.pontos_por_categoria || calcularPontosPorCategoria(escolha);

      if (!autenticado) {
        setXp((atual) => CATEGORIAS.reduce((resultado, categoria) => ({
          ...resultado,
          [categoria]: resultado[categoria] + (pontosPorCategoria[categoria] || 0),
        }), atual));
        setEnviando(false);
        return { sucesso: false, salvoNoBanco: false, motivo: 'login_necessario' };
      }

      let emailEnvio = emailAluno;
      if (!emailEnvio) {
        try {
          const sessao = JSON.parse(localStorage.getItem('cidadao-digital:aluno') || '{}');
          emailEnvio = sessao.email || '';
        } catch {}
      }

      const payload = {
        id_aluno: idAluno,
        email: emailEnvio,
        id_fase: idFase,
        id_decisao: escolha.id_decisao || `fase_${idFase}_${escolha.categoria || 'opcao'}`,
        categoria: escolha.categoria || 'etica',
        classificacao: escolha.classificacao || 'correta',
        pontos_ganhos: Number(escolha.pontos_ganhos ?? 10),
        pontos_por_categoria: pontosPorCategoria,
        texto_escolha: escolha.texto || 'Escolha efetuada',
        feedback_exibido: escolha.feedback || 'Decisão registrada',
      };

      try {
        const response = await fetchWithFallback('util?acao=save_decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const corpo = await response.json().catch(() => ({}));
          throw new Error(corpo.error || `Erro HTTP ${response.status}`);
        }

        const envelope = await response.json();

        // Atualiza XP local de forma otimista após confirmação do servidor
        setXp((atual) => CATEGORIAS.reduce((resultado, categoria) => ({
          ...resultado,
          [categoria]: resultado[categoria] + (pontosPorCategoria[categoria] || 0),
        }), atual));

        return envelope.data;
      } catch (err) {
        setErro(err.message);
        throw err;
      } finally {
        setEnviando(false);
      }
    },
    [idAluno, autenticado, emailAluno]
  );

  return { xp, enviando, erro, registrarDecisao };
}
