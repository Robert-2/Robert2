import './index.scss';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import { confirm, prompt } from '@/utils/alert';
import apiTags from '@/stores/api/tags';

// @vue/component
export default {
    name: 'Tags',
    data() {
        return {
            tags: null,
            isFetched: false,
            isLoading: false,
            isProcessing: [],
            hasCriticalError: null,
            shouldDisplayTrashed: false,
            isTrashDisplayed: false,
        };
    },
    computed: {
        sortedTags() {
            const { tags } = this;
            if (!tags) {
                return [];
            }

            const sortedTags = [...tags]
                .sort(({ name: name1 }, { name: name2 }) => (
                    name1.localeCompare(name2)
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

            const { value: isConfirmed } = await confirm({
                type: isSoft ? 'warning' : 'danger',
                text: isSoft
                    ? __('page.tags.confirm-delete')
                    : __('page.tags.confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('yes-delete')
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
            const { value: isConfirmed } = await confirm({
                type: 'restore',
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

        handleToggleTrashed() {
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
                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                let errorMessage = __('errors.unexpected-while-saving');
                if (code === 400) {
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
            handleToggleTrashed,
        } = this;

        const displayLoading = isLoading || isProcessing.length > 0;

        if (hasCriticalError || !isFetched) {
            return (
                <Page
                    name="tags"
                    title={__('page.tags.title')}
                    help={__('page.tags.help')}
                    isLoading={displayLoading}
                >
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        if (sortedTags.length === 0) {
            return (
                <Page
                    name="tags"
                    title={__('page.tags.title')}
                    help={__('page.tags.help')}
                    isLoading={displayLoading}
                >
                    <div class="Tags">
                        <EmptyMessage
                            message={(
                                isTrashDisplayed
                                    ? __('page.tags.no-item-in-trash')
                                    : __('page.tags.no-item')
                            )}
                            action={(
                                isTrashDisplayed
                                    ? {
                                        label: __('display-not-deleted-items'),
                                        onClick: handleToggleTrashed,
                                    }
                                    : {
                                        label: __('page.tags.action-add'),
                                        onClick: handleCreate,
                                    }
                            )}
                        />
                    </div>
                    {!isTrashDisplayed && (
                        <div class="content__footer">
                            <Button
                                onClick={handleToggleTrashed}
                                icon="trash"
                                type="danger"
                            >
                                {__('open-trash-bin')}
                            </Button>
                        </div>
                    )}
                </Page>
            );
        }

        return (
            <Page
                name="tags"
                title={__('page.tags.title')}
                help={__('page.tags.help')}
                isLoading={displayLoading}
                actions={[
                    <Button type="add" onClick={handleCreate}>
                        {__('page.tags.action-add')}
                    </Button>,
                ]}
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
                <div class="content__footer">
                    <Button
                        onClick={handleToggleTrashed}
                        icon={isTrashDisplayed ? 'eye' : 'trash'}
                        type={isTrashDisplayed ? 'success' : 'danger'}
                    >
                        {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                    </Button>
                </div>
            </Page>
        );
    },
};
