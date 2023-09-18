import './index.scss';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import { computed, ref, onMounted } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import useRouteId from '@/hooks/useRouteId';
import useRouter from '@/hooks/useRouter';
import Page from '@/themes/default/components/Page';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Form from './components/Form';
import apiParks from '@/stores/api/parks';
import { ApiErrorCode } from '@/stores/api/@codes';

// @vue/component
const ParkEditPage = (props, { root }) => {
    const __ = useI18n();
    const { router } = useRouter();
    const id = useRouteId();
    const park = ref(null);
    const isNew = computed(() => id.value === null);
    const isFetched = ref(false);
    const isSaving = ref(false);
    const criticalError = ref(null);
    const validationErrors = ref(null);
    const pageRef = ref(null);

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    const fetchData = async () => {
        if (isNew.value) {
            isFetched.value = true;
            return;
        }

        try {
            park.value = await apiParks.one(id.value);
            isFetched.value = true;
        } catch (error) {
            if (!axios.isAxiosError(error)) {
                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving park #${id.value} data`, error);
                criticalError.value = ERROR.UNKNOWN;
            } else {
                const { status = HttpCode.ServerErrorInternal } = error.response ?? {};
                criticalError.value = status === HttpCode.ClientErrorNotFound
                    ? ERROR.NOT_FOUND
                    : ERROR.UNKNOWN;
            }
        }
    };

    const save = async (data) => {
        if (isSaving.value) {
            return;
        }
        isSaving.value = true;

        const doRequest = () => (
            !isNew.value
                ? apiParks.update(id.value, data)
                : apiParks.create(data)
        );

        try {
            const _park = await doRequest();
            if (!isNew.value) {
                park.value = _park;
            }

            validationErrors.value = null;
            root.$store.dispatch('parks/refresh');

            // - Redirection...
            root.$toasted.success(__('page.park.saved'));
            router.replace({ name: 'parks' });
        } catch (error) {
            const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
            if (code === ApiErrorCode.VALIDATION_FAILED) {
                validationErrors.value = { ...details };
                pageRef.value.scrollToTop();
            } else {
                root.$toasted.error(__('errors.unexpected-while-saving'));
            }
            isSaving.value = false;
        }
    };

    // ------------------------------------------------------
    // -
    // -    Handlers
    // -
    // ------------------------------------------------------

    onMounted(() => {
        fetchData();
    });

    const handleSubmit = (data) => {
        save(data);
    };

    const handleCancel = () => {
        router.back();
    };

    // ------------------------------------------------------
    // -
    // -    Rendering
    // -
    // ------------------------------------------------------

    const pageTitle = computed(() => {
        if (isNew.value) {
            return __('page.park.title-create');
        }

        if (!isFetched.value) {
            return __('page.park.title-edit-simple');
        }

        const { name } = park.value;
        return __('page.park.title-edit', { name });
    });

    return () => {
        if (criticalError.value || !isFetched.value) {
            return (
                <Page name="park-edit" title={pageTitle.value}>
                    {criticalError.value
                        ? <CriticalError type={criticalError.value} />
                        : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref={pageRef}
                name="park-edit"
                title={pageTitle.value}
                hasValidationError={!!validationErrors.value}
            >
                <div class="ParkEdit">
                    <Form
                        savedData={park.value}
                        isSaving={isSaving.value}
                        errors={validationErrors.value}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    };
};

export default ParkEditPage;
