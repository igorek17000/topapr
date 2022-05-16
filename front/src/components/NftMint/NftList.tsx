// Bismillaahirrahmaanirrahiim

import { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/system';
import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import UserContext from 'context/UserContext';

interface NftListProps {}

export default function NftList(props: NftListProps) {
  const { address } = useContext(UserContext);
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // get nfts
  useEffect(() => {
    setIsLoading(true);
    if (address) {
      fetch(`${process.env.REACT_APP_SERVER}/nft`, {
        headers: {
          Authorization: `Bearer ${address}:`,
        },
      })
        .then((res) => res.json())
        .then((result) => {
          // console.log(result);
          if (result && result.nfts) {
            setNfts(result.nfts);
          } else {
            setNfts([]);
          }
        })
        .catch(() => {
          setNfts([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setNfts([]);
      setIsLoading(false);
    }
  }, [address]);

  return (
    <Box sx={{ width: '100%' }}>
      <Divider sx={{ my: 4 }} />
      {isLoading && <CircularProgress sx={{ margin: 2 }} />}
      {nfts.length > 0 && !isLoading && (
        <Box>
          <Typography variant="h6" sx={{ marginLeft: 2 }}>
            Your NFTs:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            {nfts.map((nft: any) => (
              <Card sx={{ minWidth: 150, margin: 2 }} key={nft.token_id}>
                <CardContent>
                  <Typography color="text.secondary" variant="caption">
                    ID: {nft.block_number}
                  </Typography>
                  <Typography color="Highlight">Cakia NFT</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
      {nfts.length === 0 && !isLoading && (
        <Typography variant="body1" sx={{ marginLeft: 2 }}>
          You don't have Cakia NFT yet.
        </Typography>
      )}
    </Box>
  );
}
