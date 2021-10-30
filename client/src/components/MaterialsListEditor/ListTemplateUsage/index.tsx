import './index.scss';
import { ref } from '@vue/composition-api';
import { useQuery, useQueryProvider } from 'vue-query';
import queryClient from '@/globals/queryClient';
import useI18n from '@/hooks/useI18n';
import apiListTemplates from '@/stores/api/list-templates';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import MaterialsSorted from '@/components/MaterialsSorted';
import TemplatesList from './List';

import type { Component, SetupContext } from '@vue/composition-api';
import type { ListTemplate, ListTemplateWithMaterial } from '@/stores/api/list-templates';

type Props = Record<string, never>;

// @vue/component
const ListTemplateUsage: Component<Props> = (props: Props, { emit }: SetupContext) => {
    const __ = useI18n();
    const selected = ref<ListTemplateWithMaterial | null>(null);

    // - Obligation d'utiliser ce hook car on est dans une modale
    useQueryProvider(queryClient);

    const { data: listTemplates, isLoading, error } = useQuery<ListTemplate[]>(
        'list-templates',
        () => apiListTemplates.all({ paginated: false }),
    );

    const handleSelectTemplate = async (id: number): Promise<void> => {
        isLoading.value = true;
        error.value = null;

        try {
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
                    <div class="ListTemplateUsage__selected">
                        <h3>{__('list-template-details', { name: selected.value.name })}</h3>
                        <p class="ListTemplateUsage__selected__description">{selected.value.description}</p>
                        <MaterialsSorted
                            data={selected.value.materials}
                            hideDetails={selected.value.materials.length > 10}
                        />
                        <p class="ListTemplateUsage__selected__warning">
                            <i class="fas fa-exclamation-triangle" />
                            {__('list-template-use-warning')}
                        </p>
                    </div>
                );
            }

            return (
                <div class="ListTemplateUsage__list">
                    <TemplatesList
                        data={listTemplates.value}
                        onSelect={handleSelectTemplate}
                    />
                </div>
            );
        };

        return (
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
                    {renderMainContent()}
                </div>
                {selected.value && (
                    <div class="ListTemplateUsage__footer">
                        <button type="button" onClick={handleSubmit} class="success">
                            <i class="fas fa-check" /> {__('use-this-template')}
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

export default ListTemplateUsage;
