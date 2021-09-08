import './index.scss';
import { prompt } from '@/utils/alert';

// @vue/component
export default {
    name: 'CategoriesItem',
    props: {
        category: { type: Object, required: true },
    },
    methods: {
        async editCategory(categoryId, oldName) {
            const { value } = await prompt(
                this.$t('page-categories.prompt-modify'),
                { placeholder: oldName, inputValue: oldName },
            );

            if (!value) {
                return;
            }

            this.$emit('saveCategory', categoryId, value);
        },

        async addSubCategory(categoryId, categoryName) {
            const { value } = await prompt(
                this.$t('page-subcategories.prompt-add', { categoryName }),
                {
                    placeholder: this.$t('page-subcategories.sub-category-name'),
                    confirmButtonText: this.$t('page-subcategories.create'),
                },
            );

            if (!value) {
                return;
            }

            this.$emit('createSubCategory', categoryId, value);
        },

        async editSubCategory(subCategoryId, oldName) {
            const { value } = await prompt(
                this.$t('page-subcategories.prompt-modify'),
                { placeholder: oldName, inputValue: oldName },
            );

            if (!value) {
                return;
            }

            this.$emit('saveSubcategory', subCategoryId, value);
        },

        remove(entity, id) {
            this.$emit('deleteItem', entity, id);
        },
    },
    render() {
        const { $t: __, category, editCategory, addSubCategory, editSubCategory, remove } = this;

        return (
            <li class="CategoriesItem CategoriesItem--category">
                <div class="CategoriesItem__name">
                    <i class="fas fa-folder-open" /> {category.name}
                    <div class="CategoriesItem__actions">
                        <router-link
                            v-tooltip={__('page-categories.display-materials')}
                            to={`/materials?category=${category.id}`}
                            class="CategoriesItem__view-materials-button"
                        >
                            <i class="fas fa-eye" />
                        </router-link>
                        <button
                            type="button"
                            v-tooltip={__('action-edit')}
                            class="CategoriesItem__edit-button info"
                            onClick={() => { editCategory(category.id, category.name); }}
                        >
                            <i class="fas fa-edit" />
                        </button>
                        <button
                            type="button"
                            v-tooltip={__('action-delete')}
                            class="CategoriesItem__delete-button danger"
                            onClick={() => { remove('categories', category.id); }}
                        >
                            <i class="fas fa-trash" />
                        </button>
                    </div>
                </div>
                <ul class="CategoriesItem__sub-categories">
                    {category.sub_categories.map((subCategory) => (
                        <li key={subCategory.id} class="CategoriesItem CategoriesItem--sub-category">
                            <div class="CategoriesItem__name">
                                <i class="fas fa-arrow-right" /> {subCategory.name}
                                <div class="CategoriesItem__actions">
                                    <router-link
                                        v-tooltip={__('page-subcategories.display-materials')}
                                        to={`/materials?category=${category.id}&subCategory=${subCategory.id}`}
                                        class="CategoriesItem__view-materials-button"
                                    >
                                        <i class="fas fa-eye" />
                                    </router-link>
                                    <button
                                        type="button"
                                        v-tooltip={__('action-edit')}
                                        class="CategoriesItem__edit-button info"
                                        onClick={() => { editSubCategory(subCategory.id, subCategory.name); }}
                                    >
                                        <i class="fas fa-edit" />
                                    </button>
                                    <button
                                        type="button"
                                        v-tooltip={__('action-delete')}
                                        class="CategoriesItem__delete-button danger"
                                        onClick={() => { remove('subcategories', subCategory.id); }}
                                    >
                                        <i class="fas fa-trash" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    <button
                        type="button"
                        class="CategoriesItem__add-sub-category-btn"
                        onClick={() => { addSubCategory(category.id, category.name); }}
                    >
                        <i class="fas fa-plus" /> {__('page-subcategories.add')}
                    </button>
                </ul>
            </li>
        );
    },
};
