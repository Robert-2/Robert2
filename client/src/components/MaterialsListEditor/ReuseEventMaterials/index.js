import './index.scss';
import { ref, computed } from '@vue/composition-api';
import useI18n from '@/hooks/vue/useI18n';
import useRouter from '@/hooks/vue/useRouter';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage/index';
import MaterialsSorted from '@/components/MaterialsSorted';
import apiEvents from '@/stores/api/events';
import SearchEvents from './SearchEvents';

// @vue/component
const ReuseEventMaterials = (props, { emit }) => {
    const __ = useI18n();
    const { route } = useRouter();
    const selected = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const excludeEvent = computed(() => {
        const { id } = route.value.params;
        return id ? Number.parseInt(id, 10) : null;
    });

    const handleSelectEvent = async (id) => {
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

    const handleClearSelection = () => {
        selected.value = null;
    };

    const handleSubmit = () => {
        if (!selected.value) {
            return;
        }
        const { materials } = selected.value;
        emit('close', { materials });
    };

    const handleClose = () => {
        emit('close');
    };

    return () => {
        const renderSelection = () => {
            if (error.value) {
                return <ErrorMessage error={error.value} />;
            }

            if (isLoading.value) {
                return <Loading />;
            }

            if (selected.value === null) {
                return null;
            }

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
        };

        const mainClassNames = {
            'ReuseEventMaterials__main': true,
            'ReuseEventMaterials__main--has-selected': selected.value !== null,
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
                <div class={mainClassNames}>
                    <SearchEvents
                        exclude={excludeEvent.value}
                        onSelect={handleSelectEvent}
                    />
                    {renderSelection()}
                </div>
                {selected.value !== null && (
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
