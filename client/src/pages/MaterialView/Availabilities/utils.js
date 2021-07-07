import formatTimelineEvent from '@/utils/timeline-event/format';
import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';
import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';
import getMainIcon from '@/utils/timeline-event/getMainIcon';

const formatEvent = (dataEvent, units, translate) => {
  const withIcon = (iconName, text) => (
    iconName ? `<i class="fas fa-${iconName}"></i> ${text}` : text
  );

  const formattedEvent = formatTimelineEvent(dataEvent);
  const {
    title,
    location,
    startDate: start,
    endDate: end,
    pivot,
    hasNotReturnedMaterials,
  } = formattedEvent;

  let hasMissingUnits = false;
  if (units && units.length > 0) {
    hasMissingUnits = units
      .filter((unit) => dataEvent.pivot.units.includes(unit.id))
      .some((unit) => (unit.is_broken || unit.is_lost));
  }

  const { quantity: count } = pivot;
  const countText = translate('used-count', { count }, count);

  let baseContent = `${title} (${countText})`;
  if (hasMissingUnits || hasNotReturnedMaterials) {
    baseContent = withIcon('exclamation-triangle', baseContent);
  }

  const content = withIcon(getMainIcon(formattedEvent), baseContent);

  const locationText = withIcon('map-marker-alt', location || '?');

  const datesText = withIcon(
    'clock',
    translate('from-date-to-date', { from: start.format('L'), to: end.format('L') }),
  );

  const statusesText = getTimelineEventI18nStatuses({ ...formattedEvent, hasMissingUnits }).map(
    ({ icon, i18nKey }) => withIcon(icon, translate(`page-calendar.${i18nKey}`)),
  ).join('\n');

  return {
    ...formattedEvent,
    hasMissingUnits,
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
