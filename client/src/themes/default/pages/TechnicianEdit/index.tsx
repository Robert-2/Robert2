import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import { ApiErrorCode } from '@/stores/api/@codes';
import Page from '@/themes/default/components/Page';
import CriticalError, { ErrorType } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Form from './components/Form';
import apiTechnicians from '@/stores/api/technicians';
import parseInteger from '@/utils/parseInteger';

import type { ComponentRef } from 'vue';
import type {
    TechnicianDetails,
    TechnicianEdit as TechnicianEditType,
} from '@/stores/api/technicians';

type Data = {
    id: number | null,
    isFetched: boolean,
    isSaving: boolean,
    technician: TechnicianDetails | null,
    criticalError: string | null,
    validationErrors: Record<keyof TechnicianEditType, string> | null,
};

/** Page d'edition d'un technicien. */
const TechnicianEdit = defineComponent({
    name: 'TechnicianEdit',
    data(): Data {
        return {
            id: parseInteger(this.$route.params.id),
            isFetched: false,
            isSaving: false,
            technician: null,
            criticalError: null,
            validationErrors: null,
        };
    },
    computed: {
        isNew(): boolean {
            return this.id === null;
        },

        pageTitle(): string {
            const { $t: __, isNew, isFetched, technician } = this;

            if (isNew) {
                return __('page.technician-edit.title-create');
            }

            if (!isFetched || !technician) {
                return __('page.technician-edit.title-edit-simple');
            }

            return __('page.technician-edit.title-edit', { name: technician.full_name });
        },
    },
    errorCaptured(error: unknown) {
        this.criticalError = ErrorType.UNKNOWN;

        // eslint-disable-next-line no-console
        console.error(error);

        return false;
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

        handleSubmit(data: TechnicianEditType, withUser: boolean) {
            this.save(data, withUser);
        },

        handleCancel() {
            this.$router.back();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                this.isFetched = true;
                return;
            }

            try {
                this.technician = await apiTechnicians.one(this.id!);
                this.isFetched = true;
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while retrieving technician #${this.id!} data`, error);
                    this.criticalError = ErrorType.UNKNOWN;
                } else {
                    const { status = HttpCode.ServerErrorInternal } = error.response ?? {};
                    this.criticalError = status === HttpCode.ClientErrorNotFound
                        ? ErrorType.NOT_FOUND
                        : ErrorType.UNKNOWN;
                }
            }
        },

        async save(data: TechnicianEditType, withUser: boolean) {
            if (this.isSaving) {
                return;
            }

            const { $t: __ } = this;
            this.isSaving = true;

            const doRequest = (): Promise<TechnicianDetails> => (
                !this.isNew
                    ? apiTechnicians.update(this.id!, data, withUser)
                    : apiTechnicians.create(data, withUser)
            );

            try {
                const technician = await doRequest();
                if (!this.isNew) {
                    this.technician = technician;
                }

                this.validationErrors = null;

                // - Redirection...
                this.$toasted.success(__('page.technician-edit.saved'));
                this.$router.replace({ name: 'view-technician', params: { id: technician.id.toString() } });
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while saving the technician`, error);
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                } else {
                    const { code = ApiErrorCode.UNKNOWN, details = {} } = error.response?.data?.error ?? {};
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                        (this.$refs.page as ComponentRef<typeof Page>)?.scrollToTop();
                    } else {
                        this.$toasted.error(__('errors.unexpected-while-saving'));
                    }
                }
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            pageTitle,
            isSaving,
            isFetched,
            technician,
            handleSubmit,
            handleCancel,
            criticalError,
            validationErrors,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="technician-edit" title={pageTitle} centered>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                title={pageTitle}
                name="technician-edit"
                hasValidationError={!!validationErrors}
            >
                <div class="TechnicianEdit">
                    <Form
                        savedData={technician}
                        isSaving={isSaving}
                        errors={validationErrors}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    },
});

export default TechnicianEdit;
