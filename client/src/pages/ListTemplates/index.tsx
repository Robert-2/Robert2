import './index.scss';
import { ref } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import Page from '@/components/Page';
import ListTemplates from './ListTemplates';

import type { Render } from '@vue/composition-api';

// @vue/component
const ListTemplatesPage = (): Render => {
    const __ = useI18n();

    const isLoading = ref<boolean>(false);
    const isTrashDisplayed = ref<boolean>(false);

    const handleLoading = (newState: boolean): void => {
        isLoading.value = newState;
    };

    const showTrashed = (): void => {
        isTrashDisplayed.value = !isTrashDisplayed.value;
    };

    const headerActions = [
        <router-link to="/list-templates/new" class="button success">
            <i class="fas fa-plus" /> {__('page-list-templates.action-add')}
        </router-link>,
    ];

    return () => (
        <Page
            name="list-templates"
            title={__('page-list-templates.title')}
            help={__('page-list-templates.help')}
            isLoading={isLoading.value}
            actions={headerActions}
        >
            <ListTemplates
                withTrashed={isTrashDisplayed.value}
                onLoading={handleLoading}
            />
            <div class="content__footer">
                <button
                    type="button"
                    class={isTrashDisplayed.value ? 'info' : 'warning'}
                    onClick={showTrashed}
                >
                    <i class={['fas', { 'fa-trash': !isTrashDisplayed.value, 'fa-eye"': isTrashDisplayed.value }]} />{' '}
                    {isTrashDisplayed.value ? __('display-not-deleted-items') : __('open-trash-bin')}
                </button>
            </div>
        </Page>
    );
};

export default ListTemplatesPage;
