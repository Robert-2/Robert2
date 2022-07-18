import './index.scss';
import { debounce } from 'debounce';
import queryClient from '@/globals/queryClient';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import eventStore from '../../EventStore';
import MaterialsListEditor, {
    getMaterialsQuantities,
    materialsHasChanged,
} from '@/components/MaterialsListEditor';

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

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        async save({ gotoStep } = { gotoStep: 4 }) {
            this.$emit('loading');
            const { id } = this.event;
            const { resource } = this.$route.meta;

            const materials = this.materials.filter(({ quantity }) => quantity > 0);

            try {
                const { data } = await this.$http.put(`${resource}/${id}`, { materials });
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
                    withTemplates
                />
                <section class="Form__actions">
                    <button class="info" type="submit">
                        <i class="fas fa-arrow-left" />
                        {__('page.event-edit.save-and-back-to-calendar')}
                    </button>
                    <button type="button" class="success" onClick={saveAndNext}>
                        {__('page.event-edit.save-and-continue')}
                        <i class="fas fa-arrow-right" />
                    </button>
                </section>
            </form>
        );
    },
};
