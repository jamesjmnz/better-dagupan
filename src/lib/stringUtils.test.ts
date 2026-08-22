/* eslint-disable @typescript-eslint/no-explicit-any */
// Test code uses any for mock data which is acceptable in test context
import { describe, it, expect } from 'vitest';
import { formatGovName, toTitleCase } from './stringUtils';

/**
 * Four of Dagupan's barangays are named with Roman numerals ("Barangay I",
 * "Barangay II", "Barangay IV") and these helpers cannot render them. Both
 * lowercase the whole word before re-capitalising the first letter, so "II"
 * becomes "Ii". The barangay pages therefore render the PSGC name verbatim
 * instead of formatting it, and these tests pin the reason down so nobody
 * reintroduces the call and ships "Barangay Ii" to a resident.
 */
describe('Roman-numeral names these formatters cannot handle', () => {
  it('toTitleCase() mangles Roman numerals', () => {
    expect(toTitleCase('Barangay II')).toBe('Barangay Ii');
    expect(toTitleCase('Barangay IV')).toBe('Barangay Iv');
  });

  it('formatGovName() mangles Roman numerals too', () => {
    expect(formatGovName('Barangay III', 'barangay')).toBe('Iii');
  });

  it('does not strip a mixed-case "Barangay " prefix the way callers assume', () => {
    // The page code used barangay_name.replace('BARANGAY ', ''), which only
    // matches the uppercase form the inherited dataset happened to use.
    expect('Barangay II'.replace('BARANGAY ', '')).toBe('Barangay II');
  });

  it('leaves ordinary PSGC names unchanged, which is why verbatim is safe', () => {
    for (const name of ['Bonuan Gueset', 'Pugaro Suit', 'Poblacion Oeste']) {
      expect(toTitleCase(name)).toBe(name);
    }
  });
});

describe('formatGovName() - government name formatter', () => {
  describe('department type', () => {
    it('removes "DEPARTMENT OF" prefix', () => {
      const result = formatGovName('DEPARTMENT OF AGRICULTURE', 'department');
      expect(result).toBe('Agriculture');
    });

    it('removes lowercase "department of"', () => {
      const result = formatGovName('department of health', 'department');
      expect(result).toBe('Health');
    });

    it('capitalizes first word', () => {
      const result = formatGovName('MUNICIPAL HEALTH OFFICE', 'department');
      expect(result).toBe('Municipal Health Office');
    });

    it('keeps acronyms uppercase', () => {
      const result = formatGovName('MDRRMO OFFICE', 'department');
      expect(result).toBe('MDRRMO Office');
    });

    it('keeps minor words lowercase', () => {
      const result = formatGovName('DEPARTMENT OF THE INTERIOR', 'department');
      expect(result).toBe('The Interior');
    });

    it('handles multiple acronyms', () => {
      const result = formatGovName('MDRRMO AND MSWDO DEPARTMENT', 'department');
      expect(result).toBe('MDRRMO and MSWDO Department');
    });

    it('handles empty string', () => {
      const result = formatGovName('', 'department');
      expect(result).toBe('');
    });

    it('handles null/undefined', () => {
      const result = formatGovName(null as any, 'department');
      expect(result).toBe('');
    });
  });

  describe('barangay type', () => {
    it('removes "BARANGAY" prefix', () => {
      const result = formatGovName('BARANGAY SAN JOSE', 'barangay');
      expect(result).toBe('San Jose');
    });

    it('removes lowercase "barangay"', () => {
      const result = formatGovName('barangay batong malake', 'barangay');
      expect(result).toBe('Batong Malake');
    });

    it('capitalizes first word after prefix', () => {
      const result = formatGovName('BARANGAY ANONG', 'barangay');
      expect(result).toBe('Anong');
    });

    it('handles barangay with acronyms', () => {
      const result = formatGovName('BARANGAY MDRRMO CENTER', 'barangay');
      expect(result).toBe('MDRRMO Center');
    });
  });
});

describe('toTitleCase() - title case formatter', () => {
  it('capitalizes first letter of each word', () => {
    const result = toTitleCase('hello world');
    expect(result).toBe('Hello World');
  });

  it('keeps acronyms uppercase', () => {
    const result = toTitleCase('GAD OFFICE');
    expect(result).toBe('GAD Office');
  });

  it('handles multiple acronyms', () => {
    const result = toTitleCase('BPLO AND MDRRMO');
    expect(result).toBe('BPLO and MDRRMO');
  });

  it('keeps minor words lowercase except first word', () => {
    const result = toTitleCase('MAYOR OF THE TOWN');
    expect(result).toBe('Mayor of the Town');
  });

  it('capitalizes first word even if minor word', () => {
    const result = toTitleCase('the office of mayor');
    expect(result).toBe('The Office of Mayor');
  });

  it('handles mixed case input', () => {
    const result = toTitleCase('municipal health office');
    expect(result).toBe('Municipal Health Office');
  });

  it('handles empty string', () => {
    const result = toTitleCase('');
    expect(result).toBe('');
  });

  it('handles null/undefined', () => {
    const result = toTitleCase(null as any);
    expect(result).toBe('');
  });

  it('handles single word', () => {
    const result = toTitleCase('mayor');
    expect(result).toBe('Mayor');
  });

  it('handles acronym as first word', () => {
    const result = toTitleCase('ICT DEPARTMENT');
    expect(result).toBe('ICT Department');
  });

  it('handles all minor words', () => {
    const result = toTitleCase('of and the in for on');
    expect(result).toBe('Of and the in for on');
  });

  it('handles complex string with acronyms and minor words', () => {
    const result = toTitleCase('MUNICIPAL DISASTER MDRRMO OFFICE');
    expect(result).toBe('Municipal Disaster MDRRMO Office');
  });

  it('handles minor word after first word', () => {
    const result = toTitleCase('MAYOR OF MUNICIPALITY');
    expect(result).toBe('Mayor of Municipality');
  });

  it('handles multiple consecutive minor words', () => {
    const result = toTitleCase('HEAD OF THE OFFICE');
    expect(result).toBe('Head of the Office');
  });

  it('handles acronym after minor word', () => {
    const result = toTitleCase('CITY OF BFP');
    expect(result).toBe('City of BFP');
  });
});
