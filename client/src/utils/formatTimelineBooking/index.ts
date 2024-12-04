import DateTime from '@/utils/datetime';
import { BookingEntity } from '@/stores/api/bookings';
import getBookingIcon from '@/utils/getBookingIcon';
import getTimelineBookingClassNames from './_utils/getClassNames';
import getTimelineBookingStatuses from './_utils/getStatuses';

import type { BookingExcerpt, BookingSummary } from '@/stores/api/bookings';
import type { TimelineItem } from '@/themes/default/components/Timeline';
import type { BookingTimelineStatus } from './_utils/getStatuses';
import type { BookingContext } from './_types';
import type { I18nTranslate } from 'vuex-i18n';
import type { RawColor } from '../color';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { EventTechnician } from '@/stores/api/events';

//
// - Types
//

type FormatOptions = {
    /**
     * Si le booking est un événement, faut-il afficher le lieu ou il se déroule
     * dans l'élément de la timeline ?
     *
     * @default true
     */
    showEventLocation?: boolean,

    /**
     * Si le booking est un événement, faut-il afficher le premier bénéficiaire
     * dans l'élément de la timeline ?
     *
     * @default false
     */
    showEventBorrower?: boolean,
};

type TimelineBookingFormatter = (
    & ((booking: BookingSummary) => TimelineItem)
    & ((booking: BookingExcerpt, excerpt: true, quantity?: number) => TimelineItem)
    & ((booking: BookingSummary, excerpt: false, quantity?: number) => TimelineItem)
);

//
// - Formatters
//

const withIcon = (iconName: string | null, text: string): string => (
    iconName ? `<i class="fas fa-${iconName}"></i> ${text}` : text
);

