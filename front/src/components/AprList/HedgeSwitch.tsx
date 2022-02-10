import React, { useContext, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import LockIcon from '@mui/icons-material/Lock';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserContext from 'context/UserContext';
import { Box } from '@mui/system';

interface HedgeSwitchProps {
  isHedge: boolean;
  setIsHedge: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HedgeSwitch(props: HedgeSwitchProps) {
  const { isHedge, setIsHedge } = props;
  const navigate = useNavigate();
  const { isHavingNft } = useContext(UserContext);

  useEffect(() => {
    if (!isHavingNft) {
      setIsHedge(false);
    }
  }, [isHavingNft, setIsHedge]);

  const handleIsHedgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsHedge(event.target.checked);
  };

  return (
    <Grid container>
      <Grid item>
        <FormGroup sx={{ maxWidth: '180px' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isHedge}
                disabled={!isHavingNft}
                onChange={handleIsHedgeChange}
              />
            }
            label={isHavingNft ? 'Hedge' : 'Premium'}
          />
        </FormGroup>
      </Grid>
      <Grid item>
        <Box sx={{ display: isHavingNft ? 'none' : 'block' }}>
          <Tooltip title="Get an NFT to unlock this feature">
            <IconButton
              color="primary"
              onClick={() => {
                navigate('./nft');
              }}
            >
              <LockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );
}
