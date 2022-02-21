import { Stack } from '@mui/material';
import React from 'react';
import FilterCheckbox from './FilterCheckbox';
import FilterFormControlLabel from './FilterFormControlLabel';

export const pools = [
  'PancakeSwap',
  'Mdex-BSC',
  'Mdex-Heco',
  'Raydium',
  'TraderJoe',
  'Sushi',
] as const;

export type PoolName = typeof pools[number];

export type CheckedPool = {
  [x in PoolName]: boolean;
};

type PoolFilterProps = {
  checked: CheckedPool;
  setChecked: React.Dispatch<React.SetStateAction<CheckedPool>>;
};

function PoolFilter(props: PoolFilterProps) {
  const { checked, setChecked } = props;

  const allChecked = pools.reduce(
    (prev, pool) => prev && checked[pool],
    true as boolean
  );

  const partialChecked =
    pools.reduce((prev, pool) => prev || checked[pool], false as boolean) &&
    !allChecked;

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({
      ...checked,
      [event.target.name]: event.target.checked,
    });
  };

  const handleAllChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(
      pools.reduce(
        (prev, pool) => ({
          ...prev,
          [pool]: event.target.checked,
        }),
        {} as CheckedPool
      )
    );
  };

  return (
    <div>
      <FilterFormControlLabel
        label="All Pools"
        checked={allChecked}
        control={
          <FilterCheckbox
            checked={allChecked}
            indeterminate={partialChecked}
            onChange={handleAllChecked}
          />
        }
      />
      {pools.map((pool) => (
        <FilterFormControlLabel
          key={pool}
          label={
            <Stack direction="row" spacing={1}>
              <div>
                <img
                  src={`/pool/${pool}.png`}
                  style={checked[pool] ? {} : { filter: 'grayscale(100%)' }}
                  alt={pool}
                  width={18}
                  height={18}
                />
              </div>
              <div>{pool}</div>
            </Stack>
          }
          checked={checked[pool]}
          control={
            <FilterCheckbox
              name={pool}
              checked={checked[pool]}
              onChange={handleChecked}
            />
          }
        />
      ))}
    </div>
  );
}

export default PoolFilter;
