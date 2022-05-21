// Bismillaahirrahmaanirrahiim

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Divider, Grid } from '@mui/material';
import TokenDetails from './TokenDetails';

type PairDetailsProps = {
  pair: string;
  network: string;
};

export default function PairDetails(props: PairDetailsProps) {
  const { pair, network } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [firstToken, setFirstToken] = useState<any>({});
  const [secondToken, setSecondToken] = useState<any>({});

  useEffect(() => {
    setIsLoading(true);
    const apiUrl = `${process.env.REACT_APP_SERVER}/api/pairdetails?network=${network}&pair=${pair}`;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        if (result.queryRes[0]) {
          setFirstToken(result.queryRes[0]);
        }
        if (result.queryRes[1]) {
          setSecondToken(result.queryRes[1]);
        } else {
          setSecondToken(undefined);
        }
        setIsLoading(false);
      });
  }, [pair, network, setFirstToken, setSecondToken, setIsLoading]);

  return (
    <Box sx={{ width: '100%' }}>
      <Divider sx={{ marginBottom: 2 }} />
      {isLoading && (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TokenDetails token={firstToken} idx={0} />
        </Grid>
        {secondToken && (
          <Grid item xs={12} md={6}>
            <TokenDetails token={secondToken} idx={1} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
