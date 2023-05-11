import './index.scss';
import debounce from 'lodash/debounce';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiBookings, { BookingEntity } from '@/stores/api/bookings';
import eventStore from '../../EventStore';
import MaterialsListEditor, {
    getEventMaterialsQuantities,
    materialsHasChanged,
} from '@/themes/default/components/MaterialsListEditor';

// @vue/component
export default {
    name: 'EventStep4',
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            materials: getEventMaterialsQuantities(this.event.materials),
        };
    },
    created() {
        this.debouncedSave = debounce(this.save.bind(this), DEBOUNCE_WAIT);
    },
    beforeDestroy() {
        this.debouncedSave.cancel();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(newList) {
            const { event } = this;
            if (!event) {
                return;
            }

            this.materials = newList;
            const savedList = getEventMaterialsQuantities(event.materials);
            const hasDifference = materialsHasChanged(savedList, newList);
            eventStore.commit('setIsSaved', !hasDifference);

            if (hasDifference) {
                this.debouncedSave();
            }
        },

        handleSubmit(e) {
            e.preventDefault();

            this.saveAndGoToStep(5);
        },

        handlePrevClick(e) {
            e.preventDefault();

            this.saveAndGoToStep(3);
        },

        handleNextClick(e) {
            e.preventDefault();

            this.saveAndGoToStep(5);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async saveAndGoToStep(nextStep) {
            await this.save();

            this.$emit('gotoStep', nextStep);
        },

        async save() {
            this.$emit('loading');

            const { id } = this.event;
            const materials = this.materials.filter(({ quantity }) => quantity > 0);

            try {
                const data = await apiBookings.updateMaterials(id, {
                    entity: BookingEntity.EVENT,
                    materials,
                });
                eventStore.commit('setIsSaved', true);
                this.$emit('updateEvent', data);
            } catch (error) {
                this.$emit('error', error);

                const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    this.errors = { ...details };
                }
            } finally {
                this.$emit('stopLoading');
            }
        },
    },
    render() {
        const {
            $t: __,
            materials,
            event,
            handleChange,
            handleSubmit,
            handlePrevClick,
            handleNextClick,
        } = this;

        return (
            <form class="EventStep4" onSubmit={handleSubmit}>
                <MaterialsListEditor
                    selected={materials}
                    booking={{ entity: BookingEntity.EVENT, ...event }}
                    onChange={handleChange}
                />
                <section class="EventStep4__actions">
                    <button type="submit" class="button info" onClick={handlePrevClick}>
                        <i class="fas fa-arrow-left" />&nbsp;
                        {__('page.event-edit.save-and-go-to-prev-step')}
                    </button>
                    <button type="submit" class="button success" onClick={handleNextClick}>
                        {__('page.event-edit.save-and-go-to-next-step')}&nbsp;
                        <i class="fas fa-arrow-right" />
                    </button>
                </section>
            </form>
        );
    },
};
