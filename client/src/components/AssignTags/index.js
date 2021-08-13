import VueSelect from 'vue-select';
import Header from './Header/Header.vue';

export default {
    name: 'AssignTags',
    components: { Header, VueSelect },
    props: ['entity', 'id', 'name', 'initialTags'],
    data() {
        return {
            isLoading: false,
            title: this.$t('entity-name-tags', { entityName: this.name || '' }),
            tags: this.initialTags
                ? this.initialTags.map(({ id, name }) => ({ label: name, value: id }))
                : [],
            error: null,
        };
    },
    methods: {
        save() {
            this.isLoading = true;
            const tags = this.tags.map((item) => item.label);

            this.$http.put(`${this.entity}/${this.id}`, { tags })
                .then(() => {
                    this.$emit('saved');
                    this.$emit('close');
                })
                .catch((error) => {
                    if (!error.response) {
                        this.error = error;
                        return;
                    }
                    const { message } = error.response.data.error;
                    this.error = message;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        removeAll() {
            this.tags = [];
        },
    },
};
