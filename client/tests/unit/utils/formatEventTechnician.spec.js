// import moment from 'moment';
import formatEventTechnician from '@/utils/formatEventTechnician';
import eventTechniciansData from './data/event-technicians';

describe('formatEventTechnician', () => {
  it('returns null when nothing passed', () => {
    [null, undefined].forEach((emptyValue) => {
      const result = formatEventTechnician(emptyValue);
      expect(result).toBeNull();
    });
  });

  it('returns an object with formatted data of the event-technician', () => {
    const result = formatEventTechnician(eventTechniciansData[0]);
    expect(result).toEqual({
      id: 1,
      start: '2021-07-26 08:00:00',
      end: '2021-07-26 19:30:00',
      title: 'Test event (Testville)\n<strong>Testeur</strong> : 8:00 AM ⇒ 7:30 PM',
    });
  });
});
