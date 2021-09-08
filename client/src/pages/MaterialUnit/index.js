import './index.scss';
import moment from 'moment';
import getPersonItemLabel from '@/utils/getPersonItemLabel';
import formatOptions from '@/utils/formatOptions';
import FormField from '@/components/FormField';
import SelectSearch from '@/components/SelectSearch';
import Help from '@/components/Help';

export default {
    name: 'MaterialUnit',
    components: { FormField, SelectSearch, Help },
    data() {
        return {
            help: 'page-material-units.help-edit',
            error: null,
            isLoading: false,
            material: null,
            ongoingPersist: null,
            datepickerOptions: {
                disabled: {
                    from: new Date(),
                },
            },
            unit: {
                reference: '',
                serial_number: '',
                park_id: '',
                person_id: null,
                is_broken: false,
                is_lost: false,
                state: 'state-of-use',
                purchase_date: '',
                notes: '',
                owner: null,
            },
            errors: {
                reference: null,
                serial_number: null,
                park_id: null,
                person_id: null,
                is_broken: null,
                is_lost: null,
                state: null,
                purchase_date: null,
                notes: null,
            },
            renderKey: 1,
        };
    },
    computed: {
        id() {
            let { id } = this.$route.params;
            if (!Number.isNaN(id) && Number.isFinite(parseInt(id, 10))) {
                id = parseInt(id, 10);
            }
            return id && id !== 'new' ? id : null;
        },

        materialId() {
            let { materialId } = this.$route.params;
            if (!Number.isNaN(materialId) && Number.isFinite(parseInt(materialId, 10))) {
                materialId = parseInt(materialId, 10);
            }
            return materialId || null;
        },

        parksOptions() {
            return this.$store.getters['parks/options'];
        },

        statesOptions() {
            return this.$store.getters['unitStates/options'];
        },

        firstPark() {
            return this.$store.getters['parks/firstPark'];
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('unitStates/fetch');

        this.fetchData();
        this.setDefaultPark();
    },
    watch: {
        firstPark() {
            this.setDefaultPark();
        },

        unit() {
            this.renderKey += 1;
        },
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();

            this.persist();
        },

        async fetchData() {
            this.isLoading = true;
            this.error = null;
            this.help = 'page-material-units.help-edit';

            try {
                if (!this.id) {
                    await this.fetchMaterial();
                } else {
                    await this.fetchUnit();
                }
            } finally {
                this.isLoading = false;
            }
        },

        async fetchUnit() {
            if (!this.id) {
                return;
            }

            try {
                const { data } = await this.$http.get(`material-units/${this.id}`);
                const { material, ...unit } = data;

                this.$store.commit('setPageSubTitle', `${unit.reference} (${material.name})`);
                this.material = material;
                this.unit = unit;

                if (this.materialId !== material.id) {
                    this.$router.replace(`/materials/${material.id}/units/${unit.id}`);
                }
            } catch (error) {
                this.error = error;
            }
        },

        async fetchMaterial() {
            if (!this.materialId) {
                this.$router.replace('/materials');
                return;
            }

            try {
                const { data: material } = await this.$http.get(`materials/${this.materialId}`);
                this.$store.commit('setPageSubTitle', material.name);
                this.material = material;
            } catch (error) {
                this.error = error;

                // - Si le matériel lié n'existe pas (ou autre erreur de type 4xx),
                //   on redirige vers la liste du matériel.
                const code = error.response?.data?.error?.code || 0;
                if (code >= 400 && code <= 499) {
                    this.$router.replace('/materials');
                }
            }
        },

        async persist() {
            if (this.ongoingPersist) {
                await this.ongoingPersist;
                return;
            }

            this.isLoading = false;
            this.error = null;
            this.help = '';

            const method = this.id ? 'put' : 'post';
            const url = this.id
                ? `material-units/${this.id}`
                : `materials/${this.materialId}/units`;

            try {
                const { purchase_date: purchaseDate } = this.unit;
                const unitData = {
                    ...this.unit,
                    purchase_date: purchaseDate ? moment(purchaseDate).format('YYYY-MM-DD') : null,
                };

                this.ongoingPersist = this.$http[method](url, unitData);
                const { data: unit } = await this.ongoingPersist;
                this.help = { type: 'success', text: 'page-material-units.saved' };
                this.$store.commit('setPageSubTitle', `${unit.reference} (${this.material.name})`);
                this.unit = unit;

                const redirectRoute = { path: `/materials/${this.material.id}/view`, hash: '#units' };
                setTimeout(() => { this.$router.push(redirectRoute); }, 300);
            } catch (error) {
                this.error = error;

                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.errors = { ...details };
                }
            } finally {
                this.isLoading = false;
                this.ongoingPersist = null;
            }
        },

        formatOwnerOptions(data) {
            return formatOptions(data, getPersonItemLabel);
        },

        setDefaultPark() {
            if (this.id === null && this.parksOptions.length === 1) {
                this.unit.park_id = this.firstPark?.id || '';
            }
        },
    },
};
