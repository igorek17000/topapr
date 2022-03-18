import { Stack } from '@mui/material';
import React from 'react';
import FilterCheckbox from './FilterCheckbox';
import FilterFormControlLabel from './FilterFormControlLabel';

export const hedges = ['MEXC'] as const;

export type HedgeName = typeof hedges[number];

export type CheckedHedge = {
  [x in HedgeName]: boolean;
};

type HedgeFilterProps = {
  checked: CheckedHedge;
  setChecked: React.Dispatch<React.SetStateAction<CheckedHedge>>;
};

function HedgeFilter(props: HedgeFilterProps) {
  const { checked, setChecked } = props;

  const allChecked = hedges.reduce(
    (prev, hedge) => prev && checked[hedge],
    true as boolean
  );

  const partialChecked =
    hedges.reduce((prev, hedge) => prev || checked[hedge], false as boolean) &&
    !allChecked;

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({
      ...checked,
      [event.target.name]: event.target.checked,
    });
  };

  const handleAllChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(
      hedges.reduce(
        (prev, hedge) => ({
          ...prev,
          [hedge]: event.target.checked,
        }),
        {} as CheckedHedge
      )
    );
  };

  return (
    <div>
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
      />
      {hedges.map((hedge) => (
        <FilterFormControlLabel
          key={hedge}
          label={
            <Stack direction="row" spacing={1}>
              <div>
                <img
                  src={`/hedge/${hedge}.png`}
                  style={checked[hedge] ? {} : { filter: 'grayscale(100%)' }}
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
        />
      ))}
    </div>
  );
}

export default HedgeFilter;
