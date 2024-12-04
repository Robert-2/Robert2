import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import { isRequestErrorStatusCode } from '@/utils/errors';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import Dropdown from '@/themes/default/components/Dropdown';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import { confirm, prompt } from '@/utils/alert';
import stringCompare from '@/utils/stringCompare';
import apiTags from '@/stores/api/tags';
import { ApiErrorCode } from '@/stores/api/@codes';
import SubPage from '../../components/SubPage';

import type { Tag, TagEdit } from '@/stores/api/tags';

type Data = {
    tags: Tag[] | null,
    isFetched: boolean,
    processing: Array<Tag['id']>,
    hasCriticalError: boolean,
    shouldDisplayTrashed: boolean,
    isTrashDisplayed: boolean,
};

/** Page des paramètres des tags du matériel. */
const TagsGlobalSettings = defineComponent({
    name: 'TagsGlobalSettings',
    data: (): Data => ({
        tags: null,
        isFetched: false,
        processing: [],
        hasCriticalError: false,
        shouldDisplayTrashed: false,
        isTrashDisplayed: false,
    }),
    computed: {
        sortedTags(): Tag[] {
            const { tags } = this;
            if (!tags) {
                return [];
            }

            return [...tags].sort(({ name: name1 }: Tag, { name: name2 }: Tag) => (
                stringCompare(name1, name2)
            ));
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleCreate() {
            const { __ } = this;

            // TODO: À migrer vers une vraie modale.
            //       (qui ne se ferme pas quand on a des erreurs de formulaire notamment)
            const { value: name } = await prompt(
                __('prompt-add'),
                {
                    placeholder: __('tag-name'),
                    confirmButtonText: __('create'),
                },
            );
            if (!name) {
                return;
            }

            this.save(null, { name });
        },

        async handleEdit(id: Tag['id']) {
            if (!this.tags || this.processing.includes(id)) {
                return;
            }

            const { __ } = this;
            const tag = this.tags.find((_tag: Tag) => _tag.id === id);
            if (tag === undefined) {
                return;
            }

            const { name } = tag;

            // TODO: À migrer vers une vraie modale.
            //       (qui ne se ferme pas quand on a des erreurs de formulaire notamment)
            const { value: newName } = await prompt(
                __('prompt-modify'),
                { placeholder: name, inputValue: name },
            );
            if (!newName) {
                return;
            }

            this.save(id, { name: newName });
        },

        async handleRemove(id: Tag['id']) {
            if (this.processing.includes(id)) {
                return;
            }

            const { __, isTrashDisplayed } = this;
            const isSoft = !isTrashDisplayed;

            const isConfirmed = await confirm({
                type: 'danger',
                text: isSoft
                    ? __('confirm-delete')
                    : __('confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('global.yes-trash')
                    : __('global.yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.processing.push(id);
            this.removeTagFromList(id);

            try {
                await apiTags.remove(id);
                this.$toasted.success(__('deleted'));
                this.$store.dispatch('tags/refresh');
            } catch {
                this.$toasted.error(__('global.errors.unexpected-while-deleting'));
                this.fetchData();
            } finally {
                const processingSet = new Set(this.processing);
                processingSet.delete(id);
                this.processing = Array.from(processingSet);
            }
        },

        async handleRestore(id: Tag['id']) {
            if (this.processing.includes(id)) {
                return;
            }

            const { __ } = this;
            const isConfirmed = await confirm({
                text: __('confirm-restore'),
                confirmButtonText: __('global.yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.processing.push(id);
            this.removeTagFromList(id);

            try {
                await apiTags.restore(id);
                this.$toasted.success(__('restored'));
                this.$store.dispatch('tags/refresh');
            } catch {
                this.$toasted.error(__('global.errors.unexpected-while-restoring'));
                this.fetchData();
            } finally {
                const processingSet = new Set(this.processing);
                processingSet.delete(id);
                this.processing = Array.from(processingSet);
            }
        },

        handleToggleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.fetchData();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            try {
                const deleted = this.shouldDisplayTrashed;
                const data = await apiTags.all({ deleted });
                this.tags = data;
                this.isTrashDisplayed = this.shouldDisplayTrashed;
                this.isFetched = true;
            } catch {
                this.hasCriticalError = true;
            }
        },

        async save(id: Tag['id'] | null, data: TagEdit) {
            const isNew = id === null;
            if (!this.tags || (!isNew && this.processing.includes(id))) {
                return;
            }

            const { __ } = this;
            if (!isNew) {
                this.processing.push(id);
            }

            try {
                const newTagData = isNew
                    ? await apiTags.create(data)
                    : await apiTags.update(id, data);

                if (isNew) {
                    this.tags.push(newTagData);
                } else {
                    const toUpdateIndex = this.tags.findIndex((_tag: Tag) => _tag.id === id);
                    this.$set(this.tags, toUpdateIndex, newTagData);
                }
                this.$toasted.success(__('saved'));
                this.$store.dispatch('tags/refresh');
            } catch (error) {
                let errorMessage = __('global.errors.unexpected-while-saving');
                if (axios.isAxiosError(error) && isRequestErrorStatusCode(error, HttpCode.ClientErrorBadRequest)) {
                    const defaultError = { code: ApiErrorCode.UNKNOWN, details: {} };
                    const { code, details } = error.response?.data?.error ?? defaultError;
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        errorMessage = __('global.errors.validation');
                        if (details.name) {
                            [errorMessage] = details.name;
                        }
                    }
                }
                this.$toasted.error(errorMessage);
            } finally {
                if (!isNew) {
                    const processingSet = new Set(this.processing);
                    processingSet.delete(id);
                    this.processing = Array.from(processingSet);
                }
            }
        },

        removeTagFromList(id: Tag['id']) {
            if (!this.tags) {
                return;
            }

            const index = this.tags.findIndex((_tag: Tag) => _tag.id === id);
            if (index === -1) {
                return;
            }
            this.$delete(this.tags, index);
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `page.settings.tags.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            sortedTags,
            isFetched,
            processing,
            hasCriticalError,
            isTrashDisplayed,
            handleCreate,
            handleEdit,
            handleRemove,
            handleRestore,
            handleToggleShowTrashed,
        } = this;

        // - Titre de la page.
        const title = !isTrashDisplayed
            ? __('title')
            : __('title-trash');

        // - Aide de page.
        const help = !isTrashDisplayed
            ? __('help')
            : undefined;

        if (hasCriticalError || !isFetched) {
            return (
                <SubPage class="TagsGlobalSettings" title={title} help={help} centered>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </SubPage>
            );
        }

        // - Actions de la page.
        const actions = !isTrashDisplayed
            ? [
                <Button type="add" onClick={handleCreate} collapsible>
                    {__('action-add')}
                </Button>,
                <Dropdown>
                    <Button icon="trash" onClick={handleToggleShowTrashed}>
                        {__('global.open-trash-bin')}
                    </Button>
                </Dropdown>,
            ]
            : [
                <Button onClick={handleToggleShowTrashed} icon="eye" type="primary">
                    {__('global.display-not-deleted-items')}
                </Button>,
            ];

        if (sortedTags.length === 0) {
            return (
                <SubPage
                    class="TagsGlobalSettings"
                    title={title}
                    help={help}
                    actions={actions}
                    centered
                >
                    <EmptyMessage
                        message={(
                            isTrashDisplayed
                                ? __('no-tag-in-trash')
                                : __('no-tag-yet')
                        )}
                        action={(
                            isTrashDisplayed
                                ? {
                                    type: 'primary',
                                    label: __('global.display-not-deleted-items'),
                                    onClick: handleToggleShowTrashed,
                                }
                                : {
                                    type: 'add',
                                    label: __('create-first-tag'),
                                    onClick: handleCreate,
                                }
                        )}
                    />
                </SubPage>
            );
        }

        return (
            <SubPage
                class="TagsGlobalSettings"
                title={title}
                help={help}
                actions={actions}
            >
                <ul class="TagsGlobalSettings__list">
                    {sortedTags.map(({ id, name }: Tag) => (
                        <li key={id} class="TagsGlobalSettings__item">
                            <span class="TagsGlobalSettings__item__name">
                                {(
                                    processing.includes(id)
                                        ? <Icon name="circle-notch" spin />
                                        : <Icon name="tag" />
                                )}
                                {name}
                            </span>
                            {!isTrashDisplayed && (
                                <span class="TagsGlobalSettings__item__actions">
                                    <Button
                                        type="edit"
                                        onClick={() => { handleEdit(id); }}
                                        disabled={processing.includes(id)}
                                    />
                                    <Button
                                        type="trash"
                                        onClick={() => { handleRemove(id); }}
                                        disabled={processing.includes(id)}
                                    />
                                </span>
                            )}
                            {isTrashDisplayed && (
                                <span class="TagsGlobalSettings__item__actions">
                                    <Button
                                        type="restore"
                                        onClick={() => { handleRestore(id); }}
                                        disabled={processing.includes(id)}
                                    />
                                    <Button
                                        type="delete"
                                        onClick={() => { handleRemove(id); }}
                                        disabled={processing.includes(id)}
                                    />
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </SubPage>
        );
    },
});

export default TagsGlobalSettings;
