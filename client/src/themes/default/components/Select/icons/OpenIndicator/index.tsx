import './index.scss';
import Icon from '@/themes/default/components/Icon';

/** Icône de l'indicateur d'ouverture du champ de formulaire de type sélecteur. */
const SelectIconOpenIndicator = () => () => (
    <Icon class="SelectIconOpenIndicator" name="caret-down" />
);

export default SelectIconOpenIndicator;
