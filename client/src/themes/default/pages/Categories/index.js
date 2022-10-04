import './index.scss';
import { confirm, prompt } from '@/utils/alert';
import apiCategories from '@/stores/api/categories';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Button from '@/themes/default/components/Button';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import Item from './components/Item';

// @vue/component
export default {
    name: 'Categories',
    data() {
        return {
            hasCriticalError: false,
            isFetching: false,
            isFetched: false,
            isSaving: false,
            categories: [],
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleClickNewCategory() {
            const name = await this.askForName();
            if (!name) {
                return;
            }
            this.saveCategory(null, name);
        },

        async handleEditCategory(id, previousName) {
            const name = await this.askForName(previousName);
            if (!name) {
                return;
            }
            this.saveCategory(id, name);
        },

        async handleDeleteCategory(id) {
            const { $t: __ } = this;
            const { value: isConfirmed } = await confirm({
                title: __('please-confirm'),
                text: __(`page.categories.confirm-permanently-delete`),
                confirmButtonText: __(`yes-permanently-delete`),
                type: 'danger',
            });

            if (!isConfirmed) {
                return;
            }

            this.isSaving = true;
            try {
                await apiCategories.remove(id);
                this.fetchData();
                this.$toasted.success(__('page.categories.deleted'));
                this.$store.dispatch('categories/refresh');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isSaving = false;
            }
        },

        handleSubCategoryChange() {
            this.fetchData();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isFetching) {
                return;
            }

            try {
                this.isFetching = true;
                this.categories = await apiCategories.all();
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isFetching = false;
                this.isFetched = true;
            }
        },

        async askForName(previousName = null) {
            const { $t: __ } = this;
            const isCreate = previousName === null;
            const title = isCreate
                ? __('page.categories.create')
                : __('page.categories.modify');

            const { value } = await prompt(title, {
                placeholder: __('page.categories.category-name'),
                inputValue: isCreate ? undefined : previousName,
                confirmButtonText: isCreate ? __('page.categories.create') : undefined,
            });

            if (value === undefined) {
                return null;
            }

            if (value.length < 2 || value.length > 96) {
                this.$toasted.error(__('page.categories.name-length-not-valid'));
                return this.askForName(value);
            }

            if (this.categories.some((category) => category.name === value)) {
                this.$toasted.error(__('page.categories.name-already-exists'));
                return this.askForName(value);
            }

            return value;
        },

        async saveCategory(id, name) {
            const { $t: __, isSaving } = this;
            if (isSaving) {
                return;
            }

            const request = async () => {
                if (id) {
                    await apiCategories.update(id, { name });
                } else {
                    await apiCategories.create({ name });
                }
            };

            this.isSaving = true;
            try {
                await request();
                this.fetchData();
                this.$toasted.success(__('page.categories.saved'));
                this.$store.dispatch('categories/refresh');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            hasCriticalError,
            isSaving,
            isFetched,
            categories,
            handleClickNewCategory,
            handleEditCategory,
            handleDeleteCategory,
            handleSubCategoryChange,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="categories" title={__('page.categories.title')}>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        if (categories.length === 0) {
            return (
                <Page name="categories" title={__('page.categories.title')}>
                    <EmptyMessage
                        message={__('page.categories.no-category')}
                        action={{
                            label: __('page.categories.create-a-category'),
                            onClick: handleClickNewCategory,
                        }}
                    />
                </Page>
            );
        }

        return (
            <Page
                name="categories"
                title={__('page.categories.title')}
                help={__('page.categories.help')}
                isLoading={isSaving}
                actions={[
                    <Button type="add" class="Categories__create" onClick={handleClickNewCategory}>
                        {__('page.categories.new-category')}
                    </Button>,
                ]}
            >
                <ul class="Categories">
                    {categories.map((category) => (
                        <Item
                            key={category.id}
                            category={category}
                            onEditCategory={handleEditCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onSubcategoryChange={handleSubCategoryChange}
                        />
                    ))}
                </ul>
            </Page>
        );
    },
};
