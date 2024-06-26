import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import omit from 'lodash/omit';
import { ApiErrorCode } from '@/stores/api/@codes';
import Page from '@/themes/default/components/Page';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Form from './components/Form';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import safeJsonParse from '@/utils/safeJsonParse';

const WIP_STORAGE_KEY = 'WIP-newBeneficiary';

/** Page d'edition d'un bénéficiaire. */
const BeneficiaryEdit = defineComponent({
    name: 'BeneficiaryEdit',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            isFetched: false,
            isSaving: false,
            beneficiary: null,
            criticalError: null,
            validationErrors: null,
        };
    },
    computed: {
        isNew() {
            return this.id === null;
        },

        pageTitle() {
            const { $t: __, isNew, isFetched, beneficiary } = this;

            if (isNew) {
                return __('page.beneficiary-edit.title-create');
            }

            if (!isFetched) {
                return __('page.beneficiary-edit.title-edit-simple');
            }

            return __('page.beneficiary-edit.title-edit', { name: beneficiary.full_name });
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

        handleChange(data) {
            if (!this.isNew) {
                return;
            }

            const stashedData = JSON.stringify(omit(data, ['pseudo', 'password']));
            localStorage.setItem(WIP_STORAGE_KEY, stashedData);
        },

        handleSubmit(data) {
            this.save(data);
        },

        handleCancel() {
            this.flushStashedData();
            this.$router.back();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                const stashedData = localStorage.getItem(WIP_STORAGE_KEY);
                if (stashedData) {
                    // TODO: Ne devrait pas être mis là mais dans le data de <Form>...
                    //       (overwrite de `DEFAULT_VALUES`)
                    this.beneficiary = safeJsonParse(stashedData) ?? null;
                }
                this.isFetched = true;
                return;
            }

            try {
                this.beneficiary = await apiBeneficiaries.one(this.id);
                this.isFetched = true;
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while retrieving beneficiary #${this.id} data`, error);
                    this.criticalError = ERROR.UNKNOWN;
                } else {
                    const { status = HttpCode.ServerErrorInternal } = error.response ?? {};
                    this.criticalError = status === HttpCode.ClientErrorNotFound
                        ? ERROR.NOT_FOUND
                        : ERROR.UNKNOWN;
                }
            }
        },

        async save(data) {
            if (this.isSaving) {
                return;
            }

            const { $t: __ } = this;
            this.isSaving = true;

            const doRequest = () => (
                !this.isNew
                    ? apiBeneficiaries.update(this.id, data)
                    : apiBeneficiaries.create(data)
            );

            try {
                const beneficiary = await doRequest();
                if (!this.isNew) {
                    this.beneficiary = beneficiary;
                }

                this.validationErrors = null;
                this.flushStashedData();

                // - Redirection...
                this.$toasted.success(__('page.beneficiary-edit.saved'));
                this.$router.replace({ name: 'view-beneficiary', params: { id: beneficiary.id } });
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    this.validationErrors = { ...details };
                    this.$refs.page.scrollToTop();
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
                this.isSaving = false;
            }
        },

        flushStashedData() {
            localStorage.removeItem(WIP_STORAGE_KEY);
        },
    },
    render() {
        const {
            pageTitle,
            isSaving,
            isFetched,
            beneficiary,
            handleSubmit,
            handleChange,
            handleCancel,
            criticalError,
            validationErrors,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="beneficiary-edit" title={pageTitle} centered>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                name="beneficiary-edit"
                title={pageTitle}
                hasValidationError={!!validationErrors}
            >
                <div class="BeneficiaryEdit">
                    <Form
                        savedData={beneficiary}
                        isSaving={isSaving}
                        errors={validationErrors}
                        onSubmit={handleSubmit}
                        onChange={handleChange}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    },
});

export default BeneficiaryEdit;
