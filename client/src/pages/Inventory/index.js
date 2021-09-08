import './index.scss';
import Page from '@/components/Page';
import Loading from '@/components/Loading';
import CriticalError from '@/components/CriticalError';
import Inventory from './Inventory';
import Lock from './Lock';

const InventoryPage = {
    name: 'InventoryPage',
    data() {
        return {
            isDataLoaded: false,
            isAlreadyLocked: false,
            isLockAcquired: false,
            hasCriticalError: false,
            parkId: parseInt(this.$route.params.parkId, 10),
            park: null,
            materials: [],
            inventory: null,
        };
    },
    async mounted() {
        await this.fetchData();

        if (!this.hasCriticalError) {
            await this.acquireLock();
        }
    },
    methods: {
    // ------------------------------------------------------
    // -
    // -    Handlers
    // -
    // ------------------------------------------------------

        handleChange(inventory) {
            this.inventory = inventory;
        },

        handleFinished(inventory) {
            this.inventory = inventory;

            // TODO: Rediriger vers la vue view (#53) ?
            // @see https://github.com/Robert-2/Robert2-Premium/issues/53
            this.$router.replace({ name: 'park-inventories', params: { parkId: this.parkId } });
        },

        handleUnlock() {
            this.acquireLock(true);
        },

        // ------------------------------------------------------
        // -
        // -    Methods
        // -
        // ------------------------------------------------------

        async acquireLock(force = false) {
            if (this.isLockAcquired) {
                return;
            }

            try {
                const params = { force: force || undefined };
                const { data: inventory } = await this.$http.post(`parks/${this.parkId}/inventories`, {}, { params });

                this.isLockAcquired = true;
                this.isAlreadyLocked = false;
                this.inventory = inventory;
            } catch (error) {
                if (error.response.status === 423) {
                    this.isAlreadyLocked = true;
                    return;
                }
                this.hasCriticalError = true;
            }
        },

        async fetchData() {
            try {
                const [{ data: park }, { data: materials }] = await Promise.all([
                    this.$http.get(`parks/${this.parkId}`),
                    this.$http.get(`parks/${this.parkId}/materials`),
                ]);

                this.park = park;
                this.materials = materials;
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isDataLoaded = true;
            }
        },
    },
    render() {
        const {
            $t: __,
            materials,
            park,
            parkId,
            inventory,
            handleUnlock,
            handleChange,
            handleFinished,
        } = this;

        const render = () => {
            if (this.hasCriticalError) {
                return <CriticalError />;
            }

            if (this.isAlreadyLocked) {
                return <Lock parkId={parkId} onUnlock={handleUnlock} />;
            }

            if (!this.isDataLoaded || !this.isLockAcquired) {
                return <Loading />;
            }

            return (
                <Inventory
                    inventory={inventory}
                    materials={materials}
                    onChange={handleChange}
                    onFinished={handleFinished}
                />
            );
        };

        const title = park !== null
            ? __('page-inventory.title-with-park', { park: park.name })
            : __('page-inventory.title');

        return <Page name="inventory" title={title} render={render} />;
    },
};

export default InventoryPage;
