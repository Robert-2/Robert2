import './index.scss';
import invariant from 'invariant';
import { defineComponent } from '@vue/composition-api';
import showModal from '@/utils/showModal';
import { BookingEntity } from '@/stores/api/bookings';
import apiMaterials from '@/stores/api/materials';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Button from '@/themes/default/components/Button';
import Dropdown from '@/themes/default/components/Dropdown';
import Filters from './components/Filters';
import List from './components/List';
import store from './store';

// - Modales
import ReuseEventMaterials from './modals/ReuseEventMaterials';

import type { PropType } from '@vue/composition-api';
import type { Booking } from '@/stores/api/bookings';
import type { Event, EventMaterial } from '@/stores/api/events';
import type { MaterialWithAvailabilities as Material } from '@/stores/api/materials';
import type { SelectedMaterial, Filters as FiltersType } from './_types';

type Props = {
    /**
     * La sélection de matériel initiale.
     *
     * /!\ Attention, cette prop. ne peut pas être utilisée pour "controller" le component.
     * Celui-ci maintient son propre "state". Vous pouvez récupérer l'état courant
     * via l'API publique `[Ref].values` ou en écoutant l'événement `onChange`.
     */
    defaultValues?: SelectedMaterial[],

    /** Le booking (événement, réservation ou demande de réservation). */
    booking?: Booking,
};

type Data = {
    isInitialized: boolean,
    isFetched: boolean,
    criticalError: boolean,
    filters: FiltersType,
    materials: Material[],
};

type InstanceProperties = {
    unsubscribeStore: (() => void) | undefined,
    fetchInterval: ReturnType<typeof setInterval> | undefined,
};

/**
 * Représente l'état des filtres quand ils sont vides.
 *
 * @param onlySelected - Dois-t'on afficher uniquement le matériel sélectionné ?
 *
 * @returns Les filtres "vides".
 */
const getEmptyFilters = (onlySelected: boolean): FiltersType => ({
    search: null,
    onlySelected,
    park: null,
    category: null,
    subCategory: null,
    tags: [],
});

