import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DetailSection } from '@/components/layout/PageLayouts';
import { RequirementCard } from './RequirementCard';
import { Requirement } from '@/types/citizens-charter';

interface RequirementGridProps {
  requirements: Requirement[];
}

export function RequirementGrid({ requirements }: RequirementGridProps) {
  const { t } = useTranslation('services');

  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <DetailSection title={t('requirements.title')} icon={FileText}>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {requirements.map((req, idx) => (
          <RequirementCard key={idx} requirement={req} />
        ))}
      </div>
    </DetailSection>
  );
}
