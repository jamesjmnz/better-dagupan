import {
  Landmark,
  LayoutGrid,
  Scale,
  Scroll,
  Signature,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  SidebarContainer,
  SidebarGroup,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import CurrentTermCard from './CurrentTermCard';
import type { DocumentItem, Term } from '@/lib/openlgu';

interface OpenLGUSidebarProps {
  filterType: string;
  setFilterType: (
    type: 'all' | 'ordinance' | 'resolution' | 'executive_order'
  ) => void;
  terms: Array<{
    id: string;
    ordinal: string;
    name: string;
    year_range: string;
    term_number: number;
  }>;
  persons: Array<{ id: string }>;
  term: Term | null;
  documents: DocumentItem[];
}

export default function OpenLGUSidebar({
  filterType,
  terms,
  persons,
  term,
  documents,
}: OpenLGUSidebarProps) {
  const { t } = useTranslation('openlgu');
  const categories = [
    { id: 'all', label: t('common.allDocuments'), icon: LayoutGrid },
    { id: 'ordinance', label: t('common.ordinances'), icon: Scale },
    { id: 'resolution', label: t('common.resolutions'), icon: Scroll },
    {
      id: 'executive_order',
      label: t('common.executiveOrders'),
      icon: Signature,
    },
  ];

  return (
    <SidebarContainer title={t('common.portal')}>
      {/* Current Term Stats */}
      {term && <CurrentTermCard term={term} documents={documents} />}

      {/* Group 1: Browse */}
      <SidebarGroup title={t('sidebar.browse')}>
        <SidebarItem
          label={t('sidebar.legislativeTerms')}
          description={t('sidebar.termCount', { count: terms.length })}
          path='/openlgu/terms'
          icon={Landmark}
        />
        <SidebarItem
          label={t('common.officials')}
          description={t('sidebar.officialCount', { count: persons.length })}
          path='/openlgu/officials'
          icon={Users}
        />
      </SidebarGroup>

      {/* Group 2: Document Types */}
      <SidebarGroup title={t('sidebar.documentTypes')}>
        {categories.map(cat => {
          const path =
            cat.id === 'all' ? '/openlgu' : `/openlgu?type=${cat.id}`;
          return (
            <SidebarItem
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              path={path}
              isActive={filterType === cat.id}
            />
          );
        })}
      </SidebarGroup>
    </SidebarContainer>
  );
}
