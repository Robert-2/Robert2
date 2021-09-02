import './index.scss';
import warning from 'warning';
import { Fragment } from 'vue-fragment';

const ParkSelector = {
    name: 'ParkSelector',
    props: {
        list: { type: Array, required: true },
        value: (prop) => typeof prop === 'object' || prop === null,
    },
    methods: {
        handleChange(e) {
            const { value } = e.currentTarget;

            if (value === '') {
                this.$emit('change', null);
                this.$forceUpdate();
                return;
            }

            const selectedPark = this.list.find(
                (park) => park.id === parseInt(value, 10),
            );

            warning(
                selectedPark !== undefined,
                `Park inconnu relevé lors de la sélection d'un parc dans l'inventaire (\`${value}\`).`,
            );

            this.$emit('change', selectedPark ?? null);
            this.$forceUpdate();
        },
    },
    render() {
        const { $t: __, value, list } = this;

        const render = () => {
            if (this.list.length === 0) {
                return (
                    <p class="ParkSelector__empty">
                        <span class="ParkSelector__empty__message">{__('page-inventories.no-parks')}</span>
                        <router-link to="/parks/new" class="ParkSelector__empty__button button success">
                            <i class="fas fa-plus ParkSelector__empty__button__icon" />
                            {__('page-inventories.add-park')}
                        </router-link>
                    </p>
                );
            }

            return (
                <Fragment>
                    <p class="ParkSelector__intro">{__('page-inventories.select-park-intro')}</p>
                    <select class="ParkSelector__select" onChange={this.handleChange} value={value?.id ?? ''}>
                        <option value="">{__('please-choose')}</option>
                        {(list.map(({ id, name }) => (
                            <option key={id} value={id}>{name}</option>
                        )))}
                    </select>
                </Fragment>
            );
        };
        return <div class="ParkSelector">{render()}</div>;
    },
};

export default ParkSelector;
