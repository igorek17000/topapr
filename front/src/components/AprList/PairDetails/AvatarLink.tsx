// Bismillaahirrahmaanirrahiim

import { useEffect, useState } from 'react';
import { Avatar, Link } from '@mui/material';

type AvatarLinkProps = {
  provider: string;
  url?: string;
  id?: string;
};

const img: any = {
  coingecko: '/socials/coingecko.ico',
  cmc: '/socials/cmc.png',
  birdeye: '/socials/birdeye.png',
};

export default function AvatarLink(props: AvatarLinkProps) {
  const { provider, url, id } = props;
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (url) {
      setBaseUrl(url);
    } else {
      if (provider === 'coingecko')
        setBaseUrl(`https://www.coingecko.com/en/coins/${id}/`);
      if (provider === 'cmc')
        setBaseUrl(`https://coinmarketcap.com/currencies/${id}/`);
    }
  }, [provider, url, id, setBaseUrl]);

  return (
    <Link
      href={baseUrl}
      sx={{
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'middle',
        marginRight: '8px',
      }}
      target="_blank"
    >
      <Avatar
        src={img[provider]}
        sx={{
          border: provider === 'birdeye' ? '1px solid #ccc' : 'none',
          width: '24px',
          height: '24px',
        }}
      />
    </Link>
  );
}
