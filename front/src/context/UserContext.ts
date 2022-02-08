import { createContext } from 'react';

const UserContext = createContext<{
  address: string;
  shortAddress: string;
  uid: string;
  isHavingNft: boolean;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setShortAddress: React.Dispatch<React.SetStateAction<string>>;
  setUid: React.Dispatch<React.SetStateAction<string>>;
  setIsHavingNft: React.Dispatch<React.SetStateAction<boolean>>;
  resetAccount: () => void;
}>({
  address: '',
  shortAddress: '',
  uid: '',
  isHavingNft: false,
  setAddress: () => {},
  setShortAddress: () => {},
  setUid: () => {},
  setIsHavingNft: () => {},
  resetAccount: () => {},
});

export default UserContext;
