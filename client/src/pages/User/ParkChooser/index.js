import './index.scss';

export default {
    name: 'ParkChooser',
    props: {
        initialSelection: Array,
    },
    data() {
        return {
            selectedParks: [],
        };
    },
    computed: {
        allParks() {
            return this.$store.state.parks.list;
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
        this.selectedParks = this.initialSelection;
    },
    methods: {
        handleSelect(parkId) {
            const foundIndex = this.selectedParks.findIndex((id) => id === parkId);
            if (foundIndex === -1) {
                this.selectedParks.push(parkId);
            } else {
                this.selectedParks.splice(foundIndex, 1);
            }

            this.$emit('updateParksSelection', this.selectedParks);
        },
    },
    render() {
        const { allParks, selectedParks, handleSelect } = this;

        return (
            <ul class="ParkChooser">
                {allParks.map(({ id, name }) => (
                    <li
                        key={id}
                        class={[
                            'ParkChooser__park',
                            { 'ParkChooser__park--selected': selectedParks.includes(id) },
                        ]}
                        role="button"
                        onClick={() => { handleSelect(id); }}
                    >
                        <i
                            class={[
                                'ParkChooser__park__icon',
                                'fas',
                                selectedParks.includes(id) ? 'fa-ban' : 'fa-check',
                            ]}
                        />
                        {name}
                    </li>
                ))}
            </ul>
        );
    },
};
