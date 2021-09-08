import './index.scss';
import VueSelect from 'vue-select';
import Header from './Header';

// @vue/component
export default {
    name: 'AssignTags',
    components: { Header, VueSelect },
    props: {
        'entity': { type: String, required: true },
        'id': { type: [String, Number], required: true },
        'name': { type: String, required: true },
        'initialTags': { type: Array, default: () => [] },
    },
    data() {
        return {
            isLoading: false,
            title: this.$t('entity-name-tags', { entityName: this.name || '' }),
            tags: this.initialTags.map(({ id, name }) => ({ label: name, value: id })),
            error: null,
        };
    },
    methods: {
        async save() {
            this.isLoading = true;
            const tags = this.tags.map((item) => item.label);

            try {
                await this.$http.put(`${this.entity}/${this.id}`, { tags });

                this.$emit('saved');
                this.$emit('close');
            } catch (error) {
                if (!error.response) {
                    this.error = error;
                    return;
                }
                const { message } = error.response.data.error;
                this.error = message;
            } finally {
                this.isLoading = false;
            }
        },

        removeAll() {
            this.tags = [];
        },
    },
};
