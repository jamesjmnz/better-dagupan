import { Outlet } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { PageHeader, SectionBlock } from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

import StatisticsSidebar from './components/StatisticsSidebar';
import { useLguTerms } from '@/lib/useLguTerms';

export default function StatisticsLayout() {
  const { t } = useTranslation('statistics');
  const terms = useLguTerms();

  return (
    <div className='min-h-screen bg-kapwa-bg-surface'>
      <PageHeader
        variant='centered'
        title={t('layout.title', terms)}
        description={t('layout.description', terms)}
      />

      <SectionBlock>
        <SidebarLayout sidebar={<StatisticsSidebar />} collapsible={true}>
          <Outlet />
        </SidebarLayout>
      </SectionBlock>
    </div>
  );
}
