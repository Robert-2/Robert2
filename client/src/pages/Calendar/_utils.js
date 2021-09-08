import formatTimelineEvent from '@/utils/timeline-event/format';
import getMainIcon from '@/utils/timeline-event/getMainIcon';
import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';
import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

const formatEvent = (dataEvent, translate) => {
    const withIcon = (iconName, text) => (
        iconName ? `<i class="fas fa-${iconName}"></i> ${text}` : text
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
        isInventoryDone,
        hasNotReturnedMaterials,
        beneficiaries,
        technicians,
    } = formattedEvent;

    let baseContent = title;
    if (hasMissingMaterials || hasNotReturnedMaterials) {
        baseContent = withIcon('exclamation-triangle', baseContent);
    }

    let content = withIcon(getMainIcon(formattedEvent), baseContent);

    const locationText = withIcon('map-marker-alt', location || '?');
    if (location) {
        content = `${content} − ${locationText}`;
    }

    const dates = withIcon(
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

    let techniciansText = '';
    if (technicians.length > 0) {
        const techniciansNames = technicians
            .filter((eventTechnician, index, self) => (
                self.findIndex(
                    ({ technician }) => (technician.id === eventTechnician.technician.id),
                ) === index
            ))
            .map(({ technician }) => technician.full_name);
        techniciansText = withIcon(
            'people-carry',
            `${translate('with')} ${techniciansNames.join(', ')}`,
        );
    }

    const statusesText = getTimelineEventI18nStatuses(formattedEvent)
        .map(({ icon, i18nKey }) => withIcon(icon, translate(`page-calendar.${i18nKey}`)))
        .join('\n');

    return {
        ...formattedEvent,
        content,
        start,
        end,
        editable: !isConfirmed || (isPast && !isConfirmed && !isInventoryDone),
        className: getTimelineEventClassNames(formattedEvent).join(' '),
        title: [
            `<strong>${title}</strong>`,
            `\n${locationText}\n${dates}\n${beneficiariesText}\n${techniciansText}\n`,
            statusesText,
        ].join('\n'),
    };
};

export default formatEvent;
