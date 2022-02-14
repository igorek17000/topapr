import React, { useContext, useState } from 'react';
import { ethers } from 'ethers';
import { Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import NftMintButton from './NftMintButton';
import ContractContext from 'context/ContractContext';

interface CakiaAllowanceProps {
  isCakiaApproved: boolean;
  setCurrentAllowance: React.Dispatch<React.SetStateAction<number>>;
}

export default function CakiaAllowance(props: CakiaAllowanceProps) {
  const { isCakiaApproved, setCurrentAllowance } = props;
  const { cakiaContract } = useContext(ContractContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    try {
      if (cakiaContract) {
        let nftTxn = await cakiaContract.increaseAllowance(
          '0x5481307Ebc228f8B791b7b684cAaA6F9e781ddD9',
          ethers.utils.parseEther('100000')
        );

        setIsLoading(true);
        // console.log('Approving... please wait');
        await nftTxn.wait();

        setIsLoading(false);
        setCurrentAllowance(100000);
        // console.log('Approved');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box>
      <Box component="span" sx={{ marginRight: '24px' }}>
        {isLoading ? (
          <LoadingButton
            loading
            variant="contained"
            loadingPosition="start"
            startIcon={<SaveIcon />}
          >
            Approving...
          </LoadingButton>
        ) : (
          <Button
            variant="contained"
            onClick={handleApprove}
            disabled={isCakiaApproved || isLoading}
            sx={{ textTransform: 'none' }}
          >
            Approve CAKIA
          </Button>
        )}
      </Box>
      <NftMintButton disabled={!isCakiaApproved} />
    </Box>
  );
}
