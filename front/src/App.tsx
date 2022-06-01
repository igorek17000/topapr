// Bismillaahirrahmaanirrahiim

import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth, useSetContracts } from 'hooks';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AprList, HideOnScroll, NftMint, WalletButton } from 'components';
import MenuIcon from '@mui/icons-material/Menu';

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

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HideOnScroll>
        <AppBar>
          <Toolbar disableGutters sx={{ mx: 2 }}>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem onClick={handleCloseNavMenu}>
                  <Link to="/">Farms</Link>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                  <Link to="/nft">NFT</Link>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                  <a href="mailto:cakia99999@gmail.com">Contact</a>
                </MenuItem>
              </Menu>
              <Box>
                <Link to="/">
                  <img src="/logo.png" alt="Top APR" width={48} height={48} />
                </Link>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Link to="/">
                <img src="/logo.png" alt="Top APR" width={48} height={48} />
              </Link>
            </Box>
            <Box sx={{ flex: 1, px: 3, display: { xs: 'none', md: 'flex' } }}>
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
