import './index.scss';

// @vue/component
export default {
    name: 'AssignTagsHeader',
    props: {
        title: { type: String, required: true },
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },
    },
    render() {
        const { title, handleClose } = this;

        return (
            <header class="AssignTagsHeader">
                <h4 class="AssignTagsHeader__title">
                    <i class="fas fa-tags" />{' '}
                    {title}
                </h4>
                <button type="button" class="close" onClick={handleClose}>
                    <i class="fas fa-times" />
                </button>
            </header>
        );
    },
};
