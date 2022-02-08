import { useContext, useEffect } from 'react';
import UserContext from 'context/UserContext';
import { getShortAddress } from 'utils/getShortAddress';

export function useSetMetamaskListener() {
  const { setAddress, setShortAddress, resetAccount, uid } =
    useContext(UserContext);

  useEffect(() => {
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum.on('accountsChanged', (acc: string[]) => {
        if (acc.length > 0) {
          const address = acc[0].toLowerCase();
          const shortAddress = getShortAddress(address);

          if (uid === address) {
            setAddress(address);
            setShortAddress(shortAddress);
          } else {
            // TODO: signout
            // signOut(auth);
            resetAccount();
          }
        } else {
          // TODO: signout
          // signOut(auth);
          resetAccount();
        }
      });
    }
  }, [setAddress, setShortAddress]);

  return;
}
