// Bismillaahirrahmaanirrahiim

import { useContext } from 'react';
import { Box } from '@mui/system';
import UserContext from 'context/UserContext';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';

export default function WalletButton() {
  const { address } = useContext(UserContext);

  return <Box>{address ? <SignOutButton /> : <SignInButton />}</Box>;
}
