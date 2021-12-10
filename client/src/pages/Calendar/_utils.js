import formatTimelineEvent from '@/utils/timeline-event/format';
import getMainIcon from '@/utils/timeline-event/getMainIcon';
import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';
import getTimelineEventI18nStatuses from '@/utils/timeline-event/getI18nStatuses';

const formatEvent = (dataEvent, __, options = {}) => {
    const { showLocation = true, showBorrower = false } = options;
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

    const withIcon = (iconName, text) => (
        iconName ? `<i class="fas fa-${iconName}"></i> ${text}` : text
    );

    // - Période de l'événement
    const dates = withIcon('clock', __('from-date-to-date', {
        from: start.format('L'),
        to: end.format('L'),
    }));

    // - Location
    const locationText = withIcon('map-marker-alt', location || '?');

    // - Bénéficiaire
    const hasBorrower = beneficiaries.length > 0;
    let beneficiariesText = withIcon('exclamation-triangle', `<em>(${__('missing-beneficiary')})</em>`);
    if (hasBorrower) {
        const beneficiariesNames = beneficiaries.map((beneficiary) => {
            if (!beneficiary.company) {
                return beneficiary.full_name;
            }
            return `${beneficiary.full_name} (${beneficiary.company.legal_name})`;
        });
        beneficiariesText = withIcon('address-book', `${__('for')} ${beneficiariesNames.join(', ')}`);
    }

    // - Summary
    const summaryParts = [title];
    if (showLocation && location) {
        summaryParts.push(locationText);
    }
    if (showBorrower && hasBorrower) {
        const firstBeneficiary = beneficiaries[0];
        const firstBeneficiaryIsCompany = !!firstBeneficiary.company;

        let beneficiaryExcerpt = firstBeneficiaryIsCompany
            ? firstBeneficiary.company.legal_name
            : firstBeneficiary.full_name;

        if (beneficiaries.length > 1) {
            const countSecondaryBeneficiaries = beneficiaries.length - 1;
            // eslint-disable-next-line prefer-template
            beneficiaryExcerpt += ' ' + __(
                'and-n-others',
                { count: countSecondaryBeneficiaries },
                countSecondaryBeneficiaries,
            );

            beneficiaryExcerpt = withIcon('users', beneficiaryExcerpt);
        } else {
            beneficiaryExcerpt = withIcon(
                firstBeneficiaryIsCompany ? 'industry' : 'user',
                beneficiaryExcerpt,
            );
        }
        summaryParts.push(beneficiaryExcerpt);
    }

    let summary;
    summary = summaryParts.join(' - ');
    summary = hasMissingMaterials || hasNotReturnedMaterials
        ? withIcon('exclamation-triangle', summary)
        : summary;
    summary = withIcon(getMainIcon(formattedEvent), summary);

    // - Techniciens
    let techniciansText = '';
    if (technicians.length > 0) {
        const techniciansNames = technicians
            .filter((eventTechnician, index, self) => (
                eventTechnician.technician && self.findIndex(
                    ({ technician }) => (technician && technician.id === eventTechnician.technician.id),
                ) === index
            ))
            .map(({ technician }) => technician.full_name);

        techniciansText = withIcon('people-carry', `${__('with')} ${techniciansNames.join(', ')}`);
    }

    // - Statut
    const statusesText = getTimelineEventI18nStatuses(formattedEvent)
        .map(({ icon, i18nKey }) => withIcon(icon, __(`page-calendar.${i18nKey}`)))
        .join('\n');

    return {
        ...formattedEvent,
        content: summary,
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
