import formatTimelineEvent from '@/utils/timeline-event/format';
import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';
import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

const formatEvent = (dataEvent, translate) => {
  const formattedEvent = formatTimelineEvent(dataEvent);
  const {
    title,
    location,
    startDate: start,
    endDate: end,
    pivot,
  } = formattedEvent;

  const content = `${title} (${pivot.quantity})`;

  const eventStatuses = getTimelineEventI18nStatuses(formattedEvent).map(
    (i18nKey) => translate(`page-calendar.${i18nKey}`),
  );

  let eventTitle = title;
  if (location) {
    eventTitle = `${title} - ${location}`;
  }
  if (eventStatuses.length > 0) {
    eventTitle += `\n  →${eventStatuses.join('\n  →')}`;
  }

  return {
    ...formattedEvent,
    content,
    start,
    end,
    editable: false,
    className: getTimelineEventClassNames(formattedEvent).join(' '),
    title: eventTitle,
  };
};

export default formatEvent;
