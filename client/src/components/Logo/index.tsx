import { computed, toRefs } from '@vue/composition-api';
import minimalistLogoSrc from './assets/logo-R.svg';
import logoSrc from './assets/logo.svg';

type Props = {
    minimalist: boolean,
};

// @vue/component
const Logo = (props: Props): JSX.Element => {
    const { minimalist } = toRefs(props);
    const src = computed(() => (minimalist.value ? minimalistLogoSrc : logoSrc));

    return () => <img class="Logo" src={src.value} alt="Robert²" />;
};

Logo.props = {
    minimalist: { type: Boolean, default: false },
};

export default Logo;
