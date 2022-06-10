// Bismillaahirrahmaanirrahiim

import React, { MouseEvent, useContext, useEffect } from 'react';
import { Box, Stack, CircularProgress, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import FilterCheckbox from './FilterCheckbox';
import FilterFormControlLabel from './FilterFormControlLabel';
import { HedgeName, hedges } from '../config';
import UserContext from 'context/UserContext';

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
  const { address } = useContext(UserContext);

  useEffect(() => {
    if (!address) {
      setChecked(
        hedges.reduce(
          (prev, hedge) => ({
            ...prev,
            [hedge]: false,
          }),
          {} as CheckedHedge
        )
      );
    }
  }, [address, setChecked]);

  const allChecked = hedges.reduce(
    (prev, hedge) => prev && checked[hedge],
    true as boolean
  );

  const partialChecked =
    hedges.reduce((prev, hedge) => prev || checked[hedge], false as boolean) &&
    !allChecked;

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (nfts.length > 0) {
      const id = (e as any).target.attributes['data-name'].value;
      if (id) {
        setChecked(
          hedges.reduce(
            (prev, hedge) => ({
              ...prev,
              [hedge]: hedge === id,
            }),
            {} as CheckedHedge
          )
        );
      }
    }
  };

  const handleClickCheckbox = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (nfts.length > 0) {
      setChecked({
        ...checked,
        [(e as any).target.name]: !(checked as any)[(e as any).target.name],
      });
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
              onClick={handleClick}
              data-name={hedge}
              label={
                <Stack
                  direction="row"
                  spacing={1}
                  data-name={hedge}
                  sx={{ alignItems: 'center' }}
                >
                  <Box sx={{ display: 'flex' }} data-name={hedge}>
                    <img
                      src={`/hedge/${hedge}.png`}
                      style={
                        checked[hedge] ? {} : { filter: 'grayscale(100%)' }
                      }
                      alt={hedge}
                      width={18}
                      height={18}
                      data-name={hedge}
                    />
                  </Box>
                  <div data-name={hedge}>{hedge}</div>
                </Stack>
              }
              checked={checked[hedge]}
              control={
                <FilterCheckbox
                  name={hedge}
                  checked={checked[hedge] || false}
                  onClick={handleClickCheckbox}
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
