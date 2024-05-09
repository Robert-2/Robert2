import './index.scss';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

enum Type {
    /** Une alerte d'avertissement. */
    WARNING = 'warning',

    /** Une alerte d'information. */
    INFO = 'info',
}

type Props = {
    /** Le type (= variante) de l'alerte. */
    type: Type,
};

/** Une alerte. */
const Alert = defineComponent({
    name: 'Alert',
    props: {
        type: {
            type: String as PropType<Props['type']>,
            required: true,
            validator: (value: unknown) => (
                typeof value === 'string' &&
                (Object.values(Type) as string[]).includes(value)
            ),
        },
    },
    render() {
        const { type } = this;
        const children = this.$slots.default;

        return (
            <div class={['Alert', `Alert--${type}`]}>
                {children}
            </div>
        );
    },
});

export default Alert;
