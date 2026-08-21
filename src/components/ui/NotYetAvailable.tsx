import { FC } from 'react';

import { FileQuestion } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';

import { EmptyState } from './EmptyState';

/**
 * Shown wherever the portal has structure but no verified records yet.
 *
 * The inherited Los Banos datasets were removed rather than shown under a
 * Dagupan heading, so these sections are genuinely empty until sourced records
 * are verified. The copy says exactly that instead of implying a search
 * returned nothing.
 */
export const NotYetAvailable: FC<{ title?: string }> = ({ title }) => {
  const { t } = useTranslation('common');
  const values = { lgu: config.lgu.name };

  return (
    <EmptyState
      title={title ?? t('emptyState.title', values)}
      message={t('emptyState.body', values)}
      icon={FileQuestion}
      actionHref={`${config.portal.githubUrl}/issues/new?template=contribution.yml`}
      actionLabel={t('emptyState.contribute', values)}
    />
  );
};
