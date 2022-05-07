// Bismillahirrahmaanirraahiim

import FormControlLabel from '@mui/material/FormControlLabel';
import { FormControlLabelProps } from '@mui/material';

export default function FilterFormControlLabel(props: FormControlLabelProps) {
  return (
    <FormControlLabel
      {...props}
      sx={{
        border: 'solid 1px #e5e5e5',
        paddingRight: '16px',
        marginLeft: '0px',
        marginRight: '16px',
        marginBottom: '12px',
        backgroundColor: props.checked ? 'white' : '#f1f1f1',
        color: props.checked ? 'rgba(0, 0, 0, 0.86)' : 'rgba(0, 0, 0, 0.6)',
      }}
    />
  );
}
