import formatTimelineEvent from '@/utils/timeline-event/format';
import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';
import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

const formatEvent = (dataEvent, translate) => {
  const withIcon = (iconName, text) => (
    `<i class="fas fa-${iconName}"></i> ${text}`
  );

  const formattedEvent = formatTimelineEvent(dataEvent);
  const {
    title,
    location,
    startDate: start,
    endDate: end,
    pivot,
  } = formattedEvent;

  const { quantity: count } = pivot;
  const countText = translate('used-count', { count }, count);

  const content = `${title} (${countText})`;

  const locationText = withIcon('map-marker-alt', location || '?');

  const datesText = withIcon(
    'clock',
    translate('from-date-to-date', { from: start.format('L'), to: end.format('L') }),
  );

  const statusesText = getTimelineEventI18nStatuses(formattedEvent).map(
    ({ icon, i18nKey }) => withIcon(icon, translate(`page-calendar.${i18nKey}`)),
  ).join('\n');

  return {
    ...formattedEvent,
    content,
    start,
    end,
    editable: false,
    className: getTimelineEventClassNames(formattedEvent).join(' '),
    title: [
      `<strong>${title}</strong>, ${countText}`,
      '',
      locationText,
      datesText,
      '',
      statusesText,
    ].join('\n'),
  };
};

export default formatEvent;
