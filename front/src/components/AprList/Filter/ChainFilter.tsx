import { Stack } from '@mui/material';
import React from 'react';
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

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({
      ...checked,
      [event.target.name]: event.target.checked,
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
          label={
            <Stack direction="row" spacing={1}>
              <div>
                <img
                  src={`/chain/${chain}.png`}
                  style={checked[chain] ? {} : { filter: 'grayscale(100%)' }}
                  alt={chain}
                  width={18}
                  height={18}
                />
              </div>
              <div>{chain}</div>
            </Stack>
          }
          checked={checked[chain]}
          control={
            <FilterCheckbox
              name={chain}
              checked={checked[chain]}
              onChange={handleChecked}
            />
          }
        />
      ))}
    </div>
  );
}

export default ChainFilter;
