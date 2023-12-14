import './index.scss';
import moment from 'moment';
import { Direction } from '@/stores/api/@types';
import { defineComponent } from '@vue/composition-api';
import showModal from '@/utils/showModal';
import { BookingEntity } from '@/stores/api/bookings';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import Loading from '@/themes/default/components/Loading';
import EventDetails from '@/themes/default/modals/EventDetails';
import Item from '../../../components/BookingsItem';

import type { PropType } from '@vue/composition-api';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { BookingSummary } from '@/stores/api/bookings';

type Props = {
    /* Identifiant du bénéficiaire. */
    id: Beneficiary['id'],
};

type InstanceProperties = {
    cancelOngoingFetch: (() => void) | undefined,
};

type Data = {
    bookings: BookingSummary[],
    hasCriticalError: boolean,
    isPartiallyFetched: boolean,
    isFullyFetched: boolean,
};

/* Liste des emprunts en cours ou futurs d'un bénéficiaire. */
const BeneficiaryViewNextBookings = defineComponent({
    name: 'BeneficiaryViewNextBookings',
    props: {
        id: {
            type: Number as PropType<Props['id']>,
            required: true,
        },
    },
    setup: (): InstanceProperties => ({
        cancelOngoingFetch: undefined,
    }),
    data: (): Data => ({
        bookings: [],
        hasCriticalError: false,
        isPartiallyFetched: false,
        isFullyFetched: false,
    }),
    created() {
        this.fetchData();
    },
    beforeDestroy() {
        this.cancelOngoingFetch?.();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleOpen(booking: BookingSummary) {
            const modalComponents = {
                [BookingEntity.EVENT]: EventDetails,
            };
            if (!(booking.entity in modalComponents)) {
                throw new Error('Unsupported booking type.');
            }

            let shouldRefetch = false;
            const modalComponent = modalComponents[booking.entity];
            await showModal(this.$modal, modalComponent, {
                id: booking.id,
                onUpdated: () => {
                    shouldRefetch = true;
                },
                onDuplicated() {
                    shouldRefetch = true;
                },
                onDeleted: () => {
                    shouldRefetch = true;
                },
            });

            if (shouldRefetch) {
                this.fetchData();
            }
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            const { id } = this;
            const now = moment();

            // - Annule la récupération en cours, s'il y en a une.
            this.cancelOngoingFetch?.();

            let isCancelled: boolean = false;
            this.cancelOngoingFetch = () => {
                isCancelled = true;
            };

            try {
                const fetchPageRecursive = async (page: number): Promise<void> => {
                    const params = { page, direction: Direction.ASC, after: now };
                    const { data, pagination } = await apiBeneficiaries.bookings(id, params);
                    if (isCancelled) {
                        return;
                    }

                    if (page === 1) {
                        this.bookings = data;
                    } else {
                        this.bookings.push(...data);
                    }
                    this.isPartiallyFetched = true;
                    this.isFullyFetched = false;

                    if (page < pagination.total.pages) {
                        await fetchPageRecursive(page + 1);
                    }
                };
                await fetchPageRecursive(1);

                if (!isCancelled) {
                    this.isFullyFetched = true;
                    this.isPartiallyFetched = false;
                }
            } catch {
                this.hasCriticalError = true;
            }
        },
    },
    render() {
        const {
            $t: __,
            bookings,
            hasCriticalError,
            isPartiallyFetched,
            isFullyFetched,
            handleOpen,
        } = this;

        if (hasCriticalError) {
            return null;
        }

        const renderContent = (): JSX.Element => {
            if (!isPartiallyFetched && !isFullyFetched) {
                return <Loading horizontal />;
            }

            if (bookings.length === 0) {
                return (
                    <p class="BeneficiaryViewNextBookings__empty">
                        {__('page.beneficiary-view.infos.no-borrowing-planned')}
                    </p>
                );
            }

            return (
                <ul class="BeneficiaryViewNextBookings__list">
                    {bookings.map((booking: BookingSummary) => (
                        <Item
                            key={`${booking.entity}-${booking.id}`}
                            booking={booking}
                            onClick={() => { handleOpen(booking); }}
                            onOpen={handleOpen}
                        />
                    ))}
                </ul>
            );
        };

        return (
            <div class="BeneficiaryViewNextBookings">
                <h3 class="BeneficiaryViewNextBookings__title">
                    {__('page.beneficiary-view.infos.next-borrowings-title')}
                </h3>
                {renderContent()}
            </div>
        );
    },
});

export default BeneficiaryViewNextBookings;
