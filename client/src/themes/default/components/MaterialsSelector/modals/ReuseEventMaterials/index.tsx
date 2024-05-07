import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import Loading from '@/themes/default/components/Loading';
import ErrorMessage from '@/themes/default/components/ErrorMessage/index';
import MaterialsSorted from '@/themes/default/components/MaterialsSorted';
import apiEvents from '@/stores/api/events';
import SearchEvents from './SearchEvents';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';
import type { Booking } from '@/stores/api/bookings';

type Props = {
    /**
     * L'éventuel booking dans lequel le matériel de l'événement va être importé.
     * Utile notamment pour exclure celui-ci des propositions si c'est un événement.
     */
    booking?: Booking,

    /** Doit-on afficher les montants de location ? */
    withRentalPrices?: boolean,
};

type Data = {
    selected: EventDetails | null,
    isLoading: boolean,
    error: unknown | null,
};

// @vue/component
const ReuseEventMaterials = defineComponent({
    name: 'ReuseEventMaterials',
    modal: {
        width: 700,
        draggable: true,
        clickToClose: true,
    },
    props: {
        booking: {
            type: Object as PropType<Props['booking']>,
            default: undefined,
        },
        withRentalPrices: {
            type: Boolean as PropType<Required<Props>['withRentalPrices']>,
            default: false,
        },
    },
    emits: ['close'],
    data: (): Data => ({
        selected: null,
        isLoading: false,
        error: null,
    }),
    methods: {
        handleClearSelection() {
            this.selected = null;
        },

        handleSubmit() {
            const { selected } = this;
            this.$emit('close', selected);
        },

        handleClose() {
            this.$emit('close');
        },

        async handleSelectEvent(id: number) {
            this.isLoading = true;
            this.error = null;

            try {
                this.selected = await apiEvents.one(id);
            } catch (err) {
                this.error = err;
                this.selected = null;
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            error,
            booking,
            isLoading,
            selected,
            withRentalPrices,
            handleClose,
            handleSelectEvent,
            handleSubmit,
            handleClearSelection,
        } = this;

        const renderSelection = (): JSX.Element | null => {
            if (error) {
                return <ErrorMessage error={error} />;
            }

            if (isLoading) {
                return <Loading />;
            }

            if (selected === null) {
                return null;
            }

            return (
                <div class="ReuseEventMaterials__selected">
                    <h3>{__('event-materials', { name: selected.title })}</h3>
                    <p class="ReuseEventMaterials__selected__description">
                        {selected.description}
                    </p>
                    <MaterialsSorted
                        data={selected.materials}
                        withRentalPrices={withRentalPrices}
                    />
                    <p class="ReuseEventMaterials__selected__warning">
                        <Icon name="exclamation-triangle" />{' '}
                        {__('reuse-list-from-event-warning')}
                    </p>
                </div>
            );
        };

        const bodyClassNames = {
            'ReuseEventMaterials__body': true,
            'ReuseEventMaterials__body--has-selected': selected !== null,
        };

        return (
            <div class="ReuseEventMaterials">
                <div class="ReuseEventMaterials__header">
                    <h2 class="ReuseEventMaterials__header__title">
                        {__('choose-event-to-reuse-materials-list')}
                    </h2>
                    <Button
                        type="close"
                        class="ReuseEventMaterials__header__close-button"
                        onClick={handleClose}
                    />
                </div>
                <div class={bodyClassNames}>
                    <SearchEvents
                        exclude={booking?.id ?? null}
                        onSelect={handleSelectEvent}
                    />
                    {renderSelection()}
                </div>
                {selected !== null && (
                    <div class="ReuseEventMaterials__footer">
                        <Button type="primary" icon="check" onClick={handleSubmit}>
                            {__('use-these-materials')}
                        </Button>
                        <Button icon="random" onClick={handleClearSelection}>
                            {__('choose-another-one')}
                        </Button>
                    </div>
                )}
            </div>
        );
    },
});

export default ReuseEventMaterials;
