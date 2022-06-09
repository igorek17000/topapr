// Bismillaahirrahmaanirrahiim

import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import {
  Box,
  Grid,
  LinearProgress,
  ListItem,
  SelectChangeEvent,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useFilter } from 'hooks/useFilter';
import useDebounce from 'hooks/useDebounce';
import UserContext from 'context/UserContext';
import PoolFilter, { CheckedPool } from './Filter/PoolFilter';
import ChainFilter, { CheckedChain } from './Filter/ChainFilter';
import HedgeFilter, { CheckedHedge } from './Filter/HedgeFilter';
import AprListItem from './AprListItem';
import SortBySelect, { SortBy } from './SortBySelect';
import {
  ChainName,
  chains,
  HedgeName,
  hedges,
  PoolName,
  pools,
} from './config';
import { Farm } from 'types';
import { useNft } from 'hooks/useNft';
import { useStarred } from 'hooks/useStarred';
import DataArrayIcon from '@mui/icons-material/DataArray';

export default memo(function AprList() {
  const { address, isUserLoading } = useContext(UserContext);

  const [chainChecked, setChainChecked] = useFilter<CheckedChain, ChainName>(
    chains
  );
  const [poolChecked, setPoolChecked] = useFilter<CheckedPool, PoolName>(pools);
  const [hedgeChecked, setHedgeChecked] = useFilter<CheckedHedge, HedgeName>(
    []
  );
  const [sortBy, setSortBy] = useState<SortBy>('APR');
  const [searchText, setSearchText] = useState<string>('');
  const debouncedValue = useDebounce<string>(searchText, 200);
  const [nfts, isNftLoading] = useNft();

  const [isScrollHit, setIsScrollHit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [tabValue, setTabValue] = React.useState(0);

  const [farmsAprList, setFarmsAprList] = useState<Farm[]>([]);
  const [starredFarmsAprList, setStarredFarmsAprList] = useState<Farm[]>([]);

  const [farmList, starredFarmList, handleStarClick] = useStarred(
    farmsAprList,
    starredFarmsAprList
  );

  const [farmFirstFecth, setFarmFirstFetch] = useState(false);
  const [starredFirstFecth, setStarredFirstFetch] = useState(false);

  const [isNoMoreData, setIsNoMoreData] = useState(false);
  const [isNoMoreStarreData, setIsNoMoreStarredData] = useState(false);

  const [page, setPage] = useState(1);
  const [starredPage, setStarredPage] = useState(1);

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
  };

  // Reset states when filters changed
  useEffect(() => {
    resetStates();
  }, [debouncedValue, poolChecked, chainChecked, hedgeChecked, sortBy]);

  const fetchData = useCallback(() => {
    // console.log('fetch data. Tab value: ', tabValue, page, starredPage);
    setIsScrollHit(false);
    setIsLoading(true);

    const getList = (filterList: any, filterChecked: any) =>
      filterList.reduce((prev: any, item: any) => {
        if (filterChecked[item]) return `${prev}${prev ? ',' : ''}${item}`;
        return prev;
      }, '');

    const poolList = getList(pools, poolChecked);
    const chainList = getList(chains, chainChecked);
    const hedgeList = address ? getList(hedges, hedgeChecked) : undefined;

    const token = sessionStorage.getItem('data');
    const bearer = token ? `Bearer ${token}` : '';

    const fetchData = {
      q: debouncedValue,
      sort: sortBy,
      p: tabValue === 0 ? page : starredPage,
      pools: poolList,
      chains: chainList,
      starred: tabValue === 1,
      hedges: hedgeList,
    };

    fetch(`${process.env.REACT_APP_SERVER}/${hedgeList ? 'hedge' : 'api'}`, {
      method: 'POST',
      headers: {
        Authorization: bearer,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fetchData),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.queryRes && result.queryRes.length > 0) {
          const baseList = tabValue === 0 ? farmsAprList : starredFarmsAprList;
          const newArr = [...baseList, ...result.queryRes].reduce(
            (prev, curr) => {
              if (
                !prev.find(
                  (data: any) =>
                    data.pair === curr.pair &&
                    data.pool === curr.pool &&
                    data.network === curr.network
                )
              )
                prev.push(curr);

              return prev;
            },
            []
          );
          if (tabValue === 0) {
            setFarmsAprList(newArr);
            setPage(page + 1);
          } else if (tabValue === 1) {
            // console.log('ada nih', newArr);
            setStarredFarmsAprList(newArr);
            setStarredPage(starredPage + 1);
          }
        } else {
          if (tabValue === 0) setIsNoMoreData(true);
          if (tabValue === 1) setIsNoMoreStarredData(true);
        }

        if (tabValue === 0) {
          setFarmFirstFetch(true);
        }

        if (tabValue === 1) {
          setStarredFirstFetch(true);
        }

        setIsLoading(false);
        // console.log(result);
      });
  }, [
    tabValue,
    address,
    chainChecked,
    debouncedValue,
    farmsAprList,
    hedgeChecked,
    page,
    poolChecked,
    sortBy,
    starredFarmsAprList,
    starredPage,
  ]);

  // Fetch first data
  useEffect(() => {
    if (
      ((tabValue === 0 && farmFirstFecth === false) ||
        (tabValue === 1 && starredFirstFecth === false)) &&
      !isLoading &&
      !isUserLoading
    ) {
      fetchData();
    }
  }, [tabValue, farmFirstFecth, starredFirstFecth, isLoading, isUserLoading, fetchData]);

  // Fetch when scroll hit
  useEffect(() => {
    if (
      ((tabValue === 0 && !isNoMoreData) ||
        (tabValue === 1 && !isNoMoreStarreData)) &&
      isScrollHit &&
      !isLoading &&
      !isUserLoading
    ) {
      // console.log('Scroll hit: ', tabValue);
      fetchData();
    }
  }, [tabValue, isScrollHit, isNoMoreData, isNoMoreStarreData, isLoading, isUserLoading, fetchData]);

  const handleNavigation = useCallback(
    (e: any) => {
      const window = e.currentTarget;
      if (
        window.scrollY + window.innerHeight >
        document.documentElement.offsetHeight - 100
      ) {
        // console.log(
        //   'Scroll hit...',
        //   tabValue,
        //   isNoMoreData,
        //   isNoMoreStarreData
        // );
        if (
          (tabValue === 0 && !isNoMoreData) ||
          (tabValue === 1 && !isNoMoreStarreData)
        ) {
          setIsScrollHit(true);
        }
      }
    },
    [tabValue, isNoMoreData, isNoMoreStarreData, setIsScrollHit]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleNavigation);

    return () => {
      window.removeEventListener('scroll', handleNavigation);
    };
  }, [handleNavigation]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as SortBy);
  };

  const resetStates = () => {
    setFarmsAprList([]);
    setStarredFarmsAprList([]);
    setPage(1);
    setStarredPage(1);
    setIsLoading(false);
    setIsNoMoreData(false);
    setIsNoMoreStarredData(false);
    setIsScrollHit(false);
    setStarredFirstFetch(false);
    setFarmFirstFetch(false);
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
      <Grid container spacing={3} sx={{ mt: '0px', mb: '32px' }}>
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
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="All" />
        <Tab label="Starred" />
        <Tab label="Wallet" />
      </Tabs>
      <List
        sx={{
          border: '1px solid #e5e5e5',
          borderRadius: '20px',
          boxShadow:
            '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
          visibility: tabValue === 0 ? 'visible' : 'hidden',
          display: tabValue === 0 ? 'block' : 'none',
        }}
      >
        {farmList.map((farm) => (
          <React.Fragment key={`${farm.pair}-${farm.pool}-${farm.network}`}>
            <AprListItem
              farm={farm}
              address={address}
              isNftDetected={nfts.length > 0}
              handleStarClick={handleStarClick}
            />
            <Divider />
          </React.Fragment>
        ))}
        {!isLoading && !isUserLoading && farmList.length === 0 && (
          <ListItem>
            <Box sx={{ width: '100%', padding: '24px', textAlign: 'center' }}>
              <DataArrayIcon
                sx={{ fontSize: '64px', color: 'rgba(0,0,0,0.2)' }}
              />
            </Box>
          </ListItem>
        )}
        {isLoading && (
          <ListItem>
            <Box sx={{ width: '100%', padding: '24px' }}>
              <LinearProgress />
            </Box>
          </ListItem>
        )}
      </List>
      <List
        sx={{
          border: '1px solid #e5e5e5',
          borderRadius: '20px',
          boxShadow:
            '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
          visibility: tabValue === 1 ? 'visible' : 'hidden',
          display: tabValue === 1 ? 'block' : 'none',
        }}
      >
        {starredFarmList.map((farm) => (
          <React.Fragment key={`${farm.pair}-${farm.pool}-${farm.network}`}>
            <AprListItem
              farm={farm}
              address={address}
              isNftDetected={nfts.length > 0}
              handleStarClick={handleStarClick}
            />
            <Divider />
          </React.Fragment>
        ))}
        {!isLoading && !isUserLoading && starredFarmList.length === 0 && (
          <ListItem>
            <Box sx={{ width: '100%', padding: '24px', textAlign: 'center' }}>
              <DataArrayIcon
                sx={{ fontSize: '64px', color: 'rgba(0,0,0,0.2)' }}
              />
            </Box>
          </ListItem>
        )}
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
      <List
        sx={{
          border: '1px solid #e5e5e5',
          borderRadius: '20px',
          boxShadow:
            '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
          visibility: tabValue !== 2 ? 'hidden' : 'visible',
          display: tabValue !== 2 ? 'none' : 'block',
        }}
      >
        <ListItem>
          <Box sx={{ width: '100%', padding: '24px', textAlign: 'center' }}>
            <Typography variant="overline" sx={{ fontSize: '14px' }}>
              Coming Soon
            </Typography>
          </Box>
        </ListItem>
      </List>
      {isNoMoreData ? <div className="text-center"></div> : ''}
    </div>
  );
});
