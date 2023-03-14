import './index.scss';
import { ref, computed } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import Loading from '@/themes/default/components/Loading';
import ErrorMessage from '@/themes/default/components/ErrorMessage/index';
import MaterialsSorted from '@/themes/default/components/MaterialsSorted';
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
                    <MaterialsSorted data={selected.value.materials} />
                    <p class="ReuseEventMaterials__selected__warning">
                        <Icon name="exclamation-triangle" />{' '}
                        {__('reuse-list-from-event-warning')}
                    </p>
                </div>
            );
        };

        const bodyClassNames = {
            'ReuseEventMaterials__body': true,
            'ReuseEventMaterials__body--has-selected': selected.value !== null,
        };

        return (
            <div class="ReuseEventMaterials">
                <div class="ReuseEventMaterials__header">
                    <h2 class="ReuseEventMaterials__header__title">
                        {__('choose-event-to-reuse-materials-list')}
                    </h2>
                    <Button
                        type="close"
                        class="ListTemplateUsage__header__close-button"
                        onClick={handleClose}
                    />
                </div>
                <div class={bodyClassNames}>
                    <SearchEvents
                        exclude={excludeEvent.value}
                        onSelect={handleSelectEvent}
                    />
                    {renderSelection()}
                </div>
                {selected.value !== null && (
                    <div class="ReuseEventMaterials__footer">
                        <Button type="primary" icon="check" onClick={handleSubmit}>
                            {__('use-these-materials')}
                        </Button>
                        <Button icon="random" onClick={handleClearSelection}>
                            {__('choose-another-one')}
                        </Button>
                    </div>
                )}
            </div>
        );
    };
};

ReuseEventMaterials.modal = {
    width: 700,
    draggable: true,
    clickToClose: true,
};

export default ReuseEventMaterials;
