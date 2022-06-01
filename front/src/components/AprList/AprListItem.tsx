// Bismillaahirrahmaanirrahiim

import React, { memo, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Farm } from 'types';
import PairImg from './PairImg';
import ButtonPool from './ButtonPool';
import { PoolName, poolsName } from './config';
import RoiCalculator from './RoiCalculator';
import TokenDetails from './TokenDetails';
import PairCharts from './PairCharts';

type AprListItemProps = {
  farm: Farm;
  isNftDetected: boolean;
};

export default memo(function AprListItem(props: AprListItemProps) {
  const { farm, isNftDetected } = props;
  const [open, setOpen] = useState(false);
  const [firstToken, setFirstToken] = useState('');
  const [secondToken, setSecondToken] = useState('');

  const [openCalc, setOpenCalc] = useState(false);
  const [aprCalc, setAprCalc] = useState(0);

  const [openDetails, setOpenDetails] = useState(false);
  const [tokenDetails, setTokenDetails] = useState('');

  const [pairHistory, setPairHistory] = useState<any[] | undefined>(undefined);
  const [isPairHistoryLoading, setIsPairHistoryLoading] = useState(false);

  useEffect(() => {
    const tokens = farm.pair.split('-');
    if (tokens[0]) setFirstToken(tokens[0]);
    if (tokens[1]) setSecondToken(tokens[1]);
  }, [farm.pair, setFirstToken, setSecondToken]);

  // Set pairHistory data
  useEffect(() => {
    if (open && pairHistory === undefined) {
      setIsPairHistoryLoading(true);
      console.log('fetch pairHistory data', farm.pair);
      fetch(`${process.env.REACT_APP_SERVER}/api/history?pair=${farm.pair}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.queryRes && result.queryRes.length > 0) {
            console.log('sini', result.queryRes);
            setPairHistory(
              result.queryRes.reverse().map((data: any) => ({
                date: new Date(data.date.replace(' ', 'T') + 'Z'),
                APR: data.apr,
                'Total Value': data.totalValue,
              }))
            );
          } else {
            setPairHistory([]);
          }
        })
        .catch(() => {
          setPairHistory([]);
        })
        .finally(() => {
          setIsPairHistoryLoading(false);
        });
    }
  }, [farm.pair, open, pairHistory, setPairHistory]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  const handleCalcClick =
    (apr: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setAprCalc(apr);
      setOpenCalc(true);
    };

  const handleTokenClick =
    (token: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setTokenDetails(token);
      setOpenDetails(true);
    };

  return (
    <React.Fragment>
      <ListItemButton
        sx={{
          px: {
            md: '48px',
          },
        }}
        onClick={handleClick}
      >
        <Grid container spacing={3}>
          <Grid
            item
            xs
            sx={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: '80px !important',
            }}
          >
            <PairImg pair={farm.pair} />
          </Grid>
          <Grid
            item
            xs
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: '220px',
            }}
          >
            <Button
              color="primary"
              variant="outlined"
              onClick={handleTokenClick(firstToken)}
            >
              {firstToken}
            </Button>
            <Typography sx={{ mx: '4px', color: '#aaa' }}>-</Typography>
            <Button
              color="secondary"
              variant="outlined"
              onClick={handleTokenClick(secondToken)}
            >
              {secondToken}
            </Button>
          </Grid>
          <Grid item xs>
            <Typography variant="caption">APR</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography color="success.light" sx={{ fontWeight: 600 }}>
                {(farm.apr as number).toLocaleString()}%
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleCalcClick(farm.apr as number)}
                >
                  <CalculateIcon />
                </IconButton>
              </Box>
            </Stack>
          </Grid>
          {farm.apy && (
            <Grid item xs>
              <Typography variant="caption">APY</Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography color="success.light" sx={{ fontWeight: 600 }}>
                  {(farm.apy as number).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                  %
                </Typography>
              </Stack>
            </Grid>
          )}
          <Grid item xs>
            <Typography variant="caption">Value</Typography>
            <div>
              {farm.totalValue
                ? `$${(farm.totalValue as number).toLocaleString()}`
                : '-'}
            </div>
          </Grid>
          <Grid item xs>
            <Typography variant="caption">{farm.network}</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <div>{(poolsName as any)[farm.pool]}</div>
              <Box sx={{ display: 'flex' }}>
                <img
                  src={`/pool/${farm.pool}.png`}
                  alt={farm.pool}
                  width={18}
                  height={18}
                />
              </Box>
            </Stack>
          </Grid>
          <Grid
            item
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {open ? <ExpandLess /> : <ExpandMore />}
          </Grid>
        </Grid>
      </ListItemButton>
      <Collapse in={open} timeout="auto" mountOnEnter unmountOnExit>
        <List>
          <ListItem
            sx={{
              px: {
                md: '48px',
              },
            }}
          >
            <ButtonPool poolName={farm.pool as PoolName} />
          </ListItem>
          <ListItem
            sx={{
              px: {
                md: '48px',
              },
            }}
          >
            {isPairHistoryLoading && (
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {!isPairHistoryLoading && pairHistory && pairHistory.length > 0 && (
              <PairCharts data={pairHistory} />
            )}
          </ListItem>
        </List>
      </Collapse>
      <RoiCalculator
        apr={aprCalc}
        isNftDetected={isNftDetected}
        isOpen={openCalc}
        setIsOpen={setOpenCalc}
      />
      <TokenDetails
        token={tokenDetails}
        network={farm.network}
        isOpen={openDetails}
        setIsOpen={setOpenDetails}
      />
    </React.Fragment>
  );
});
