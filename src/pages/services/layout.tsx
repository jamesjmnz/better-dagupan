import { useEffect, useState } from 'react';

import { Outlet, useLocation, useSearchParams } from 'react-router-dom';

import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import SearchInput from '@/components/ui/SearchInput';
import { useLguTerms } from '@/lib/useLguTerms';

import ServicesSidebar from './components/ServicesSidebar';

// Additional filter types
export type ServiceSource = 'citizens-charter' | 'community' | 'all';
export type ClassificationFilter = 'Simple' | 'Complex' | 'all';

export interface ServicesOutletContext {
  searchQuery: string;
  selectedCategorySlug: string;
  selectedOfficeDivision: string;
  selectedSource: ServiceSource;
  selectedClassification: ClassificationFilter;
  setOfficeDivision: (division: string) => void;
  setSource: (source: ServiceSource) => void;
  setClassification: (classification: ClassificationFilter) => void;
}

export default function ServicesLayout() {
  const { t } = useTranslation('services');
  const terms = useLguTerms();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isIndexPage =
    location.pathname === '/services' || location.pathname === '/services/';

  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState(initialCategory);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategorySlug(slug);
    setSearchParams({ category: slug });
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategorySlug) {
      setSelectedCategorySlug(categoryFromUrl);
    }
  }, [searchParams, selectedCategorySlug]);

  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });

  // New filter states
  const [selectedOfficeDivision, setSelectedOfficeDivision] = useState('all');
  const [selectedSource, setSelectedSource] = useState<ServiceSource>('all');
  const [selectedClassification, setSelectedClassification] =
    useState<ClassificationFilter>('all');

  return (
    <SidebarLayout
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      // Unified header using PageHeader component
      headerNode={
        isIndexPage ? (
          <PageHeader
            variant='hero'
            title={t('layout.title')}
            description={t('layout.description', terms)}
            actions={
              <SearchInput
                placeholder={t('layout.searchPlaceholder')}
                value={searchQuery}
                onChangeValue={setSearchQuery}
                size='md'
              />
            }
          />
        ) : (
          <PageHeader
            variant='compact'
            title={t('layout.directoryTitle')}
            description={t('layout.directoryDescription')}
            autoBreadcrumbs={true}
          />
        )
      }
      sidebar={
        <ServicesSidebar
          selectedCategorySlug={selectedCategorySlug}
          handleCategoryChange={handleCategoryChange}
        />
      }
    >
      <Outlet
        context={{
          searchQuery,
          selectedCategorySlug,
          selectedOfficeDivision,
          selectedSource,
          selectedClassification,
          setOfficeDivision: setSelectedOfficeDivision,
          setSource: setSelectedSource,
          setClassification: setSelectedClassification,
        }}
      />
    </SidebarLayout>
  );
}
