import { FC, ReactNode } from 'react';

import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Marks a detail this portal has not verified.
 *
 * The wording matters more than the styling. "No contact listed" tells a
 * reader the barangay has no phone number, which is not something we know;
 * this says only that Better Dagupan has not sourced it yet. Missing data
 * must never be presented as an established absence.
 */
export const NotVerified: FC<{
  /** What specifically is unverified. Falls back to the generic label. */
  label?: string;
  /** Optional longer explanation, e.g. why a roster is being withheld. */
  detail?: ReactNode;
  className?: string;
}> = ({ label, detail, className }) => {
  const { t } = useTranslation('common');

  return (
    <div
      className={`border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-start gap-2 rounded-lg border border-dashed p-3 ${className ?? ''}`}
    >
      <HelpCircle
        aria-hidden='true'
        className='text-kapwa-text-disabled mt-0.5 h-3.5 w-3.5 shrink-0'
      />
      <div className='min-w-0'>
        <p className='text-kapwa-text-support text-xs font-semibold'>
          {label ?? t('civic.notVerified')}
        </p>
        <p className='text-kapwa-text-disabled mt-0.5 text-[11px] leading-relaxed'>
          {detail ?? t('civic.notVerifiedHint')}
        </p>
      </div>
    </div>
  );
};
