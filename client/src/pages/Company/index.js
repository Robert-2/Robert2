import Config from '@/config/globalConfig';
import Help from '@/components/Help';
import CompanyForm from '@/components/CompanyForm';

// @vue/component
export default {
    name: 'Company',
    components: { Help, CompanyForm },
    data() {
        return {
            help: 'page-companies.help-edit',
            error: null,
            isLoading: false,
            company: {
                id: this.$route.params.id || null,
                legal_name: '',
                street: '',
                postal_code: '',
                locality: '',
                country_id: '',
                phone: '',
                note: '',
            },
            persons: [],
            errors: {
                legal_name: null,
                street: null,
                postal_code: null,
                locality: null,
                country_id: null,
                phone: null,
            },
        };
    },
    mounted() {
        this.getCompanyData();
        this.getCompanyPersons();
    },
    methods: {
        getCompanyData() {
            const { id } = this.company;
            if (!id || id === 'new') {
                return;
            }

            this.resetHelpLoading();

            const { resource } = this.$route.meta;
            this.$http.get(`${resource}/${id}`)
                .then(({ data }) => {
                    this.setCompany(data);
                    this.isLoading = false;
                })
                .catch(this.displayError);
        },

        getCompanyPersons() {
            const { id } = this.company;
            if (!id || id === 'new') {
                return;
            }

            this.resetHelpLoading();

            const { resource } = this.$route.meta;
            this.$http.get(`${resource}/${id}/persons`)
                .then(({ data }) => {
                    this.persons = data.data;
                    this.isLoading = false;
                })
                .catch(this.displayError);
        },

        saveCompany() {
            this.resetHelpLoading();

            const { id } = this.company;
            const { resource } = this.$route.meta;

            let request = this.$http.post;
            let route = resource;
            if (id) {
                request = this.$http.put;
                route = `${resource}/${id}`;
            }

            const companyData = { ...this.company };
            if (!id) {
                companyData.tags = [Config.beneficiaryTagName];
            }

            request(route, companyData)
                .then(({ data }) => {
                    this.isLoading = false;
                    this.help = { type: 'success', text: 'page-companies.saved' };
                    this.setCompany(data);
                    this.$store.dispatch('companies/refresh');

                    setTimeout(() => {
                        this.$router.back();
                    }, 300);
                })
                .catch(this.displayError);
        },

        resetHelpLoading() {
            this.help = 'page-companies.help-edit';
            this.error = null;
            this.isLoading = true;
        },

        displayError(error) {
            this.help = 'page-companies.help-edit';
            this.error = error;
            this.isLoading = false;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        setCompany(data) {
            this.company = data;
            this.$store.commit('setPageSubTitle', data.legal_name);
        },
    },
};
