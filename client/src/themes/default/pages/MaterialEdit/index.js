import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiMaterials from '@/stores/api/materials';
import FormField from '@/themes/default/components/FormField';
import InputImage from '@/themes/default/components/InputImage';
import Page from '@/themes/default/components/Page';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Form from './components/Form';

/** Page d'edition d'un matériel. */
const MaterialEdit = defineComponent({
    name: 'MaterialEdit',
    provide: {
        verticalForm: true,
    },
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            wasNew: id === null,
            material: null,
            isFetched: false,
            isSaving: false,
            saveProgress: 0,
            criticalError: null,
            validationErrors: null,
            newPicture: undefined,
            subCategoriesOptions: [],
        };
    },
    computed: {
        isNew() {
            return this.id === null;
        },

        pageTitle() {
            const { $t: __, isNew, wasNew, isFetched, material } = this;

            if (isNew || wasNew) {
                return __('page.material-edit.title-create');
            }

            if (!isFetched || !material) {
                return __('page.material-edit.title-simple');
            }

            const { name } = material;
            return __('page.material-edit.title', { name });
        },

        picture() {
            if (this.newPicture !== undefined) {
                return this.newPicture;
            }

            const { material } = this;
            return material?.picture;
        },
    },
    errorCaptured(error) {
        this.criticalError = ERROR.UNKNOWN;

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

        handleChangePicture(newPicture) {
            this.newPicture = newPicture;
        },

        handleSubmit(data, materialAttributes) {
            this.save(data, materialAttributes);
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
            const { isNew, id } = this;
            if (isNew) {
                this.isFetched = true;
                return;
            }

            try {
                this.material = await apiMaterials.one(id);
                this.isFetched = true;
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while retrieving material #${this.id} data`, error);
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

            const { $t: __, id, newPicture, isNew } = this;
            this.isSaving = true;
            this.saveProgress = 0;

            const postData = { ...data };
            if (newPicture !== undefined) {
                postData.picture = newPicture ?? null;
            }

            const handleProgress = (percent) => {
                this.saveProgress = percent;
            };

            const doRequest = () => (
                isNew
                    ? apiMaterials.create(postData, handleProgress)
                    : apiMaterials.update(id, postData, handleProgress)
            );

            try {
                const material = await doRequest();
                if (!this.isNew) {
                    this.material = material;
                }

                this.validationErrors = null;

                // - Redirection...
                this.$toasted.success(__('page.material-edit.saved'));
                this.$router.push({ name: 'view-material', params: { id: material.id } });
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
    },
    render() {
        const {
            $t: __,
            criticalError,
            pageTitle,
            material,
            picture,
            isFetched,
            isSaving,
            saveProgress,
            validationErrors,
            handleChangePicture,
            handleSubmit,
            handleCancel,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="material-edit" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                name="material-edit"
                title={pageTitle}
                hasValidationError={!!validationErrors}
            >
                <div class="MaterialEdit">
                    <Form
                        class="MaterialEdit__body"
                        savedData={material}
                        isSaving={isSaving}
                        errors={validationErrors}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                    <div class="MaterialEdit__side">
                        <FormField
                            type="custom"
                            label={__('picture')}
                            errors={validationErrors?.picture}
                            // help={__('page.material-edit.help-picture')}
                        >
                            <InputImage
                                value={picture}
                                onChange={handleChangePicture}
                                uploading={isSaving ? saveProgress : false}
                            />
                        </FormField>
                    </div>
                </div>
            </Page>
        );
    },
});

export default MaterialEdit;
