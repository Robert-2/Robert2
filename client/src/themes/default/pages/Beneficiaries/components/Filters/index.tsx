import { z } from '@/utils/validation';
import { defineComponent } from '@vue/composition-api';
import SearchPanel from '@/themes/default/components/SearchPanel';

import type { PropType } from '@vue/composition-api';
import type { SchemaInfer } from '@/utils/validation';

export const FiltersSchema = z.strictObject({
    search: z.string().array(),
});

export type Filters = SchemaInfer<typeof FiltersSchema>;

type Props = {
    /** Les valeurs actuelles des filtres. */
    values: Filters,
};

/** Filtres de la page des bénéficiaires. */
const BeneficiariesFilters = defineComponent({
    name: 'BeneficiariesFilters',
    props: {
        values: {
            type: Object as PropType<Required<Props>['values']>,
            required: true,
            validator: (value: unknown) => (
                FiltersSchema.safeParse(value).success
            ),
        },
    },
    emits: ['change', 'submit'],
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(newFilters: Filters) {
            this.$emit('change', newFilters);
        },

        handleSubmit() {
            this.$emit('submit');
        },
    },
    render() {
        const {
            values,
            handleChange,
            handleSubmit,
        } = this;

        return (
            <SearchPanel
                values={values}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );
    },
});

export default BeneficiariesFilters;
