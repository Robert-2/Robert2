import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import { BookingEntity } from '@/stores/api/bookings';
import getBookingIcon from '@/utils/getBookingIcon';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';

import type { Moment } from 'moment';
import type { PropType } from '@vue/composition-api';
import type { BookingSummary } from '@/stores/api/bookings';

type Props = {
    /* L'emprunt (booking) à afficher. */
    booking: BookingSummary,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    now: number,
};

/* Affiche un emprunt (booking). */
const BeneficiaryViewBookingsItem = defineComponent({
    name: 'BeneficiaryViewBookingsItem',
    props: {
        booking: {
            type: Object as PropType<Props['booking']>,
            required: true,
        },
    },
    emits: ['click', 'open'],
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        now: Date.now(),
    }),
    computed: {
        icon(): string {
            return getBookingIcon(this.booking, this.now);
        },

        title(): string | undefined {
            const { booking } = this;

            switch (booking.entity) {
                case BookingEntity.EVENT: {
                    const { title, location } = booking;
                    return !location ? title : `${title} (${location})`;
                }
                default:
                    throw new Error(`Unsupported entity ${booking.entity}`);
            }
        },

        start(): Moment {
            return moment(this.booking.start_date);
        },

        end(): Moment {
            return moment(this.booking.end_date);
        },

        isOneDay(): boolean {
            return this.start.isSame(this.end, 'day');
        },

        isPast(): boolean {
            return this.end.isBefore(this.now, 'day');
        },

        isOngoing(): boolean {
            return moment(this.now).isBetween(this.start, this.end, 'day', '[]');
        },

        isConfirmed(): boolean {
            const { booking } = this;

            switch (booking.entity) {
                case BookingEntity.EVENT:
                    return booking.is_confirmed;

                default:
                    throw new Error(`Unsupported entity ${booking.entity}`);
            }
        },

        readableState(): string {
            const { $t: __, isOngoing, isPast, start } = this;

            if (isPast) {
                return __('page.beneficiary-view.borrowings.done');
            }

            if (isOngoing) {
                return __('page.beneficiary-view.borrowings.currently-out');
            }

            return __(
                'page.beneficiary-view.borrowings.expected-to-be-out-on',
                { date: start.format('L') },
            );
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
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
            this.$emit('click', this.booking);
        },

        handleOpen(e: MouseEvent) {
            e.stopPropagation();

            this.$emit('open', this.booking);
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
        const { duration, has_missing_materials: hasMissingMaterials } = this.booking;
        const {
            $t: __,
            icon,
            title,
            isOngoing,
            isPast,
            isOneDay,
            isConfirmed,
            readableState,
            start,
            end,
            handleClick,
            handleOpen,
        } = this;

        const className = ['BeneficiaryViewBookingsItem', {
            'BeneficiaryViewBookingsItem--future': !isPast,
            'BeneficiaryViewBookingsItem--current': isOngoing,
            'BeneficiaryViewBookingsItem--confirmed': isConfirmed,
            'BeneficiaryViewBookingsItem--warning': hasMissingMaterials,
        }];

        return (
            <li
                class={className}
                onClick={handleClick}
                role="button"
            >
                <div class="BeneficiaryViewBookingsItem__booking">
                    <div class="BeneficiaryViewBookingsItem__booking__icon">
                        <Icon name={icon} />
                    </div>
                    <div class="BeneficiaryViewBookingsItem__booking__infos">
                        <h3 class="BeneficiaryViewBookingsItem__booking__title">
                            {title}
                        </h3>
                        <div class="BeneficiaryViewBookingsItem__booking__dates">
                            {!isOneDay
                                ? __('from-date-to-date', { from: start.format('L'), to: end.format('L') })
                                : __('on-date', { date: start.format('L') })}
                            {!isOneDay && (
                                <span class="BeneficiaryViewBookingsItem__booking__duration">
                                    ({__('days-count', { duration: duration.days }, duration.days)})
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div class="BeneficiaryViewBookingsItem__readable-state">
                    {readableState}
                </div>
                <div class="BeneficiaryViewBookingsItem__actions">
                    <Button type="primary" icon="eye" onClick={handleOpen} />
                </div>
            </li>
        );
    },
});

export default BeneficiaryViewBookingsItem;
