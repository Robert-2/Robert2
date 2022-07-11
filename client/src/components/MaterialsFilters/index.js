import './index.scss';
import { defineComponent } from '@vue/composition-api';
import formatOptions from '@/utils/formatOptions';
import Select from '@/components/Select';
import Button from '@/components/Button';

// @vue/component
export default defineComponent({
    name: 'MaterialsFilters',
    data() {
        return {
            filters: {
                park: this.$route.query.park ?? '',
                category: this.$route.query.category ?? '',
                subCategory: this.$route.query.subCategory ?? '',
                tags: [],
            },
        };
    },
    computed: {
        parksOptions() {
            return this.$store.getters['parks/options'];
        },

        tagsOptions() {
            return this.$store.getters['tags/options'];
        },

        categoriesOptions() {
            const { $t: __ } = this;

            const options = this.$store.getters['categories/options'];

            return [
                { value: 'uncategorized', label: __('not-categorized') },
                ...options,
            ];
        },

        subCategoriesOptions() {
            let { category: categoryId } = this.filters;
            if (!categoryId && categoryId !== 0) {
                return [];
            }
            categoryId = parseInt(categoryId, 10);

            const categories = this.$store.state.categories.list;
            const category = categories.find(
                (_category) => parseInt(_category.id, 10) === categoryId,
            );
            if (!category) {
                return [];
            }

            return formatOptions(category.sub_categories);
        },

        disableSubCategories() {
            if (!this.filters.category && this.filters.category !== 0) {
                return true;
            }
            return this.subCategoriesOptions.length <= 0;
        },

        isFilterEmpty() {
            return (
                this.filters.park === '' &&
                this.filters.category === '' &&
                this.filters.subCategory === '' &&
                this.filters.tags.length === 0
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

        handleCategoryChange() {
            this.filters.subCategory = '';
            this.updateQueryFilters();
        },

        handleBasicChange() {
            this.updateQueryFilters();
        },

        handleClear() {
            this.clearFilters();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        updateQueryFilters() {
            const { park, category, subCategory, tags: rawTags } = this.filters;

            // FIXME: On devrait passer la liste des IDs des tags au back-end plutôt
            //        que de passer des chaînes comme ça...
            const _getTagName = (name) => this.$store.getters['tags/tagName'](name);
            const tags = rawTags.reduce(
                (acc, tagId) => {
                    const tagName = _getTagName(tagId);
                    return tagName !== null ? acc.concat(tagName) : acc;
                },
                [],
            );

            const filters = {
                park: park || null,
                category: category || null,
                subCategory: subCategory || null,
                tags,
            };

            const query = {};
            if (park) {
                query.park = park;
            }
            if (category) {
                query.category = category;
            }
            if (subCategory) {
                query.subCategory = subCategory;
            }
            if (tags.length > 0) {
                query.tags = JSON.stringify(tags);
            }

            this.$router.push({ query });
            this.$emit('change', filters);
        },

        // ------------------------------------------------------
        // -
        // -    Public API
        // -
        // ------------------------------------------------------

        clearFilters() {
            this.filters = {
                park: '',
                category: '',
                subCategory: '',
                tags: [],
            };
            this.updateQueryFilters();
        },
    },
    render() {
        const {
            $t: __,
            filters,
            tagsOptions,
            parksOptions,
            categoriesOptions,
            subCategoriesOptions,
            disableSubCategories,
            isFilterEmpty,
            handleBasicChange,
            handleCategoryChange,
            handleClear,
        } = this;

        return (
            <div class="MaterialsFilters">
                {parksOptions.length > 1 && (
                    <Select
                        class="MaterialsFilters__item MaterialsFilters__item--park"
                        placeholder={__('all-parks')}
                        options={parksOptions}
                        onChange={handleBasicChange}
                        v-model={filters.park}
                        highlight={filters.park !== ''}
                    />
                )}
                <Select
                    class="MaterialsFilters__item MaterialsFilters__item--category"
                    placeholder={__('all-categories')}
                    options={categoriesOptions}
                    onChange={handleCategoryChange}
                    v-model={filters.category}
                    highlight={filters.category !== ''}
                />
                <Select
                    class="MaterialsFilters__item MaterialsFilters__item--sub-category"
                    placeholder={__('all-sub-categories')}
                    disabled={disableSubCategories}
                    options={subCategoriesOptions}
                    onChange={handleBasicChange}
                    v-model={filters.subCategory}
                    highlight={!disableSubCategories && filters.subCategory !== ''}
                />
                <Select
                    name="test"
                    class="MaterialsFilters__item MaterialsFilters__item--tags"
                    v-model={filters.tags}
                    placeholder={__('tags')}
                    options={tagsOptions}
                    onChange={handleBasicChange}
                    highlight={filters.tags.length > 0}
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
