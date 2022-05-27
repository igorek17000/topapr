// Bismillaahirrahmaanirrahiim

import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';

import ButtonSwitch from './ButtonSwitch';
import Projection from './Projection';

interface RoiCalculatorProps {
  apr: number;
  isNftDetected: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RoiCalculator(props: RoiCalculatorProps) {
  const { apr, isNftDetected, isOpen, setIsOpen } = props;

  const [staked, setStaked] = useState('100');
  const [stakedTime, setStakedTime] = useState('14D');
  const [compoundChecked, setCompoundChecked] = useState(false);
  const [compoundTime, setCompoundTime] = useState('1D');

  const [roi, setRoi] = useState<number>();
  const [compoundEarnings, setCompoundEarnings] = useState([
    { earning: 0, balance: 0 },
  ]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStaked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStaked(event.target.value);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle sx={{ m: 0, px: 3, backgroundColor: '#e6e6e6' }}>
        <span>ROI Calculator</span>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 12,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack sx={{ my: 4, mx: 1 }}>
          <TextField
            label="Staked Amount"
            sx={{ my: 1 }}
            value={staked}
            onChange={handleStaked}
            placeholder="0.00"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />
          <div>
            <Button
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={() => setStaked('10')}
            >
              $10
            </Button>
            <Button
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={() => setStaked('100')}
            >
              $100
            </Button>
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => setStaked('1000')}
            >
              $1000
            </Button>
          </div>
          <Typography variant="caption" sx={{ mt: 3 }}>
            Staked For
          </Typography>
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              1D
            </ButtonSwitch>
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              7D
            </ButtonSwitch>
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              14D
            </ButtonSwitch>
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              1M
            </ButtonSwitch>
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              3M
            </ButtonSwitch>
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              6M
            </ButtonSwitch>
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              1Y
            </ButtonSwitch>
            <ButtonSwitch value={stakedTime} setValue={setStakedTime}>
              5Y
            </ButtonSwitch>
          </ButtonGroup>
          <Typography variant="caption" sx={{ mt: 3 }}>
            Compounding every
          </Typography>
          <div>
            <Checkbox
              defaultChecked
              sx={{ pl: 0 }}
              checked={compoundChecked}
              onClick={() => {
                setCompoundChecked(!compoundChecked);
              }}
              disabled={!isNftDetected}
            />
            <ButtonGroup
              variant="outlined"
              aria-label="outlined button group"
              disabled={!compoundChecked || !isNftDetected}
            >
              <ButtonSwitch
                value={compoundTime}
                setValue={setCompoundTime}
                disabled={!compoundChecked}
              >
                1D
              </ButtonSwitch>
              <ButtonSwitch
                value={compoundTime}
                setValue={setCompoundTime}
                disabled={!compoundChecked}
              >
                3D
              </ButtonSwitch>
              <ButtonSwitch
                value={compoundTime}
                setValue={setCompoundTime}
                disabled={!compoundChecked}
              >
                7D
              </ButtonSwitch>
              <ButtonSwitch
                value={compoundTime}
                setValue={setCompoundTime}
                disabled={!compoundChecked}
              >
                14D
              </ButtonSwitch>
              <ButtonSwitch
                value={compoundTime}
                setValue={setCompoundTime}
                disabled={!compoundChecked}
              >
                30D
              </ButtonSwitch>
              {!isNftDetected && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    height: '36px',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    ml: 2,
                  }}
                >
                  <LockIcon />
                </Box>
              )}
            </ButtonGroup>
          </div>
          <Projection
            apr={apr}
            staked={staked}
            stakedTime={stakedTime}
            compoundChecked={compoundChecked}
            compoundTime={compoundTime}
            roi={roi}
            compoundEarnings={compoundEarnings}
            setRoi={setRoi}
            setCompoundEarnings={setCompoundEarnings}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
