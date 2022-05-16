// Bismillaahirrahmaanirrahiim

import React from 'react';
import { Box, Stack, CircularProgress, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import FilterCheckbox from './FilterCheckbox';
import FilterFormControlLabel from './FilterFormControlLabel';
import { HedgeName, hedges } from '../config';

export type CheckedHedge = {
  [x in HedgeName]: boolean;
};

type HedgeFilterProps = {
  nfts: any[];
  isNftLoading: boolean;
  checked: CheckedHedge;
  setChecked: React.Dispatch<React.SetStateAction<CheckedHedge>>;
};

function HedgeFilter(props: HedgeFilterProps) {
  const { nfts, checked, setChecked, isNftLoading } = props;

  const allChecked = hedges.reduce(
    (prev, hedge) => prev && checked[hedge],
    true as boolean
  );

  const partialChecked =
    hedges.reduce((prev, hedge) => prev || checked[hedge], false as boolean) &&
    !allChecked;

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (nfts.length > 0) {
      setChecked({
        ...checked,
        [event.target.name]: event.target.checked,
      });
    } else {
      console.log('no nft');
    }
  };

  const handleAllChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (nfts.length > 0) {
      setChecked(
        hedges.reduce(
          (prev, hedge) => ({
            ...prev,
            [hedge]: event.target.checked,
          }),
          {} as CheckedHedge
        )
      );
    } else {
      console.log('no nft');
    }
  };

  return (
    <div>
      <Tooltip
        title={
          isNftLoading
            ? 'Loading...'
            : nfts.length === 0
            ? 'No NFT detected. You need to have an NFT to use this feature'
            : ''
        }
        placement="top"
      >
        <span>
          <FilterFormControlLabel
            label="All Hedges"
            checked={allChecked || false}
            control={
              <FilterCheckbox
                checked={allChecked}
                indeterminate={partialChecked}
                onChange={handleAllChecked}
              />
            }
            disabled={isNftLoading || nfts.length === 0}
          />
        </span>
      </Tooltip>
      {hedges.map((hedge) => (
        <Tooltip
          title={
            isNftLoading
              ? 'Loading...'
              : nfts.length === 0
              ? 'No NFT detected. You need to have an NFT to use this feature'
              : ''
          }
          placement="top"
          key={hedge}
        >
          <span>
            <FilterFormControlLabel
              key={hedge}
              label={
                <Stack direction="row" spacing={1}>
                  <div>
                    <img
                      src={`/hedge/${hedge}.png`}
                      style={
                        checked[hedge] ? {} : { filter: 'grayscale(100%)' }
                      }
                      alt={hedge}
                      width={18}
                      height={18}
                    />
                  </div>
                  <div>{hedge}</div>
                </Stack>
              }
              checked={checked[hedge]}
              control={
                <FilterCheckbox
                  name={hedge}
                  checked={checked[hedge] || false}
                  onChange={handleChecked}
                />
              }
              disabled={isNftLoading || nfts.length === 0}
            />
          </span>
        </Tooltip>
      ))}
      <Box component={'span'}>
        {!isNftLoading && (
          <Tooltip
            title={
              nfts.length > 0
                ? 'NFT detected.'
                : 'No NFT detected. You need to have an NFT to use this feature'
            }
            placement="top"
          >
            {nfts.length > 0 ? <LockOpenIcon /> : <LockIcon />}
          </Tooltip>
        )}
        {isNftLoading && <CircularProgress size={20} />}
      </Box>
    </div>
  );
}

export default HedgeFilter;
