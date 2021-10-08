import './index.scss';
import { computed, reactive, ref } from '@vue/composition-api';
import { useQuery, useQueryClient } from 'vue-query';
import requester from '@/globals/requester';
import apiListTemplates from '@/stores/api/list-templates';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import Help from '@/components/Help';
import Page from '@/components/Page';
import ListTemplateForm from './Form';

import type { Render } from '@vue/composition-api';
import type { ListTemplateWithMaterial } from '@/stores/api/list-templates';

// @vue/component
const ListTemplateEditPage = (): Render => {
    const __ = useI18n();
    const { route, router } = useRouter();
    const id = computed(() => route.value.params.id || null);
    const isNew = computed(() => !id.value || id.value === 'new');

    const errors = ref<Record<string, string>>();

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
        isLoading.value = true;

        const request = isNew.value ? requester.post : requester.put;
        const endpoint = isNew.value ? 'list-templates' : `list-templates/${id.value || ''}`;

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

            // @ts-ignore // TODO: Utiliser un typage correct pour la gestion des erreurs de validation de l'API
            const { code, details } = err.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                errors.value = { ...details };
            }
        } finally {
            isLoading.value = false;
        }
    };

    const handleCancel = (): void => {
        flushStashedData();
        router.back();
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
                        listTemplate={listTemplate.value}
                        errors={errors.value}
                        onSubmit={save}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    };
};

export default ListTemplateEditPage;
