import './index.scss';
import { ref, computed } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage/index';
import MaterialsSorted from '@/components/MaterialsSorted';
import apiEvents from '@/stores/api/events';
import SearchEvents from './SearchEvents';

import type { Component, SetupContext } from '@vue/composition-api';
import type { Event } from '@/stores/api/events';

type Props = Record<string, never>;

// @vue/component
const ReuseEventMaterials: Component<Props> = (props: Props, { emit }: SetupContext) => {
    const __ = useI18n();
    const { route } = useRouter();
    const selected = ref<Event | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<unknown | null>(null);

    const excludeEvent = computed<number | null>(() => {
        const { id } = route.value.params;
        return id ? Number.parseInt(id, 10) : null;
    });

    const handleSelectEvent = async (id: number): Promise<void> => {
        isLoading.value = true;
        error.value = null;

        try {
            selected.value = await apiEvents.one(id);
        } catch (err) {
            error.value = err;
            selected.value = null;
        } finally {
            isLoading.value = false;
        }
    };

    const handleClearSelection = (): void => {
        selected.value = null;
    };

    const handleSubmit = (): void => {
        if (!selected.value) {
            return;
        }
        const { materials } = selected.value;
        emit('close', { materials });
    };

    const handleClose = (): void => {
        emit('close');
    };

    return () => {
        const renderMainContent = (): JSX.Element => {
            if (error.value) {
                return <ErrorMessage error={error.value} />;
            }

            if (isLoading.value) {
                return <Loading />;
            }

            if (selected.value) {
                return (
                    <div class="ReuseEventMaterials__selected">
                        <h3>{__('event-materials', { name: selected.value.title })}</h3>
                        <p class="ReuseEventMaterials__selected__description">{selected.value.description}</p>
                        <MaterialsSorted
                            data={selected.value.materials}
                            hideDetails={selected.value.materials.length > 10}
                        />
                        <p class="ReuseEventMaterials__selected__warning">
                            <i class="fas fa-exclamation-triangle" />
                            {__('reuse-list-from-event-warning')}
                        </p>
                    </div>
                );
            }

            return (
                <SearchEvents
                    exclude={excludeEvent.value}
                    onSelect={handleSelectEvent}
                />
            );
        };

        return (
            <div class="ReuseEventMaterials">
                <div class="ReuseEventMaterials__header">
                    <h2 class="ReuseEventMaterials__header__title">
                        {__('choose-event-to-reuse-materials-list')}
                    </h2>
                    <button type="button" class="ReuseEventMaterials__header__btn-close" onClick={handleClose}>
                        <i class="fas fa-times" />
                    </button>
                </div>
                <div class="ReuseEventMaterials__main">
                    {renderMainContent()}
                </div>
                {selected.value && (
                    <div class="ReuseEventMaterials__footer">
                        <button type="button" onClick={handleSubmit} class="success">
                            <i class="fas fa-check" /> {__('use-these-materials')}
                        </button>
                        <button type="button" onClick={handleClearSelection}>
                            <i class="fas fa-random" /> {__('choose-another-one')}
                        </button>
                    </div>
                )}
            </div>
        );
    };
};

export default ReuseEventMaterials;
