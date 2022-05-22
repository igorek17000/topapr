// Bismillaahirrahmaanirrahiim

import { Routes, Route, Link } from 'react-router-dom';
import { useAuth, useSetContracts } from 'hooks';
import { AppBar, Box, Container, CssBaseline, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AprList, HideOnScroll, NftMint, WalletButton } from 'components';

const theme = createTheme({
  palette: {
    secondary: {
      main: 'rgb(51, 39, 106)',
    },
  },
});

function App() {
  useSetContracts();
  useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HideOnScroll>
        <AppBar>
          <Toolbar disableGutters sx={{ mx: 2 }}>
            <Box>
              <Link to="/">
                <img src="/logo.png" alt="Top APR" width={48} height={48} />
              </Link>
            </Box>
            <Box sx={{ flex: 1, px: 3 }}>
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
                <a href="mailto:cakia99999@gmail.com">Contact</a>
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
    </ThemeProvider>
  );
}

const linkStyle = {
  a: {
    color: 'white',
    textDecoration: 'none',
  },
};

export default App;
