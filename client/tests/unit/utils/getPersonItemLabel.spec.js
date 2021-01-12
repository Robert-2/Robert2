import getPersonItemLabel from '@/utils/getPersonItemLabel';

describe('getPersonItemLabel', () => {
  it('returns a label string with name from basic person data', () => {
    const person = {
      id: 1,
      first_name: 'Jean',
      last_name: 'Testing',
    };
    expect(getPersonItemLabel(person)).toEqual('Testing Jean');
  });

  it('returns a label string with name and company when defined in person data', () => {
    const person = {
      id: 1,
      first_name: 'Jean',
      last_name: 'Testing',
      company: { legal_name: 'Pulsanova' },
    };
    expect(getPersonItemLabel(person)).toEqual('Testing Jean − Pulsanova');
  });

  it('returns a label string with name and locality when defined in person data', () => {
    const person = {
      id: 1,
      first_name: 'Jean',
      last_name: 'Testing',
      locality: 'French Alps',
    };
    expect(getPersonItemLabel(person)).toEqual('Testing Jean − French Alps');
  });

  it('returns a label string with name, company and locality when defined in person data', () => {
    const person = {
      id: 1,
      first_name: 'Jean',
      last_name: 'Testing',
      locality: 'French Alps',
      company: { legal_name: 'Pulsanova' },
    };
    expect(getPersonItemLabel(person)).toEqual('Testing Jean − Pulsanova − French Alps');
  });

  it('returns the same label when already defined', () => {
    expect(getPersonItemLabel({ id: 1, label: 'test' })).toEqual('test');
  });
});
