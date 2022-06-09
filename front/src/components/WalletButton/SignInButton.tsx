// Bismillaahirrahmaanirrahiim

import { useContext } from 'react';
import { Avatar, Button } from '@mui/material';
import ContractContext from 'context/ContractContext';
import UserContext from 'context/UserContext';
import { getShortAddress } from 'utils/getShortAddress';
// import jwt_decode from 'jwt-decode';

export default function SignInButton() {
  const { signer } = useContext(ContractContext);
  const { setAddress, setShortAddress, resetAccount, setIsUserLoading } =
    useContext(UserContext);

  const handleClick = () => {
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((acc: string[]) => {
          if (acc.length > 0) {
            const address = acc[0].toLowerCase();
            const shortAddress = getShortAddress(address);

            fetch(`${process.env.REACT_APP_SERVER}/auth/sign/${address}`)
              .then((res) => res.json())
              .then(
                (result) => {
                  if (signer && result.nonce) {
                    signer
                      .signMessage(
                        `Sign In to TopAPR.com\nSign ID: ${result.nonce}`
                      )
                      .then((signature) => {
                        setIsUserLoading(true);
                        fetch(
                          `${process.env.REACT_APP_SERVER}/auth/verify/${address}/${signature}`
                        )
                          .then((res) => res.json())
                          .then((result) => {
                            const { token } = result;
                            if (token) {
                              // console.log(token);
                              // console.log('decode', jwt_decode(token));

                              setIsUserLoading(false);
                              setAddress(address);
                              setShortAddress(shortAddress);

                              sessionStorage.setItem('data', token);
                            } else {
                              setIsUserLoading(false);
                            }
                          });
                      });
                  }
                },
                (error) => {
                  resetAccount();
                  console.log(error);
                }
              );
          }
        });
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleClick}
      sx={{ textTransform: 'none' }}
      startIcon={
        <Avatar
          src="/metamask.png"
          variant="rounded"
          sx={{ width: 22, height: 22, mr: '4px' }}
        />
      }
    >
      {signer ? 'Sign In' : 'Install Metamask'}
    </Button>
  );
}
