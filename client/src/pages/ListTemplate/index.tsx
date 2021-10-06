import './index.scss';
import { computed, ref } from '@vue/composition-api';
import { reactive } from 'vue-demi';
import { useQuery, useQueryClient } from 'vue-query';
import requester from '@/globals/requester';
import apiListTemplates from '@/stores/api/list-templates';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import Help from '@/components/Help';
import Page from '@/components/Page';
import ListTemplateForm from './Form';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ListTemplateWithMaterial } from '@/stores/api/list-templates';

type Props = Record<string, never>;

const WIP_STORAGE_KEY = 'WIP-newListTemplate';

// @vue/component
const ListTemplateEditPage = (props: Props, { root }: SetupContext): Render => {
    const __ = useI18n();
    const { route, router } = useRouter();
    const id = computed(() => route.value.params.id || null);
    const isNew = computed(() => !id.value || id.value === 'new');

    const errors = ref<Record<string, string>>();

    const queryClient = useQueryClient();

    const { data: listTemplate, isLoading, error } = useQuery<ListTemplateWithMaterial | null>(
        reactive(['list-template', { id: id.value }]),
        () => id.value ? apiListTemplates.one(id.value) : null,
        reactive({ enabled: !isNew.value }),
    );

    const flushStashedData = (): void => {
        queryClient.removeQueries(['list-template', { id: null }]);
    };

    const save = async (parkData: Record<string, any>): Promise<void> => {
        error.value = null;
        isLoading.value = true;

        const request = isNew.value ? requester.post : requester.put;
        const endpoint = isNew.value ? 'list-templates' : `list-templates/${id.value}`;

        try {
            const { data } = await request(endpoint, parkData);
            listTemplate.value = data;
            flushStashedData();
            setTimeout(() => { router.push('/list-templates'); }, 300);
        } catch (err) {
            error.value = err;

            // TODO: Utiliser un typage correct pour la gestion des erreurs de validation de l'API
            // @ts-ignore
            const { code, details } = err.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                errors.value = { ...details };
            }
        } finally {
            isLoading.value = false;
        }
    };

    const handleChange = (newData: Record<string, any>): void => {
        if (isNew.value) {
            queryClient.setQueryData(['list-template', { id: id.value }], newData);
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
                        listTemplate={listTemplate.value}
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
