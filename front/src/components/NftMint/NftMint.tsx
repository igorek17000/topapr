import { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { ethers } from 'ethers';
import NftMintButton from './NftMintButton';
import CakiaAllowance from './CakiaAllowance';
import UserContext from 'context/UserContext';
import ContractContext from 'context/ContractContext';
import { cakiaNftCa } from 'contracts';
import { Divider, Typography } from '@mui/material';
import NftList from './NftList';

export default function NftMint() {
  const { address } = useContext(UserContext);
  const { cakiaContract } = useContext(ContractContext);
  const [currentAllowance, setCurrentAllowance] = useState(0);
  const [isCakiaApproved, setIsCakiaApproved] = useState(true);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // get tokenPrice
  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_SERVER}/nft/price`)
      .then((res) => res.json())
      .then((result) => {
        // console.log(result);
        if (result && result.cakiaPrice) {
          setTokenPrice(result.cakiaPrice.usdPrice);
        } else {
          setTokenPrice(undefined);
        }
      })
      .catch(() => {
        setTokenPrice(undefined);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // get Allowance
  useEffect(() => {
    (async function () {
      if (cakiaContract && address) {
        let cakiaTxn = await cakiaContract.allowance(address, cakiaNftCa);

        const allowance = parseFloat(ethers.utils.formatEther(cakiaTxn._hex));
        // console.log('Get allowance', allowance);

        if (allowance !== currentAllowance) {
          setCurrentAllowance(allowance);
        }

        if (allowance < 1000) {
          setIsCakiaApproved(false);
        } else {
          setIsCakiaApproved(true);
        }
      }
    })();
  }, [cakiaContract, currentAllowance, address]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ my: 1, textAlign: 'center' }}>
        <Typography variant="subtitle2">
          CAKIA Contract Address - BSC:
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: {
              xs: '0.8rem',
              md: '1.25rem',
            },
          }}
        >
          0x248b291290796c5743814bD18cAE46D37268E17d
        </Typography>
        {tokenPrice && (
          <Typography variant="subtitle2">
            1 CAKIA = $
            {tokenPrice.toLocaleString(undefined, {
              maximumFractionDigits: 3,
            })}
          </Typography>
        )}
      </Box>
      <Box sx={{ width: '100%' }}>
        <Divider sx={{ my: 4 }} />
      </Box>
      {isCakiaApproved ? (
        <NftMintButton tokenPrice={tokenPrice} isLoading={isLoading} />
      ) : (
        <CakiaAllowance
          isCakiaApproved={isCakiaApproved}
          setCurrentAllowance={setCurrentAllowance}
          tokenPrice={tokenPrice}
          isLoading={isLoading}
        />
      )}
      <NftList />
    </Box>
  );
}
