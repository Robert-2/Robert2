import './index.scss';
import Illustration from './assets/illustration.svg?inline';

// @vue/component
export default {
    name: 'EmptyMessage',
    props: {
        message: { type: String, default: undefined },
        action: { type: Object, default: undefined },
    },
    render() {
        const { $t: __, message, action } = this;

        const renderAction = () => {
            if (!action) {
                return null;
            }

            const { label, url, onClick } = action;
            const classNames = 'EmptyMessage__action button success';

            return url
                ? <router-link to={url} class={classNames}>{label}</router-link>
                : <a class={classNames} onClick={onClick}>{label}</a>;
        };

        return (
            <div class="EmptyMessage">
                <Illustration class="EmptyMessage__illustration" />
                <p class="EmptyMessage__message">{message ?? __('empty-state')}</p>
                {renderAction()}
            </div>
        );
    },
};
