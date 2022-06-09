// Bismillaahirrahmaanirrahiim

import React, { memo, MouseEvent, useEffect, useState } from 'react';
import {
  Avatar,
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
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
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
  address: string;
  handleStarClick: (farm: Farm) => (e: MouseEvent<HTMLButtonElement>) => void;
};

export default memo(
  function AprListItem(props: AprListItemProps) {
    const { farm, isNftDetected, handleStarClick } = props;

    const [open, setOpen] = useState(false);
    const [firstToken, setFirstToken] = useState('');
    const [secondToken, setSecondToken] = useState('');

    const [openCalc, setOpenCalc] = useState(false);
    const [aprCalc, setAprCalc] = useState(0);

    const [openDetails, setOpenDetails] = useState(false);
    const [tokenDetails, setTokenDetails] = useState('');

    const [pairHistory, setPairHistory] = useState<any[] | undefined>(
      undefined
    );
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
        fetch(
          `${process.env.REACT_APP_SERVER}/api/history?pair=${farm.pair}&pool=${farm.pool}&network=${farm.network}`
        )
          .then((res) => res.json())
          .then((result) => {
            if (result.queryRes && result.queryRes.length > 0) {
              setPairHistory(
                result.queryRes.map((data: any) => ({
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
    }, [farm.pair, farm.pool, farm.network, open, pairHistory, setPairHistory]);

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    };

    const handleCalcClick =
      (apr: number) => (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setAprCalc(apr);
        setOpenCalc(true);
      };

    const handleTokenClick =
      (token: string) => (e: MouseEvent<HTMLButtonElement>) => {
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
          <Grid
            container
            spacing={3}
            ml={{ xs: '-12px', md: '-24px' }}
            mt={{ xs: '8px', md: '-24px' }}
            mb={{ xs: '12px', md: 'unset' }}
          >
            <Grid
              item
              xs
              pt={{ xs: '8px !important', md: '24px !important' }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: '54px !important',
              }}
            >
              <IconButton onClick={handleStarClick(farm)} aria-label="star">
                {farm.isStarred ? (
                  <StarIcon htmlColor="#fcc544" />
                ) : (
                  <StarOutlineIcon fontSize="inherit" />
                )}
              </IconButton>
            </Grid>
            <Grid
              item
              xs
              pt={{ xs: '8px !important', md: '24px !important' }}
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
              pt={{ xs: '8px !important', md: '24px !important' }}
              minWidth={{ xs: '200px', md: '220px' }}
              sx={{
                display: 'flex',
                alignItems: 'center',
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
            <Grid item xs pt={{ xs: '8px !important', md: '24px !important' }}>
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
              <Grid
                item
                xs
                pt={{ xs: '8px !important', md: '24px !important' }}
              >
                <Typography variant="caption">APY</Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Typography color="success.light" sx={{ fontWeight: 600 }}>
                    {(farm.apy as number) > 1000000
                      ? '> 1M'
                      : (farm.apy as number).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                    %
                  </Typography>
                </Stack>
              </Grid>
            )}
            <Grid item xs pt={{ xs: '8px !important', md: '24px !important' }}>
              <Typography variant="caption">Value</Typography>
              <div>
                {farm.totalValue
                  ? `$${(farm.totalValue as number).toLocaleString()}`
                  : '-'}
              </div>
            </Grid>
            <Grid item xs pt={{ xs: '8px !important', md: '24px !important' }}>
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
              pt={{ xs: '8px !important', md: '24px !important' }}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'inline-flex' }}>
                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                  <ShowChartIcon />
                </Avatar>
                {open ? <ExpandLess /> : <ExpandMore />}
              </Box>
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
              {!isPairHistoryLoading &&
                pairHistory &&
                pairHistory.length > 0 && <PairCharts data={pairHistory} />}
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
  },
  (prevProps, nextProps) => {
    // console.log(prevProps, nextProps);
    return (
      prevProps.address + JSON.stringify(prevProps.farm) ===
      nextProps.address + JSON.stringify(nextProps.farm)
    );
  }
);
