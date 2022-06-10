// Bismillaahirrahmaanirrahiim

import React, { MouseEvent } from 'react';
import { Box, Stack } from '@mui/material';
import { ChainName, chains } from '../config';
import FilterCheckbox from './FilterCheckbox';
import FilterFormControlLabel from './FilterFormControlLabel';

export type CheckedChain = {
  [x in ChainName]: boolean;
};

type ChainFilterProps = {
  checked: CheckedChain;
  setChecked: React.Dispatch<React.SetStateAction<CheckedChain>>;
};

function ChainFilter(props: ChainFilterProps) {
  const { checked, setChecked } = props;

  const allChecked = chains.reduce(
    (prev, chain) => prev && checked[chain],
    true as boolean
  );

  const partialChecked =
    chains.reduce((prev, chain) => prev || checked[chain], false as boolean) &&
    !allChecked;

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const id = (e as any).target.attributes['data-name'].value;
    if (id) {
      setChecked(
        chains.reduce(
          (prev, chain) => ({
            ...prev,
            [chain]: chain === id,
          }),
          {} as CheckedChain
        )
      );
    }
  };

  const handleClickCheckbox = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setChecked({
      ...checked,
      [(e as any).target.name]: !(checked as any)[(e as any).target.name],
    });
  };

  const handleAllChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(
      chains.reduce(
        (prev, chain) => ({
          ...prev,
          [chain]: event.target.checked,
        }),
        {} as CheckedChain
      )
    );
  };

  return (
    <div>
      <FilterFormControlLabel
        label="All Chains"
        checked={allChecked}
        control={
          <FilterCheckbox
            checked={allChecked}
            indeterminate={partialChecked}
            onChange={handleAllChecked}
          />
        }
      />
      {chains.map((chain) => (
        <FilterFormControlLabel
          key={chain}
          data-name={chain}
          label={
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
              data-name={chain}
            >
              <Box sx={{ display: 'flex' }} data-name={chain}>
                <img
                  src={`/chain/${chain}.png`}
                  style={checked[chain] ? {} : { filter: 'grayscale(100%)' }}
                  alt={chain}
                  width={18}
                  height={18}
                  data-name={chain}
                />
              </Box>
              <div data-name={chain}>{chain}</div>
            </Stack>
          }
          onClick={handleClick}
          checked={checked[chain]}
          control={
            <FilterCheckbox
              name={chain}
              checked={checked[chain]}
              onClick={handleClickCheckbox}
            />
          }
        />
      ))}
    </div>
  );
}

export default ChainFilter;
