import { z } from '@/utils/validation';
import { defineComponent } from '@vue/composition-api';
import SearchPanel, { FilterKind } from '@/themes/default/components/SearchPanel';

import type { Role } from '@/stores/api/roles';
import type { SchemaInfer } from '@/utils/validation';
import type { PropType } from '@vue/composition-api';
import type { Options } from '@/utils/formatOptions';
import type { FilterDefinition } from '@/themes/default/components/SearchPanel';

export enum TokenType {
    AVAILABILITY_PERIOD = 'availabilityPeriod',
    ROLE = 'role',
}

export const FiltersSchema = z.strictObject({
    search: z.string().array(),
    [TokenType.ROLE]: z.number().nullable(),
    [TokenType.AVAILABILITY_PERIOD]: z.period().nullable(),
});

export type Filters = SchemaInfer<typeof FiltersSchema>;

type Props = {
    /** Les valeurs actuelles des filtres. */
    values: Filters,
};

/** Filtres de la liste des techniciens. */
const TechniciansListingFilters = defineComponent({
    name: 'TechniciansListingFilters',
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
    computed: {
        rolesOptions(): Options<Role> {
            return this.$store.getters['roles/options'];
        },

        definitions(): FilterDefinition[] {
            const { __, rolesOptions } = this;

            return [
                {
                    type: TokenType.ROLE,
                    icon: 'tools',
                    title: __('global.role'),
                    placeholder: __('global.all-roles'),
                    options: rolesOptions,
                },
                {
                    type: TokenType.AVAILABILITY_PERIOD,
                    icon: 'calendar-alt',
                    title: __('period-of-availability'),
                    placeholder: __('global.all-periods'),
                    kind: FilterKind.PERIOD,
                },
            ];
        },
    },
    mounted() {
        this.$store.dispatch('roles/fetch');
    },
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

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            if (!key.startsWith('global.')) {
                if (!key.startsWith('page.')) {
                    key = `page.sub-pages.listing.${key}`;
                }
                key = key.replace(/^page\./, 'page.technicians.');
            } else {
                key = key.replace(/^global\./, '');
            }
            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            values,
            definitions,
            handleChange,
            handleSubmit,
        } = this;

        return (
            <SearchPanel
                values={values}
                definitions={definitions}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );
    },
});

export default TechniciansListingFilters;
