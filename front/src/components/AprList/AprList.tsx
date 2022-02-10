import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { Grid, SelectChangeEvent } from '@mui/material';
import { useFilter } from 'hooks/useFilter';
import useDebounce from 'hooks/useDebounce';
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
    console.log(debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    if (isScrollHit && !isNoMoreData) {
      setIsScrollHit(false);
      console.log('loading data ...');
      fetch(`http://localhost:3100/api/${sortBy}/${page}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.queryRes && result.queryRes.length > 0) {
            setFarmsAprList([...farmsAprList, ...result.queryRes]);
            setPage(page + 1);
          }
          console.log(result);
        });
    }
  }, [isScrollHit, isNoMoreData]);

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
