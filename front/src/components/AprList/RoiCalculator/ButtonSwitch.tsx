// Bismillahirrahmaanirraahiim

import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface ButtonSwitchProps extends ButtonProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function ButtonSwitch(props: ButtonSwitchProps) {
  const { value, setValue, children, disabled, ...buttonProps } = props;

  return (
    <Button
      variant="outlined"
      onClick={() => {
        setValue(children as string);
      }}
      sx={
        value === children && !disabled
          ? { background: '#1976d2 !important', color: 'white' }
          : {}
      }
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
