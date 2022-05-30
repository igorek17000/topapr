// Bismillaahirrahmaanirrahiim

import { useEffect, useState } from 'react';
import { SocialIcon } from 'react-social-icons';
import AvatarLink from './AvatarLink';

type TokenSocialsProps = {
  socials: string;
};

export default function TokenSocials(props: TokenSocialsProps) {
  const { socials } = props;
  const [socialData, setSocialData] = useState<string[]>([]);

  useEffect(() => {
    const socialsArr = socials.replace('Email: ', 'Email: mailto:').split('||');
    setSocialData(socialsArr);
  }, [socials, setSocialData]);

  return (
    <div>
      {socialData.map((social, idx) => {
        const socialUrl = social.split(': ');
        if (socialUrl[1]) {
          if (socialUrl[0] === 'CoinGecko')
            return (
              <AvatarLink
                key={`social-${idx}`}
                provider="coingecko"
                id={socialUrl[1]}
              />
            );
          if (socialUrl[0] === 'CoinMarketCap')
            return (
              <AvatarLink
                key={`social-${idx}`}
                provider="cmc"
                id={socialUrl[1]}
              />
            );

          const network = (() => {
            if (socialUrl[0] === 'Telegram') return 'telegram';
            if (socialUrl[0] === 'Discord') return 'discord';

            return '';
          })();

          return (
            <SocialIcon
              key={`social-${idx}`}
              url={socialUrl[1]}
              network={network}
              style={{ width: 24, height: 24, marginRight: 8 }}
              target="_blank"
            />
          );
        } else if (socialUrl[0]) {
          if (socialUrl[0].includes('birdeye.so'))
            return (
              <AvatarLink
                key={`social-${idx}`}
                provider="birdeye"
                url={socialUrl[0]}
              />
            );
        }

        return null;
      })}
    </div>
  );
}
