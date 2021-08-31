import './index.scss';
import moment from 'moment';
import Loading from '@/components/Loading';
import CriticalError from '@/components/CriticalError';
import Illustration from './assets/illustration.svg?inline';

const InventoryLock = {
    name: 'InventoryLock',
    props: {
        parkId: { type: Number, required: true },
    },
    data() {
        return {
            isDataLoaded: false,
            hasCriticalError: false,
            inventory: null,
        };
    },
    async mounted() {
        await this.fetchData();
    },
    computed: {
        createDate() {
            const { created_at: createdAt } = this.inventory;
            return createdAt ? moment(createdAt).format('L LT') : null;
        },

        author() {
            return this.inventory?.author ?? null;
        },

        isUnlockable() {
            const { user } = this.$store.state.auth;

            // - Si l'auteur a été supprimé, n'importe qui peut reprendre la main.
            //   ou bien que l'auteur est l'utilisateur courant...
            if (!this.author || this.author.id === user.id) {
                return true;
            }

            // - Sinon, il faut être admin pour prendre la main...
            return this.$store.getters['auth/is']('admin');
        },
    },
    methods: {
    // ------------------------------------------------------
    // -
    // -    Handlers
    // -
    // ------------------------------------------------------

        handleUnlock() {
            if (!this.isUnlockable) {
                return;
            }
            this.$emit('unlock');
        },

        // ------------------------------------------------------
        // -
        // -    Methods
        // -
        // ------------------------------------------------------

        async fetchData() {
            try {
                const { data: inventory } = await this.$http.get(`/parks/${this.parkId}/inventories/ongoing`);
                this.inventory = inventory;
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isDataLoaded = true;
            }
        },
    },
    render() {
        if (this.hasCriticalError) {
            return <CriticalError />;
        }

        if (!this.isDataLoaded) {
            return <Loading />;
        }

        const { $t: __, author, createDate, isUnlockable, handleUnlock } = this;
        const messageKey = author != null ? 'locked-message' : 'locked-message-no-author';
        const messageParams = { author: author?.pseudo, email: author?.email, date: createDate };

        return (
            <div class="InventoryLock">
                <Illustration class="InventoryLock__illustration" />
                <p class="InventoryLock__message">
                    {__(`page-inventory.${messageKey}`, messageParams)}
                </p>
                {isUnlockable && !!author && (
                    <p class="InventoryLock__message">
                        {__('page-inventory.locked-message-unlock-warning')}
                    </p>
                )}
                {isUnlockable && (
                    <button type="button" class="InventoryLock__action button warning" onClick={handleUnlock}>
                        {__('take-control')}
                    </button>
                )}
                {!isUnlockable && (
                <router-link
                    class="InventoryLock__action button"
                    to={{ name: 'park-inventories', params: { parkId: this.parkId } }}
                >
                    {__('page-inventory.back-to-inventories-list')}
                </router-link>
                )}
            </div>
        );
    },
};

export default InventoryLock;
