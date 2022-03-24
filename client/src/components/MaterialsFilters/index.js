import './index.scss';
import { defineComponent } from '@vue/composition-api';
import VueSelect from 'vue-select';
import Button from '@/components/Button';
import { initFilters } from './utils/initFilters';

// @vue/component
export default defineComponent({
    name: 'MaterialsFilters',
    components: { VueSelect },
    data() {
        return {
            filters: initFilters(this.$route.query),
        };
    },
    computed: {
        parks() {
            return this.$store.state.parks.list;
        },

        categories() {
            return this.$store.state.categories.list;
        },

        subCategories() {
            const selectedCategoryIdRaw = this.filters.category;
            if (selectedCategoryIdRaw === '') {
                return [];
            }

            const selectedCategoryId = parseInt(selectedCategoryIdRaw, 10);
            const selectedCategory = this.categories.find(
                (category) => category.id === selectedCategoryId,
            );

            return selectedCategory?.sub_categories || [];
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
        changePark(e) {
            this.filters.park = parseInt(e.currentTarget.value, 10) || '';
            this.saveFilters();
        },

        changeCategory(e) {
            this.filters.category = parseInt(e.currentTarget.value, 10) || '';
            this.filters.subCategory = '';
            this.saveFilters();
        },

        changeSubCategory(e) {
            this.filters.subCategory = parseInt(e.currentTarget.value, 10) || '';
            this.saveFilters();
        },

        clearFilters() {
            this.filters = {
                park: '',
                category: '',
                subCategory: '',
                tags: [],
            };
            this.saveFilters();
        },

        setQueryFilters() {
            const { park, category, subCategory, tags } = this.filters;

            const filters = {
                park: park || null,
                category: category || null,
                subCategory: subCategory || null,
                tags: tags.map((tag) => tag.label || tag),
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
                query.tags = JSON.stringify(filters.tags);
            }

            this.$router.push({ query });
            this.$emit('change', filters);
        },

        saveFilters() {
            const { tags, ...otherFilters } = this.filters;
            localStorage.setItem(`materialsFilters`, JSON.stringify({
                ...otherFilters,
                tags: tags.map((tag) => tag.label),
            }));

            this.setQueryFilters();
        },
    },
    render() {
        const {
            $t: __,
            filters,
            parks,
            changePark,
            categories,
            changeCategory,
            subCategories,
            changeSubCategory,
            saveFilters,
            isFilterEmpty,
            clearFilters,
        } = this;

        return (
            <div class="MaterialsFilters">
                <select
                    vModel={this.filters.park}
                    onChange={changePark}
                    class={{
                        'MaterialsFilters__item': true,
                        'MaterialsFilters__item--is-active': filters.park !== '',
                    }}
                >
                    <option value="">{__('all-parks')}</option>
                    {parks.map(({ id, name }) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
                <select
                    vModel={this.filters.category}
                    onChange={changeCategory}
                    class={{
                        'MaterialsFilters__item': true,
                        'MaterialsFilters__item--is-active': filters.category !== '',
                    }}
                >
                    <option value="">{__('all-categories')}</option>
                    {categories.map(({ id, name }) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
                <select
                    vModel={this.filters.subCategory}
                    onChange={changeSubCategory}
                    disabled={subCategories.length === 0}
                    class={{
                        'MaterialsFilters__item': true,
                        'MaterialsFilters__item--is-active': filters.subCategory !== '',
                    }}
                >
                    <option value="">{__('all-sub-categories')}</option>
                    {subCategories.map(({ id, name }) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
                <VueSelect
                    vModel={this.filters.tags}
                    options={this.$store.getters['tags/options']}
                    class={{
                        'MaterialsFilters__item': true,
                        'MaterialsFilters__item--tags': true,
                        'MaterialsFilters__item--is-active': filters.tags.length > 0,
                    }}
                    placeholder={__('tags')}
                    onInput={saveFilters}
                    multiple
                />
                {!isFilterEmpty && (
                    <Button
                        type="warning"
                        icon="backspace"
                        onClick={clearFilters}
                        vTooltip={__('clear-filters')}
                        class="MaterialsFilters__reset"
                    />
                )}
            </div>
        );
    },
});
