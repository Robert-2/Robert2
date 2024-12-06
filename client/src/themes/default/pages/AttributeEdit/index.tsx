import './index.scss';
import axios from 'axios';
import diff from 'lodash/difference';
import parseInteger from '@/utils/parseInteger';
import { defineComponent } from '@vue/composition-api';
import HttpCode from 'status-code-enum';
import { isRequestErrorStatusCode } from '@/utils/errors';
import { confirm } from '@/utils/alert';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiAttributes from '@/stores/api/attributes';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Form from './components/Form';

import type { ComponentRef } from 'vue';
import type { AttributeDetails, AttributeCreate } from '@/stores/api/attributes';
import type { Category } from '@/stores/api/categories';

type Data = {
    id: AttributeDetails['id'] | null,
    isFetched: boolean,
    isSaving: boolean,
    attribute: AttributeDetails | null,
    criticalError: boolean,
    validationErrors: Record<string, string> | undefined,
};

/** Page d'edition d'un attribut de matériel. */
const AttributeEdit = defineComponent({
    name: 'AttributeEdit',
    data(): Data {
        return {
            id: parseInteger(this.$route.params.id)!,
            isFetched: false,
            isSaving: false,
            attribute: null,
            criticalError: false,
            validationErrors: undefined,
        };
    },
    computed: {
        isNew() {
            return this.id === null;
        },

        pageTitle() {
            const { $t: __, isNew, isFetched, attribute } = this;

            if (isNew) {
                return __('page.attribute-edit.title-create');
            }

            if (!isFetched) {
                return __('page.attribute-edit.title-simple');
            }

            return __('page.attribute-edit.title', { name: attribute!.name });
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

        handleSubmit(data: AttributeCreate) {
            this.save(data);
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
                this.attribute = await apiAttributes.one(id!);
                this.isFetched = true;
            } catch {
                this.criticalError = true;
            }
        },

        async save(data: AttributeCreate) {
            if (this.isSaving) {
                return;
            }

            const { $t: __, attribute, isNew } = this;

            if (!isNew) {
                let isConfirmed = true;

                const savedEntities = attribute?.entities ?? [];
                const haveEntitiesRemoved = diff(savedEntities, data.entities).length > 0;
                if (haveEntitiesRemoved) {
                    isConfirmed = await confirm({
                        type: 'danger',
                        text: __('page.attribute-edit.confirm-update-entities'),
                        confirmButtonText: __('page.attribute-edit.yes-update'),
                    });
                }

                const savedCategories = attribute?.categories?.map(({ id }: Category) => id) ?? [];
                const haveCategoriesChanged = (
                    data.categories.length > 0 && (
                        diff(savedCategories, data.categories).length > 0 ||
                        diff(data.categories, savedCategories).length > 0
                    )
                );
                if (haveCategoriesChanged) {
                    isConfirmed = await confirm({
                        type: 'danger',
                        text: __('page.attribute-edit.confirm-update-categories'),
                        confirmButtonText: __('page.attribute-edit.yes-update'),
                    });
                }

                if (!isConfirmed) {
                    return;
                }
            }

            this.isSaving = true;

            try {
                if (isNew) {
                    await apiAttributes.create(data);
                } else {
                    this.attribute = await apiAttributes.update(this.id!, data);
                }

                this.validationErrors = undefined;

                // - Redirection...
                this.$toasted.success(__('page.attribute-edit.saved'));
                this.$router.replace({ name: 'attributes' });
            } catch (error) {
                if (axios.isAxiosError(error) && isRequestErrorStatusCode(error, HttpCode.ClientErrorBadRequest)) {
                    const defaultError = { code: ApiErrorCode.UNKNOWN, details: {} };
                    const { code, details } = error.response?.data?.error ?? defaultError;
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                        (this.$refs.page as ComponentRef<typeof Page>)?.scrollToTop();
                        return;
                    }
                }

                this.$toasted.error(__('errors.unexpected-while-saving'));
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            criticalError,
            isFetched,
            pageTitle,
            validationErrors,
            attribute,
            isSaving,
            handleSubmit,
            handleCancel,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="attribute-edit" title={pageTitle} centered>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                title={pageTitle}
                name="attribute-edit"
                hasValidationError={!!validationErrors}
            >
                <div class="AttributeEdit">
                    <Form
                        savedData={attribute}
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

export default AttributeEdit;
