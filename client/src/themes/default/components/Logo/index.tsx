import { defineComponent } from '@vue/composition-api';
import minimalistLogoSrc from './assets/logo-R.svg';
import logoSrc from './assets/logo.svg';

import type { PropType } from '@vue/composition-api';

type Props = {
    /** Doit-on utiliser la version minimaliste du Logo ? */
    minimalist: boolean,
};

// @vue/component
const Logo = defineComponent({
    name: 'Logo',
    props: {
        minimalist: {
            type: Boolean as PropType<Required<Props>['minimalist']>,
            default: false,
        },
    },
    render() {
        const src = this.minimalist ? minimalistLogoSrc : logoSrc;
        return <img class="Logo" src={src} alt="Robert2" />;
    },
});

export default Logo;
