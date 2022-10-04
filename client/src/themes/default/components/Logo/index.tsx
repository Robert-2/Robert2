import minimalistLogoSrc from './assets/logo-R.svg';
import logoSrc from './assets/logo.svg';

type Props = {
    /** Doit-on utiliser la version minimaliste du Logo ? */
    minimalist: boolean,
};

const Logo = ({ minimalist }: Props): JSX.Element => {
    const src = minimalist ? minimalistLogoSrc : logoSrc;
    return <img className="Logo" src={src} alt="Robert²" />;
};

export default Logo;
