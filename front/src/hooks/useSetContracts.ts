// Bismillaahirrahmaanirrahiim

import { useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { cakiaAbi, cakiaCa, cakiaNftAbi, cakiaNftCa } from 'contracts';
import ContractContext from 'context/ContractContext';

export function useSetContracts() {
  const { setSigner, setNftContract, setCakiaContract } =
    useContext(ContractContext);

  useEffect(() => {
    const { ethereum } = window as any;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      setSigner(signer);

      const nftContract = new ethers.Contract(cakiaNftCa, cakiaNftAbi, signer);
      setNftContract(nftContract);

      const cakiaContract = new ethers.Contract(cakiaCa, cakiaAbi, signer);
      setCakiaContract(cakiaContract);
    }
  }, [setNftContract, setCakiaContract, setSigner]);
}
