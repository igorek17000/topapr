import React, { useContext, useState } from 'react';
import { ethers } from 'ethers';
import { Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import NftMintButton from './NftMintButton';
import ContractContext from 'context/ContractContext';
import { cakiaNftCa } from 'contracts';

interface CakiaAllowanceProps {
  isCakiaApproved: boolean;
  setCurrentAllowance: React.Dispatch<React.SetStateAction<number>>;
  tokenPrice?: number;
  isLoading?: boolean;
}

export default function CakiaAllowance(props: CakiaAllowanceProps) {
  const { isCakiaApproved, setCurrentAllowance, tokenPrice, isLoading } = props;
  const { cakiaContract } = useContext(ContractContext);
  const [isApproveLoading, setIsApproveLoading] = useState(false);

  const handleApprove = async () => {
    try {
      if (cakiaContract) {
        let nftTxn = await cakiaContract.increaseAllowance(
          cakiaNftCa,
          ethers.utils.parseEther('100000')
        );

        setIsApproveLoading(true);
        // console.log('Approving... please wait');
        await nftTxn.wait();

        setIsApproveLoading(false);
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
        {isApproveLoading ? (
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
            disabled={isCakiaApproved || isApproveLoading}
            sx={{ textTransform: 'none' }}
          >
            Approve CAKIA
          </Button>
        )}
      </Box>
      <NftMintButton
        disabled={!isCakiaApproved}
        tokenPrice={tokenPrice}
        isLoading={isLoading}
      />
    </Box>
  );
}
