import './index.scss';
import { confirm } from '@/utils/alert';
import Help from '@/components/Help';

// @vue/component
export default {
    name: 'Users',
    components: { Help },
    data() {
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
                orderBy: { column: 'pseudo', ascending: true },
                initialPage: this.$route.query.page || 1,
                sortable: ['pseudo', 'group_id', 'email'],
                columnsDisplay: {
                    // - This is a hack: init the table with hidden columns by default
                    address: 'mobile',
                },
                headings: {
                    pseudo: this.$t('pseudo'),
                    full_name: this.$t('name'),
                    group_id: this.$t('group'),
                    email: this.$t('email'),
                    phone: this.$t('phone'),
                    address: this.$t('address'),
                    actions: '',
                },
                columnsClasses: {
                    pseudo: 'Users__pseudo',
                    full_name: 'Users__name',
                    group_id: 'Users__group',
                    email: 'Users__email',
                    phone: 'Users__phone',
                    address: 'Users__address',
                },
                requestFunction: this.fetch.bind(this),
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
                type: isSoft ? 'trash' : 'delete',

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
};
