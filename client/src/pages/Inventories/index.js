import './index.scss';
import { confirm } from '@/utils/alert';
import Page from '@/components/Page';
import Loading from '@/components/Loading';
import CriticalError from '@/components/CriticalError';
import ParkSelector from './ParkSelector';
import Inventories from './Inventories';

const InventoriesPage = {
    name: 'InventoriesPage',
    data() {
        return {
            isLoading: true,
            hasError: false,
            parks: [],
            park: null,
        };
    },
    async mounted() {
        try {
            this.parks = await this.$store.dispatch('parks/fetch', true);
        } catch {
            this.hasError = true;
        } finally {
            this.isLoading = false;
        }

        if (!this.hasError) {
            if ('parkId' in this.$route.params) {
                const parkId = parseInt(this.$route.params.parkId, 10);

                const parkExists = !!this.parks.find((_park) => _park.id === parkId);
                if (!parkExists) {
                    this.$router.replace({ name: 'inventories' });
                    return;
                }

                this.setPark(parkId);
                return;
            }

            if (this.parks.length === 1) {
                const park = this.parks.slice(0, 1).shift();
                this.handleParkChange(park);
            }
        }
    },
    methods: {
        handleParkChange(park) {
            this.$router.replace({ name: 'park-inventories', params: { parkId: park.id } });
        },

        async handleAddClick() {
            const {
                has_ongoing_event: hasOngoingEvent = false,
                has_ongoing_inventory: hasOngoingInventory = false,
            } = this.park;

            if (!hasOngoingInventory && hasOngoingEvent) {
                const response = await confirm({
                    title: this.$t('page-inventories.underway-events-alert-title'),
                    text: this.$t('page-inventories.underway-events-alert-text'),
                    confirmButtonText: this.$t('page-inventories.underway-events-alert-confirm'),
                });

                if (!response.isConfirmed) {
                    return;
                }
            }

            this.$router.push({ name: 'park-inventories-new', params: { parkId: this.park.id } });
        },

        async setPark(id) {
            this.isLoading = true;

            try {
                const { data: park } = await this.$http.get(`parks/${id}`);
                this.park = park;
            } catch {
                this.hasError = true;
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const { $t: __, handleAddClick } = this;

        const title = this.park !== null
            ? __('page-inventories.title-with-park', { park: this.park.name })
            : __('page-inventories.title');

        const actions = [];
        if (this.park !== null) {
            actions.push(
                <button type="button" class="button info" onClick={handleAddClick}>
                    <i class="fas fa-plus" />&nbsp;{__('page-inventories.add')}
                </button>,
            );
        }

        const render = () => {
            if (this.isLoading) {
                return <Loading />;
            }

            if (this.hasError) {
                return <CriticalError />;
            }

            if (this.park === null) {
                return (
                    <ParkSelector
                        list={this.parks}
                        onChange={this.handleParkChange}
                    />
                );
            }

            return (
                <Inventories
                    parkId={this.park.id}
                    onAddClick={handleAddClick}
                />
            );
        };

        return (
            <Page
                name="inventories"
                title={title}
                actions={actions}
                render={render}
            />
        );
    },
};

export default InventoriesPage;
