// Bismillaahirrahmaanirrahiim

import { useEffect, useState } from 'react';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { numToUsd } from 'utils/numToUsd';
import TokenSocials from './TokenSocials';

type TokenDetailsProps = {
  token: any;
  idx: number;
};

export default function TokenDetails(props: TokenDetailsProps) {
  const { token, idx } = props;
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    dayjs.extend(relativeTime);
    setLastUpdated(dayjs(token.updatedAt).fromNow());
  }, [token, setLastUpdated]);

  return (
    <div>
      <Typography
        variant="caption"
        sx={{
          display: 'inline-block',
          width: '100%',
          padding: 1,
          textAlign: 'right',
          color: '#777',
        }}
      >
        Last updated: {lastUpdated}
      </Typography>
      <Card sx={{ backgroundColor: '#fcfcfc' }}>
        <CardHeader
          avatar={
            <Avatar alt={token.fullname} src={`/token/${token.name}.png`} />
          }
          title={token.name}
          titleTypographyProps={{
            variant: 'h6',
            color: idx === 0 ? 'primary.dark' : 'secondary.dark',
          }}
          subheader={token.fullname}
          action={
            token.price !== 0 ? (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Typography variant="h5" color="info.light">
                  {numToUsd(token.price, 5, 0)}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: token.pricechange < 0 ? 'red' : 'green',
                  }}
                >
                  {token.pricechange ? `${token.pricechange}%` : ''}
                </Typography>
              </Stack>
            ) : null
          }
          sx={{
            '& .MuiCardHeader-action': {
              margin: 'unset',
            },
          }}
        ></CardHeader>
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={2} direction="row">
              <Typography sx={{ minWidth: '120px' }}>Contract:</Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.8rem',
                }}
              >
                {token.address}
              </Typography>
            </Stack>
            {token.site && (
              <Stack spacing={2} direction="row">
                <Typography sx={{ minWidth: '120px' }}>
                  Official site:
                </Typography>
                <Link href={token.site} target="_blank" rel="noreferrer">
                  <Typography component="span" sx={{ marginRight: 1 }}>
                    {token.site}
                  </Typography>
                  <OpenInNewIcon fontSize="inherit" />
                </Link>
              </Stack>
            )}
            {token.socials && (
              <Stack spacing={2} direction="row">
                <Typography sx={{ minWidth: '120px' }}>
                  Social Profiles:
                </Typography>
                <TokenSocials socials={token.socials} />
              </Stack>
            )}
            {token.holders && (
              <Stack spacing={2} direction="row">
                <Typography sx={{ minWidth: '120px' }}>Holders:</Typography>
                <Typography>
                  {token.holders.toLocaleString()} addresses
                </Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
