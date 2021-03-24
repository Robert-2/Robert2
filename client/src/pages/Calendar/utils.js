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
    isPast,
    isConfirmed,
    hasMissingMaterials,
    beneficiaries,
    assignees,
  } = formattedEvent;

  let content = title;
  if (hasMissingMaterials) {
    content = withIcon('exclamation-triangle', content);
  }
  if (isConfirmed) {
    content = withIcon(isPast ? 'lock' : 'check', content);
  }

  const locationText = withIcon('map-marker-alt', location || '?');
  if (location) {
    content = `${content} − ${locationText}`;
  }

  const datesText = withIcon(
    'clock',
    translate('from-date-to-date', { from: start.format('L'), to: end.format('L') }),
  );

  let beneficiariesText = withIcon(
    'exclamation-triangle',
    `<em>(${translate('missing-beneficiary')})</em>`,
  );
  if (beneficiaries.length > 0) {
    const beneficiariesNames = beneficiaries.map((beneficiary) => beneficiary.full_name);
    beneficiariesText = withIcon(
      'address-book',
      `${translate('for')} ${beneficiariesNames.join(', ')}`,
    );
  }

  let assigneesText = '';
  if (assignees.length > 0) {
    const assigneesNames = assignees.map((beneficiary) => beneficiary.full_name);
    assigneesText = withIcon(
      'people-carry',
      `${translate('with')} ${assigneesNames.join(', ')}`,
    );
  }

  const statusesText = getTimelineEventI18nStatuses(formattedEvent).map(
    ({ icon, i18nKey }) => withIcon(icon, translate(`page-calendar.${i18nKey}`)),
  ).join('\n');

  return {
    ...formattedEvent,
    content,
    start,
    end,
    editable: !isConfirmed,
    className: getTimelineEventClassNames(formattedEvent).join(' '),
    title: [
      `<strong>${title}</strong>`,
      '',
      locationText,
      datesText,
      beneficiariesText,
      assigneesText,
      '',
      statusesText,
    ].join('\n'),
  };
};

export default formatEvent;
