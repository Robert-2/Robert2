import Alert from '@/components/Alert';
import Help from '@/components/Help';
import DocumentItem from './Item/Item.vue';
import DocumentUpload from './Upload/Upload.vue';

// @vue/component
export default {
    name: 'MaterialViewDocuments',
    components: { Help, DocumentItem, DocumentUpload },
    props: {
        material: { required: true, type: Object },
    },
    data() {
        return {
            help: '',
            error: null,
            isLoading: false,
            materialId: this.$route.params.id,
            documents: [],
        };
    },
    mounted() {
        this.$store.commit('setPageSubTitle', this.material.name);

        this.fetchDocuments();
    },
    methods: {
        fetchDocuments() {
            this.isLoading = true;
            this.error = null;

            this.$http.get(`materials/${this.materialId}/documents`)
                .then(({ data }) => {
                    this.documents = data;
                    this.isLoading = false;
                })
                .catch(this.displayError);
        },

        handleUploadSuccess() {
            this.help = { type: 'success', text: 'page-materials-view.documents.saved' };
            this.fetchDocuments();
        },

        removeDocument(file) {
            this.help = '';
            this.error = null;

            Alert.ConfirmDelete(this.$t, 'materials-view.documents', false).then(({ value }) => {
                if (!value) {
                    return;
                }

                this.isLoading = true;

                this.$http.delete(`documents/${file.id}`)
                    .then(() => {
                        this.isLoading = false;
                        this.help = {
                            type: 'success',
                            text: 'page-materials-view.documents.deleted',
                        };
                        this.fetchDocuments();
                    })
                    .catch(this.displayError);
            });
        },

        displayError(error) {
            this.error = error;
            this.isLoading = false;
        },
    },
};
