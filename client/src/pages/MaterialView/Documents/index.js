import './index.scss';
import { confirm } from '@/utils/alert';
import apiMaterials from '@/stores/api/materials';
import apiDocuments from '@/stores/api/documents';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import DocumentItem from './Item';
import DocumentUpload from './Upload';

// @vue/component
export default {
    name: 'MaterialViewDocuments',
    props: {
        material: { required: true, type: Object },
    },
    data() {
        return {
            isFetched: false,
            isDeleting: false,
            hasCriticalError: false,
            error: null,
            materialId: this.$route.params.id,
            documents: [],
        };
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

        handleFileUploaded() {
            const { $t: __ } = this;
            this.$toasted.success(__('page-material-view.documents.saved'));
            this.fetchData();
        },

        async handleDeleteDocument(file) {
            const { $t: __ } = this;

            const { value: isConfirmed } = await confirm({
                type: 'danger',
                text: __('page-material-view.documents.confirm-permanently-delete'),
                confirmButtonText: __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isDeleting = true;
            this.removeDocumentFromList(file.id);

            try {
                await apiDocuments.remove(file.id);
                this.$toasted.success(__('page-material-view.documents.deleted'));
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
                this.fetchData();
            } finally {
                this.isDeleting = false;
            }
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async fetchData() {
            const { materialId } = this;

            try {
                const data = await apiMaterials.documents(materialId);
                this.documents = data;
            } catch (error) {
                const { code } = error.response?.data?.error ?? { code: 0 };
                this.hasCriticalError = code === 404 ? 'not-found' : true;
            } finally {
                this.isFetched = true;
            }
        },

        removeDocumentFromList(id) {
            const index = this.documents.findIndex((file) => file.id === id);
            if (index === -1) {
                return;
            }
            this.$delete(this.documents, index);
        },
    },
    render() {
        const {
            $t: __,
            isFetched,
            isDeleting,
            hasCriticalError,
            documents,
            handleDeleteDocument,
            materialId,
            handleFileUploaded,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <div class="MaterialViewDocuments">
                    {hasCriticalError
                        ? <CriticalError type={hasCriticalError === 'not-found' ? 'not-found' : 'default'} />
                        : <Loading />}
                </div>
            );
        }

        return (
            <div class="MaterialViewDocuments">
                <section class="MaterialViewDocuments__main">
                    {documents.length === 0 && (
                        <p class="MaterialViewDocuments__no-document">
                            {__('page-material-view.documents.no-document')}
                        </p>
                    )}
                    {documents.length > 0 && (
                        <ul class="MaterialViewDocuments__list">
                            {documents.map((document) => (
                                <DocumentItem
                                    key={document.id}
                                    file={document}
                                    onRemove={handleDeleteDocument}
                                />
                            ))}
                        </ul>
                    )}
                    {isDeleting && <Loading horizontal />}
                </section>
                <DocumentUpload
                    materialId={materialId}
                    onFileUploaded={handleFileUploaded}
                />
            </div>
        );
    },
};
