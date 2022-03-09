import React from 'react';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Farm } from 'types';
import PairImg from './PairImg';

type AprListItemProps = {
  farm: Farm;
};

export default React.memo(function AprListItem(props: AprListItemProps) {
  const { farm } = props;

  return (
    <ListItem
      sx={{
        mx: {
          md: '24px',
        },
      }}
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
      </Grid>
    </ListItem>
  );
});
