import { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { ethers } from 'ethers';
import NftMintButton from './NftMintButton';
import CakiaAllowance from './CakiaAllowance';
import UserContext from 'context/UserContext';
import ContractContext from 'context/ContractContext';
import { cakiaNftCa } from 'contracts';

export default function NftMint() {
  const { address } = useContext(UserContext);
  const { cakiaContract } = useContext(ContractContext);
  const [currentAllowance, setCurrentAllowance] = useState(0);
  const [isCakiaApproved, setIsCakiaApproved] = useState(true);

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
        height: 'calc(100vh - 120px)',
      }}
    >
      {isCakiaApproved ? (
        <NftMintButton />
      ) : (
        <CakiaAllowance
          isCakiaApproved={isCakiaApproved}
          setCurrentAllowance={setCurrentAllowance}
        />
      )}
    </Box>
  );
}
