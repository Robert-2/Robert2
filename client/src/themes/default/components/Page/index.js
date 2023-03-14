import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { APP_NAME } from '@/globals/constants';
import Loading from '@/themes/default/components/Loading';
import ErrorMessage from '@/themes/default/components/ErrorMessage';

// @vue/component
export default defineComponent({
    name: 'Page',
    props: {
        name: { type: String, required: true },
        title: { type: String, default: null },
        help: { type: String, default: undefined },
        hasValidationError: { type: Boolean, default: false },
        isLoading: { type: Boolean, default: false },
        actions: { type: Array, default: undefined },
        render: { type: Function, default: undefined },
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
        scrollToTop() {
            this.$refs.pageContent.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        },
    },
    render() {
        const {
            $t: __,
            help,
            actions,
            hasValidationError,
            isLoading,
            render,
        } = this;

        const content = render ? render() : this.$slots.default;

        const renderHelp = () => {
            if (!isLoading && !hasValidationError && !help) {
                return null;
            }

            return (
                <div class="header-page__help">
                    {isLoading && <Loading horizontal />}
                    {!isLoading && hasValidationError && (
                        <ErrorMessage error={__('errors.validation')} />
                    )}
                    {!!(help && !hasValidationError && !isLoading) && (
                        <div class="header-page__intro">{help}</div>
                    )}
                </div>
            );
        };

        const renderHeader = () => {
            const hasActions = actions && actions.length > 0;
            const helpElement = renderHelp();
            if (helpElement === null && !hasActions) {
                return null;
            }

            return (
                <div class="content__header header-page">
                    {helpElement}
                    {hasActions && (
                        <nav class="header-page__actions" key="actions">
                            {actions}
                        </nav>
                    )}
                </div>
            );
        };

        return (
            <div class="content" ref="pageContent">
                {renderHeader()}
                <div class="content__main-view" key="content">
                    <div class={['Page', `Page--${this.name}`]}>
                        {content}
                    </div>
                </div>
            </div>
        );
    },
});
