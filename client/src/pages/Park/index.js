import Help from '@/components/Help';
import FormField from '@/components/FormField';
import ParkTotalAmount from '../Parks/TotalAmount';

const storageKeyWIP = 'WIP-newPark';

// @vue/component
export default {
    name: 'Material',
    components: { Help, FormField, ParkTotalAmount },
    data() {
        return {
            help: 'page-parks.help-edit',
            error: null,
            isLoading: false,
            park: {
                id: this.$route.params.id || null,
                name: '',
                street: '',
                postal_code: '',
                locality: '',
                country_id: '',
                total_amount: 0,
                note: '',
            },
            errors: {
                name: null,
                street: null,
                postal_code: null,
                locality: null,
                country_id: null,
            },
        };
    },
    computed: {
        isNew() {
            const { id } = this.park;
            return !id || id === 'new';
        },

        countriesOptions() {
            return this.$store.getters['countries/options'];
        },
    },
    mounted() {
        this.$store.dispatch('countries/fetch');
        this.getParkData();
    },
    methods: {
        getParkData() {
            if (this.isNew) {
                this.initWithStash();
                return;
            }

            this.resetHelpLoading();

            const { id } = this.park;
            const { resource } = this.$route.meta;

            this.$http.get(`${resource}/${id}`)
                .then(({ data }) => {
                    this.setParkData(data);
                    this.isLoading = false;
                })
                .catch(this.displayError);
        },

        savePark(e) {
            e.preventDefault();
            this.resetHelpLoading();

            const { id } = this.park;
            const { resource } = this.$route.meta;

            let request = this.$http.post;
            let route = resource;
            if (id) {
                request = this.$http.put;
                route = `${resource}/${id}`;
            }

            request(route, { ...this.park })
                .then(({ data }) => {
                    this.isLoading = false;
                    this.help = { type: 'success', text: 'page-parks.saved' };
                    this.setParkData(data);
                    this.flushStashedData();
                    this.$store.dispatch('parks/refresh');

                    setTimeout(() => {
                        this.$router.push('/parks');
                    }, 300);
                })
                .catch(this.displayError);
        },

        resetHelpLoading() {
            this.help = 'page-parks.help-edit';
            this.error = null;
            this.isLoading = true;
        },

        displayError(error) {
            this.help = 'page-parks.help-edit';
            this.error = error;
            this.isLoading = false;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        setParkData(data) {
            this.park = data;
            this.$store.commit('setPageSubTitle', this.park.name);
        },

        handleFormChange() {
            if (!this.isNew) {
                return;
            }

            const stashedData = JSON.stringify(this.park);
            localStorage.setItem(storageKeyWIP, stashedData);
        },

        handleCancel() {
            this.flushStashedData();
            this.$router.back();
        },

        initWithStash() {
            if (!this.isNew) {
                return;
            }

            const stashedData = localStorage.getItem(storageKeyWIP);
            if (!stashedData) {
                return;
            }

            this.park = JSON.parse(stashedData);
        },

        flushStashedData() {
            localStorage.removeItem(storageKeyWIP);
        },
    },
};
