import { Outlet, useLocation } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

import TransparencySidebar from './components/TransparencySidebar';
import { useLguTerms } from '@/lib/useLguTerms';

export default function TransparencyLayout() {
  const { t } = useTranslation('transparency');
  const terms = useLguTerms();
  const location = useLocation();
  const isIndexPage = location.pathname === '/transparency';

  return (
    <SidebarLayout
      sidebar={<TransparencySidebar />}
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      // Unified header using PageHeader component
      headerNode={
        isIndexPage ? (
          <PageHeader
            variant='centered'
            title={t('layout.title')}
            description={t('layout.description', terms)}
          />
        ) : (
          <PageHeader
            variant='compact'
            title={t('layout.title')}
            description={t('layout.compactDescription', terms)}
            autoBreadcrumbs={true}
          />
        )
      }
    >
      <Outlet />
    </SidebarLayout>
  );
}
