import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ContextWrap from 'context/ContextWrap';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ContextWrap>
        <App />
      </ContextWrap>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
