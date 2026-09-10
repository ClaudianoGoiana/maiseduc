import React from 'react';
import ReactDOM from 'react-dom/client';
import Game from './components/Game.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Game idAluno={1} />
  </React.StrictMode>
);
