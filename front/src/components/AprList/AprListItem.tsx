// Bismillaahirrahmaanirrahiim

import React, { memo, useState } from 'react';
import {
  Box,
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
import PairDetails from './PairDetails';

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

  React.useEffect(() => {
    const tokens = farm.pair.split('-');
    if (tokens[0]) setFirstToken(tokens[0]);
    if (tokens[1]) setSecondToken(tokens[1]);
  }, [farm.pair, setFirstToken, setSecondToken]);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleCalcClick =
    (apr: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setAprCalc(apr);
      setOpenCalc(true);
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
            }}
          >
            <Typography color="primary.dark">{firstToken}</Typography>
            <Typography sx={{ mx: '4px', color: '#aaa' }}>-</Typography>
            <Typography color="secondary.dark">{secondToken}</Typography>
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
          <Grid item xs>
            <Typography variant="caption">Value</Typography>
            <div>
              {farm.totalValue
                ? `$${(farm.totalValue as number).toLocaleString()}`
                : '-'}
            </div>
          </Grid>
          <Grid item xs>
            <Typography variant="caption">Pool</Typography>
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
          <Grid item xs>
            <Typography variant="caption">Chain</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <div>{farm.network}</div>
              <Box sx={{ display: 'flex' }}>
                <img
                  src={`/chain/${farm.network}.png`}
                  alt={farm.network}
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
      <Collapse in={open} timeout="auto" unmountOnExit>
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
            <PairDetails pair={farm.pair} network={farm.network} />
          </ListItem>
        </List>
      </Collapse>
      <RoiCalculator
        apr={aprCalc}
        isNftDetected={isNftDetected}
        isOpen={openCalc}
        setIsOpen={setOpenCalc}
      />
    </React.Fragment>
  );
});
