import { useContext, useEffect } from 'react';
import UserContext from 'context/UserContext';
import ContractContext from 'context/ContractContext';
import { getShortAddress } from 'utils/getShortAddress';
import jwt_decode from 'jwt-decode';

export function useAuth() {
  const {
    address,
    setAddress,
    setShortAddress,
    setIdToken,
    setIsHavingNft,
    setIsUserLoading,
    setUid,
    resetAccount,
  } = useContext(UserContext);

  const { signer } = useContext(ContractContext);

  useEffect(() => {
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum.on('accountsChanged', (acc: string[]) => {
        if (acc.length > 0) {
          resetAccount();
          localStorage.removeItem('data');
        }
      });
    }
  }, [resetAccount]);

  useEffect(() => {
    if (signer) {
      signer.getAddress().then((data) => {
        if (data) {
          const address = data.toLocaleLowerCase();
          const shortAddress = getShortAddress(address);

          setAddress(address);
          setShortAddress(shortAddress);
          setIsUserLoading(false);
        }
      });
    }
  }, [signer, setAddress, setShortAddress, setIsUserLoading]);

  useEffect(() => {
    if (address) {
      const customToken = localStorage.getItem('data');
      if (customToken) {
        const { isHavingNft } = jwt_decode(customToken) as any;
        setIdToken(customToken);
        setIsHavingNft(isHavingNft);
        setUid(address);
      }
    }
  }, [setIsHavingNft, setIdToken, address, setUid]);
}
