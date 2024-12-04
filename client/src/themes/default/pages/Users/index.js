import './index.scss';
import { defineComponent } from '@vue/composition-api';
import HttpCode from 'status-code-enum';
import isTruthy from '@/utils/isTruthy';
import { isRequestErrorStatusCode } from '@/utils/errors';
import Fragment from '@/components/Fragment';
import Page from '@/themes/default/components/Page';
import Dropdown from '@/themes/default/components/Dropdown';
import CriticalError from '@/themes/default/components/CriticalError';
import { ServerTable } from '@/themes/default/components/Table';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import { confirm } from '@/utils/alert';
import apiUsers from '@/stores/api/users';
import { Group } from '@/stores/api/groups';

/** Page de listing des utilisateurs. */
const Users = defineComponent({
    name: 'Users',
    data: () => ({
        hasCriticalError: false,
        isLoading: false,
        shouldDisplayTrashed: false,
        isTrashDisplayed: false,
    }),
    computed: {
        currentUserId() {
            return this.$store.state.auth.user.id;
        },

        columns() {
            const {
                $t: __,
                currentUserId,
                isTrashDisplayed,
                handleDeleteItem,
                handleRestoreItem,
            } = this;

            return [
                {
                    key: 'full_name',
                    title: `${__('first-name')} / ${__('last-name')}`,
                    class: 'Users__cell Users__cell--name',
                    sortable: true,
                    render: (h, user) => {
                        const isActiveUser = user.id === currentUserId;

                        return (
                            <span class="Users__name">
                                <Icon name={isActiveUser ? 'user-circle' : 'user'} />
                                <span class="Users__name__data">
                                    <span class="Users__full-name">{user.full_name}</span>
                                    <span class="Users__pseudo">@{user.pseudo}</span>
                                </span>
                            </span>
                        );
                    },
                },
                {
                    key: 'group',
                    title: __('access'),
                    class: 'Users__cell Users__cell--group',
                    sortable: true,
                    render: (h, user) => (
                        this.$store.getters['groups/getName'](user.group)
                    ),
                },
                {
                    key: 'email',
                    title: __('email'),
                    class: 'Users__cell Users__cell--email',
                    sortable: true,
                    render: (h, user) => {
                        const isActiveUser = user.id === currentUserId;
                        if (isActiveUser || isTrashDisplayed) {
                            return user.email;
                        }
                        return <a href={`mailto:${user.email}`}>{user.email}</a>;
                    },
                },
                !isTrashDisplayed && {
                    key: 'phone',
                    title: __('phone'),
                    class: 'Users__cell Users__cell--phone',
                    render: (h, { phone }) => (
                        phone ?? (
                            <span class="Users__cell__empty">
                                {__('not-specified')}
                            </span>
                        )
                    ),
                },
                {
                    key: 'actions',
                    title: '',
                    class: 'Users__cell Users__cell--actions',
                    render: (h, user) => {
                        const isActiveUser = user.id === currentUserId;
                        if (isActiveUser) {
                            return null;
                        }

                        const isUserAdmin = user.group === Group.ADMINISTRATION;
                        if (isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <Button
                                        type="restore"
                                        onClick={() => { handleRestoreItem(user.id); }}
                                    />
                                    {!isUserAdmin && (
                                        <Button
                                            type="delete"
                                            onClick={() => { handleDeleteItem(user.id); }}
                                        />
                                    )}
                                </Fragment>
                            );
                        }

                        return (
                            <Dropdown>
                                <Button
                                    type="edit"
                                    to={{
                                        name: 'edit-user',
                                        params: { id: user.id },
                                    }}
                                >
                                    {__('action-edit')}
                                </Button>
                                {!isUserAdmin && (
                                    <Button
                                        type="trash"
                                        onClick={() => { handleDeleteItem(user.id); }}
                                    >
                                        {__('action-delete')}
                                    </Button>
                                )}
                            </Dropdown>
                        );
                    },
                },
            ].filter(isTruthy);
        },
    },
    created() {
        // - Binding.
        this.fetch = this.fetch.bind(this);
    },
    mounted() {
        this.$store.dispatch('groups/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleDeleteItem(id) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const isConfirmed = await confirm({
                type: 'danger',
                text: isSoft
                    ? __('page.users.confirm-delete')
                    : __('page.users.confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('yes-trash')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiUsers.remove(id);
                this.$refs.table.refresh();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItem(id) {
            const { $t: __ } = this;

            const isConfirmed = await confirm({
                text: __('page.users.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiUsers.restore(id);
                this.$refs.table.refresh();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleToggleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.$refs.table.setPage(1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination) {
            this.isLoading = true;

            try {
                const data = await apiUsers.all({
                    ...pagination,
                    deleted: this.shouldDisplayTrashed,
                });
                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return data;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.$refs.table.setPage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving users:`, error);
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },
    },
    render() {
        const {
            $t: __,
            fetch,
            $options,
            columns,
            isLoading,
            isTrashDisplayed,
            hasCriticalError,
            handleToggleShowTrashed,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="users" title={__('page.users.title')} centered>
                    <CriticalError />
                </Page>
            );
        }

        // - Titre de la page.
        const title = !isTrashDisplayed
            ? __('page.users.title')
            : __('page.users.title-trash');

        // - Aide de page.
        const help = !isTrashDisplayed
            ? __('page.users.help')
            : undefined;

        // - Actions de la page.
        const actions = !isTrashDisplayed
            ? [
                <Button type="add" icon="user-plus" to={{ name: 'add-user' }} collapsible>
                    {__('page.users.action-add')}
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

        return (
            <Page
                name="users"
                title={title}
                help={help}
                loading={isLoading}
                actions={actions}
            >
                <div class="Users">
                    <ServerTable
                        ref="table"
                        key={!isTrashDisplayed ? 'default' : 'trash'}
                        name={!isTrashDisplayed ? $options.name : undefined}
                        class="Users__table"
                        columns={columns}
                        fetcher={fetch}
                    />
                </div>
            </Page>
        );
    },
});

export default Users;
