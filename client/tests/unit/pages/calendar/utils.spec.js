import utils from '@/pages/Calendar/utils';

jest.mock('moment', () => {
  const momentMock = require.requireActual('moment');
  return momentMock.utc;
});

describe('formatEvent', () => {
  const event = {
    title: 'Test',
    start_date: '2019-10-01',
    end_date: '2019-10-02',
    is_confirmed: false,
    has_missing_materials: false,
  };

  it('returns the event with moment dates and time flags', () => {
    const result = utils.formatEvent(event);
    expect(result).toBeDefined();
    const resultWithStringDates = JSON.parse(JSON.stringify(result));
    expect(resultWithStringDates).toEqual({
      title: 'Test',
      startDate: '2019-10-01T00:00:00.000Z',
      start_date: '2019-10-01',
      endDate: '2019-10-02T00:00:00.000Z',
      end_date: '2019-10-02',
      is_confirmed: false,
      isConfirmed: false,
      isCurrent: false,
      has_missing_materials: false,
      hasMissingMaterials: false,
      isPast: true,
    });
  });
});

describe('formatTimelineEvent', () => {
  const event = {
    id: 1,
    title: 'Test',
    start_date: '2019-10-01',
    end_date: '2019-10-02',
    is_confirmed: false,
    has_missing_materials: true,
    location: 'Testville',
  };

  it('returns the event well formated to be used in timeline', () => {
    const result = utils.formatTimelineEvent(event, (s) => s);
    expect(result).toBeDefined();
    const resultWithStringDates = JSON.parse(JSON.stringify(result));
    expect(resultWithStringDates).toEqual({
      id: 1,
      content: 'Test (Testville)',
      start: '2019-10-01T00:00:00.000Z',
      end: '2019-10-02T00:00:00.000Z',
      editable: false,
      className: 'Calendar__event Calendar__event--past Calendar__event--locked Calendar__event--with-warning',
      title: 'Test (Testville)\n  →page-calendar.this-event-is-past\n  →page-calendar.this-event-has-missing-materials',
    });
  });
});
