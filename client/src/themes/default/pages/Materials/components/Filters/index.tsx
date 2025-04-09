import './index.scss';
import Period from '@/utils/period';
import { defineComponent } from '@vue/composition-api';
import SearchPanel, { FiltersSchema } from '@/themes/default/components/MaterialsFilters';
import DatePicker from '@/themes/default/components/DatePicker';

import type { PropType } from '@vue/composition-api';
import type { Filters } from '@/themes/default/components/MaterialsFilters';

type Props = {
    /** La valeur actuelle des filtres. */
    values: Filters,

    /*
     * La valeur de la période à utiliser pour le
     * calcul des quantités disponibles.
     */
    quantitiesPeriodValue: Period | null,
};

type Data = {
    quantitiesPeriodIsFullDays: boolean,
};

/** Filtres de la page de listing du matériel. */
const MaterialsPageFilters = defineComponent({
    name: 'MaterialsPageFilters',
    props: {
        values: {
            type: Object as PropType<Required<Props>['values']>,
            required: true,
            validator: (value: unknown) => (
                FiltersSchema.safeParse(value).success
            ),
        },
        quantitiesPeriodValue: {
            // TODO [vue@>2.7]: Mettre `[Period, null] as PropType<Props['quantitiesPeriodValue']>,` en Vue 2.7.
            // @see https://github.com/vuejs/core/issues/3948#issuecomment-860466204
            type: null as unknown as PropType<Props['quantitiesPeriodValue']>,
            required: true,
            validator: (value: unknown): boolean => (
                value === null || value instanceof Period
            ),
        },
    },
    emits: [
        'filtersChange',
        'quantitiesPeriodChange',
        'submit',
    ],
    data: (): Data => ({
        quantitiesPeriodIsFullDays: false,
    }),
    computed: {
        quantitiesPeriod(): Period | null {
            return this.quantitiesPeriodValue;
        },
    },
    methods: {
        handleCoreFiltersChange(newFilters: Filters) {
            this.$emit('filtersChange', newFilters);
        },

        handleChangeQuantitiesPeriod(newPeriod: Period<true> | null, isFullDays: boolean) {
            this.quantitiesPeriodIsFullDays = isFullDays;
            this.$emit('quantitiesPeriodChange', newPeriod);
        },

        handleCoreFiltersSubmit() {
            this.$emit('submit');
        },
    },
    render() {
        const {
            $t: __,
            values,
            quantitiesPeriodValue,
            quantitiesPeriodIsFullDays,
            handleChangeQuantitiesPeriod,
            handleCoreFiltersSubmit,
            handleCoreFiltersChange,
        } = this;

        return (
            <div class="MaterialsPageFilters">
                <SearchPanel
                    class="MaterialsPageFilters__search"
                    values={values}
                    onChange={handleCoreFiltersChange}
                    onSubmit={handleCoreFiltersSubmit}
                />
                <div class="MaterialsPageFilters__quantities-period">
                    <DatePicker
                        type={quantitiesPeriodIsFullDays ? 'date' : 'datetime'}
                        value={quantitiesPeriodValue}
                        onChange={handleChangeQuantitiesPeriod}
                        class="MaterialsPageFilters__quantities-period__input"
                        v-tooltip={{
                            placement: 'top',
                            content: __('page.materials.period-to-display-available-quantities'),
                        }}
                        withFullDaysToggle
                        withSnippets
                        range
                    />
                </div>
            </div>
        );
    },
});

export type { Filters };

export { FiltersSchema };
export default MaterialsPageFilters;
