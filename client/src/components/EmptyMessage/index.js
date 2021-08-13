import './index.scss';
import Illustration from './assets/illustration.svg?inline';

const EmptyMessage = {
    name: 'EmptyMessage',
    props: {
        message: String,
        action: Object,
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

export default EmptyMessage;
