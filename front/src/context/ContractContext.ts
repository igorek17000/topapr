import { createContext } from 'react';
import { ethers } from 'ethers';

const ContractContext = createContext<{
  signer?: ethers.providers.JsonRpcSigner;
  cakiaContract?: ethers.Contract;
  nftContract?: ethers.Contract;
  setSigner: React.Dispatch<
    React.SetStateAction<ethers.providers.JsonRpcSigner | undefined>
  >;
  setCakiaContract: React.Dispatch<
    React.SetStateAction<ethers.Contract | undefined>
  >;
  setNftContract: React.Dispatch<
    React.SetStateAction<ethers.Contract | undefined>
  >;
}>({
  signer: undefined,
  cakiaContract: undefined,
  nftContract: undefined,
  setSigner: () => {},
  setCakiaContract: () => {},
  setNftContract: () => {},
});

export default ContractContext;
