import './index.scss';
import { defineComponent } from '@vue/composition-api';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { UNCATEGORIZED } from '@/stores/api/materials';
import Select from '@/themes/default/components/Select';
import DatePicker from '@/themes/default/components/DatePicker';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { BookingListFilters } from '@/stores/api/bookings';
import type { Options } from '@/utils/formatOptions';
import type { Park } from '@/stores/api/parks';
import type { Category } from '@/stores/api/categories';
import type Period from '@/utils/period';

export type Filters = Omit<BookingListFilters, 'search'>;
type StateFilterName = 'endingToday' | 'returnInventoryTodo' | 'archived' | 'notConfirmed';
export type StateFilters = Pick<BookingListFilters, StateFilterName>;

type Props = {
    /** Les valeurs actuelles des filtres. */
    values: Filters,
};

/** Filtres de la liste des bookings. */
const ScheduleListingFilters = defineComponent({
    name: 'ScheduleListingFilters',
    props: {
        values: {
            type: Object as PropType<Props['values']>,
            required: true,
        },
    },
    emits: ['change'],
    computed: {
        parksOptions(): Options<Park> {
            return this.$store.getters['parks/options'];
        },

        categoriesOptions(): Options<Category> {
            const { $t: __ } = this;

            return [
                { value: UNCATEGORIZED, label: __('not-categorized') },
                ...this.$store.getters['categories/options'],
            ];
        },

        statesOptions(): Options<{ id: StateFilterName }> {
            const { $t: __ } = this;

            return [
                { value: 'endingToday', label: __('page.schedule.listing.states.ending-today') },
                { value: 'returnInventoryTodo', label: __('page.schedule.listing.states.return-inventory-todo') },
                { value: 'notConfirmed', label: __('page.schedule.listing.states.not-confirmed') },
                { value: 'archived', label: __('page.schedule.listing.states.archived') },
            ];
        },

        statesValues(): Array<keyof StateFilters> {
            const { values } = this;

            return (['endingToday', 'returnInventoryTodo', 'archived', 'notConfirmed'] as Array<keyof StateFilters>)
                .filter((key: keyof StateFilters) => (key in values && values[key] === true));
        },

        isFilterEmpty(): boolean {
            return (
                this.values.park === undefined &&
                this.values.category === undefined &&
                this.values.endingToday === undefined &&
                this.values.returnInventoryTodo === undefined &&
                this.values.archived === undefined &&
                this.values.notConfirmed === undefined
            );
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('categories/fetch');
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
                ? omit(this.values, 'category')
                : { ...this.values, category };

            this.$emit('change', newFilters);
        },

        handlePeriodChange(period: Period | null) {
            const newFilters = period === null
                ? omit(this.values, 'period')
                : { ...this.values, period };

            this.$emit('change', newFilters);
        },

        handleChangeStates(states: Array<keyof StateFilters>) {
            const newFilters: BookingListFilters = pick(this.values, ['park', 'category', 'period']);

            if (states.length === 0) {
                this.$emit('change', newFilters);
                return;
            }

            states.forEach((state: keyof StateFilters) => {
                newFilters[state] = true;
            });
            this.$emit('change', newFilters);
        },

        handleClear() {
            this.$emit('change', {});
        },
    },
    render() {
        const {
            $t: __,
            parksOptions,
            categoriesOptions,
            statesOptions,
            values,
            statesValues,
            handleParkChange,
            handleCategoryChange,
            handlePeriodChange,
            handleChangeStates,
            isFilterEmpty,
            handleClear,
        } = this;

        return (
            <div class="ScheduleListingFilters">
                {parksOptions.length > 1 && (
                    <Select
                        class="ScheduleListingFilters__item ScheduleListingFilters__item--park"
                        placeholder={__('all-parks')}
                        options={parksOptions}
                        value={values.park ?? null}
                        highlight={values.park !== undefined}
                        onChange={handleParkChange}
                    />
                )}
                <Select
                    class="ScheduleListingFilters__item ScheduleListingFilters__item--category"
                    placeholder={__('all-categories')}
                    options={categoriesOptions}
                    value={values.category ?? null}
                    highlight={values.category !== undefined}
                    onChange={handleCategoryChange}
                />
                <DatePicker
                    type="date"
                    placeholder={__('page.schedule.listing.all-periods')}
                    value={values.period}
                    onChange={handlePeriodChange}
                    class="ScheduleListingFilters__item ScheduleListingFilters__item--period"
                    withSnippets
                    range
                    clearable
                />
                <Select
                    class="ScheduleListingFilters__item ScheduleListingFilters__item--state"
                    placeholder={__('page.schedule.listing.all-states')}
                    options={statesOptions}
                    value={statesValues}
                    highlight={statesValues.length > 0}
                    onChange={handleChangeStates}
                    multiple
                />
                {!isFilterEmpty && (
                    <Button
                        type="danger"
                        icon="backspace"
                        class="ScheduleListingFilters__reset"
                        tooltip={__('clear-filters')}
                        onClick={handleClear}
                    />
                )}
            </div>
        );
    },
});

export default ScheduleListingFilters;
