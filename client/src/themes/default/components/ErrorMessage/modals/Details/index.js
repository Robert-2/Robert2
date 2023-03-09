import './index.scss';

const cleanFilePath = (path) => {
    if (!path) {
        return '';
    }

    const filePath = path.split('/src/');
    return filePath.length > 0 ? `src/${filePath[1]}` : path;
};

// @vue/component
export default {
    name: 'ErrorDetails',
    props: {
        statusCode: { type: Number, required: true },
        message: { type: String, required: true },
        details: { type: Object, default: null },
    },
    data() {
        return {
            isCopied: false,
        };
    },
    computed: {
        requested() {
            return this.details?.requested;
        },

        file() {
            return cleanFilePath(this.details?.file);
        },

        trace() {
            const stackTrace = this.details?.stackTrace;
            if (!stackTrace) {
                return [];
            }

            return stackTrace.map((traceItem) => {
                const { file } = traceItem;
                return { ...traceItem, file: cleanFilePath(file) };
            });
        },
    },
    methods: {
        copyErrorContent() {
            const range = document.createRange();
            range.selectNode(this.$refs.errorContent);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');

            this.isCopied = true;
            window.getSelection().removeAllRanges();
        },
    },
};
