// Bismillaahirrahmaanirrahiim

import { createContext } from 'react';

const UserContext = createContext<{
  address: string;
  shortAddress: string;
  isUserLoading: boolean;
  isHavingNft: boolean;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setShortAddress: React.Dispatch<React.SetStateAction<string>>;
  setIsUserLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsHavingNft: React.Dispatch<React.SetStateAction<boolean>>;
  resetAccount: () => void;
}>({
  address: '',
  shortAddress: '',
  isUserLoading: true,
  isHavingNft: false,
  setAddress: () => {},
  setShortAddress: () => {},
  setIsUserLoading: () => {},
  setIsHavingNft: () => {},
  resetAccount: () => {},
});

export default UserContext;
