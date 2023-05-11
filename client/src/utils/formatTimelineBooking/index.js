import moment from 'moment';
import { BookingEntity } from '@/stores/api/bookings';
import getTimelineBookingClassNames from './utils/getClassNames';
import getTimelineBookingStatuses from './utils/getStatuses';
import getBookingIcon from '@/utils/getBookingIcon';

const withIcon = (iconName, text) => (
    iconName ? `<i class="fas fa-${iconName}"></i> ${text}` : text
);

const formatTimelineEvent = (event, __, now = Date.now(), options = {}) => {
    const { showLocation = true, showBorrower = false } = options;
    const startDate = moment(event.start_date);
    const endDate = moment(event.end_date);
    const isPast = endDate.isBefore(now, 'day');
    const {
        title,
        color,
        location,
        is_confirmed: isConfirmed,
        is_return_inventory_done: isReturnInventoryDone,
        beneficiaries,
        technicians,
    } = event;

    // - Période de l'événement
    const intervalText = withIcon('clock', __('from-date-to-date', {
        from: startDate.format('L'),
        to: endDate.format('L'),
    }));

    // - Lieu
    const locationText = withIcon('map-marker-alt', location || '?');

    // - Quantité utilisée
    const quantityText = event.pivot?.quantity !== undefined
        ? __('used-count', { count: event.pivot.quantity }, event.pivot.quantity)
        : null;

    // - Statut
    const statusesText = getTimelineBookingStatuses(event, __, now)
        .map(({ icon, label }) => withIcon(icon, label))
        .join('\n');

    // - Bénéficiaire
    const hasBorrower = beneficiaries.length > 0;
    let borrowerText = withIcon('exclamation-triangle', `<em>(${__('missing-beneficiary')})</em>`);
    if (hasBorrower) {
        const beneficiariesNames = beneficiaries.map((beneficiary) => {
            if (!beneficiary.company) {
                return beneficiary.full_name;
            }
            return `${beneficiary.full_name} (${beneficiary.company.legal_name})`;
        });
        borrowerText = withIcon('address-book', `${__('for')} ${beneficiariesNames.join(', ')}`);
    }

    // - Summary
    const summaryParts = [title + (quantityText ? ` (${quantityText})` : '')];
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
    const mainIcon = getBookingIcon(event, now);
    const summary = withIcon(mainIcon, summaryParts.join(' - '));

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

    const tooltip = [
        // eslint-disable-next-line prefer-template
        `<strong>${title}</strong>` + (quantityText ? `, ${quantityText}` : ''),
        [locationText, intervalText, borrowerText, techniciansText]
            .filter(Boolean)
            .join('\n'),
        statusesText,
    ].filter(Boolean).join('\n\n');

    return {
        id: `${BookingEntity.EVENT}-${event.id}`,
        start: startDate,
        end: endDate,
        title: tooltip,
        content: summary,
        booking: event,
        color,
        className: getTimelineBookingClassNames(event),
        editable: {
            updateTime: !isConfirmed || (isPast && !isConfirmed && !isReturnInventoryDone),
            remove: false,
        },
    };
};

const formatTimelineBooking = (booking, __, now = Date.now(), options = {}) => {
    switch (booking.entity) {
        case BookingEntity.EVENT:
            return formatTimelineEvent(booking, __, now, options);

        default:
            throw new Error(`Unsupported entity ${booking.entity}`);
    }
};

export default formatTimelineBooking;
