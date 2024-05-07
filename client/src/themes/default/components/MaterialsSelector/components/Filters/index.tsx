import './index.scss';
import debounce from 'lodash/debounce';
import { defineComponent } from '@vue/composition-api';
import { DEBOUNCE_WAIT_DURATION } from '@/globals/constants';
import MaterialsFilters from '@/themes/default/components/MaterialsFilters';
import SwitchToggle from '@/themes/default/components/SwitchToggle';
import Input from '@/themes/default/components/Input';

import type { DebouncedMethod } from 'lodash';
import type { PropType } from '@vue/composition-api';
import type { Filters as CoreFilters } from '@/themes/default/components/MaterialsFilters';
import type { Filters } from '../../_types';

type Props = {
    /** Les filtres actuels. */
    values: Filters,

    /**
     * Dois-t'on afficher le filtre permettant de n'afficher
     * que les éléments sélectionnés ?
     */
    withSelectedOnlyFilter?: boolean,
};

type InstanceProperties = {
    handleSearchChangeDebounced: (
        | DebouncedMethod<typeof MaterialsSelectorFilters, 'handleSearchChange'>
        | undefined
    ),
};

// @vue/component
const MaterialsSelectorFilters = defineComponent({
    name: 'MaterialsSelectorFilters',
    props: {
        values: {
            type: Object as PropType<Required<Props>['values']>,
            required: true,
        },
        withSelectedOnlyFilter: {
            type: Boolean as PropType<Required<Props>['withSelectedOnlyFilter']>,
            default: true,
        },
    },
    emits: ['change'],
    setup: (): InstanceProperties => ({
        handleSearchChangeDebounced: undefined,
    }),
    computed: {
        coreValues(): CoreFilters {
            return (['park', 'category', 'subCategory', 'tags'] as Array<keyof CoreFilters>).reduce(
                (coreFilters: CoreFilters, key: keyof CoreFilters): CoreFilters => {
                    const value = this.values[key];
                    return value !== null && (!Array.isArray(value) || value.length > 0)
                        ? { ...coreFilters, [key]: value }
                        : coreFilters;
                },
                {},
            );
        },
    },
    created() {
        this.handleSearchChangeDebounced = debounce(
            this.handleSearchChange.bind(this),
            DEBOUNCE_WAIT_DURATION.asMilliseconds(),
        );
    },
    beforeDestroy() {
        this.handleSearchChangeDebounced?.cancel();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSearchChange(rawSearch: string) {
            const search = rawSearch.length > 0 ? rawSearch : null;
            this.$emit('change', { ...this.values, search });
        },

        handleFiltersChanges(coreFilters: CoreFilters) {
            this.$emit('change', {
                ...this.values,
                park: coreFilters.park ?? null,
                category: coreFilters.category ?? null,
                subCategory: coreFilters.subCategory ?? null,
                tags: coreFilters.tags ?? [],
            });
        },

        handleSelectOnlyFilterChange(onlySelected: boolean) {
            if (!this.withSelectedOnlyFilter) {
                return;
            }
            this.$emit('change', { ...this.values, onlySelected });
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `components.MaterialsSelector.filters.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            values,
            coreValues,
            withSelectedOnlyFilter,
            handleFiltersChanges,
            handleSearchChangeDebounced,
            handleSelectOnlyFilterChange,
        } = this;

        return (
            <div class="MaterialsSelectorFilters">
                <Input
                    class="MaterialsSelectorFilters__search"
                    placeholder={__('search-placeholder')}
                    autocomplete="off"
                    onInput={handleSearchChangeDebounced}
                    value={values.search}
                />
                <div class="MaterialsSelectorFilters__filters">
                    <MaterialsFilters
                        ref="coreFilters"
                        values={coreValues}
                        onChange={handleFiltersChanges}
                    />
                    {withSelectedOnlyFilter && (
                        <div class="MaterialsSelectorFilters__selected-only">
                            <span class="MaterialsSelectorFilters__selected-only__label">
                                {__('selected-materials-only')}
                            </span>
                            <SwitchToggle
                                value={values.onlySelected}
                                onInput={handleSelectOnlyFilterChange}
                                class="MaterialsSelectorFilters__selected-only__input"
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    },
});

export default MaterialsSelectorFilters;
