// Bismillaahirrahmaanirrahiim

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Dialog, DialogContent } from '@mui/material';
import CardDetails from './CardDetails';

type TokenDetailsProps = {
  token: string;
  network: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TokenDetails(props: TokenDetailsProps) {
  const { token, network, isOpen, setIsOpen } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const apiUrl = `${process.env.REACT_APP_SERVER}/api/details?network=${network}&token=${token}`;
      fetch(apiUrl)
        .then((res) => res.json())
        .then((result) => {
          // console.log(result);
          if (result.queryRes[0]) {
            setTokenData(result.queryRes[0]);
          } else {
            setTokenData({});
          }
          setIsLoading(false);
        });
    }
  }, [token, network, isOpen, setTokenData, setIsLoading]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', margin: 2 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <CardDetails token={tokenData} />
        )}
      </DialogContent>
    </Dialog>
  );
}
