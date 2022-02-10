import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export const sortByItems = ['APR', 'Total value', 'Name'] as const;
export type SortBy = typeof sortByItems[number];

type SortBySelectProps = {
  sortBy: SortBy;
  handleChange: (event: SelectChangeEvent) => void;
};

export default function SortBySelect(props: SortBySelectProps) {
  const { sortBy, handleChange } = props;

  return (
    <FormControl fullWidth>
      <InputLabel id="sortBy-select-label">Sort By</InputLabel>
      <Select
        labelId="sortBy-select-label"
        id="sortBy-select"
        value={sortBy}
        label="Sort By"
        onChange={handleChange}
      >
        {sortByItems.map((sortBy) => (
          <MenuItem value={sortBy} key={sortBy}>
            {sortBy}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
