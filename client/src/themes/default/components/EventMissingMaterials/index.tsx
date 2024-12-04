import './index.scss';
import { defineComponent } from '@vue/composition-api';
import apiEvents from '@/stores/api/events';

import type { PropType } from '@vue/composition-api';
import type { Event, EventMaterialWithQuantityMissing } from '@/stores/api/events';

type Props = {
    /** Identifiant de l'événement. */
    id: Event['id'],
};

type Data = {
    hasCriticalError: boolean,
    missingMaterials: EventMaterialWithQuantityMissing[],
};

/** Liste du matériel manquant d'un événement. */
const EventMissingMaterials = defineComponent({
    name: 'EventMissingMaterials',
    props: {
        id: {
            type: Number as PropType<Props['id']>,
            required: true,
        },
    },
    data: (): Data => ({
        hasCriticalError: false,
        missingMaterials: [],
    }),
    computed: {
        hasMissingMaterials(): boolean {
            return this.missingMaterials.length > 0;
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            const { id } = this;
            try {
                this.missingMaterials = await apiEvents.missingMaterials(id);
            } catch {
                this.hasCriticalError = true;
            }
        },
    },
    render() {
        const { $t: __, missingMaterials, hasCriticalError, hasMissingMaterials } = this;

        if (hasCriticalError) {
            return (
                <div class="EventMissingMaterials">
                    <div class="EventMissingMaterials__header">
                        <h3 class="EventMissingMaterials__header__title">
                            {__('@event.event-missing-materials')}
                        </h3>
                    </div>
                    <p class="EventMissingMaterials__error">
                        {__('errors.unexpected-while-fetching')}
                    </p>
                </div>
            );
        }

        if (!hasMissingMaterials) {
            return null;
        }

        return (
            <div class="EventMissingMaterials">
                <div class="EventMissingMaterials__header">
                    <h3 class="EventMissingMaterials__header__title">
                        {__('@event.event-missing-materials')}
                    </h3>
                    <p class="EventMissingMaterials__header__help">
                        {__('@event.event-missing-materials-help')}
                    </p>
                </div>
                <ul class="EventMissingMaterials__list">
                    {missingMaterials.map((missingMaterial: EventMaterialWithQuantityMissing) => (
                        <li key={missingMaterial.id} class="EventMissingMaterials__list__item">
                            <div class="EventMissingMaterials__list__item__name">
                                {missingMaterial.name}
                            </div>
                            <div class="EventMissingMaterials__list__item__quantity">
                                {__('@event.missing-material-count', {
                                    quantity: missingMaterial.quantity,
                                    missing: missingMaterial.quantity_missing,
                                })}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    },
});

export default EventMissingMaterials;
