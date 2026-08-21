import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { config } from '@/lib/lguConfig';

// Resolve against the real locale file so this asserts the copy that ships,
// not a placeholder. i18next is not initialised in the unit suite, so an
// unmocked useTranslation would return the key instead of the sentence.
const en = JSON.parse(
  readFileSync(join(process.cwd(), 'public/locales/en/common.json'), 'utf8')
);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) => {
      const raw = key
        .split('.')
        .reduce<unknown>(
          (acc, part) => (acc as Record<string, unknown>)?.[part],
          en
        );
      if (typeof raw !== 'string') return key;
      return raw.replace(
        /\{\{(\w+)\}\}/g,
        (_, name: string) => values?.[name] ?? `{{${name}}}`
      );
    },
  }),
}));

const { DisclaimerLine, DisclaimerNotice } = await import('../Disclaimer');

describe('DisclaimerLine', () => {
  it('states that the portal is independent and not the official website', () => {
    render(<DisclaimerLine />);

    const text = screen.getByText(/independent, community-led project/i);
    expect(text).toBeInTheDocument();
    expect(text.textContent).toMatch(
      /not the official website of the City Government of Dagupan/i
    );
  });

  it('takes the names from config rather than hardcoding them', () => {
    render(<DisclaimerLine />);

    expect(
      screen.getByText(new RegExp(config.portal.name))
    ).toBeInTheDocument();
    expect(screen.getByText(new RegExp(config.lgu.name))).toBeInTheDocument();
  });
});

describe('DisclaimerNotice', () => {
  it('disclaims affiliation and links to the real city government site', () => {
    render(<DisclaimerNotice />);

    expect(
      screen.getByText(
        /not affiliated with or endorsed by any government agency/i
      )
    ).toBeInTheDocument();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', config.lgu.officialWebsite);
    expect(link).toHaveAttribute('href', 'https://www.dagupan.gov.ph');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('is exposed as a labelled landmark', () => {
    render(<DisclaimerNotice />);

    expect(
      screen.getByRole('complementary', {
        name: /independent community project/i,
      })
    ).toBeInTheDocument();
  });
});
