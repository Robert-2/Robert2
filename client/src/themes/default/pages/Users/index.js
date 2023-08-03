import './index.scss';
import HttpCode from 'status-code-enum';
import { isRequestErrorStatusCode } from '@/utils/errors';
import Fragment from '@/components/Fragment';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import { confirm } from '@/utils/alert';
import apiUsers from '@/stores/api/users';
import { Group } from '@/stores/api/groups';
import initColumnsDisplay from '@/utils/initColumnsDisplay';

// @vue/component
export default {
    name: 'Users',
    data() {
        const { $t: __, $options } = this;

        return {
            hasCriticalError: false,
            isLoading: false,
            shouldDisplayTrashed: false,
            isTrashDisplayed: false,

            //
            // - Tableau
            //

            columns: [
                'pseudo',
                'full_name',
                'group',
                'email',
                'phone',
                'actions',
            ],
            options: {
                columnsDropdown: true,
                preserveState: true,
                saveState: true,
                orderBy: { column: 'pseudo', ascending: true },
                sortable: ['pseudo', 'group', 'email'],
                columnsDisplay: initColumnsDisplay($options.name, {
                    pseudo: true,
                    full_name: true,
                    group: true,
                    email: true,
                    phone: true,
                }),
                headings: {
                    pseudo: __('pseudo'),
                    full_name: __('name'),
                    group: __('group'),
                    email: __('email'),
                    phone: __('phone'),
                    actions: '',
                },
                columnsClasses: {
                    pseudo: 'Users__pseudo ',
                    full_name: 'Users__name ',
                    group: 'Users__group ',
                    email: 'Users__email ',
                    phone: 'Users__phone ',
                    actions: 'VueTables__actions Users__actions ',
                },
                requestFunction: this.getData.bind(this),
                templates: {
                    pseudo: (h, user) => {
                        const isActiveUser = user.id === this.currentUserId;

                        return (
                            <Fragment>
                                <Icon name={isActiveUser ? 'user-circle' : 'user'} />
                                {user.pseudo}
                            </Fragment>
                        );
                    },
                    full_name: (h, user) => {
                        if (!user.full_name) {
                            return (
                                <span class="Users__no-profile">
                                    {__('page.users.profile-missing-or-deleted')}
                                </span>
                            );
                        }
                        return user.full_name;
                    },
                    group: (h, user) => __(user.group),
                    email: (h, user) => {
                        const isActiveUser = user.id === this.currentUserId;
                        if (isActiveUser) {
                            return user.email;
                        }
                        return <a href={`mailto:${user.email}`}>{user.email}</a>;
                    },
                    phone: (h, user) => user.phone ?? null,
                    actions: (h, user) => {
                        const isActiveUser = user.id === this.currentUserId;
                        if (isActiveUser) {
                            return <Button type="edit" to={{ name: 'user-settings' }} />;
                        }

                        const isUserAdmin = user.group === Group.ADMIN;
                        const {
                            isTrashDisplayed,
                            handleDeleteItem,
                            handleRestoreItem,
                        } = this;

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
                            <Fragment>
                                <Button
                                    type="edit"
                                    to={{
                                        name: 'edit-user',
                                        params: { id: user.id },
                                    }}
                                />
                                {!isUserAdmin && (
                                    <Button
                                        type="trash"
                                        onClick={() => { handleDeleteItem(user.id); }}
                                    />
                                )}
                            </Fragment>
                        );
                    },
                },
            },
        };
    },
    computed: {
        currentUserId() {
            return this.$store.state.auth.user.id;
        },
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

        handleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.$refs.table.setPage(1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async getData(pagination) {
            this.isLoading = true;

            try {
                const params = {
                    ...pagination,
                    deleted: this.shouldDisplayTrashed,
                };
                const data = await apiUsers.all(params);
                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return data;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.$refs.table.setPage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error ocurred while retrieving users:`, error);
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
            $options,
            columns,
            options,
            isLoading,
            isTrashDisplayed,
            hasCriticalError,
            handleShowTrashed,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="users" title={__('page.users.title')}>
                    <CriticalError />
                </Page>
            );
        }

        return (
            <Page
                name="users"
                title={__('page.users.title')}
                help={__('page.users.help')}
                isLoading={isLoading}
                actions={[
                    <Button
                        type="add"
                        icon="user-plus"
                        to={{ name: 'add-user' }}
                    >
                        {__('page.users.action-add')}
                    </Button>,
                ]}
            >
                <div class="Users">
                    <v-server-table
                        ref="table"
                        class="Users__table"
                        name={$options.name}
                        columns={columns}
                        options={options}
                    />
                    <div class="content__footer">
                        <Button
                            onClick={handleShowTrashed}
                            icon={isTrashDisplayed ? 'eye' : 'trash'}
                            type={isTrashDisplayed ? 'success' : 'danger'}
                        >
                            {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                        </Button>
                    </div>
                </div>
            </Page>
        );
    },
};
