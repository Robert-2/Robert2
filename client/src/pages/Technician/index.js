import './index.scss';
import Config from '@/globals/config';
import Page from '@/components/Page';
import PersonForm from '@/components/PersonForm';

const WIP_STORAGE_KEY = 'WIP-newTechnician';

// @vue/component
export default {
    name: 'Technician',
    data() {
        return {
            error: null,
            isLoading: false,
            isFetched: false,
            isSaving: false,
            person: {
                id: this.$route.params.id || null,
                first_name: '',
                last_name: '',
                nickname: '',
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
                nickname: null,
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
        pageTitle() {
            const { $t: __, isNew, person } = this;
            if (isNew) {
                return __('page-technician.title-create');
            }

            const { full_name: fullName, first_name: firstName, last_name: lastName } = person;
            const name = fullName || `${firstName} ${lastName}`;
            return __('page-technician.title-edit', { name });
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

        handleChange(newPersonData) {
            this.person = newPersonData;
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
                this.isFetched = true;
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
                this.setPerson(data);
                this.isFetched = true;
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        async save() {
            this.error = null;
            this.isSaving = true;

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
                personData.tags = [Config.technicianTagName];
            }

            try {
                const { data } = await request(route, personData);
                this.setPerson(data);
                this.flushStashedData();

                const redirect = () => {
                    this.$router.push(`/technicians/${data.id}/view#infos`);
                };
                setTimeout(redirect, 300);
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isSaving = false;
            }
        },

        displayError(error) {
            this.error = error;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        setPerson(data) {
            this.person = data;
            const fullName = data.full_name || `${data.first_name} ${data.last_name}`;
            this.$store.commit('setPageSubTitle', fullName);
        },

        flushStashedData() {
            localStorage.removeItem(WIP_STORAGE_KEY);
        },
    },
    render() {
        const {
            $t: __,
            pageTitle,
            isLoading,
            isFetched,
            person,
            errors,
            error,
            isSaving,
            handleSave,
            handleChange,
            handleCancel,
        } = this;

        return (
            <Page
                name="technician-edit"
                title={pageTitle}
                help={__('page-technician.help')}
                error={error}
                isLoading={isLoading}
            >
                {isFetched && (
                    <PersonForm
                        initialData={person}
                        isSaving={isSaving}
                        errors={errors}
                        onSubmit={handleSave}
                        onChange={handleChange}
                        onCancel={handleCancel}
                    />
                )}
            </Page>
        );
    },
};
