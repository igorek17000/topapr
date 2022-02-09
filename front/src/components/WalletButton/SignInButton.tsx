import { useContext } from 'react';
import { Button } from '@mui/material';
import ContractContext from 'context/ContractContext';
import UserContext from 'context/UserContext';
import { getShortAddress } from 'utils/getShortAddress';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from 'initFirebase';

export default function SignInButton() {
  const { signer } = useContext(ContractContext);
  const {
    setAddress,
    setShortAddress,
    resetAccount,
    setUid,
    setIsUserLoading,
  } = useContext(UserContext);

  const handleClick = () => {
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((acc: string[]) => {
          if (acc.length > 0) {
            const address = acc[0].toLowerCase();
            const shortAddress = getShortAddress(address);

            setAddress(address);
            setShortAddress(shortAddress);

            fetch(`http://localhost:3100/auth/sign/${address}`)
              .then((res) => res.json())
              .then(
                (result) => {
                  if (signer && result.nonce) {
                    signer
                      .signMessage(
                        `Sign In to TopAPR.com \n Sign ID: ${result.nonce}`
                      )
                      .then((signature) => {
                        setIsUserLoading(true);
                        fetch(
                          `http://localhost:3100/auth/verify/${address}/${signature}`
                        )
                          .then((res) => res.json())
                          .then((result) => {
                            if (result.customToken) {
                              // console.log('custom token:', result.customToken);
                              signInWithCustomToken(auth, result.customToken)
                                .then((userCredential) => {
                                  // Signed in
                                  setIsUserLoading(false);
                                  setUid(userCredential.user.uid.toLowerCase());
                                })
                                .catch((error) => {
                                  resetAccount();
                                  console.log(error);
                                });
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
    >
      {signer ? 'Connect Metamask' : 'Install Metamask'}
    </Button>
  );
}
