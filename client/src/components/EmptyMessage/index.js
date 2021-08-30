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

            const LinkComponent = action.url ? 'router-link' : 'a';
            return (
                <LinkComponent
                    class="EmptyMessage__action button success"
                    // eslint-disable-next-line react/jsx-handler-names
                    onClick={action.onClick}
                    to={action.url}
                >
                    {action.label}
                </LinkComponent>
            );
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
