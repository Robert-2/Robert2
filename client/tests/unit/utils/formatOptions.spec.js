import formatOptions from '@/utils/formatOptions';

describe('formatOptions', () => {
  const emptyOptions = [
    { value: '', label: 'N/A' },
  ];

  it('returns an array with only one empty option', () => {
    expect(formatOptions()).toEqual(emptyOptions);
    expect(formatOptions(null)).toEqual(emptyOptions);
    expect(formatOptions([])).toEqual(emptyOptions);
  });

  it('returns a set of options with given list of entities', () => {
    const entities = [
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
    ];
    const options = formatOptions(entities);
    expect(options).toEqual([
      { value: 1, label: 'test1' },
      { value: 2, label: 'test2' },
    ]);
  });

  it('returns a set of options with given list of entities and custom fields to create label', () => {
    const entities = [
      { id: 1, title: 'test1', phone: '0123456789' },
      {
        id: 2,
        title: 'test2',
        phone: '0987654321',
        company: { id: 1, name: 'Testing' },
      },
    ];
    const options = formatOptions(entities, ['title', 'phone', '−', 'company.name']);
    expect(options).toEqual([
      { value: 1, label: 'test1 0123456789 −' },
      { value: 2, label: 'test2 0987654321 − Testing' },
    ]);
  });

  it('returns a set of options with given list of entities, plus an empty one at position 0', () => {
    const entities = [
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
    ];
    const options = formatOptions(entities, undefined, 'Choose...');
    expect(options).toEqual([
      { value: '', label: 'Choose...' },
      { value: 1, label: 'test1' },
      { value: 2, label: 'test2' },
    ]);
  });
});
