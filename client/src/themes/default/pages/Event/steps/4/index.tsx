import './index.scss';
import debounce from 'lodash/debounce';
import { defineComponent } from '@vue/composition-api';
import { DEBOUNCE_WAIT_DURATION } from '@/globals/constants';
import apiBookings, { BookingEntity } from '@/stores/api/bookings';
import Button from '@/themes/default/components/Button';
import MaterialsSelector, {
    materialsHasChanged,
    getEventMaterialsQuantities,
} from '@/themes/default/components/MaterialsSelector';

import type { DebouncedMethod } from 'lodash';
import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';
import type { Booking } from '@/stores/api/bookings';
import type { SelectedMaterial } from '@/themes/default/components/MaterialsSelector';

type Props = {
    /** L'événement en cours d'édition. */
    event: EventDetails,
};

type InstanceProperties = {
    debouncedSave: DebouncedMethod<typeof EventStep4, 'save'> | undefined,
};

type Data = {
    materials: SelectedMaterial[],
};

/** Étape 4 de l'edition d'un événement: Sélection du matériel. */
const EventStep4 = defineComponent({
    name: 'EventStep4',
    props: {
        event: {
            type: Object as PropType<Props['event']>,
            required: true,
        },
    },
    emits: [
        'loading',
        'stopLoading',
        'goToStep',
        'updateEvent',
        'error',
    ],
    setup: (): InstanceProperties => ({
        debouncedSave: undefined,
    }),
    data(): Data {
        return {
            materials: getEventMaterialsQuantities(this.event.materials),
        };
    },
    computed: {
        booking(): Booking {
            // FIXME: Corriger ça, on fait passer un événement pour un booking...
            return { entity: BookingEntity.EVENT, ...this.event };
        },
    },
    created() {
        this.debouncedSave = debounce(
            this.save.bind(this),
            DEBOUNCE_WAIT_DURATION.asMilliseconds(),
        );
    },
    beforeDestroy() {
        this.debouncedSave?.cancel();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(materials: SelectedMaterial[]) {
            this.materials = materials;

            const savedMaterials = getEventMaterialsQuantities(this.event.materials);
            const hasChanged = materialsHasChanged(savedMaterials, materials);
            this.$emit(hasChanged ? 'dataChange' : 'dataReset');

            if (hasChanged) {
                this.debouncedSave!();
            }
        },

        handleSubmit(e: SubmitEvent) {
            e.preventDefault();

            this.saveAndGoToStep(5);
        },

        handlePrevClick(e: MouseEvent) {
            e.preventDefault();

            this.saveAndGoToStep(3);
        },

        handleNextClick(e: MouseEvent) {
            e.preventDefault();

            this.saveAndGoToStep(5);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async saveAndGoToStep(nextStep: number) {
            await this.save();

            this.$emit('goToStep', nextStep);
        },

        async save() {
            this.$emit('loading');

            const { id } = this.event;
            const materials = this.materials.filter(
                ({ quantity }: SelectedMaterial) => quantity > 0,
            );

            try {
                // FIXME: Vraiment pas terrible (on fait passer un event pour un booking)...
                //        => On devrait utiliser une fonction spécifique aux événements.
                const data = await apiBookings.updateMaterials(BookingEntity.EVENT, id, materials);
                this.$emit('updateEvent', data);
            } catch (error) {
                this.$emit('error', error);
            } finally {
                this.$emit('stopLoading');
            }
        },
    },
    render() {
        const {
            $t: __,
            materials,
            booking,
            handleChange,
            handleSubmit,
            handlePrevClick,
            handleNextClick,
        } = this;

        return (
            <form class="EventStep4" onSubmit={handleSubmit}>
                <MaterialsSelector
                    booking={booking}
                    defaultValues={materials}
                    onChange={handleChange}
                    withTemplates
                />
                <section class="EventStep4__actions">
                    <Button
                        htmlType="submit"
                        type="default"
                        icon={{ name: 'arrow-left', position: 'before' }}
                        onClick={handlePrevClick}
                    >
                        {__('page.event-edit.save-and-go-to-prev-step')}
                    </Button>
                    <Button
                        htmlType="submit"
                        type="primary"
                        icon={{ name: 'arrow-right', position: 'after' }}
                        onClick={handleNextClick}
                    >
                        {__('page.event-edit.save-and-go-to-next-step')}
                    </Button>
                </section>
            </form>
        );
    },
});

export default EventStep4;
