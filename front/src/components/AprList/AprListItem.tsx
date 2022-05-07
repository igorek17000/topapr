// Bismillahirrahmaanirraahiim

import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Farm } from 'types';
import PairImg from './PairImg';
import ButtonPool from './ButtonPool';
import { PoolName } from './config';
import RoiCalculator from './RoiCalculator';

type AprListItemProps = {
  farm: Farm;
  isNftDetected: boolean;
};

export default React.memo(function AprListItem(props: AprListItemProps) {
  const { farm, isNftDetected } = props;
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
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
            {farm.pair}
          </Grid>
          <Grid item xs>
            <Typography variant="caption">APR</Typography>
            <div>{(farm.apr as number).toLocaleString()}%</div>
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
            <div>{farm.pool}</div>
          </Grid>
          <Grid item xs>
            <Typography variant="caption">Chain</Typography>
            <div>{farm.network}</div>
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
            <RoiCalculator apr={farm.apr} isNftDetected={isNftDetected} />
          </ListItem>
        </List>
      </Collapse>
    </React.Fragment>
  );
});
