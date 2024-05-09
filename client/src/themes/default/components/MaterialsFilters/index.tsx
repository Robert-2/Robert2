import './index.scss';
import omit from 'lodash/omit';
import { defineComponent } from '@vue/composition-api';
import { UNCATEGORIZED } from '@/stores/api/materials';
import formatOptions from '@/utils/formatOptions';
import Select from '@/themes/default/components/Select';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { Tag } from '@/stores/api/tags';
import type { Park } from '@/stores/api/parks';
import type { SubCategory } from '@/stores/api/subcategories';
import type { Filters as AllFilters } from '@/stores/api/materials';
import type { Category, CategoryDetails } from '@/stores/api/categories';

export type Filters = Pick<AllFilters, (
    | 'park'
    | 'category'
    | 'subCategory'
    | 'tags'
)>;

type Props = {
    /** Les valeurs actuelles des filtres. */
    values: Filters,
};

// @vue/component
const MaterialsFilters = defineComponent({
    name: 'MaterialsFilters',
    props: {
        values: {
            type: Object as PropType<Required<Props>['values']>,
            required: true,
        },
    },
    emits: ['change'],
    computed: {
        parksOptions() {
            return this.$store.getters['parks/options'];
        },

        tagsOptions() {
            return this.$store.getters['tags/options'];
        },

        categoriesOptions() {
            const { $t: __ } = this;

            return [
                { value: UNCATEGORIZED, label: __('not-categorized') },
                ...this.$store.getters['categories/options'],
            ];
        },

        subCategoriesOptions() {
            const { category: categoryId } = this.values;
            if (categoryId === undefined || categoryId === UNCATEGORIZED) {
                return [];
            }

            const category = (this.$store.state.categories.list as CategoryDetails[]).find(
                (_category: CategoryDetails) => _category.id === categoryId,
            );
            if (!category) {
                return [];
            }

            return formatOptions(category.sub_categories);
        },

        disableSubCategories() {
            if (this.values.category === undefined) {
                return true;
            }
            return this.subCategoriesOptions.length <= 0;
        },

        isFilterEmpty() {
            return (
                this.values.park === undefined &&
                this.values.category === undefined &&
                this.values.subCategory === undefined &&
                (this.values.tags ?? []).length === 0
            );
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('tags/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleParkChange(rawPark: Park['id'] | '') {
            const park = rawPark !== '' ? rawPark : null;
            if (park === (this.values.park ?? null)) {
                return;
            }

            const newFilters = park === null
                ? omit(this.values, 'park')
                : { ...this.values, park };

            this.$emit('change', newFilters);
        },

        handleCategoryChange(rawCategory: Category['id'] | '') {
            const category = rawCategory !== '' ? rawCategory : null;
            if (category === (this.values.category ?? null)) {
                return;
            }

            const newFilters = category === null
                ? omit(this.values, ['category', 'subCategory'])
                : { ...omit(this.values, ['subCategory']), category };

            this.$emit('change', newFilters);
        },

        handleSubCategoryChange(rawSubCategory: SubCategory['id'] | '') {
            const subCategory = rawSubCategory !== '' ? rawSubCategory : null;
            if (subCategory === (this.values.subCategory ?? null)) {
                return;
            }

            const newFilters = subCategory === null
                ? omit(this.values, 'subCategory')
                : { ...this.values, subCategory };

            this.$emit('change', newFilters);
        },

        handleTagsChange(tags: Array<Tag['id']>) {
            const hasChanged = (this.values.tags ?? []).join(',') !== tags.join(',');
            if (!hasChanged) {
                return;
            }

            const newFilters = tags.length === 0
                ? omit(this.values, 'tags')
                : { ...this.values, tags };

            this.$emit('change', newFilters);
        },

        handleClear() {
            this.$emit('change', {});
        },
    },
    render() {
        const {
            $t: __,
            values,
            tagsOptions,
            parksOptions,
            categoriesOptions,
            subCategoriesOptions,
            disableSubCategories,
            isFilterEmpty,
            handleClear,
            handleParkChange,
            handleTagsChange,
            handleCategoryChange,
            handleSubCategoryChange,
        } = this;

        return (
            <div class="MaterialsFilters">
                {parksOptions.length > 1 && (
                    <Select
                        class="MaterialsFilters__item MaterialsFilters__item--park"
                        placeholder={__('all-parks')}
                        options={parksOptions}
                        value={values.park ?? null}
                        highlight={values.park !== undefined}
                        onChange={handleParkChange}
                    />
                )}
                <Select
                    class="MaterialsFilters__item MaterialsFilters__item--category"
                    placeholder={__('all-categories')}
                    options={categoriesOptions}
                    value={values.category ?? null}
                    highlight={values.category !== undefined}
                    onChange={handleCategoryChange}
                />
                <Select
                    class="MaterialsFilters__item MaterialsFilters__item--sub-category"
                    placeholder={__('all-sub-categories')}
                    disabled={disableSubCategories}
                    options={subCategoriesOptions}
                    value={values.subCategory ?? null}
                    highlight={!disableSubCategories && values.subCategory !== undefined}
                    onChange={handleSubCategoryChange}
                />
                <Select
                    class="MaterialsFilters__item MaterialsFilters__item--tags"
                    placeholder={__('tags')}
                    options={tagsOptions}
                    value={values.tags ?? []}
                    highlight={(values.tags ?? []).length > 0}
                    onChange={handleTagsChange}
                    multiple
                />
                {!isFilterEmpty && (
                    <Button
                        type="danger"
                        icon="backspace"
                        class="MaterialsFilters__reset"
                        tooltip={__('clear-filters')}
                        onClick={handleClear}
                    />
                )}
            </div>
        );
    },
});

export default MaterialsFilters;
