import './index.scss';
import { toRefs, ref } from '@vue/composition-api';
import moment from 'moment';
import useI18n from '@/hooks/useI18n';
import { useQuery } from 'vue-query';
import apiParks from '@/stores/api/parks';
import apiUnitStates from '@/stores/api/unit-states';
import ItemActions from './ItemActions';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ServerTableOptions, TableRow } from 'vue-tables-2';
import type { Material, MaterialUnit } from '@/stores/api/materials';
import type { Park } from '@/stores/api/parks';
import type { UnitState } from '@/stores/api/unit-states';

type Props = {
    material: Material,
    onOutDated?(): void,
    onError?(error: unknown): void,
};

// @vue/component
const MaterialViewUnits = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();
    const { material } = toRefs(props);
    const { data: parks } = useQuery('parks', apiParks.list);
    const { data: unitStates } = useQuery('unit-states', apiUnitStates.all);

    const columns = ref<string[]>([
        'reference',
        'serial_number',
        'park',
        'owner',
        'is_broken',
        'is_lost',
        'state',
        'purchase_date',
        'actions',
    ]);

    const options = ref<ServerTableOptions<MaterialUnit[]>>({
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'reference', ascending: true },
        sortable: [
            'reference',
            'serial_number',
            'is_broken',
            'state',
            'purchase_date',
            'is_lost',
        ],
        headings: {
            reference: __('reference'),
            serial_number: __('serial-number'),
            park: __('park'),
            owner: __('owner'),
            is_broken: __('is-broken'),
            is_lost: __('is-lost'),
            state: __('state'),
            purchase_date: __('purchase-date'),
            actions: '',
        },
    });

    const getParkName = (parkId: number): string => (
        parks?.value?.find((park: Park) => park.id === parkId)?.name || ''
    );

    const getUnitStateName = (stateId: string): string => (
        unitStates?.value?.find((state: UnitState) => state.id === stateId)?.name || ''
    );

    return () => (
        <div class="MaterialViewUnits">
            <v-client-table
                data={material.value.units}
                columns={columns.value}
                options={options.value}
                scopedSlots={{
                    park: ({ row }: TableRow<MaterialUnit>) => getParkName(row.park_id),
                    owner: ({ row }: TableRow<MaterialUnit>) => row.owner?.full_name,
                    is_broken: ({ row }: TableRow<MaterialUnit>) => (
                        row.is_broken
                            ? <span class="MaterialViewUnits__yes-warning">{__('yes')}</span>
                            : <span class="MaterialViewUnits__no-ok">{__('no')}</span>
                    ),
                    is_lost: ({ row }: TableRow<MaterialUnit>) => (
                        row.is_lost
                            ? <span class="MaterialViewUnits__yes-warning">{__('yes')}</span>
                            : <span class="MaterialViewUnits__no-ok">{__('no')}</span>
                    ),
                    state: ({ row }: TableRow<MaterialUnit>) => getUnitStateName(row.state),
                    purchase_date: ({ row }: TableRow<MaterialUnit>) => (
                        row.purchase_date ? moment(row.purchase_date).format('L') : null
                    ),
                    actions: ({ row }: TableRow<MaterialUnit>) => (
                        <ItemActions
                            id={row.id}
                            materialId={material.value.id}
                            onChange={() => { emit('outdated'); }}
                            onError={(error: unknown) => { emit('error', error); }}
                        />
                    ),
                }}
            />
        </div>
    );
};

MaterialViewUnits.props = {
    material: { type: Object, required: true },
};

MaterialViewUnits.emits = ['outdated', 'error'];

export default MaterialViewUnits;
