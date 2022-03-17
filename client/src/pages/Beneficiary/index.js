import './index.scss';
import Config from '@/globals/config';
import Page from '@/components/Page';
import Help from '@/components/Help';
import PersonForm from '@/components/PersonForm';

const WIP_STORAGE_KEY = 'WIP-newBeneficiary';

// @vue/component
export default {
    name: 'Beneficiary',
    data() {
        return {
            error: null,
            isLoading: false,
            isSaved: false,
            person: {
                id: this.$route.params.id || null,
                first_name: '',
                last_name: '',
                reference: '',
                company_id: '',
                phone: '',
                email: '',
                street: '',
                postal_code: '',
                locality: '',
                country_id: '',
                note: '',
            },
            errors: {
                first_name: null,
                last_name: null,
                reference: null,
                company_id: null,
                phone: null,
                email: null,
                street: null,
                postal_code: null,
                locality: null,
                country_id: null,
                note: null,
            },
        };
    },
    computed: {
        isNew() {
            const { id } = this.person;
            return !id || id === 'new';
        },
        help() {
            return this.isSaved
                ? { type: 'success', text: 'page-beneficiary.saved' }
                : 'page-beneficiary.help';
        },
        fullName() {
            const { full_name: fullName, first_name: firstName, last_name: lastName } = this.person;
            return fullName || `${firstName} ${lastName}`;
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange() {
            if (!this.isNew) {
                return;
            }

            const stashedData = JSON.stringify(this.person);
            localStorage.setItem(WIP_STORAGE_KEY, stashedData);
        },

        handleSave(e) {
            e.preventDefault();
            this.save();
        },

        handleCancel() {
            this.flushStashedData();
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                const stashedData = localStorage.getItem(WIP_STORAGE_KEY);
                if (!stashedData) {
                    return;
                }

                this.person = JSON.parse(stashedData);
                return;
            }

            this.error = null;
            this.isLoading = true;

            const { id } = this.person;
            const { resource } = this.$route.meta;

            try {
                const { data } = await this.$http.get(`${resource}/${id}`);
                this.person = data;
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        async save() {
            this.error = null;
            this.isSaved = false;
            this.isLoading = true;

            const { id } = this.person;
            const { resource } = this.$route.meta;

            let request = this.$http.post;
            let route = resource;
            if (id) {
                request = this.$http.put;
                route = `${resource}/${id}`;
            }

            const personData = { ...this.person };
            if (!id) {
                personData.tags = [Config.beneficiaryTagName];
            }

            try {
                const { data } = await request(route, personData);
                this.person = data;
                this.isSaved = true;
                this.flushStashedData();

                const redirect = () => { this.$router.push('/beneficiaries'); };
                setTimeout(redirect, 300);
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        displayError(error) {
            this.error = error;
            this.isSaved = false;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        flushStashedData() {
            localStorage.removeItem(WIP_STORAGE_KEY);
        },
    },
    render() {
        const {
            $t: __,
            isNew,
            fullName,
            person,
            errors,
            help,
            error,
            isLoading,
            handleSave,
            handleChange,
            handleCancel,
        } = this;

        const title = isNew
            ? __('page-beneficiary.title-create')
            : __('page-beneficiary.title-edit', { name: fullName });

        return (
            <Page name="global-settings" title={title}>
                <PersonForm
                    person={person}
                    errors={errors}
                    onSubmit={handleSave}
                    onChange={handleChange}
                    onCancel={handleCancel}
                    withCompany
                    withReference
                />
                <Help message={help} error={error} isLoading={isLoading} />
            </Page>
        );
    },
};
