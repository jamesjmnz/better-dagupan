import { Building2, CheckCircle2, FileText, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ScrollArea } from '@/components/ui/ScrollArea';
import { getAllOfficeDivisions } from '@/lib/services';

// Types
export type ServiceSource = 'citizens-charter' | 'community' | 'all';
export type ClassificationFilter = 'Simple' | 'Complex' | 'all';

interface ServiceFiltersProps {
  selectedOfficeDivision: string;
  selectedSource: ServiceSource;
  selectedClassification: ClassificationFilter;
  onOfficeDivisionChange: (division: string) => void;
  onSourceChange: (source: ServiceSource) => void;
  onClassificationChange: (classification: ClassificationFilter) => void;
}

export default function ServiceFilters({
  selectedOfficeDivision,
  selectedSource,
  selectedClassification,
  onOfficeDivisionChange,
  onSourceChange,
  onClassificationChange,
}: ServiceFiltersProps) {
  const { t } = useTranslation('services');
  const officeDivisions = getAllOfficeDivisions();

  return (
    <div className='border-kapwa-border-weak bg-kapwa-bg-surface space-y-5 rounded-2xl border p-5 shadow-sm'>
      {/* Source Filter */}
      <div>
        <div className='mb-3 flex items-center gap-2'>
          <CheckCircle2 className='text-kapwa-text-disabled h-4 w-4' />
          <h4 className='text-kapwa-text-strong text-xs font-bold uppercase tracking-wider'>
            {t('filters.dataSource')}
          </h4>
        </div>
        <div className='flex flex-wrap gap-2'>
          <SourceBadge
            source='all'
            selected={selectedSource === 'all'}
            onClick={() => onSourceChange('all')}
          />
          <SourceBadge
            source='citizens-charter'
            selected={selectedSource === 'citizens-charter'}
            onClick={() => onSourceChange('citizens-charter')}
          />
          <SourceBadge
            source='community'
            selected={selectedSource === 'community'}
            onClick={() => onSourceChange('community')}
          />
        </div>
      </div>

      {/* Classification Filter (only for Citizens Charter services) */}
      <div>
        <div className='mb-3 flex items-center gap-2'>
          <Layers className='text-kapwa-text-disabled h-4 w-4' />
          <h4 className='text-kapwa-text-strong text-xs font-bold uppercase tracking-wider'>
            {t('filters.classification')}
          </h4>
        </div>
        <div className='flex flex-wrap gap-2'>
          <ClassificationBadge
            classification='all'
            selected={selectedClassification === 'all'}
            onClick={() => onClassificationChange('all')}
          />
          <ClassificationBadge
            classification='Simple'
            selected={selectedClassification === 'Simple'}
            onClick={() => onClassificationChange('Simple')}
          />
          <ClassificationBadge
            classification='Complex'
            selected={selectedClassification === 'Complex'}
            onClick={() => onClassificationChange('Complex')}
          />
        </div>
      </div>

      {/* Office Division Filter */}
      <div>
        <div className='mb-3 flex items-center gap-2'>
          <Building2 className='text-kapwa-text-disabled h-4 w-4' />
          <h4 className='text-kapwa-text-strong text-xs font-bold uppercase tracking-wider'>
            {t('filters.officeDivision')}
          </h4>
        </div>
        <ScrollArea className='h-48'>
          <div className='space-y-1 pr-2'>
            <OfficeDivisionItem
              division={t('filters.allOffices')}
              value='all'
              selected={selectedOfficeDivision === 'all'}
              onClick={() => onOfficeDivisionChange('all')}
            />
            {officeDivisions.map(division => (
              <OfficeDivisionItem
                key={division}
                division={division}
                value={division}
                selected={selectedOfficeDivision === division}
                onClick={() => onOfficeDivisionChange(division)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Source Badge Component
interface SourceBadgeProps {
  source: ServiceSource;
  selected: boolean;
  onClick: () => void;
}

function SourceBadge({ source, selected, onClick }: SourceBadgeProps) {
  const { t } = useTranslation('services');
  const labels: Record<Exclude<ServiceSource, 'all'>, string> = {
    'citizens-charter': t('source.official'),
    community: t('source.community'),
  };

  const isSelected = source === 'all';

  return (
    <button
      type='button'
      onClick={onClick}
      className={`transition-all ${
        selected
          ? 'border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand'
          : 'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:border-kapwa-border-weak hover:bg-kapwa-bg-surface-raised'
      } inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold`}
    >
      {isSelected ? (
        <>
          <CheckCircle2 className='h-3.5 w-3.5' />
          {t('source.allSources')}
        </>
      ) : (
        <>
          <FileText className='h-3.5 w-3.5' />
          {labels[source]}
        </>
      )}
    </button>
  );
}

// Classification Badge Component
interface ClassificationBadgeProps {
  classification: ClassificationFilter;
  selected: boolean;
  onClick: () => void;
}

function ClassificationBadge({
  classification,
  selected,
  onClick,
}: ClassificationBadgeProps) {
  const { t } = useTranslation('services');

  return (
    <button
      type='button'
      onClick={onClick}
      className={`transition-all ${
        selected
          ? 'border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand'
          : 'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:border-kapwa-border-weak hover:bg-kapwa-bg-surface-raised'
      } inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold`}
    >
      {classification === 'all' ? (
        <>{t('filters.allTypes')}</>
      ) : (
        <>
          <Layers className='h-3.5 w-3.5' />
          {classification}
        </>
      )}
    </button>
  );
}

// Office Division Item Component
interface OfficeDivisionItemProps {
  division: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}

function OfficeDivisionItem({
  division,
  selected,
  onClick,
}: OfficeDivisionItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`w-full text-left transition-all ${
        selected
          ? 'bg-kapwa-bg-brand-weak text-kapwa-text-brand'
          : 'text-kapwa-text-support hover:bg-kapwa-bg-surface-raised'
      } rounded-lg px-3 py-2 text-xs font-medium`}
    >
      {division}
    </button>
  );
}