// @vue/component
const MaterialsSelector = defineComponent({
    name: 'MaterialsSelector',
    props: {
        booking: {
            type: Object as PropType<Props['booking']>,
            default: undefined,
        },
        defaultValues: {
            type: Array as PropType<Required<Props>['defaultValues']>,
            default: () => [],
        },
    },
    emits: [
        'ready',
        'change',
    ],
    setup: (): InstanceProperties => ({
        unsubscribeStore: undefined,
        fetchInterval: undefined,
    }),
    data(): Data {
        return {
            isInitialized: false,
            isFetched: false,
            criticalError: false,
            filters: getEmptyFilters(false),
            materials: [],
        };
    },
    computed: {
        hasSelectedMaterials(): boolean {
            return !store.getters.isEmpty;
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        /**
         * Retourne les quantités actuellement sélectionnées.
         *
         * @returns Les quantités actuellement sélectionnées.
         */
        values(): SelectedMaterial[] {
            return store.getters.export();
        },
    },
    mounted() {
        this.init();
    },
    beforeDestroy() {
        if (this.unsubscribeStore) {
            this.unsubscribeStore();
        }

        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange() {
            if (store.getters.isEmpty) {
                this.filters = { ...this.filters, onlySelected: false };
            }
            this.$emit('change', store.getters.export());
        },

        handleFiltersChanges(filters: FiltersType) {
            this.filters = filters;
        },

        async handleEventImport() {
            const withRentalPrices = !!this.booking?.is_billable;
            const event: Event | undefined = await showModal(
                this.$modal,
                ReuseEventMaterials,
                { withRentalPrices },
            );
            if (event) {
                this.importFromEvent(event);
            }
        },

        handleShowAllMaterials() {
            if (!this.filters.onlySelected) {
                return;
            }
            this.filters = { ...this.filters, onlySelected: false };
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        init() {
            invariant(!this.isInitialized, 'Already initialized.');

            // - On initialise le store avec les données initiales.
            store.commit('init', this.defaultValues);

            // - Si du matériel est déjà sélectionné à l'initialisation ...
            //   => On passe en mode "Sélectionné uniquement".
            const hasSelectedMaterials = !store.getters.isEmpty;
            this.filters = { ...this.filters, onlySelected: hasSelectedMaterials };

            // - Observe les changements du store et appelle le handler adéquate.
            this.unsubscribeStore = store.subscribe(() => { this.handleChange(); });

            // - Actualise la liste du matériel toutes les 30 secondes.
            this.fetchInterval = setInterval(this.fetchMaterials.bind(this), 30_000);
            this.fetchMaterials();

            this.isInitialized = true;
        },

        async fetchMaterials() {
            const { entity, id } = this.booking ?? { entity: null, id: null };

            try {
                if (entity && entity === BookingEntity.EVENT) {
                    this.materials = await apiMaterials.allWhileEvent(id);
                } else {
                    this.materials = await apiMaterials.all({ paginated: false });
                }
                this.isFetched = true;
                this.$emit('ready');
            } catch {
                if (!this.isFetched) {
                    this.criticalError = true;

                    // - On ne tente pas de refetch si on est en erreur critique...
                    if (this.fetchInterval) {
                        clearInterval(this.fetchInterval);
                    }
                }
            }
        },

        async importFromEvent(event: Event) {
            // - On reset les filtres sans quoi l'utilisateur ne pourra
            //   potentiellement pas voir ce qu'il vient d'importer.
            this.filters = getEmptyFilters(true);

            event.materials.forEach(({ id, pivot: { quantity } }: EventMaterial) => {
                const material = this.materials.find(({ id: _id }: Material) => _id === id);
                if (!material || quantity <= 0) {
                    return;
                }

                store.commit('setQuantity', { material, quantity });
            });
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `components.MaterialsSelector.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            filters,
            isInitialized,
            isFetched,
            materials,
            criticalError,
            hasSelectedMaterials,
            handleFiltersChanges,
            handleEventImport,
            handleShowAllMaterials,
        } = this;

        // - On affiche le filtre permettant de n'afficher que le matériel
        //   sélectionné que s'il y a effectivement du matériel sélectionné.
        //   (ou que le filtre est encore sur "activé" et qu'il n'y a plus
        //   de matériel sélectionné)
        const showSelectedOnlyFilter = (
            hasSelectedMaterials || filters.onlySelected
        );

        if (criticalError || !isInitialized || !isFetched) {
            return (
                <div class="MaterialsSelector MaterialsSelector--not-ready">
                    {criticalError ? <CriticalError /> : <Loading />}
                </div>
            );
        }

        const renderImportActions = (): JSX.Element => (
            <Dropdown label={__('add-materials-from.dropdown.title')}>
                <Button
                    type="add"
                    class="Dropdown__item"
                    onClick={handleEventImport}
                >
                    {__('add-materials-from.dropdown.choices.an-event')}
                </Button>
            </Dropdown>
        );

        return (
            <div class="MaterialsSelector">
                <header class="MaterialsSelector__header">
                    <div class="MaterialsSelector__header__filters">
                        <Filters
                            ref="filters"
                            values={filters}
                            withSelectedOnlyFilter={showSelectedOnlyFilter}
                            onChange={handleFiltersChanges}
                        />
                    </div>
                    <div class="MaterialsSelector__header__actions">
                        {renderImportActions()}
                    </div>
                </header>
                <div class="MaterialsSelector__main">
                    <List
                        ref="list"
                        filters={filters}
                        materials={materials}
                        onRequestShowAllMaterials={handleShowAllMaterials}
                    />
                </div>
            </div>
        );
    },
});

export type { SelectedMaterial };

export { default as getEventMaterialsQuantities } from './utils/getEventMaterialsQuantities';
export { default as materialsHasChanged } from './utils/materialsHasChanged';

export default MaterialsSelector;
