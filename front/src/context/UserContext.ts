import { createContext } from 'react';

const UserContext = createContext<{
  address: string;
  shortAddress: string;
  uid: string;
  isHavingNft: boolean;
  isUserLoading: boolean;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setShortAddress: React.Dispatch<React.SetStateAction<string>>;
  setUid: React.Dispatch<React.SetStateAction<string>>;
  setIsHavingNft: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUserLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resetAccount: () => void;
}>({
  address: '',
  shortAddress: '',
  uid: '',
  isHavingNft: false,
  isUserLoading: false,
  setAddress: () => {},
  setShortAddress: () => {},
  setUid: () => {},
  setIsHavingNft: () => {},
  setIsUserLoading: () => {},
  resetAccount: () => {},
});

export default UserContext;
