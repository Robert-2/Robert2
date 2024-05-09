import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Page from '@/themes/default/components/Page';
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

/** Page de listing des tags. */
const Tags = defineComponent({
    name: 'Tags',
    data: () => ({
        tags: null,
        isFetched: false,
        isLoading: false,
        isProcessing: [],
        hasCriticalError: null,
        shouldDisplayTrashed: false,
        isTrashDisplayed: false,
    }),
    computed: {
        sortedTags() {
            const { tags } = this;
            if (!tags) {
                return [];
            }

            const sortedTags = [...tags]
                .sort(({ name: name1 }, { name: name2 }) => (
                    stringCompare(name1, name2)
                ));

            return sortedTags;
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
            const { $t: __ } = this;

            // TODO: À migrer vers une vraie modale.
            //       (qui ne se ferme pas quand on a des erreurs de formulaire notamment)
            const { value: name } = await prompt(
                __('page.tags.prompt-add'),
                {
                    placeholder: __('page.tags.tag-name'),
                    confirmButtonText: __('page.tags.create'),
                },
            );
            if (!name) {
                return;
            }

            this.save(null, { name });
        },

        async handleEdit(id) {
            if (this.isProcessing.includes(id)) {
                return;
            }

            const { $t: __ } = this;
            const tag = this.tags.find((_tag) => _tag.id === id);
            if (tag === undefined) {
                return;
            }

            const { name } = tag;

            // TODO: À migrer vers une vraie modale.
            //       (qui ne se ferme pas quand on a des erreurs de formulaire notamment)
            const { value: newName } = await prompt(
                __('page.tags.prompt-modify'),
                { placeholder: name, inputValue: name },
            );
            if (!newName) {
                return;
            }

            this.save(id, { name: newName });
        },

        async handleRemove(id) {
            if (this.isProcessing.includes(id)) {
                return;
            }

            const { $t: __, isTrashDisplayed } = this;
            const isSoft = !isTrashDisplayed;

            const isConfirmed = await confirm({
                type: 'danger',
                text: isSoft
                    ? __('page.tags.confirm-delete')
                    : __('page.tags.confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('yes-trash')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isProcessing.push(id);
            this.removeTagFromList(id);

            try {
                await apiTags.remove(id);
                this.$toasted.success(__('page.tags.deleted'));
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
                this.fetchData();
            } finally {
                this.isProcessing = Array.from((new Set(this.isProcessing)).delete(id));
            }
        },

        async handleRestore(id) {
            if (this.isProcessing.includes(id)) {
                return;
            }

            const { $t: __ } = this;
            const isConfirmed = await confirm({
                text: __('page.tags.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isProcessing.push(id);
            this.removeTagFromList(id);

            try {
                await apiTags.restore(id);
                this.$toasted.success(__('page.tags.restored'));
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
                this.fetchData();
            } finally {
                this.isProcessing = Array.from((new Set(this.isProcessing)).delete(id));
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
            this.isLoading = true;
            try {
                const deleted = this.shouldDisplayTrashed;
                const data = await apiTags.all({ deleted });
                this.tags = data;
                this.isTrashDisplayed = this.shouldDisplayTrashed;
                this.isFetched = true;
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }
        },

        async save(id, data) {
            const isNew = id === null;
            if (this.isProcessing.includes(id)) {
                return;
            }

            const doRequest = () => (
                isNew
                    ? apiTags.create(data)
                    : apiTags.update(id, data)
            );

            const { $t: __ } = this;
            if (!isNew) {
                this.isProcessing.push(id);
            }

            try {
                const newTagData = await doRequest();
                if (isNew) {
                    this.tags.push(newTagData);
                } else {
                    const toUpdateIndex = this.tags.findIndex((tag) => tag.id === id);
                    this.$set(this.tags, toUpdateIndex, newTagData);
                }
                this.$toasted.success(__('page.tags.saved'));
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                let errorMessage = __('errors.unexpected-while-saving');
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    errorMessage = __('errors.validation');
                    if (details.name) {
                        [errorMessage] = details.name;
                    }
                }
                this.$toasted.error(errorMessage);
            } finally {
                if (!isNew) {
                    this.isProcessing = Array.from((new Set(this.isProcessing)).delete(id));
                }
            }
        },

        removeTagFromList(id) {
            const index = this.tags.findIndex((tag) => tag.id === id);
            if (index === -1) {
                return;
            }
            this.$delete(this.tags, index);
        },
    },
    render() {
        const {
            $t: __,
            sortedTags,
            isLoading,
            isFetched,
            isProcessing,
            hasCriticalError,
            isTrashDisplayed,
            handleCreate,
            handleEdit,
            handleRemove,
            handleRestore,
            handleToggleShowTrashed,
        } = this;

        const displayLoading = isLoading || isProcessing.length > 0;

        // - Titre de la page.
        const title = !isTrashDisplayed
            ? __('page.tags.title')
            : __('page.tags.title-trash');

        // - Aide de page.
        const help = !isTrashDisplayed
            ? __('page.tags.help')
            : undefined;

        // - Actions de la page.
        const actions = !isTrashDisplayed
            ? [
                <Button type="add" onClick={handleCreate} collapsible>
                    {__('page.tags.action-add')}
                </Button>,
                <Dropdown>
                    <Button icon="trash" onClick={handleToggleShowTrashed}>
                        {__('open-trash-bin')}
                    </Button>
                </Dropdown>,
            ]
            : [
                <Button onClick={handleToggleShowTrashed} icon="eye" type="primary">
                    {__('display-not-deleted-items')}
                </Button>,
            ];

        if (hasCriticalError || !isFetched) {
            return (
                <Page
                    name="tags"
                    title={title}
                    help={help}
                    loading={displayLoading}
                    centered
                >
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        if (sortedTags.length === 0) {
            return (
                <Page
                    name="tags"
                    title={title}
                    help={help}
                    loading={displayLoading}
                    actions={actions}
                >
                    <div class="Tags">
                        <EmptyMessage
                            message={(
                                isTrashDisplayed
                                    ? __('page.tags.no-tag-in-trash')
                                    : __('page.tags.no-tag-yet')
                            )}
                            action={(
                                isTrashDisplayed
                                    ? {
                                        type: 'primary',
                                        label: __('display-not-deleted-items'),
                                        onClick: handleToggleShowTrashed,
                                    }
                                    : {
                                        type: 'add',
                                        label: __('page.tags.create-first-tag'),
                                        onClick: handleCreate,
                                    }
                            )}
                        />
                    </div>
                </Page>
            );
        }

        return (
            <Page
                name="tags"
                title={title}
                help={help}
                loading={displayLoading}
                actions={actions}
            >
                <div class="Tags">
                    <ul class="Tags__list">
                        {sortedTags.map(({ id, name }) => (
                            <li key={id} class="Tags__item">
                                <span class="Tags__item__name">
                                    <Icon name="tag" /> {name}
                                </span>
                                {!isTrashDisplayed && (
                                    <span class="Tags__item__actions">
                                        <Button
                                            type="edit"
                                            onClick={() => { handleEdit(id); }}
                                            disabled={isProcessing.includes(id)}
                                        />
                                        <Button
                                            type="trash"
                                            onClick={() => { handleRemove(id); }}
                                            disabled={isProcessing.includes(id)}
                                        />
                                    </span>
                                )}
                                {isTrashDisplayed && (
                                    <span class="Tags__item__actions">
                                        <Button
                                            type="restore"
                                            onClick={() => { handleRestore(id); }}
                                        />
                                        <Button
                                            type="delete"
                                            onClick={() => { handleRemove(id); }}
                                        />
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </Page>
        );
    },
});

export default Tags;
