import { useContext, useEffect } from 'react';
import UserContext from 'context/UserContext';
import ContractContext from 'context/ContractContext';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { getShortAddress } from 'utils/getShortAddress';
import { auth } from 'initFirebase';

export function useAuth() {
  const {
    address,
    setAddress,
    setShortAddress,
    uid,
    setUid,
    setIdToken,
    setIsUserLoading,
    resetAccount,
    setIsHavingNft,
    isUserLoading,
  } = useContext(UserContext);

  const { signer } = useContext(ContractContext);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid.toLowerCase());
        user
          .getIdToken()
          .then((userIdToken) => {
            if (userIdToken) {
              setIdToken(userIdToken);
            }
          })
          .finally(() => {
            setIsUserLoading(false);
          });
      } else {
        setIsUserLoading(false);
      }
    });
  }, [setUid, setIdToken, setIsUserLoading]);

  useEffect(() => {
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum.on('accountsChanged', (acc: string[]) => {
        if (acc.length > 0) {
          const address = acc[0].toLowerCase();
          const shortAddress = getShortAddress(address);

          setAddress(address);
          setShortAddress(shortAddress);
        }
      });
    }
  }, [setAddress, setShortAddress]);

  useEffect(() => {
    if (!isUserLoading && uid && !address) {
      signer?.getAddress().then((val) => {
        if (val) {
          const signerAddress = val.toLowerCase();
          if (signerAddress === uid) {
            setAddress(signerAddress);
            setShortAddress(getShortAddress(signerAddress));
            auth.currentUser?.getIdTokenResult().then((idTokenResult) => {
              setIsHavingNft((idTokenResult.claims as any).isHavingNft);
            });
          } else {
            signOut(auth);
            resetAccount();
          }
        }
      });
    }
  }, [
    address,
    uid,
    isUserLoading,
    signer,
    resetAccount,
    setAddress,
    setShortAddress,
    setIsHavingNft,
  ]);
}
