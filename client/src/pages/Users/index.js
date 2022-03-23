import './index.scss';
import { Fragment } from 'vue-fragment';
import initColumnsDisplay from '@/utils/initColumnsDisplay';
import { confirm } from '@/utils/alert';
import Icon from '@/components/Icon';
import Help from '@/components/Help';

// @vue/component
export default {
    name: 'Users',
    data() {
        const { $t: __ } = this;

        return {
            help: 'page-users.help',
            error: null,
            isLoading: false,
            isDisplayTrashed: false,
            isTrashDisplayed: false,
            columns: [
                'pseudo',
                'full_name',
                'group_id',
                'email',
                'phone',
                'address',
                'actions',
            ],
            options: {
                columnsDropdown: true,
                preserveState: true,
                saveState: true,
                orderBy: { column: 'pseudo', ascending: true },
                initialPage: this.$route.query.page || 1,
                sortable: ['pseudo', 'group_id', 'email'],
                columnsDisplay: initColumnsDisplay('usersTable', {
                    pseudo: true,
                    full_name: true,
                    group_id: true,
                    email: true,
                    phone: true,
                    address: false,
                }),
                headings: {
                    pseudo: __('pseudo'),
                    full_name: __('name'),
                    group_id: __('group'),
                    email: __('email'),
                    phone: __('phone'),
                    address: __('address'),
                    actions: '',
                },
                columnsClasses: {
                    pseudo: 'Users__pseudo',
                    full_name: 'Users__name',
                    group_id: 'Users__group',
                    email: 'Users__email',
                    phone: 'Users__phone',
                    address: 'Users__address',
                    actions: 'VueTables__actions Users__actions',
                },
                requestFunction: this.fetch.bind(this),
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
                        if (!user.person) {
                            return (
                                <span class="Users__no-profile">
                                    {__('page-users.profile-missing-or-deleted')}
                                </span>
                            );
                        }
                        return `${user.person.first_name} ${user.person.last_name}`;
                    },
                    group_id: (h, user) => __(user.group_id),
                    email: (h, user) => {
                        const isActiveUser = user.id === this.currentUserId;
                        if (!isActiveUser) {
                            return user.email;
                        }
                        return <a href={`mailto:${user.email}`}>{user.email}</a>;
                    },
                    phone: (h, user) => user.person?.phone ?? null,
                    address: (h, user) => {
                        if (!user.person) {
                            return null;
                        }

                        return (
                            <Fragment>
                                {user.person.street}<br />
                                {user.person.postal_code} {user.person.locality}
                            </Fragment>
                        );
                    },
                    actions: (h, user) => {
                        const isActiveUser = user.id === this.currentUserId;
                        if (isActiveUser) {
                            return (
                                <router-link to="/user-settings" custom>
                                    {({ navigate }) => (
                                        <button type="button" onClick={navigate} class="info">
                                            <i class="fas fa-edit" />
                                        </button>
                                    )}
                                </router-link>
                            );
                        }

                        const isUserAdmin = user.group_id === 'admin';
                        const { isTrashDisplayed, restoreUser, deleteUser } = this;

                        if (isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <button
                                        type="button"
                                        vTooltip={__('action-restore')}
                                        class="item-actions__button info"
                                        onClick={() => { restoreUser(user.id); }}
                                    >
                                        <i class="fas fa-trash-restore" />
                                    </button>
                                    {!isUserAdmin && (
                                        <button
                                            type="button"
                                            vTooltip={__('action-delete')}
                                            class="item-actions__button danger"
                                            onClick={() => { deleteUser(user.id); }}
                                        >
                                            <i class="fas fa-trash-alt" />
                                        </button>
                                    )}
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment>
                                <router-link to={`/users/${user.id}`} custom>
                                    {({ navigate }) => (
                                        <button
                                            type="button"
                                            vTooltip={__('action-edit')}
                                            class="item-actions__button info"
                                            onClick={navigate}
                                        >
                                            <i class="fas fa-edit" />
                                        </button>
                                    )}

                                </router-link>
                                {!isUserAdmin && (
                                    <button
                                        type="button"
                                        vTooltip={__('action-trash')}
                                        class="item-actions__button warning"
                                        onClick={() => { deleteUser(user.id); }}
                                    >
                                        <i class="fas fa-trash" />
                                    </button>
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
        async fetch(pagination) {
            this.error = null;
            this.isLoading = true;

            try {
                const params = {
                    ...pagination,
                    deleted: this.isDisplayTrashed ? '1' : '0',
                };
                return await this.$http.get('users', { params });
            } catch (error) {
                this.error = error;
            } finally {
                this.isTrashDisplayed = this.isDisplayTrashed;
                this.isLoading = false;
            }

            return undefined;
        },

        async deleteUser(userId) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const { value: isConfirmed } = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page-users.confirm-delete')
                    : __('page-users.confirm-permanently-delete'),

                confirmButtonText: isSoft
                    ? __('yes-delete')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.delete(`users/${userId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        async restoreUser(userId) {
            const { $t: __ } = this;

            const { value: isConfirmed } = await confirm({
                type: 'restore',
                text: __('page-users.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.put(`users/restore/${userId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        refreshTable() {
            this.help = 'page-users.help';
            this.error = null;
            this.isLoading = true;
            this.$refs.DataTable.refresh();
        },

        showTrashed() {
            this.isDisplayTrashed = !this.isDisplayTrashed;
            this.refreshTable();
        },
    },
    render() {
        const {
            $t: __,
            help,
            error,
            isLoading,
            columns,
            options,
            isTrashDisplayed,
            showTrashed,
        } = this;

        return (
            <div class="content Users">
                <div class="content__header header-page">
                    <div class="header-page__help">
                        <Help message={help} error={error} isLoading={isLoading} />
                    </div>
                    <div class="header-page__actions">
                        <router-link to="/users/new" custom>
                            {({ navigate }) => (
                                <button
                                    type="button"
                                    onClick={navigate}
                                    class="Users__create success"
                                >
                                    <i class="fas fa-user-plus" />{' '}
                                    {__('page-users.action-add')}
                                </button>
                            )}
                        </router-link>
                    </div>
                </div>
                <div class="content__main-view">
                    <v-server-table
                        ref="DataTable"
                        name="usersTable"
                        columns={columns}
                        options={options}
                    />
                </div>
                <div class="content__footer">
                    <button
                        type="button"
                        onClick={showTrashed}
                        class={[
                            'Users__show-trashed',
                            isTrashDisplayed ? 'info' : 'warning',
                        ]}
                    >
                        <i class={['fas', isTrashDisplayed ? 'fa-eye' : 'fa-trash']} />{' '}
                        {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                    </button>
                </div>
            </div>
        );
    },
};
