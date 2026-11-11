// src/components/ui/SearchInput.tsx
import { InputHTMLAttributes, ReactNode } from 'react';

import { SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../lib/utils';

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  value: string;
  onChangeValue: (value: string) => void;
  className?: string;
  placeholder?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
}

const SearchInput = ({
  value,
  onChangeValue,
  className,
  placeholder,
  icon = <SearchIcon className='text-kapwa-text-support h-4 w-4' />,
  size = 'md',
  clearable = true,
  id,
  'aria-label': ariaLabel,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'aria-autocomplete': ariaAutocomplete,
  role,
  ...props
}: SearchInputProps) => {
  const { t } = useTranslation('ui');
  const placeholderText = placeholder ?? t('search.placeholder');
  const handleClear = () => {
    onChangeValue('');
  };

  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-14 text-lg',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        {icon}
      </div>
      <input
        id={id}
        type='text'
        role={role}
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        aria-label={ariaLabel ?? placeholderText}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        aria-autocomplete={ariaAutocomplete}
        className={cn(
          'border-kapwa-border-weak bg-kapwa-bg-surface/50 w-full rounded-xl border transition-all duration-200',
          'text-kapwa-text-strong placeholder:text-kapwa-text-disabled',
          'focus:border-kapwa-border-brand focus:ring-kapwa-border-brand/5 focus:bg-kapwa-bg-surface outline-none focus-visible:ring-4',
          sizes[size],
          'pl-11',
          clearable && value ? 'pr-10' : 'pr-4'
        )}
        placeholder={placeholderText}
        {...props}
      />
      {clearable && value && (
        <button
          type='button'
          aria-label={t('search.clear')}
          className='text-kapwa-text-support hover:text-kapwa-text-strong focus-visible:ring-kapwa-border-focus absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus-visible:ring-2 focus-visible:outline-none'
          onClick={handleClear}
        >
          <XIcon className='h-4 w-4' aria-hidden='true' />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
