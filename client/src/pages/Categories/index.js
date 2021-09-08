import './index.scss';
import { ERROR_CODES } from '@/globals/constants';
import { confirm, prompt } from '@/utils/alert';
import Page from '@/components/Page';
import Help from '@/components/Help';
import Loading from '@/components/Loading';
import EmptyMessage from '@/components/EmptyMessage';
import Item from './Item';

// @vue/component
export default {
    name: 'Categories',
    components: { Help, Loading, EmptyMessage },
    data() {
        return {
            help: 'page-categories.help',
            error: null,
            isSaving: false,
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
        async handleCreateCategory() {
            const { value: name } = await prompt(
                this.$t('page-categories.prompt-add'),
                {
                    placeholder: this.$t('page-categories.category-name'),
                    confirmButtonText: this.$t('page-categories.create'),
                },
            );

            if (!name) {
                return;
            }

            this.save('categories', null, name);
        },

        handleSaveCategory(id, name) {
            this.save('categories', id, name);
        },

        async handleCreateSubCategory(categoryId, name) {
            this.resetHelpLoading();

            try {
                await this.$http.post('subcategories', { name, category_id: categoryId });
                this.help = 'page-subcategories.saved';
                this.$store.dispatch('categories/refresh');
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isSaving = false;
            }
        },

        handleSaveSubcategory(id, name) {
            this.save('subcategories', id, name);
        },

        async save(entity, id, name) {
            if (!['categories', 'subcategories'].includes(entity)) {
                throw new Error(`Entité ${entity} non reconnue.`);
            }

            this.resetHelpLoading();

            const request = id ? this.$http.put : this.$http.post;
            const route = id ? `${entity}/${id}` : entity;

            try {
                await request(route, { name });
                this.help = `page-${entity}.saved`;
                this.$store.dispatch('categories/refresh');
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isSaving = false;
            }
        },

        async handleDeleteItem(entity, id) {
            const { value: isConfirmed } = await confirm({
                title: this.$t('please-confirm'),
                text: this.$t(`page-${entity}.confirm-permanently-delete`),
                confirmButtonText: this.$t(`yes-permanently-delete`),
                type: 'delete',
            });

            if (!isConfirmed) {
                return;
            }

            this.resetHelpLoading();

            try {
                await this.$http.delete(`${entity}/${id}`);
                this.help = `page-${entity}.deleted`;
                this.$store.dispatch('categories/refresh');
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isSaving = false;
            }
        },

        resetHelpLoading() {
            this.help = 'page-categories.help';
            this.error = null;
            this.isSaving = true;
            this.validationError = null;
        },

        displayError(error) {
            this.help = 'page-categories.help';
            this.error = error;
            this.validationError = null;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400 && details.name) {
                [this.validationError] = details.name;
            }
            if (code === ERROR_CODES.SQL_RELATION_NOT_EMPTY) {
                this.validationError = this.$t('page-categories.cannot-delete-not-empty');
            }
        },
    },
    render() {
        const {
            $t: __,
            help,
            error,
            validationError,
            isSaving,
            isFetched,
            categories,
            handleCreateCategory,
            handleSaveCategory,
            handleCreateSubCategory,
            handleSaveSubcategory,
            handleDeleteItem,
        } = this;

        const actions = [
            <button type="button" class="Categories__create success" onClick={handleCreateCategory}>
                <i class="fas fa-plus" /> {__('page-categories.action-add')}
            </button>,
        ];

        const render = () => {
            if (!isFetched) {
                return <Loading />;
            }

            if (categories.length === 0) {
                return (
                    <EmptyMessage
                        message={__('page-categories.no-category')}
                        action={{
                            label: __('page-categories.create-a-category'),
                            onClick: handleCreateCategory,
                        }}
                    />
                );
            }

            return (
                <ul class="Categories">
                    {categories.map((category) => (
                        <Item
                            key={category.id}
                            category={category}
                            onSaveCategory={handleSaveCategory}
                            onCreateSubCategory={handleCreateSubCategory}
                            onSaveSubcategory={handleSaveSubcategory}
                            onDeleteItem={handleDeleteItem}
                        />
                    ))}
                </ul>
            );
        };

        return (
            <Page
                name="categories"
                title={__('page-categories.title')}
                help={__(help)}
                error={validationError || error || null}
                isLoading={isSaving}
                actions={actions}
                render={render}
            />
        );
    },
};
