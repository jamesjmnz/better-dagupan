import { CreditCard, Hammer, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

const sections = [
  {
    nameKey: 'sidebar.financial',
    slug: 'financial',
    icon: CreditCard,
  },
  {
    nameKey: 'sidebar.procurement',
    slug: 'procurement',
    icon: Hammer,
  },
  {
    nameKey: 'sidebar.infrastructure',
    slug: 'infrastructure',
    icon: Truck,
  },
];

export default function TransparencySidebar() {
  const { t } = useTranslation('transparency');

  return (
    <SidebarContainer title={t('sidebar.title')}>
      {sections.map(section => (
        <SidebarItem
          key={section.slug}
          label={t(section.nameKey)}
          icon={section.icon}
          path={`${section.slug}`}
        />
      ))}
    </SidebarContainer>
  );
}
