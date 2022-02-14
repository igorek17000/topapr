import React, { useContext, useEffect, useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { Grid, SelectChangeEvent } from '@mui/material';
import { useFilter } from 'hooks/useFilter';
import useDebounce from 'hooks/useDebounce';
import UserContext from 'context/UserContext';
import PoolFilter, { CheckedPool, PoolName, pools } from './Filter/PoolFilter';
import ChainFilter, {
  ChainName,
  chains,
  CheckedChain,
} from './Filter/ChainFilter';
import AprListItem from './AprListItem';
import SortBySelect, { SortBy } from './SortBySelect';
import HedgeSwitch from './HedgeSwitch';

function AprList() {
  const { idToken, isUserLoading } = useContext(UserContext);

  const [chainChecked, setChainChecked] = useFilter<CheckedChain, ChainName>(
    chains
  );
  const [poolChecked, setPoolChecked] = useFilter<CheckedPool, PoolName>(pools);

  const [isHedge, setIsHedge] = useState(false);

  const [farmsAprList, setFarmsAprList] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('APR');
  const [page, setPage] = useState(1);
  const [isScrollHit, setIsScrollHit] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoMoreData, setIsNoMoreData] = useState(false);

  // const dbMexcRef = ref(database, 'FarmsAprMexc');
  // const farmsAprMexc = useDatabaseValue(['FarmsAprMexc'], dbMexcRef);

  const [searchText, setSearchText] = useState<string>('');
  const debouncedValue = useDebounce<string>(searchText, 200);

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    // console.log('debouncedValue changed', debouncedValue);
    // console.log('poolChecked changed', poolChecked);
    // console.log('chainChecked changed', chainChecked);
    resetStates();
  }, [debouncedValue, poolChecked, chainChecked, isHedge]);

  useEffect(() => {
    if (isScrollHit && !isNoMoreData && !isUserLoading) {
      setIsScrollHit(false);
      console.log('loading data ...');
      const poolList = pools.reduce((prev, pool) => {
        if (poolChecked[pool]) return `${prev}${prev ? ',' : ''}${pool}`;
        return prev;
      }, '');
      console.log('poolList', poolList);
      const chainList = chains.reduce((prev, chain) => {
        if (chainChecked[chain]) return `${prev}${prev ? ',' : ''}${chain}`;
        return prev;
      }, '');
      console.log('chainList', chainList);
      fetch(
        `http://localhost:3100/api?q=${debouncedValue}&sort=${sortBy}&p=${page}&pools=${poolList}&chains=${chainList}&ih=${isHedge}`,
        {
          headers: {
            Authorization: idToken ? 'Bearer ' + idToken : '',
          },
        }
      )
        .then((res) => res.json())
        .then((result) => {
          if (result.queryRes && result.queryRes.length > 0) {
            setFarmsAprList([...farmsAprList, ...result.queryRes]);
            setPage(page + 1);
          }
          console.log(result);
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
    idToken,
    isUserLoading,
    isHedge,
  ]);

  window.onscroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      console.log('Scroll hit...', isNoMoreData);
      if (!isNoMoreData) {
        setIsScrollHit(true);
      }
    }
  };

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
      <Divider />
      <Grid container spacing={3} sx={{ marginTop: '0px' }}>
        <Grid item md={7} xs={12}>
          <HedgeSwitch isHedge={isHedge} setIsHedge={setIsHedge} />
        </Grid>
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
      </List>
      {isLoading ? <div className="text-center">loading data ...</div> : ''}
      {isNoMoreData ? (
        <div className="text-center">no data anymore ...</div>
      ) : (
        ''
      )}
    </div>
  );
}

export default AprList;
