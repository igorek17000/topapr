import React from 'react';
import FilterCheckbox from './FilterCheckbox';
import FilterFormControlLabel from './FilterFormControlLabel';

export const chains = ['Avalanche', 'BSC', 'ETH', 'HECO', 'Solana'] as const;

export type ChainName = typeof chains[number];

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
          label={chain}
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
