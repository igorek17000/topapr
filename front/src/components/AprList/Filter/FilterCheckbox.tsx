import Checkbox from '@mui/material/Checkbox';
import { CheckboxProps } from '@mui/material';

export default function FilterCheckbox(props: CheckboxProps) {
  return (
    <Checkbox
      {...props}
      sx={{
        '& svg': {
          width: '0.7em',
          height: '0.7em',
        },
      }}
    />
  );
}
