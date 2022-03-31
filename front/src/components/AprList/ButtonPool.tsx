import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { PoolName, poolsName, poolsUrl } from './config';

interface ButtonPoolProps extends ButtonProps {
  poolName: PoolName;
}

export default function ButtonPool(props: ButtonPoolProps) {
  const { poolName, ...buttonProps } = props;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    window.open(poolsUrl[poolName], '_blank');
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      sx={{ textTransform: 'none' }}
      endIcon={
        <img
          src={`/pool/${poolName}.png`}
          alt={poolName}
          width={18}
          height={18}
        />
      }
    >
      Go To {poolsName[poolName]}
    </Button>
  );
}
