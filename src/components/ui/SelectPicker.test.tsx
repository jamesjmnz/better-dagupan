import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SelectPickerOption } from './SelectPicker';

// i18next is not initialised in the unit suite; resolve keys against the
// shipped English strings so the assertions read like the real UI.
const en = JSON.parse(
  readFileSync(join(process.cwd(), 'public/locales/en/ui.json'), 'utf8')
);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const raw = key
        .split('.')
        .reduce<unknown>(
          (acc, part) => (acc as Record<string, unknown>)?.[part],
          en
        );
      return typeof raw === 'string' ? raw : key;
    },
  }),
}));

const { default: SelectPicker } = await import('./SelectPicker');

const options: SelectPickerOption[] = [
  { label: 'All documents', value: 'all' },
  { label: 'Ordinances', value: 'ordinance' },
  { label: 'Resolutions', value: 'resolution' },
];

/** A consumer that keeps one value, the way the OpenLGU filters do. */
function SingleConsumer({
  onChange,
  initial = 'all',
}: {
  onChange?: (value: string) => void;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <SelectPicker
      options={options}
      selectedValues={value ? [value] : []}
      onSelect={selected => {
        const next = selected[0]?.value ?? '';
        setValue(next);
        onChange?.(next);
      }}
      multiple={false}
      searchable={false}
      placeholder='Type'
    />
  );
}

const trigger = () => screen.getByRole('button', { name: /Type|All|Ord|Res/ });
const open = () => fireEvent.click(trigger());

describe('SelectPicker', () => {
  describe('single select', () => {
    it('replaces the selection instead of adding to it', () => {
      const onChange = vi.fn();
      render(<SingleConsumer onChange={onChange} />);

      open();
      fireEvent.click(screen.getByRole('option', { name: 'Ordinances' }));

      expect(onChange).toHaveBeenLastCalledWith('ordinance');
      expect(trigger()).toHaveTextContent('Ordinances');
      expect(trigger()).not.toHaveTextContent('All documents');

      open();
      fireEvent.click(screen.getByRole('option', { name: 'Resolutions' }));
      expect(onChange).toHaveBeenLastCalledWith('resolution');
      expect(trigger()).toHaveTextContent('Resolutions');
    });

    it('passes exactly one option to onSelect', () => {
      const onSelect = vi.fn();
      render(
        <SelectPicker
          options={options}
          selectedValues={['ordinance']}
          onSelect={onSelect}
          multiple={false}
          searchable={false}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Ordinances/ }));
      fireEvent.click(screen.getByRole('option', { name: 'Resolutions' }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith([options[2]]);
    });

    it('keeps the current option when it is picked again', () => {
      const onChange = vi.fn();
      render(<SingleConsumer onChange={onChange} initial='ordinance' />);

      open();
      fireEvent.click(screen.getByRole('option', { name: 'Ordinances' }));

      expect(onChange).toHaveBeenLastCalledWith('ordinance');
      expect(trigger()).toHaveTextContent('Ordinances');
    });

    it('closes after a pick and marks one option selected', () => {
      render(<SingleConsumer initial='ordinance' />);

      open();
      const listbox = screen.getByRole('listbox');
      expect(listbox).not.toHaveAttribute('aria-multiselectable', 'true');
      expect(
        screen
          .getAllByRole('option')
          .filter(o => o.getAttribute('aria-selected') === 'true')
      ).toHaveLength(1);

      fireEvent.click(screen.getByRole('option', { name: 'Resolutions' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('clears to an empty selection', () => {
      const onChange = vi.fn();
      render(<SingleConsumer onChange={onChange} initial='ordinance' />);

      fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(onChange).toHaveBeenLastCalledWith('');
      expect(trigger()).toHaveTextContent('Type');
    });
  });

  describe('multiple select', () => {
    it('toggles options in and out of the selection and stays open', () => {
      const onSelect = vi.fn();
      function Multi() {
        const [values, setValues] = useState<string[]>([]);
        return (
          <SelectPicker
            options={options}
            selectedValues={values}
            onSelect={selected => {
              setValues(selected.map(o => o.value));
              onSelect(selected.map(o => o.value));
            }}
            searchable={false}
            placeholder='Type'
          />
        );
      }
      render(<Multi />);

      open();
      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-multiselectable',
        'true'
      );
      fireEvent.click(screen.getByRole('option', { name: 'Ordinances' }));
      fireEvent.click(screen.getByRole('option', { name: 'Resolutions' }));
      expect(onSelect).toHaveBeenLastCalledWith(['ordinance', 'resolution']);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('option', { name: 'Ordinances' }));
      expect(onSelect).toHaveBeenLastCalledWith(['resolution']);
    });
  });

  describe('keyboard', () => {
    it('opens with ArrowDown, moves with the arrows and picks with Enter', () => {
      const onChange = vi.fn();
      render(<SingleConsumer onChange={onChange} initial='' />);

      fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveFocus();

      const active = () =>
        document.getElementById(
          listbox.getAttribute('aria-activedescendant') ?? ''
        );
      expect(active()).toHaveTextContent('All documents');

      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      expect(active()).toHaveTextContent('Ordinances');
      fireEvent.keyDown(listbox, { key: 'Enter' });

      expect(onChange).toHaveBeenLastCalledWith('ordinance');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger()).toHaveFocus();
    });

    it('closes with Escape and returns focus to the trigger', () => {
      render(<SingleConsumer />);

      open();
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger()).toHaveFocus();
    });

    it('drives the list from the search box when searchable', () => {
      const onSelect = vi.fn();
      render(
        <SelectPicker
          options={options}
          selectedValues={[]}
          onSelect={onSelect}
          multiple={false}
          placeholder='Type'
        />
      );

      fireEvent.click(trigger());
      const search = screen.getByRole('combobox');
      fireEvent.change(search, { target: { value: 'res' } });
      fireEvent.keyDown(search, { key: 'ArrowDown' });
      fireEvent.keyDown(search, { key: 'Enter' });

      expect(onSelect).toHaveBeenLastCalledWith([options[2]]);
    });
  });

  it('renders without selectedValues', () => {
    render(<SelectPicker options={options} onSelect={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('Select...');
  });

  it('does not nest the clear button inside the trigger', () => {
    render(<SingleConsumer initial='ordinance' />);
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    expect(trigger()).not.toContainElement(clear);
  });
});
