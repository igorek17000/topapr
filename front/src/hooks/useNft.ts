// Bismillaahirrahmaanirrahiim

import UserContext from 'context/UserContext';
import { useContext, useEffect, useState } from 'react';

export function useNft() {
  const { address } = useContext(UserContext);

  const [nfts, setNfts] = useState([]);
  const [isNftLoading, setIsNftLoading] = useState(true);

  // get nfts
  useEffect(() => {
    // console.log('address changed', address);
    setIsNftLoading(true);
    if (address) {
      const token = sessionStorage.getItem('data');
      const bearer = token ? `Bearer ${token}` : '';

      fetch(`${process.env.REACT_APP_SERVER}/nft`, {
        headers: { Authorization: bearer },
      })
        .then((res) => res.json())
        .then((result) => {
          // console.log(result);
          if (result && result.nfts) {
            setNfts(result.nfts);
          } else {
            setNfts([]);
          }
        })
        .catch(() => {
          setNfts([]);
        })
        .finally(() => {
          setIsNftLoading(false);
        });
    } else {
      setNfts([]);
      setIsNftLoading(false);
    }
  }, [address]);

  return [nfts, isNftLoading] as const;
}
