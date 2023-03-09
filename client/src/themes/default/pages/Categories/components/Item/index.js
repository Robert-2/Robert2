import './index.scss';
import { defineComponent } from '@vue/composition-api';
import apiSubcategories from '@/stores/api/subcategories';
import { confirm, prompt } from '@/utils/alert';
import Button from '@/themes/default/components/Button';
import Dropdown from '@/themes/default/components/Dropdown';

// @vue/component
const CategoriesItem = {
    name: 'CategoriesItem',
    props: {
        category: { type: Object, required: true },
    },
    data() {
        return {
            isSaving: false,
        };
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleEditCategory(previousName) {
            const { id } = this.category;
            this.$emit('editCategory', id, previousName);
        },

        handleRemoveCategory() {
            const { id } = this.category;
            this.$emit('deleteCategory', id);
        },

        async handleCreateSubcategory() {
            const name = await this.askForName(null);
            if (!name) {
                return;
            }
            this.saveSubcategory(null, name);
        },

        async handleEditSubcategory(id, previousName) {
            const name = await this.askForName(previousName, previousName);
            if (!name) {
                return;
            }
            this.saveSubcategory(id, name);
        },

        async handleRemoveSubcategory(id) {
            const { $t: __, isSaving } = this;
            if (isSaving) {
                return;
            }

            const isConfirmed = await confirm({
                text: __('page.categories.confirm-permanently-delete-subcategory'),
                confirmButtonText: __('yes-permanently-delete'),
                type: 'danger',
            });
            if (!isConfirmed) {
                return;
            }

            this.isSaving = true;
            try {
                await apiSubcategories.remove(id);
                this.$emit('subcategoryChange');
                this.$toasted.success(__('page.categories.subcategory-deleted'));
                this.$store.dispatch('categories/refresh');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isSaving = false;
            }
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async askForName(previousName = null) {
            const { $t: __, category } = this;
            const { name: categoryName, sub_categories: subCategories } = category;
            const isCreate = previousName === null;
            const title = isCreate
                ? __('page.categories.new-subcategory', { categoryName })
                : __('page.categories.modify-subcategory');
            const { value } = await prompt(title, {
                placeholder: __('page.categories.subcategory-name'),
                inputValue: isCreate ? undefined : previousName,
                confirmButtonText: isCreate ? __('page.categories.create-subcategory') : undefined,
            });

            if (value === undefined) {
                return null;
            }

            if (value.length < 2 || value.length > 96) {
                this.$toasted.error(__('page.categories.name-length-not-valid'));
                return this.askForName(value, categoryName);
            }

            if (subCategories.some((subcategory) => subcategory.name === value)) {
                this.$toasted.error(__('page.categories.subcategory-name-already-exists'));
                return this.askForName(value);
            }

            return value;
        },

        async saveSubcategory(id, name) {
            const { $t: __, isSaving, category } = this;
            if (isSaving) {
                return;
            }

            const { id: categoryId } = category;

            const request = async () => {
                if (id) {
                    await apiSubcategories.update(id, { name });
                } else {
                    await apiSubcategories.create({ name, categoryId });
                }
            };

            this.isSaving = true;
            try {
                await request();
                this.$emit('subcategoryChange');
                this.$toasted.success(__('page.categories.subcategory-saved'));
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
            category,
            handleEditCategory,
            handleRemoveCategory,
            handleCreateSubcategory,
            handleEditSubcategory,
            handleRemoveSubcategory,
        } = this;

        const { id, name, sub_categories: subCategories } = category;

        return (
            <li class="CategoriesItem">
                <div class="CategoriesItem__category">
                    <div class="CategoriesItem__category__name">
                        {name}
                    </div>
                    <div class="CategoriesItem__category__actions">
                        <Button
                            type="success"
                            onClick={() => { handleCreateSubcategory(id, name); }}
                            v-tooltip={__('page.categories.add-a-subcategory')}
                            icon="folder-plus"
                        />
                        <Dropdown variant="actions">
                            <template slot="items">
                                <li class="CategoriesItem__category__dropdown-action">
                                    <Button
                                        to={{ name: 'materials', query: { category: id } }}
                                        icon="list"
                                        class="CategoriesItem__category__dropdown-action__button"
                                    >
                                        {__('page.categories.display-materials-list')}
                                    </Button>
                                </li>
                                <li class="CategoriesItem__category__dropdown-action">
                                    <Button
                                        type="primary"
                                        icon="edit"
                                        onClick={() => { handleEditCategory(name); }}
                                        class="CategoriesItem__category__dropdown-action__button"
                                    >
                                        {__('page.categories.modify')}
                                    </Button>
                                </li>
                                <li class="CategoriesItem__category__dropdown-action">
                                    <Button
                                        type="delete"
                                        onClick={() => { handleRemoveCategory(); }}
                                        class="CategoriesItem__category__dropdown-action__button"
                                    >
                                        {__('page.categories.delete')}
                                    </Button>
                                </li>
                            </template>
                        </Dropdown>
                    </div>
                </div>
                <ul class="CategoriesItem__subcategories">
                    {subCategories.map(({ id: subCategoryId, name: subCategoryName }) => (
                        <li key={subCategoryId} class="CategoriesItem__subcategory">
                            <div class="CategoriesItem__subcategory__name">
                                {subCategoryName}
                            </div>
                            <div class="CategoriesItem__subcategory__actions">
                                <Dropdown variant="actions">
                                    <template slot="items">
                                        <li class="CategoriesItem__subcategory__dropdown-action">
                                            <Button
                                                to={{
                                                    name: 'materials',
                                                    query: { category: id, subCategory: subCategoryId },
                                                }}
                                                icon="list"
                                                class="CategoriesItem__category__dropdown-action__button"
                                            >
                                                {__('page.categories.display-materials-list')}
                                            </Button>
                                        </li>
                                        <li class="CategoriesItem__subcategory__dropdown-action">
                                            <Button
                                                type="primary"
                                                icon="edit"
                                                onClick={() => {
                                                    handleEditSubcategory(subCategoryId, subCategoryName);
                                                }}
                                                class="CategoriesItem__category__dropdown-action__button"
                                            >
                                                {__('page.categories.modify-subcategory')}
                                            </Button>
                                        </li>
                                        <li class="CategoriesItem__subcategory__dropdown-action">
                                            <Button
                                                type="delete"
                                                onClick={() => { handleRemoveSubcategory(subCategoryId); }}
                                                class="CategoriesItem__category__dropdown-action__button"
                                            >
                                                {__('page.categories.delete-subcategory')}
                                            </Button>
                                        </li>
                                    </template>
                                </Dropdown>
                            </div>
                        </li>
                    ))}
                </ul>
            </li>
        );
    },
};

export default defineComponent(CategoriesItem);
