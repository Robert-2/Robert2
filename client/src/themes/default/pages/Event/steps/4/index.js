import './index.scss';
import { debounce } from 'debounce';
import queryClient from '@/globals/queryClient';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiEvents from '@/stores/api/events';
import eventStore from '../../EventStore';
import MaterialsListEditor, {
    getMaterialsQuantities,
    materialsHasChanged,
} from '@/themes/default/components/MaterialsListEditor';

// @vue/component
export default {
    name: 'EventStep4',
    components: { MaterialsListEditor },
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            materials: getMaterialsQuantities(this.event.materials),
        };
    },
    created() {
        this.debouncedSave = debounce(this.save.bind(this), DEBOUNCE_WAIT);
    },
    beforeUnmount() {
        this.debouncedSave.clear();
    },
    methods: {
        handleChange(newList) {
            this.materials = newList;

            const savedList = getMaterialsQuantities(this.event.materials);
            const hasDifference = materialsHasChanged(savedList, newList);
            eventStore.commit('setIsSaved', !hasDifference);

            if (hasDifference) {
                this.debouncedSave();
            }
        },

        saveAndBack(e) {
            e.preventDefault();
            this.save({ gotoStep: false });
        },

        saveAndNext(e) {
            e.preventDefault();
            this.save({ gotoStep: 5 });
        },

        displayError(error) {
            this.$emit('error', error);

            const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
            if (code === ApiErrorCode.VALIDATION_FAILED) {
                this.errors = { ...details };
            }
        },

        async save({ gotoStep } = { gotoStep: 4 }) {
            this.$emit('loading');

            const { id } = this.event;
            const materials = this.materials.filter(({ quantity }) => quantity > 0);

            try {
                const data = await apiEvents.update(id, { materials });
                queryClient.invalidateQueries('materials-while-event');
                if (!gotoStep) {
                    this.$router.push('/');
                    return;
                }
                eventStore.commit('setIsSaved', true);
                this.$emit('updateEvent', data);
                this.$emit('gotoStep', gotoStep);
            } catch (error) {
                this.displayError(error);
            }
        },
    },
    render() {
        const {
            $t: __,
            event,
            handleChange,
            saveAndBack,
            saveAndNext,
        } = this;

        return (
            <form class="Form EventStep4" onSubmit={saveAndBack}>
                <MaterialsListEditor
                    selected={event.materials}
                    event={event}
                    onChange={handleChange}
                />
                <section class="Form__actions">
                    <button class="info" type="submit">
                        <i class="fas fa-arrow-left" />&nbsp;
                        {__('page.event-edit.save-and-back-to-calendar')}
                    </button>
                    <button type="button" class="success" onClick={saveAndNext}>
                        {__('page.event-edit.save-and-continue')}&nbsp;
                        <i class="fas fa-arrow-right" />
                    </button>
                </section>
            </form>
        );
    },
};
