import { debounce } from 'debounce';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import MaterialsList from './MaterialsList/MaterialsList.vue';
import EventStore from '../EventStore';
import { getMaterialsQuantities, materialsHasChanged } from './_utils';

// @vue/component
export default {
    name: 'EventStep4',
    components: { MaterialsList },
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            materials: getMaterialsQuantities(this.event.materials),
        };
    },
    methods: {
        handleChange(newList) {
            this.materials = newList;

            const savedList = getMaterialsQuantities(this.event.materials);
            const hasDifference = materialsHasChanged(savedList, newList);
            EventStore.commit('setIsSaved', !hasDifference);

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

        // - We're not using arrow function here because we need access to 'this'
        // eslint-disable-next-line func-names
        debouncedSave: debounce(function () {
            this.save({ gotoStep: 4 });
        }, DEBOUNCE_WAIT),

        save(options) {
            this.$emit('loading');
            const { id } = this.event;
            const { resource } = this.$route.meta;

            const materials = this.materials.filter(({ quantity }) => quantity > 0);

            this.$http.put(`${resource}/${id}`, { materials })
                .then(({ data }) => {
                    const { gotoStep } = options;
                    if (!gotoStep) {
                        this.$router.push('/');
                        return;
                    }
                    EventStore.commit('setIsSaved', true);
                    this.$emit('updateEvent', data);
                    this.$emit('gotoStep', gotoStep);
                })
                .catch(this.displayError);
        },
    },
};