const formatTimelineBookingEvent = (
    context: BookingContext,
    __: I18nTranslate,
    now: DateTime,
    options: FormatOptions = {},
): TimelineItem => {
    const { isExcerpt, booking, quantity } = context;
    const { title, color, location, beneficiaries, technicians } = booking;
    const { showEventLocation = true, showEventBorrower = false } = options;

    // - Lieu
    const hasLocation = (location ?? '').length > 0;
    const locationText = withIcon('map-marker-alt', hasLocation ? location! : '?');

    // - Quantité utilisée
    const quantityText = quantity !== undefined
        ? __('used-count', { count: quantity }, quantity)
        : null;

    // - Bénéficiaire
    const hasBorrower = beneficiaries.length > 0;

    // - Summary
    const summaryParts = [title + (quantityText ? ` (${quantityText})` : '')];
    if (showEventLocation && hasLocation) {
        summaryParts.push(locationText);
    }
    if (showEventBorrower && hasBorrower) {
        const firstBeneficiary = [...beneficiaries].shift()!;

        const firstBeneficiaryIsCompany = !!firstBeneficiary.company;
        let beneficiaryExcerpt = firstBeneficiaryIsCompany
            ? firstBeneficiary.company!.legal_name
            : firstBeneficiary.full_name;

        if (beneficiaries.length > 1) {
            const countSecondaryBeneficiaries = beneficiaries.length - 1;
            beneficiaryExcerpt = withIcon('users', __(
                'name-and-n-others',
                {
                    name: beneficiaryExcerpt,
                    count: countSecondaryBeneficiaries,
                },
                countSecondaryBeneficiaries,
            ));
        } else {
            beneficiaryExcerpt = withIcon(
                firstBeneficiaryIsCompany ? 'industry' : 'user',
                beneficiaryExcerpt,
            );
        }
        summaryParts.push(beneficiaryExcerpt);
    }
    const mainIcon = getBookingIcon(booking, isExcerpt, now) ?? 'spinner';
    const summary = withIcon(mainIcon, summaryParts.join(' - '));

    const tooltip: string = (() => {
        // - Période d'opération de l'événement
        const operationPeriodText = withIcon('calendar-alt', booking.operation_period.toReadable(__));

        const arePeriodsUnified = booking.operation_period
            .setFullDays(false)
            .isSame(booking.mobilization_period);

        // - Période de mobilisation de l'événement
        const mobilizationPeriodText = !arePeriodsUnified
            ? withIcon('clock', booking.mobilization_period.toReadable(__))
            : null;

        // - Statut
        const statusesText = getTimelineBookingStatuses(context, __, now)
            .map(({ icon, label }: BookingTimelineStatus) => withIcon(icon, label))
            .join('\n');

        // - Bénéficiaire
        let borrowerText = withIcon('exclamation-triangle', `<em>(${__('missing-beneficiary')})</em>`);
        if (hasBorrower) {
            const beneficiariesNames = beneficiaries.map((beneficiary: Beneficiary) => {
                if (!beneficiary.company) {
                    return beneficiary.full_name;
                }
                return `${beneficiary.full_name} (${beneficiary.company.legal_name})`;
            });
            borrowerText = withIcon('address-book', __('for', { beneficiary: beneficiariesNames.join(', ') }));
        }

        // - Techniciens
        let techniciansText = '';
        if (technicians.length > 0) {
            const techniciansNames = technicians
                .filter((eventTechnician: EventTechnician, index: number, self: EventTechnician[]) => (
                    eventTechnician.technician && index === self.findIndex(
                        ({ technician }: EventTechnician) => (
                            technician && technician.id === eventTechnician.technician.id
                        ),
                    )
                ))
                .map(({ technician }: EventTechnician) => technician.full_name);

            techniciansText = withIcon('people-carry', `${__('with')} ${techniciansNames.join(', ')}`);
        }

        return [
            // eslint-disable-next-line prefer-template
            `<strong>${title}</strong>` + (quantityText ? `, ${quantityText}` : ''),
            [locationText, operationPeriodText, mobilizationPeriodText, borrowerText, techniciansText]
                .filter(Boolean)
                .join('\n'),
            statusesText,
        ].filter(Boolean).join('\n\n');
    })();

    return {
        id: `${BookingEntity.EVENT}-${booking.id}`,
        period: {
            expected: booking.operation_period,
            actual: booking.mobilization_period,
        },
        summary,
        tooltip,
        color: color as RawColor | null,
        className: getTimelineBookingClassNames(context, now),
    };
};

//
// - Factory
//

/* eslint-disable @stylistic/ts/lines-around-comment */
const factory = (__: I18nTranslate, now: DateTime = DateTime.now(), options: FormatOptions = {}): TimelineBookingFormatter => (
    /**
     * Permet de formater un booking pour une timeline.
     *
     * Si le paramètre `excerpt` est passé à `true`, cette fonction attendra un booking au
     * format {@link BookingExcerpt} et ne produira qu'un événement de timeline succinct
     * qui a vocation a être complété en différé lorsque le reste des données aura été chargé.
     *
     * @param booking - Le booking (événement) que l'on veut formater.
     * @param excerpt - Active le mode "extrait" uniquement qui ne requiert et n'affiche
     *                  qu'un extrait du booking (`false` si non spécifié).
     *                  Seul ce mode accepte un `BookingExcerpt` en entrée.
     * @param quantity - Si défini; affichera un compteur dans le titre de l'événement.
     *
     * @returns Le booking dans un format accepté par une timeline.
     *          (= `<Timeline items={[>> ICI <<]} />`)
     */
    (booking: BookingExcerpt | BookingExcerpt, excerpt: boolean = false, quantity?: number): TimelineItem => {
        const context = { isExcerpt: excerpt, booking, quantity } as BookingContext;

        switch (booking.entity) {
            case BookingEntity.EVENT: {
                return formatTimelineBookingEvent(context, __, now, options);
            }
            default: {
                throw new Error(`Unsupported entity ${(booking as any).entity}`);
            }
        }
    }
);
/* eslint-enable @stylistic/ts/lines-around-comment */

export default factory;
