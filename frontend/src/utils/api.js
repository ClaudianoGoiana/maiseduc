/**
 * api.js - Utilitário para chamadas à API Laravel (subdomínio próprio na Hostinger)
 */

// Subdomínio de produção do backend Laravel; sobrescrevível via VITE_API_URL (ex.: build de staging)
const PRODUCTION_API_URL = 'https://api.resetprint.com.br';

export const getApiCandidates = (endpoint) => {
  const path = String(endpoint || '').replace(/^\/+/, '');
  const cleanPath = path.replace(/^api\//, '');

  const isDev = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const baseUrl = import.meta.env?.VITE_API_URL
    || (isDev ? 'http://localhost:8000' : PRODUCTION_API_URL);

  return [`${baseUrl}/api/${cleanPath}`];
};

export async function fetchWithFallback(endpoint, options = {}) {
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
