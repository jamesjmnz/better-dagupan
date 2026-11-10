import { FileText, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { scrollToTop } from '@/lib/scrollUtils';
import { getCategoryIconBySlug } from '@/lib/serviceIcons';

import serviceCategories from '@/data/service_categories.json';
import { config } from '@/lib/lguConfig';

interface ServicesSidebarProps {
  selectedCategorySlug: string;
  handleCategoryChange: (slug: string) => void;
}

export default function ServicesSidebar({
  selectedCategorySlug,
  handleCategoryChange,
}: ServicesSidebarProps) {
  const { t } = useTranslation('services');

  return (
    <div className='space-y-6'>
      <SidebarContainer title={t('sidebar.categories')}>
        <ul className='space-y-1'>
          {/* Special "All Services" item */}
          <SidebarItem
            label={t('sidebar.allServices')}
            icon={FileText}
            isActive={selectedCategorySlug === 'all'}
            onClick={() => {
              scrollToTop();
              handleCategoryChange('all');
            }}
          />

          {/* Dynamic Categories */}
          {serviceCategories.categories.map(category => (
            <SidebarItem
              key={category.slug}
              label={t(`categories.${category.slug}`, {
                defaultValue: category.name,
              })}
              icon={getCategoryIconBySlug(category.slug)}
              isActive={selectedCategorySlug === category.slug}
              onClick={() => {
                scrollToTop();
                handleCategoryChange(category.slug);
              }}
            />
          ))}
        </ul>
      </SidebarContainer>
      <div className='p-5 mt-8 space-y-4 rounded-2xl border-2 shadow-sm border-kapwa-orange-100 bg-kapwa-bg-accent-orange-weak/30'>
        <div className='flex gap-3 items-center'>
          <div className='p-2 rounded-lg bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange'>
            <PlusCircle className='w-5 h-5' />
          </div>
          <h4 className='text-sm font-bold leading-tight text-kapwa-text-strong'>
            {t('sidebar.missingTitle')}
          </h4>
        </div>

        <p className='text-xs leading-relaxed text-kapwa-text-support'>
          {t('sidebar.missingBody', { portal: config.portal.name })}
        </p>

        <a
          href={`${config.portal.githubUrl}/issues/new?template=contribution.yml`}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-kapwa-bg-warning-active hover:bg-kapwa-orange-900 shadow-md text-kapwa-text-inverse flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all'
        >
          {t('sidebar.suggest')}
        </a>
      </div>
    </div>
  );
}
