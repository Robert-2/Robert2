import minimalistLogoSrc from './assets/logo-R.svg';
import logoSrc from './assets/logo.svg';

// @vue/component
export default {
    name: 'Logo',
    props: {
        minimalist: Boolean,
    },
    computed: {
        src() {
            return this.minimalist ? minimalistLogoSrc : logoSrc;
        },
    },
    render() {
        const { src } = this;

        return <img class="Logo" src={src} alt="Robert²" />;
    },
};
