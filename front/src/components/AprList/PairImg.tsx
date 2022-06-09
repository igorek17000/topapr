// Bismillaahirrahmaanirrahiim

import { Avatar, Stack } from '@mui/material';

type PairProps = {
  pair: string;
};

export default function PairImg(props: PairProps) {
  const { pair } = props;
  const pairSplit = pair.split('-');
  const firstToken = pairSplit[0];
  const secondToken = pairSplit[1];

  return (
    <Stack direction="row" spacing={-1}>
      <Avatar
        alt={firstToken}
        src={`/token/${firstToken}.png`}
        sx={{ width: 28, height: 28, zIndex: 10 }}
      />
      <Avatar
        alt={secondToken}
        src={`/token/${secondToken}.png`}
        sx={{ width: 28, height: 28, zIndex: 9 }}
      />
    </Stack>
  );
}
