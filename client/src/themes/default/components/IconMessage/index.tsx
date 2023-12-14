import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { Props as IconProps } from '@/themes/default/components/Icon';

type Props = IconProps & {
    /** Le texte à afficher à droite de l'icône */
    message: string,
};

const IconMessage = defineComponent({
    name: 'IconMessage',
    props: {
        ...Icon.props,
        message: {
            type: String as PropType<Required<Props>['message']>,
            required: true,
        },
    },
    render() {
        const { name, variant, spin, message } = this;

        return (
            <p class="IconMessage">
                <Icon
                    class="IconMessage__icon"
                    name={name}
                    variant={variant}
                    spin={spin}
                />
                <span class="IconMessage__message">{message}</span>
            </p>
        );
    },
});

export default IconMessage;
