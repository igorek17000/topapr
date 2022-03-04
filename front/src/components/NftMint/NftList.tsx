import { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/system';
import UserContext from 'context/UserContext';
import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';

export default function NftList() {
  const { idToken, uid } = useContext(UserContext);
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (uid) {
      fetch(`${process.env.REACT_APP_SERVER}/nft`, {
        headers: {
          Authorization: idToken ? `Bearer ${uid}:${idToken}` : '',
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result && result.nfts) {
            setNfts(result.nfts);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setNfts([]);
      setIsLoading(false);
    }
  }, [uid, idToken]);

  // console.log(nfts);

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
