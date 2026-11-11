import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';

export default function Discord() {
  const { t } = useTranslation('pages');
  useEffect(function () {
    window.location.assign(config.portal.discordUrl);
  }, []);
  return <h1>{t('discord.redirecting', { portal: config.portal.name })}</h1>;
}
