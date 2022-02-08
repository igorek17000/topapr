import { useContext, useEffect } from 'react';
import UserContext from 'context/UserContext';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { getShortAddress } from 'utils/getShortAddress';
import { auth } from 'initFirebase';

export function useFirebaseAuth() {
  const {
    address,
    setAddress,
    setShortAddress,
    setUid,
    resetAccount,
    setIsHavingNft,
  } = useContext(UserContext);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!address) {
          const { ethereum } = window as any;
          if (ethereum) {
            const accounts: string[] = await ethereum.request({
              method: 'eth_requestAccounts',
            });
            if (accounts.length > 0) {
              const walletAddr = accounts[0].toLowerCase();
              if (walletAddr === user.uid) {
                auth.currentUser?.getIdTokenResult().then((idTokenResult) => {
                  setAddress(walletAddr);
                  setShortAddress(getShortAddress(walletAddr));
                  setUid(user.uid.toLowerCase());
                  setIsHavingNft((idTokenResult.claims as any).isHavingNft);
                });
              } else {
                signOut(auth);
                resetAccount();
              }
            } else {
              signOut(auth);
              resetAccount();
            }
          } else {
            signOut(auth);
            resetAccount();
          }
        } else {
          signOut(auth);
          resetAccount();
        }
      } else {
        resetAccount();
      }
    });
  }, []);
}
