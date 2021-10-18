import './index.scss';
import { ref } from '@vue/composition-api';
import { useQuery, useQueryProvider } from 'vue-query';
import queryClient from '@/globals/queryClient';
import useI18n from '@/hooks/useI18n';
import apiListTemplates from '@/stores/api/list-templates';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import EventMaterials from '@/components/EventMaterials';
import TemplatesList from './List';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ListTemplate, ListTemplateWithMaterial } from '@/stores/api/list-templates';

// @vue/component
const ListTemplateUsage = (props: Record<string, never>, { emit }: SetupContext): Render => {
    const __ = useI18n();

    // - Obligation d'utiliser ce hook car on est dans une modale
    useQueryProvider(queryClient);

    const { data: listTemplates, isLoading, error } = useQuery<ListTemplate[] | null>(
        'list-templates',
        apiListTemplates.allWithoutPagination,
    );

    const selected = ref<ListTemplateWithMaterial | null>(null);

    const handleSelectTemplate = async (id: number): Promise<void> => {
        try {
            isLoading.value = true;
            error.value = null;
            selected.value = await apiListTemplates.one(id);
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
        emit('close', { template: selected.value });
    };

    const handleClose = (): void => {
        emit('close');
    };

    return () => (
        <div class="ListTemplateUsage">
            <div class="ListTemplateUsage__header">
                <h2 class="ListTemplateUsage__header__title">
                    {__('choose-list-template-to-use')}
                </h2>
                <button type="button" class="ListTemplateUsage__header__btn-close" onClick={handleClose}>
                    <i class="fas fa-times" />
                </button>
            </div>
            <div class="ListTemplateUsage__main">
                {(isLoading.value) && <Loading />}
                {(!isLoading.value && listTemplates.value && !selected.value) && (
                    <div class="ListTemplateUsage__list">
                        <TemplatesList
                            data={listTemplates.value}
                            onSelect={handleSelectTemplate}
                        />
                    </div>
                )}
                {(!isLoading.value && selected.value) && (
                    <div class="ListTemplateUsage__selected">
                        <h3>{__('list-template-details', { name: selected.value.name })}</h3>
                        <p class="ListTemplateUsage__selected__description">{selected.value.description}</p>
                        <EventMaterials
                            event={selected.value}
                            hideDetails={selected.value.materials.length > 10}
                        />
                        <p class="ListTemplateUsage__selected__warning">
                            <i class="fas fa-exclamation-triangle" />
                            {__('list-template-use-warning')}
                        </p>
                    </div>
                )}
            </div>
            {error.value && <ErrorMessage error={error.value} />}
            {selected.value && (
                <div class="ListTemplateUsage__footer">
                    <button type="button" onClick={handleSubmit} class="success">
                        <i class="fas fa-check" /> {__('use-this-template')}
                    </button>
                    <button type="button" onClick={handleClearSelection} class="warning">
                        <i class="fas fa-random" /> {__('choose-another-one')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListTemplateUsage;
