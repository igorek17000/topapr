import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import { useAuth, useSetContracts } from 'hooks';

import HideOnScroll from 'components/HideOnScroll';
import WalletButton from 'components/WalletButton';
import AprList from 'components/AprList/AprList';

function App() {
  useSetContracts();
  useAuth();

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll>
        <AppBar>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ marginRight: 8 }}>
              Top APR
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Box
                component="span"
                sx={{
                  ...linkStyle,
                  marginRight: 4,
                }}
              >
                <Link to={'/'}>Farms</Link>
              </Box>
              <Box component="span" sx={linkStyle}>
                <Link to={'/nft'}>NFT</Link>
              </Box>
            </Box>
            <WalletButton />
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container>
        <Box sx={{ my: 2 }}>
          <Routes>
            <Route path="/" element={<AprList />} />
            <Route path="/nft" element={<div>Nft</div>} />
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
