import './index.scss';
import moment from 'moment';
import { Direction } from '@/stores/api/@types';
import { defineComponent } from '@vue/composition-api';
import showModal from '@/utils/showModal';
import { BookingEntity } from '@/stores/api/bookings';
import config from '@/globals/config';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import apiEvents from '@/stores/api/events';
import Queue from 'p-queue';
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
    fetchMissingMaterialsQueue: Queue | undefined,
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
        fetchMissingMaterialsQueue: undefined,
    }),
    data: (): Data => ({
        bookings: [],
        hasCriticalError: false,
        isPartiallyFetched: false,
        isFullyFetched: false,
    }),
    created() {
        this.fetchMissingMaterialsQueue = new Queue({ concurrency: config.maxConcurrentFetches });

        this.fetchData();
    },
    beforeDestroy() {
        this.cancelOngoingFetch?.();

        // - Vide la file d'attente des requêtes.
        this.fetchMissingMaterialsQueue?.clear();
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

            // - Vide la file d'attente des requêtes avant de la re-peupler.
            this.fetchMissingMaterialsQueue?.clear();

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

                    const promises = data.map((booking: BookingSummary) => async () => {
                        const missingMaterials = await apiEvents.missingMaterials(booking.id);

                        const originalBookingIndex = this.bookings.findIndex(
                            ({ entity, id: searchId }: BookingSummary) => (
                                entity === booking.entity && searchId === booking.id
                            ),
                        );
                        if (originalBookingIndex === -1) {
                            return;
                        }

                        this.$set(this.bookings, originalBookingIndex, {
                            ...booking,
                            has_missing_materials: missingMaterials.length > 0,
                        });
                    });

                    await this.fetchMissingMaterialsQueue?.addAll(promises);

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
