// Bismillaahirrahmaanirrahiim

import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import ContractContext from 'context/ContractContext';

interface NftMintButtonProps extends ButtonProps {
  tokenPrice?: number;
  isLoading?: boolean;
}

export default function NftMintButton(props: NftMintButtonProps) {
  const { tokenPrice, isLoading, ...rest } = props;
  const { nftContract } = useContext(ContractContext);
  const [isMining, setIsMining] = useState(false);

  const handleMint = async () => {
    try {
      if (nftContract) {
        let nftTxn = await nftContract.mint();

        setIsMining(true);
        console.log('Minting... please wait');
        await nftTxn.wait();

        setIsMining(false);
        console.log('Minted');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <React.Fragment>
      {isMining ? (
        <LoadingButton
          loading
          variant="contained"
          loadingPosition="start"
          startIcon={<SaveIcon />}
        >
          Minting...
        </LoadingButton>
      ) : (
        <Button {...rest} variant="contained" onClick={handleMint}>
          Mint NFT
        </Button>
      )}
      <Box sx={{ my: 1 }}>
        <Typography variant="body2">
          NFT Cost: 20 CAKIA{' '}
          {isLoading && (
            <CircularProgress
              size={12}
              sx={{
                mx: '8px',
              }}
            />
          )}
          {tokenPrice
            ? `($${(tokenPrice * 20).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })})`
            : ''}
        </Typography>
      </Box>
    </React.Fragment>
  );
}
