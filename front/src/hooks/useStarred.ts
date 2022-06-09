// Bismillaahirrahmaanirrahiim

import UserContext from 'context/UserContext';
import {
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Farm } from 'types';
import { useSnackbar } from 'notistack';

export function useStarred(farmsAprList: Farm[], starredFarmsAprList: Farm[]) {
  const { address } = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();

  const [pairStarred, setPairStarred] = useState<any[] | undefined>(undefined);
  const [isPairStarredLoading, setIsPairStarredLoading] = useState(false);

  const [farmList, setFarmList] = useState<any[]>([]);
  const [starredFarmList, setStarredFarmList] = useState<any[]>([]);

  // Set pairStarred data
  useEffect(() => {
    if (address) {
      setIsPairStarredLoading(true);
      const token = sessionStorage.getItem('data');
      const bearer = token ? `Bearer ${token}` : '';

      fetch(`${process.env.REACT_APP_SERVER}/api/starred`, {
        method: 'POST',
        headers: { Authorization: bearer },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.queryRes && result.queryRes.length > 0) {
            setPairStarred(result.queryRes);
          }
        })
        .finally(() => {
          setIsPairStarredLoading(false);
        });
    } else {
      setPairStarred(undefined);
    }
  }, [address]);

  // Combine data
  useEffect(() => {
    // console.log('combine data', farmsAprList, starredFarmsAprList);
    const baseData =
      farmsAprList.length === 0 && starredFarmsAprList.length > 0
        ? starredFarmsAprList
        : farmsAprList;

    const starredList = baseData.map((farm) => {
      if (
        pairStarred &&
        pairStarred.find(
          (star) =>
            star.pair === farm.pair &&
            star.pool === farm.pool &&
            star.network === farm.network
        )
      ) {
        return { ...farm, isStarred: true };
      }

      return { ...farm, isStarred: false };
    });

    setFarmList(starredList);
    setStarredFarmList(starredList.filter((farm) => farm.isStarred));
  }, [
    farmsAprList,
    starredFarmsAprList,
    pairStarred,
    setFarmList,
    setStarredFarmList,
  ]);

  const fetchInsertDelete = (method: string, farm: Farm, bearer: string) => {
    fetch(`${process.env.REACT_APP_SERVER}/api/starred`, {
      method: 'POST',
      headers: {
        Authorization: bearer,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method,
        pair: farm.pair,
        pool: farm.pool,
        network: farm.network,
      }),
    });
  };

  const handleStarClick = useCallback(
    (farm: Farm) => (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (address) {
        const token = sessionStorage.getItem('data');
        const bearer = token ? `Bearer ${token}` : '';

        setPairStarred((old) => {
          // console.log(old);
          if (old) {
            if (
              old.find(
                (star) =>
                  star.pair === farm.pair &&
                  star.pool === farm.pool &&
                  star.network === farm.network
              )
            ) {
              // Remove starred
              // console.log('delete stared', farm);
              fetchInsertDelete('delete', farm, bearer);
              return old.filter(
                (star) =>
                  !(
                    star.pair === farm.pair &&
                    star.pool === farm.pool &&
                    star.network === farm.network
                  )
              );
            } else {
              // Add starred
              // console.log('add stared', farm);
              fetchInsertDelete('insert', farm, bearer);
              return [
                ...old,
                { pair: farm.pair, pool: farm.pool, network: farm.network },
              ];
            }
          }

          fetchInsertDelete('insert', farm, bearer);
          return [
            {
              pair: farm.pair,
              pool: farm.pool,
              network: farm.network,
            },
          ];
        });
      } else {
        enqueueSnackbar('Login first', {
          variant: 'success',
          autoHideDuration: 2000,
          preventDuplicate: true,
        });
      }
    },
    [address, setPairStarred, enqueueSnackbar]
  );

  return [
    farmList,
    starredFarmList,
    handleStarClick,
    isPairStarredLoading,
  ] as const;
}
