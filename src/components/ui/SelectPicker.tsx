import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../lib/utils';

export interface SelectPickerOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SelectPickerProps<T extends string = string> {
  options: SelectPickerOption<T>[];
  /**
   * Called with the whole new selection. In single-select mode that is one
   * option, or none after the selection is cleared.
   */
  onSelect: (options: SelectPickerOption<T>[]) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  /**
   * Allow more than one option. Off, a pick replaces the selection and
   * closes the list. Defaults to true, which is how every consumer used the
   * component before single-select existed.
   */
  multiple?: boolean;
  /**
   * The current selection, for a controlled picker. Leave it out and the
   * picker keeps its own selection.
   */
  selectedValues?: string[];
  /** Accessible name for the option list; defaults to the placeholder. */
  'aria-label'?: string;
}

const SelectPicker = <T extends string = string>({
  options,
  onSelect,
  placeholder,
  className,
  size = 'md',
  disabled = false,
  searchable = true,
  clearable = true,
  multiple = true,
  selectedValues,
  'aria-label': ariaLabel,
}: SelectPickerProps<T>) => {
  const { t } = useTranslation('ui');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ownValues, setOwnValues] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(
    'bottom'
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const listboxId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  // Read the selection straight from the props when controlled. (Copying it
  // into state from an effect left the picker a render behind its parent,
  // and looped forever with the old `selectedValues = []` default.)
  const values = selectedValues ?? ownValues;
  const selectedOptions = options.filter(opt => values.includes(opt.value));
  const isSelected = (option: SelectPickerOption<T>) =>
    values.includes(option.value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const commit = (next: SelectPickerOption<T>[]) => {
    if (selectedValues === undefined) setOwnValues(next.map(o => o.value));
    onSelect(next);
  };

  const close = ({ restoreFocus = false } = {}) => {
    setIsOpen(false);
    setSearchTerm('');
    setActiveIndex(-1);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const handleSelect = (option: SelectPickerOption<T>) => {
    if (!multiple) {
      // Picking the current option again keeps it; clearing is the clear
      // button's job, as in a native <select>.
      commit([option]);
      close({ restoreFocus: true });
      return;
    }
    commit(
      isSelected(option)
        ? selectedOptions.filter(o => o.value !== option.value)
        : [...selectedOptions, option]
    );
  };

  const handleClear = () => {
    commit([]);
    triggerRef.current?.focus();
  };

  const checkDropdownPosition = () => {
    if (!triggerRef.current) return 'bottom';
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 240;
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) return 'top';
    return 'bottom';
  };

  const openList = () => {
    if (disabled) return;
    setDropdownPosition(checkDropdownPosition());
    const firstSelected = options.findIndex(isSelected);
    setActiveIndex(firstSelected >= 0 ? firstSelected : 0);
    setIsOpen(true);
  };

  const handleToggle = () => {
    if (isOpen) close();
    else openList();
  };

  // Focus moves into the popup once it has rendered: the search box when
  // there is one, otherwise the listbox itself.
  useEffect(() => {
    if (!isOpen) return;
    if (searchable) searchInputRef.current?.focus();
    else listboxRef.current?.focus();
  }, [isOpen, searchable]);

  // Keep the active option in view while arrowing through a long list.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [isOpen, activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps -- optionId only derives from the stable useId value

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActiveIndex(0);
  };

  const handleTriggerKeyDown = (e: KeyboardEvent) => {
    if (isOpen || disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openList();
    }
  };

  /** Shared by the listbox and the search box, whichever has focus. */
  const handleListKeyDown = (e: KeyboardEvent) => {
    const last = filteredOptions.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, last));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(last);
        break;
      case 'Enter':
      case ' ': {
        // Space types into the search box rather than picking.
        if (e.key === ' ' && e.target === searchInputRef.current) break;
        e.preventDefault();
        const option = filteredOptions[activeIndex];
        if (option) handleSelect(option);
        break;
      }
      case 'Escape':
        e.preventDefault();
        close({ restoreFocus: true });
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setActiveIndex(-1);
      }
    };
    const handleResizeOrScroll = () => {
      if (isOpen) setDropdownPosition(checkDropdownPosition());
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen]);

  const sizes = { sm: 'h-9 text-sm', md: 'h-11 text-base', lg: 'h-14 text-lg' };
  const placeholderText = placeholder ?? t('select.placeholder');
  const showClear = clearable && selectedOptions.length > 0 && !disabled;
  const activeOptionId =
    isOpen && activeIndex >= 0 && activeIndex < filteredOptions.length
      ? optionId(activeIndex)
      : undefined;

  return (
    <div
      className={cn('relative w-full', className)}
      ref={dropdownRef}
      // Tabbing (or otherwise moving focus) out of the picker closes it.
      onBlur={e => {
        if (isOpen && !dropdownRef.current?.contains(e.relatedTarget)) close();
      }}
    >
      <button
        ref={triggerRef}
        type='button'
        className={cn(
          'bg-kapwa-bg-surface flex w-full items-center justify-between rounded-lg border text-left transition-all',
          'focus:ring-kapwa-border-brand/20 focus:border-kapwa-border-brand focus:ring-2',
          sizes[size],
          disabled
            ? 'bg-kapwa-bg-surface cursor-not-allowed opacity-60'
            : 'hover:border-kapwa-border-strong',
          isOpen &&
            'border-kapwa-border-brand ring-kapwa-border-brand/20 ring-2',
          // Room for the clear button, which sits over the trigger.
          showClear ? 'pr-16 pl-3' : 'pr-9 pl-3'
        )}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
      >
        <span
          className={cn(
            'truncate',
            selectedOptions.length > 0
              ? 'text-kapwa-text-strong'
              : 'text-kapwa-text-support'
          )}
        >
          {selectedOptions.length > 0
            ? selectedOptions.map(o => o.label).join(', ')
            : placeholderText}
        </span>
        <ChevronDownIcon
          aria-hidden='true'
          className={cn(
            'text-kapwa-text-support pointer-events-none absolute top-1/2 right-3 h-4 w-4 shrink-0 -translate-y-1/2 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* A sibling of the trigger, not a child: a button cannot hold one. */}
      {showClear && (
        <button
          type='button'
          className='hover:bg-kapwa-bg-hover focus-visible:ring-kapwa-border-focus absolute top-1/2 right-8 -translate-y-1/2 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none'
          onClick={handleClear}
          aria-label={t('select.clear')}
        >
          <XIcon
            className='text-kapwa-text-support h-4 w-4'
            aria-hidden='true'
          />
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            'bg-kapwa-bg-surface absolute z-50 max-h-60 w-full overflow-hidden rounded-lg border shadow-lg',
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {searchable && (
            <div className='border-kapwa-border-weak border-b p-2'>
              <div className='relative'>
                <SearchIcon
                  className='text-kapwa-text-support absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
                  aria-hidden='true'
                />
                <input
                  ref={searchInputRef}
                  type='text'
                  role='combobox'
                  aria-expanded='true'
                  aria-controls={listboxId}
                  aria-autocomplete='list'
                  aria-activedescendant={activeOptionId}
                  aria-label={t('select.search')}
                  className='focus:ring-kapwa-border-brand focus:border-kapwa-border-brand border-kapwa-border-weak w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none'
                  placeholder={t('select.search')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleListKeyDown}
                />
              </div>
            </div>
          )}
          <div className='max-h-48 overflow-y-auto'>
            {filteredOptions.length > 0 ? (
              <ul
                ref={listboxRef}
                id={listboxId}
                role='listbox'
                aria-label={ariaLabel ?? placeholderText}
                aria-multiselectable={multiple || undefined}
                aria-activedescendant={searchable ? undefined : activeOptionId}
                tabIndex={searchable ? -1 : 0}
                onKeyDown={searchable ? undefined : handleListKeyDown}
                className='focus-visible:ring-kapwa-border-focus py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset'
              >
                {filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    className={cn(
                      'cursor-pointer px-3 py-2 text-sm transition-colors',
                      'hover:bg-kapwa-bg-surface-brand hover:text-kapwa-text-brand-bold',
                      isSelected(option) &&
                        'bg-kapwa-bg-brand-weak text-kapwa-text-brand-bold',
                      index === activeIndex &&
                        'bg-kapwa-bg-surface-brand text-kapwa-text-brand-bold ring-kapwa-border-brand ring-1 ring-inset'
                    )}
                    onClick={() => handleSelect(option)}
                    onMouseMove={() => setActiveIndex(index)}
                    role='option'
                    aria-selected={isSelected(option)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className='text-kapwa-text-support px-3 py-2 text-center text-sm'>
                {t('select.noOptions')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectPicker;
