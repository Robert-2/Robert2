import './index.scss';
import { confirm } from '@/utils/alert';
import Config from '@/globals/config';
import Help from '@/components/Help';
import ParkTotalAmount from '@/components/ParkTotalAmount';

// @vue/component
export default {
    name: 'Parks',
    components: { Help, ParkTotalAmount },
    data() {
        return {
            help: 'page-parks.help',
            error: null,
            isLoading: false,
            isDisplayTrashed: false,
            isTrashDisplayed: false,
            columns: [
                'name',
                'address',
                'opening_hours',
                'totalItems',
                'totalAmount',
                'note',
                'events',
                'actions',
            ],
            options: {
                columnsDropdown: true,
                preserveState: true,
                orderBy: { column: 'name', ascending: true },
                initialPage: this.$route.query.page || 1,
                sortable: ['name'],
                columnsDisplay: {
                    // - This is a hack: init the table with hidden columns by default
                    note: 'mobile',
                    totalAmount: 'desktop',
                    events: 'desktop',
                },
                headings: {
                    name: this.$t('name'),
                    address: this.$t('address'),
                    opening_hours: this.$t('opening-hours'),
                    totalItems: this.$t('page-parks.total-items'),
                    totalAmount: this.$t('total-amount'),
                    note: this.$t('notes'),
                    events: '',
                    actions: '',
                },
                columnsClasses: {
                    address: 'Parks__address',
                    opening_hours: 'Parks__opening-hours',
                    totalAmount: 'Parks__total-amount',
                    note: 'Parks__note',
                    events: 'Parks__events',
                    actions: 'Parks__actions',
                },
                requestFunction: this.fetch.bind(this),
            },
        };
    },
    computed: {
        parksCount() {
            return this.$store.state.parks.list.length;
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
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
                return await this.$http.get('parks', { params });
            } catch (error) {
                this.error = error;
            } finally {
                this.isTrashDisplayed = this.isDisplayTrashed;
                this.isLoading = false;
            }

            return undefined;
        },

        async deletePark(parkId) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const { value: isConfirmed } = await confirm({
                type: isSoft ? 'trash' : 'delete',

                text: isSoft
                    ? __('page-parks.confirm-delete')
                    : __('page-parks.confirm-permanently-delete'),

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
                await this.$http.delete(`parks/${parkId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        async restorePark(parkId) {
            const { $t: __ } = this;

            const { value: isConfirmed } = await confirm({
                type: 'restore',
                text: __('page-parks.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.put(`parks/restore/${parkId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        getDownloadListingUrl(parkId) {
            const { baseUrl } = Config;
            return `${baseUrl}/materials/pdf?park=${parkId}`;
        },

        refreshTable() {
            this.error = null;
            this.isLoading = true;
            this.$refs.DataTable.refresh();
            this.$store.dispatch('parks/refresh');
        },

        showTrashed() {
            this.isDisplayTrashed = !this.isDisplayTrashed;
            this.refreshTable();
        },
    },
};
