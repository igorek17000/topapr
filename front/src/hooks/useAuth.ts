// Bismillaahirrahmaanirrahiim

import { useContext, useEffect } from 'react';
import UserContext from 'context/UserContext';
import jwtDecode from 'jwt-decode';
import { getShortAddress } from 'utils/getShortAddress';

export function useAuth() {
  const { setAddress, setShortAddress, resetAccount, setIsUserLoading } =
    useContext(UserContext);

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
    setIsUserLoading(true);
    const token = localStorage.getItem('data');
    if (token) {
      const data: any = jwtDecode(token);
      if (data && data.address) {
        setAddress(data.address);
        setShortAddress(getShortAddress(data.address));
      } else {
        resetAccount();
        localStorage.removeItem('data');
      }
    }
    setIsUserLoading(false);
  }, [setIsUserLoading, setAddress, setShortAddress, resetAccount]);
}
