// Bismillaahirrahmaanirrahiim

import React, { MouseEvent } from 'react';
import { Box, Stack } from '@mui/material';
import { PoolName, pools, poolsName } from '../config';
import FilterCheckbox from './FilterCheckbox';
import FilterFormControlLabel from './FilterFormControlLabel';

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

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const id = (e as any).target.attributes['data-name'].value;
    if (id) {
      setChecked(
        pools.reduce(
          (prev, pool) => ({
            ...prev,
            [pool]: pool === id,
          }),
          {} as CheckedPool
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
          onClick={handleClick}
          data-name={pool}
          label={
            <Stack
              direction="row"
              spacing={1}
              data-name={pool}
              sx={{ alignItems: 'center' }}
            >
              <Box sx={{ display: 'flex' }}>
                <img
                  src={`/pool/${pool}.png`}
                  style={checked[pool] ? {} : { filter: 'grayscale(100%)' }}
                  alt={pool}
                  data-name={pool}
                  width={18}
                  height={18}
                />
              </Box>
              <div data-name={pool}>{poolsName[pool]}</div>
            </Stack>
          }
          checked={checked[pool]}
          control={
            <FilterCheckbox
              name={pool}
              checked={checked[pool]}
              onClick={handleClickCheckbox}
            />
          }
        />
      ))}
    </div>
  );
}

export default PoolFilter;
