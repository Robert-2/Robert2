import './index.scss';
import { computed, reactive, ref } from '@vue/composition-api';
import { useQuery, useQueryClient } from 'vue-query';
import { extractErrorDetails } from '@/utils/errors';
import requester from '@/globals/requester';
import apiListTemplates from '@/stores/api/list-templates';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import Help from '@/components/Help';
import Page from '@/components/Page';
import ListTemplateForm from './Form';

import type { Render } from '@vue/composition-api';
import type { FormErrorDetail } from '@/stores/api/@types';
import type { ListTemplateWithMaterial } from '@/stores/api/list-templates';
import type { MaterialQuantity } from '@/components/MaterialsListEditor/_utils';

// @vue/component
const ListTemplateEditPage = (): Render => {
    const __ = useI18n();
    const { route, router } = useRouter();
    const id = computed(() => route.value.params.id || null);
    const isNew = computed(() => !id.value || id.value === 'new');

    const errors = ref<FormErrorDetail | null>(null);

    const queryClient = useQueryClient();

    const { data: listTemplate, isLoading, error } = useQuery<ListTemplateWithMaterial | null>(
        reactive(['list-template', { id: id.value }]),
        () => (id.value ? apiListTemplates.one(id.value) : null),
        reactive({ enabled: !isNew.value }),
    );

    const flushStashedData = (): void => {
        queryClient.removeQueries(['list-template', { id: null }]);
    };

    const save = async (templateListData: Record<string, any>): Promise<void> => {
        error.value = null;
        errors.value = null;
        isLoading.value = true;

        const request = isNew.value ? requester.post : requester.put;
        const endpoint = isNew.value ? 'list-templates' : `list-templates/${id.value!}`;

        try {
            const { data } = await request(endpoint, templateListData);
            if (isNew.value) {
                flushStashedData();
            } else {
                queryClient.setQueryData(['list-template', { id: id.value }], data);
            }
            setTimeout(() => { router.push('/list-templates'); }, 300);
        } catch (err) {
            error.value = err;
            errors.value = extractErrorDetails(err);
        } finally {
            isLoading.value = false;
        }
    };

    const handleChange = (newData: Record<string, string | MaterialQuantity>): void => {
        if (isNew.value) {
            // - Conservation des données du formulaire dans le cache
            // TODO: Prendre en charge la liste du matériel (et pas uniquement lors de la création)
            //       afin de mettre à jour les totaux du formulaire en temps réel.
            const { name, description } = newData;
            queryClient.setQueryData(['list-template', { id: null }], { name, description });
        }
    };

    const handleCancel = (): void => {
        flushStashedData();
        router.push('/list-templates');
    };

    return () => {
        const pageTitle = isNew.value
            ? __('page-list-templates.add')
            : __('page-list-templates.edit', { pageSubTitle: listTemplate.value?.name || '' });

        return (
            <Page name="list-template-edit" title={pageTitle}>
                <Help
                    message={__('page-list-templates.help-edit')}
                    error={error.value}
                    isLoading={isLoading.value}
                />
                <div class="ListTemplate__content">
                    <ListTemplateForm
                        isNew={isNew.value}
                        data={listTemplate.value}
                        errors={errors.value}
                        onSubmit={save}
                        onChange={handleChange}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    };
};

export default ListTemplateEditPage;
