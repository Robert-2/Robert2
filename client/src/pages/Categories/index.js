import './index.scss';
import Alert from '@/components/Alert';
import Help from '@/components/Help';
import Loading from '@/components/Loading';
import EmptyMessage from '@/components/EmptyMessage';

// @vue/component
export default {
    name: 'Categories',
    components: { Help, Loading, EmptyMessage },
    data() {
        return {
            help: 'page-categories.help',
            error: null,
            isLoading: false,
            validationError: null,
        };
    },
    computed: {
        categories() {
            return this.$store.state.categories.list;
        },

        isFetched() {
            return this.$store.state.categories.isFetched;
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        addCategory() {
            Alert.Prompt(this.$t, 'page-categories.prompt-add', {
                placeholder: 'page-categories.category-name',
                confirmText: 'page-categories.create',
            }).then(({ value: name }) => {
                if (name) {
                    this.save('categories', null, name);
                }
            });
        },

        editCategory(categoryId, oldName) {
            Alert.Prompt(this.$t, 'page-categories.prompt-modify', {
                placeholder: oldName,
                confirmText: 'save',
                inputValue: oldName,
            }).then(({ value: newName }) => {
                if (newName) {
                    this.save('categories', categoryId, newName);
                }
            });
        },

        addSubCategory(categoryId, categoryName) {
            Alert.Prompt(this.$t, 'page-subcategories.prompt-add', {
                titleData: { categoryName },
                placeholder: 'page-subcategories.sub-category-name',
                confirmText: 'page-subcategories.create',
            }).then(({ value: name }) => {
                if (name) {
                    this.saveNewSubCategory(name, categoryId);
                }
            });
        },

        editSubCategory(subCategoryId, oldName) {
            Alert.Prompt(this.$t, 'page-subcategories.prompt-modify', {
                placeholder: oldName,
                confirmText: 'save',
                inputValue: oldName,
            }).then(({ value: newName }) => {
                if (newName) {
                    this.save('subcategories', subCategoryId, newName);
                }
            });
        },

        save(resource, id, name) {
            this.resetHelpLoading();
            let request = this.$http.post;
            let route = resource;
            if (id) {
                request = this.$http.put;
                route = `${resource}/${id}`;
            }

            let saveMessage = 'page-categories.saved';
            if (resource === 'subcategories') {
                saveMessage = 'page-subcategories.saved';
            }

            request(route, { name })
                .then(() => {
                    this.isLoading = false;
                    this.help = { type: 'success', text: saveMessage };
                    this.$store.dispatch('categories/refresh');
                })
                .catch(this.displayError);
        },

        saveNewSubCategory(name, categoryId) {
            this.resetHelpLoading();
            this.$http.post('subcategories', { name, category_id: categoryId })
                .then(() => {
                    this.isLoading = false;
                    this.help = { type: 'success', text: 'page-subcategories.saved' };
                    this.$store.dispatch('categories/refresh');
                })
                .catch(this.displayError);
        },

        remove(entity, id) {
            let saveMessage = 'page-categories.deleted';
            if (entity === 'subcategories') {
                saveMessage = 'page-subcategories.deleted';
            }

            Alert.ConfirmDelete(this.$t, entity).then((result) => {
                if (!result.value) {
                    return;
                }
                this.resetHelpLoading();

                this.isLoading = false;
                this.$http.delete(`${entity}/${id}`)
                    .then(() => {
                        this.help = { type: 'success', text: saveMessage };
                        this.$store.dispatch('categories/refresh');
                    })
                    .catch(this.displayError);
            });
        },

        resetHelpLoading() {
            this.help = 'page-categories.help';
            this.error = null;
            this.isLoading = true;
            this.validationError = null;
        },

        displayError(error) {
            this.help = 'page-categories.help';
            this.error = error;
            this.isLoading = false;
            this.validationError = null;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400 && details.name) {
                [this.validationError] = details.name;
            }
        },
    },
};
