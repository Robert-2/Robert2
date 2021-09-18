import './index.scss';
import Config from '@/globals/config';
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
            isFetched: false,
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
        this.getData();
    },
    methods: {
        async getData() {
            const { id } = this.company;
            if (!id || id === 'new') {
                this.isFetched = true;
                return;
            }

            this.resetHelpLoading();

            try {
                const { data: companyData } = await this.$http.get(`companies/${id}`);
                this.setCompany(companyData);

                const { data: personsData } = await this.$http.get(`companies/${id}/persons`);
                this.persons = personsData.data;
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
                this.isFetched = true;
            }
        },

        async save(formData) {
            this.resetHelpLoading();

            const { id } = this.company;

            const request = id ? this.$http.put : this.$http.post;
            const route = id ? `companies/${id}` : 'companies';

            try {
                const companyData = { ...formData, country_id: parseInt(formData.country_id, 10) };
                if (!id) {
                    companyData.tags = [Config.beneficiaryTagName];
                }

                const { data } = await request(route, companyData);
                this.setCompany(data);
                this.help = { type: 'success', text: 'page-companies.saved' };

                this.$store.dispatch('companies/refresh');

                setTimeout(() => {
                    this.$router.back();
                }, 300);
            } catch (error) {
                this.displayError();
            } finally {
                this.isLoading = false;
            }
        },

        resetHelpLoading() {
            this.help = 'page-companies.help-edit';
            this.error = null;
            this.isLoading = true;
        },

        displayError(error) {
            this.help = 'page-companies.help-edit';
            this.error = error;

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
