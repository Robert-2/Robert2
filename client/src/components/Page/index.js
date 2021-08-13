import './index.scss';
import { APP_NAME } from '@/config/constants';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

const Page = {
    name: 'Page',
    props: {
        name: { type: String, required: true },
        title: String,
        help: String,
        error: String,
        isLoading: Boolean,
        actions: Array,
        render: Function,
    },
    watch: {
        title(newTitle) {
            this.updateTitle(newTitle);
        },
    },
    mounted() {
        this.updateTitle(this.title);
    },
    beforeDestroy() {
        this.$store.commit('setPageRawTitle', null);
    },
    methods: {
        updateTitle(newTitle) {
            this.$store.commit('setPageRawTitle', newTitle ?? null);
            document.title = [newTitle, APP_NAME].filter(Boolean).join(' - ');
        },
    },
    render() {
        const { help, actions, error, isLoading, render } = this.$props;
        const content = render ? render() : this.$slots.default;

        return (
            <div class="content">
                <div class="content__header header-page">
                    <div class="header-page__help">
                        {isLoading && <Loading horizontal />}
                        {!isLoading && error && <ErrorMessage error={error} />}
                        {!isLoading && !error && help}
                    </div>
                    {actions && actions.length > 0 && (
                        <nav class="header-page__actions">
                            {actions}
                        </nav>
                    )}
                </div>
                <div class="content__main-view">
                    <div class={['Page', `Page--${this.name}`]}>
                        {content}
                    </div>
                </div>
            </div>
        );
    },
};

export default Page;
