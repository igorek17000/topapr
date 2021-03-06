// Bismillaahirrahmaanirrahiim

import { useState } from 'react';
import UserContext from './UserContext';
import { ethers } from 'ethers';
import ContractContext from './ContractContext';

interface ContextWrapProps {
  children?: JSX.Element | JSX.Element[];
}

export default function ContextWrap(props: ContextWrapProps) {
  const [address, setAddress] = useState('');
  const [shortAddress, setShortAddress] = useState('');
  const [isHavingNft, setIsHavingNft] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [signer, setSigner] = useState<
    ethers.providers.JsonRpcSigner | undefined
  >(undefined);
  const [nftContract, setNftContract] = useState<ethers.Contract | undefined>(
    undefined
  );
  const [cakiaContract, setCakiaContract] = useState<
    ethers.Contract | undefined
  >(undefined);

  function resetAccount() {
    setAddress('');
    setShortAddress('');
    setIsHavingNft(false);
    setIsUserLoading(false);
  }

  return (
    <UserContext.Provider
      value={{
        address,
        shortAddress,
        isHavingNft,
        isUserLoading,
        setAddress,
        setShortAddress,
        setIsHavingNft,
        setIsUserLoading,
        resetAccount,
      }}
    >
      <ContractContext.Provider
        value={{
          signer,
          nftContract,
          cakiaContract,
          setSigner,
          setNftContract,
          setCakiaContract,
        }}
      >
        {props.children}
      </ContractContext.Provider>
    </UserContext.Provider>
  );
}
