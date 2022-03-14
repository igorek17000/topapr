import { Box } from '@mui/system';
import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';

interface NftListProps {
  nfts: any[];
  isLoading: boolean;
}

export default function NftList(props: NftListProps) {
  const { nfts, isLoading } = props;

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
