// Bismillaahirrahmaanirrahiim

// import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ContextWrap from 'context/ContextWrap';
import { SnackbarProvider } from 'notistack';
import App from './App';

const element = (
  // <React.StrictMode>
  <BrowserRouter>
    <ContextWrap>
      <SnackbarProvider maxSnack={3} hideIconVariant>
        <App />
      </SnackbarProvider>
    </ContextWrap>
  </BrowserRouter>
  // </React.StrictMode>
);

const container = document.getElementById('root') as any;
const root = ReactDOMClient.createRoot(container);

root.render(element);
