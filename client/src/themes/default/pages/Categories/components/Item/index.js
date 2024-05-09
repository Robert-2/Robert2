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
    emits: [
        'editCategory',
        'deleteCategory',
        'subCategoryChange',
    ],
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

        async handleCreateSubCategory() {
            const name = await this.askForName(null);
            if (!name) {
                return;
            }
            this.saveSubCategory(null, name);
        },

        async handleEditSubCategory(id, previousName) {
            const name = await this.askForName(previousName, previousName);
            if (!name) {
                return;
            }
            this.saveSubCategory(id, name);
        },

        async handleRemoveSubCategory(id) {
            const { $t: __, isSaving } = this;
            if (isSaving) {
                return;
            }

            const isConfirmed = await confirm({
                type: 'danger',
                text: __('page.categories.confirm-permanently-delete-subcategory'),
                confirmButtonText: __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isSaving = true;
            try {
                await apiSubcategories.remove(id);
                this.$emit('subCategoryChange');
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

            if (subCategories.some((subCategory) => subCategory.name === value)) {
                this.$toasted.error(__('page.categories.subcategory-name-already-exists'));
                return this.askForName(value);
            }

            return value;
        },

        async saveSubCategory(id, name) {
            const { $t: __, isSaving, category } = this;
            if (isSaving) {
                return;
            }

            const { id: categoryId } = category;

            const request = async () => {
                if (id) {
                    await apiSubcategories.update(id, { name });
                } else {
                    await apiSubcategories.create({ name, category_id: categoryId });
                }
            };

            this.isSaving = true;
            try {
                await request();
                this.$emit('subCategoryChange');
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
            handleCreateSubCategory,
            handleEditSubCategory,
            handleRemoveSubCategory,
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
                            type="add"
                            icon="folder-plus"
                            onClick={() => { handleCreateSubCategory(id, name); }}
                            v-tooltip={__('page.categories.add-a-subcategory')}
                        />
                        <Dropdown>
                            <Button
                                icon="list"
                                to={{ name: 'materials', query: { category: id } }}
                            >
                                {__('page.categories.display-materials-list')}
                            </Button>
                            <Button
                                icon="edit"
                                type="default"
                                onClick={() => { handleEditCategory(name); }}
                            >
                                {__('page.categories.modify')}
                            </Button>
                            <Button
                                type="delete"
                                onClick={() => { handleRemoveCategory(); }}
                            >
                                {__('page.categories.delete')}
                            </Button>
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
                                <Dropdown>
                                    <Button
                                        to={{
                                            name: 'materials',
                                            query: { category: id, subCategory: subCategoryId },
                                        }}
                                        icon="list"
                                    >
                                        {__('page.categories.display-materials-list')}
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon="edit"
                                        onClick={() => {
                                            handleEditSubCategory(subCategoryId, subCategoryName);
                                        }}
                                    >
                                        {__('page.categories.modify-subcategory')}
                                    </Button>
                                    <Button
                                        type="delete"
                                        onClick={() => { handleRemoveSubCategory(subCategoryId); }}
                                    >
                                        {__('page.categories.delete-subcategory')}
                                    </Button>
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
