import { toRefs } from '@vue/composition-api';
import minimalistLogoSrc from './assets/logo-R.svg';
import logoSrc from './assets/logo.svg';

import type { Component } from '@vue/composition-api';

type Props = {
    /** Doit-on utiliser la version minimaliste du Logo ? */
    minimalist: boolean,
};

// @vue/component
const Logo: Component<Props> = (props: Props) => {
    const { minimalist } = toRefs(props as Required<Props>);
    return () => {
        const src = minimalist.value ? minimalistLogoSrc : logoSrc;
        return <img class="Logo" src={src} alt="Robert²" />;
    };
};

Logo.props = {
    minimalist: { type: Boolean, default: false },
};

export default Logo;
