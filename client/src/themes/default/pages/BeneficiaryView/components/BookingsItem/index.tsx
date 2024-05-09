import './index.scss';
import DateTime from '@/utils/datetime';
import upperFirst from 'lodash/upperFirst';
import { defineComponent } from '@vue/composition-api';
import { BookingEntity } from '@/stores/api/bookings';
import getBookingIcon from '@/utils/getBookingIcon';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { LazyBooking } from '../../_types';

type Props = {
    /**
     * L'emprunt (booking) à afficher dans un format hybride permettant
     * de savoir si on a affaire à un extrait ou à un résumé de l'emprunt.
     */
    lazyBooking: LazyBooking,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    now: DateTime,
};

/** Un emprunt (booking) sous forme d'une cellule "inline". */
const BeneficiaryViewBookingsItem = defineComponent({
    name: 'BeneficiaryViewBookingsItem',
    props: {
        lazyBooking: {
            type: Object as PropType<Props['lazyBooking']>,
            required: true,
        },
    },
    emits: ['click', 'openClick'],
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        now: DateTime.now(),
    }),
    computed: {
        icon(): string | null {
            const { isComplete, booking } = this.lazyBooking;
            return getBookingIcon(booking, !isComplete, this.now);
        },

        title(): string {
            const { lazyBooking: { booking } } = this;

            switch (booking.entity) {
                case BookingEntity.EVENT: {
                    const { title, location } = booking;
                    return !location ? title : `${title} (${location})`;
                }
                default: {
                    throw new Error(`Unsupported entity ${(booking as any).entity}`);
                }
            }
        },

        arePeriodsUnified(): boolean {
            const { booking } = this.lazyBooking;
            const {
                operation_period: operationPeriod,
                mobilization_period: mobilizationPeriod,
            } = booking;

            return operationPeriod
                .setFullDays(false)
                .isSame(mobilizationPeriod);
        },

        duration(): number {
            const { booking } = this.lazyBooking;
            return booking.operation_period.asDays();
        },

        isOneDay(): boolean {
            return this.duration === 1;
        },

        isPast(): boolean {
            const { booking } = this.lazyBooking;
            return booking.mobilization_period.isBefore(this.now);
        },

        isFuture(): boolean {
            const { booking } = this.lazyBooking;
            return !booking.mobilization_period.isBeforeOrDuring(this.now);
        },

        isOngoing(): boolean {
            const { booking } = this.lazyBooking;
            return this.now.isBetween(booking.mobilization_period);
        },

        isConfirmed(): boolean {
            const { booking } = this.lazyBooking;

            switch (booking.entity) {
                case BookingEntity.EVENT: {
                    return booking.is_confirmed;
                }
                default: {
                    throw new Error(`Unsupported entity ${(booking as any).entity}`);
                }
            }
        },

        hasWarnings(): boolean {
            const { isPast, isFuture, lazyBooking } = this;
            const {
                is_archived: isArchived,
                has_not_returned_materials: hasNotReturnedMaterials,
            } = lazyBooking.booking;

            return (
                // - Si le booking est en cours ou à venir et qu'il manque du matériel.
                (isFuture && lazyBooking.isComplete && lazyBooking.booking.has_missing_materials === true) ||

                // - Si le booking est passé et qu'il a du matériel non retourné.
                (isPast && !isArchived && hasNotReturnedMaterials === true)
            );
        },

        readableState(): string {
            const { $t: __, isOngoing, isPast, lazyBooking: { booking } } = this;
            const { mobilization_period: mobilizationPeriod } = booking;

            if (isPast) {
                return __('page.beneficiary-view.borrowings.done');
            }

            if (isOngoing) {
                return __('page.beneficiary-view.borrowings.currently-mobilized');
            }

            return __(
                'page.beneficiary-view.borrowings.mobilized-starting-from',
                { date: mobilizationPeriod.start.toReadable() },
            );
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = DateTime.now(); }, 60_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleClick() {
            const { booking } = this.lazyBooking;
            this.$emit('click', booking.entity, booking.id);
        },

        handleOpenClick(e: MouseEvent) {
            e.stopPropagation();

            const { booking } = this.lazyBooking;
            this.$emit('openClick', booking.entity, booking.id);
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        /**
         * Fait défiler la liste de manière à faire apparaître le booking.
         *
         * @param behavior - Détermine la manière d'atteindre l'élément:
         *                     - `smooth`: Le defilement sera progressif, avec animation (défaut).
         *                     - `instant`: La defilement sera instantanée.
         *                     - `auto`: L'animation de defilement sera déterminée via la
         *                               propriété CSS `scroll-behavior`.
         */
        scrollIntoView(behavior: ScrollBehavior = 'smooth') {
            this.$el.scrollIntoView({ behavior, block: 'center' });
        },
    },
    render() {
        const { booking } = this.lazyBooking;
        const {
            $t: __,
            icon,
            title,
            duration,
            isFuture,
            isOneDay,
            isOngoing,
            isConfirmed,
            hasWarnings,
            arePeriodsUnified,
            readableState,
            handleClick,
            handleOpenClick,
        } = this;

        const className = ['BeneficiaryViewBookingsItem', {
            'BeneficiaryViewBookingsItem--future': isFuture,
            'BeneficiaryViewBookingsItem--current': isOngoing,
            'BeneficiaryViewBookingsItem--confirmed': isConfirmed,
            'BeneficiaryViewBookingsItem--warning': hasWarnings,
        }];

        return (
            <li class={className} onClick={handleClick} role="button">
                <div class="BeneficiaryViewBookingsItem__booking">
                    <div class="BeneficiaryViewBookingsItem__booking__icon">
                        <Icon name={icon ?? 'circle-notch'} spin={icon === null} />
                    </div>
                    <div class="BeneficiaryViewBookingsItem__booking__infos">
                        <h3 class="BeneficiaryViewBookingsItem__booking__title">
                            {title}
                        </h3>
                        <div class="BeneficiaryViewBookingsItem__booking__periods">
                            <span
                                class={[
                                    'BeneficiaryViewBookingsItem__booking__periods__item',
                                    'BeneficiaryViewBookingsItem__booking__periods__item--operation',
                                ]}
                            >
                                {upperFirst(booking.operation_period.toReadable(__))}
                                {!isOneDay && (
                                    <span class="BeneficiaryViewBookingsItem__booking__periods__item__duration">
                                        ({__('days-count', { duration }, duration)})
                                    </span>
                                )}
                            </span>
                            {!arePeriodsUnified && (
                                <span
                                    class={[
                                        'BeneficiaryViewBookingsItem__booking__periods__item',
                                        'BeneficiaryViewBookingsItem__booking__periods__item--mobilization',
                                    ]}
                                >
                                    {upperFirst(booking.mobilization_period.toReadable(__))}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div class="BeneficiaryViewBookingsItem__readable-state">
                    {readableState}
                </div>
                <div class="BeneficiaryViewBookingsItem__actions">
                    <Button icon="eye" onClick={handleOpenClick} />
                </div>
            </li>
        );
    },
});

export default BeneficiaryViewBookingsItem;
