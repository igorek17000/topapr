import React, { useContext, useState } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import ContractContext from 'context/ContractContext';

interface NftMintButtonProps extends ButtonProps {}

export default function NftMintButton(props: NftMintButtonProps) {
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
        <Button {...props} variant="contained" onClick={handleMint}>
          Mint NFT
        </Button>
      )}
    </React.Fragment>
  );
}
