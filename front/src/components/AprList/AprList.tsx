import React, { useCallback, useContext, useEffect, useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import {
  Box,
  Grid,
  LinearProgress,
  ListItem,
  SelectChangeEvent,
} from '@mui/material';
import { useFilter } from 'hooks/useFilter';
import useDebounce from 'hooks/useDebounce';
import UserContext from 'context/UserContext';
import PoolFilter, { CheckedPool, PoolName, pools } from './Filter/PoolFilter';
import ChainFilter, {
  ChainName,
  chains,
  CheckedChain,
} from './Filter/ChainFilter';
import HedgeFilter, {
  CheckedHedge,
  HedgeName,
  hedges,
} from './Filter/HedgeFilter';
import AprListItem from './AprListItem';
import SortBySelect, { SortBy } from './SortBySelect';

function AprList() {
  const { address, idToken, uid } = useContext(UserContext);

  const [chainChecked, setChainChecked] = useFilter<CheckedChain, ChainName>(
    chains
  );
  const [poolChecked, setPoolChecked] = useFilter<CheckedPool, PoolName>(pools);
  const [hedgeChecked, setHedgeChecked] = useFilter<CheckedHedge, HedgeName>(
    []
  );

  const [farmsAprList, setFarmsAprList] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('APR');
  const [page, setPage] = useState(1);
  const [isScrollHit, setIsScrollHit] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoMoreData, setIsNoMoreData] = useState(false);

  const [nfts, setNfts] = useState([]);
  const [isNftLoading, setIsNftLoading] = useState(true);

  const [searchText, setSearchText] = useState<string>('');
  const debouncedValue = useDebounce<string>(searchText, 200);

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    resetStates();
  }, [debouncedValue, poolChecked, chainChecked, hedgeChecked]);

  // get nfts
  useEffect(() => {
    setIsNftLoading(true);
    if (address) {
      fetch(`${process.env.REACT_APP_SERVER}/nft`, {
        headers: {
          Authorization: `Bearer ${address}:`,
        },
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

  useEffect(() => {
    if (isScrollHit && !isNoMoreData && !isLoading) {
      setIsScrollHit(false);
      setIsLoading(true);
      const getList = (filterList: any, filterChecked: any) =>
        filterList.reduce((prev: any, item: any) => {
          if (filterChecked[item]) return `${prev}${prev ? ',' : ''}${item}`;
          return prev;
        }, '');

      const poolList = getList(pools, poolChecked);
      const chainList = getList(chains, chainChecked);
      const hedgeList = getList(hedges, hedgeChecked);

      const apiUrl = hedgeList
        ? `${process.env.REACT_APP_SERVER}/api/hedge?q=${debouncedValue}&sort=${sortBy}&p=${page}&pools=${poolList}&chains=${chainList}&hedges=${hedgeList}`
        : `${process.env.REACT_APP_SERVER}/api?q=${debouncedValue}&sort=${sortBy}&p=${page}&pools=${poolList}&chains=${chainList}`;

      fetch(apiUrl, {
        headers: {
          Authorization: idToken ? `Bearer ${uid}:${idToken}` : '',
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.queryRes && result.queryRes.length > 0) {
            setFarmsAprList([...farmsAprList, ...result.queryRes]);
            setPage(page + 1);
          } else {
            setIsNoMoreData(true);
          }

          setIsLoading(false);
          // console.log(result);
        });
    }
  }, [
    isScrollHit,
    isNoMoreData,
    debouncedValue,
    farmsAprList,
    page,
    sortBy,
    poolChecked,
    chainChecked,
    hedgeChecked,
    idToken,
    uid,
    isLoading,
    setIsLoading,
  ]);

  const handleNavigation = useCallback(
    (e) => {
      const window = e.currentTarget;
      if (
        window.scrollY + window.innerHeight >
        document.documentElement.offsetHeight - 100
      ) {
        // console.log('Scroll hit...', isNoMoreData);
        if (!isNoMoreData) {
          setIsScrollHit(true);
        }
      }
    },
    [isNoMoreData, setIsScrollHit]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleNavigation);

    return () => {
      window.removeEventListener('scroll', handleNavigation);
    };
  }, [handleNavigation]);
  // console.log(farmsAprArr, poolArr);

  const handleSortByChange = (event: SelectChangeEvent) => {
    const newSortBy = event.target.value as SortBy;
    setSortBy(newSortBy);
    resetStates();
  };

  const resetStates = () => {
    setFarmsAprList([]);
    setPage(1);
    setIsLoading(false);
    setIsNoMoreData(false);
    setIsScrollHit(true);
  };

  return (
    <div>
      <PoolFilter checked={poolChecked} setChecked={setPoolChecked} />
      <Divider sx={{ marginBottom: '12px' }} />
      <ChainFilter checked={chainChecked} setChecked={setChainChecked} />
      <Divider sx={{ marginBottom: '12px' }} />
      <HedgeFilter
        nfts={nfts}
        isNftLoading={isNftLoading}
        checked={hedgeChecked}
        setChecked={setHedgeChecked}
      />
      <Divider />
      <Grid container spacing={3} sx={{ marginTop: '0px' }}>
        <Grid item md={7} xs={12}></Grid>
        <Grid item md={2} xs={5}>
          <SortBySelect sortBy={sortBy} handleChange={handleSortByChange} />
        </Grid>
        <Grid item md={3} xs={7}>
          <TextField
            fullWidth
            id="search-farms"
            label="Search Farms"
            type="search"
            onChange={handleSearchTextChange}
          />
        </Grid>
      </Grid>
      <List
        sx={{
          marginTop: '24px',
          border: '1px solid #e5e5e5',
          borderRadius: '20px',
          boxShadow:
            '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        {farmsAprList.map((farm) => (
          <React.Fragment key={farm.pair}>
            <AprListItem farm={farm} />
            <Divider />
          </React.Fragment>
        ))}
        {isLoading ? (
          <ListItem>
            <Box sx={{ width: '100%', padding: '24px' }}>
              <LinearProgress />
            </Box>
          </ListItem>
        ) : (
          ''
        )}
      </List>
      {isNoMoreData ? <div className="text-center"></div> : ''}
    </div>
  );
}

export default AprList;
