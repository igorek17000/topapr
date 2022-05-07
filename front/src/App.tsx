import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import { useAuth, useSetContracts } from 'hooks';

// Bismillahirrahmaanirraahiim

import HideOnScroll from 'components/HideOnScroll';
import WalletButton from 'components/WalletButton';
import AprList from 'components/AprList';
import NftMint from 'components/NftMint';

function App() {
  useSetContracts();
  useAuth();

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll>
        <AppBar>
          <Toolbar>
            <Box sx={{ marginRight: 4 }}>
              <Link to="/">
                <img src="/logo.png" alt="Top APR" width={48} height={48} />
              </Link>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box
                component="span"
                sx={{
                  ...linkStyle,
                  marginRight: 4,
                }}
              >
                <Link to="/">Farms</Link>
              </Box>
              <Box
                component="span"
                sx={{
                  ...linkStyle,
                  marginRight: 4,
                }}
              >
                <Link to="/nft">NFT</Link>
              </Box>
              <Box component="span" sx={linkStyle}>
                <a href="mailto:cakia99999@gmail.com">Contact Us</a>
              </Box>
            </Box>
            <WalletButton />
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container>
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route path="/" element={<AprList />} />
            <Route path="/nft" element={<NftMint />} />
          </Routes>
        </Box>
      </Container>
    </React.Fragment>
  );
}

const linkStyle = {
  a: {
    color: 'white',
    textDecoration: 'none',
  },
};

export default App;
