import { Trophy, Users, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useLguTerms } from '@/lib/useLguTerms';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

export default function StatisticsSidebar() {
  const { t } = useTranslation('statistics');
  const terms = useLguTerms();
  const sections = [
    {
      path: '/statistics',
      label: t('sidebar.demographics'),
      icon: Users,
      description: t('sidebar.demographicsDescription'),
    },
    {
      path: '/statistics/competitiveness',
      label: t('sidebar.competitiveness'),
      icon: Trophy,
      description: t('sidebar.competitivenessDescription'),
    },
    {
      path: '/statistics/municipal-income',
      label: t('sidebar.income', terms),
      icon: Wallet,
      description: t('sidebar.incomeDescription'),
    },
  ];

  return (
    <SidebarContainer title={t('sidebar.title', terms)}>
      <ul className='space-y-1'>
        {sections.map(section => (
          <SidebarItem key={section.path} {...section} />
        ))}
      </ul>
    </SidebarContainer>
  );
}
