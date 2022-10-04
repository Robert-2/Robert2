import './index.scss';
import moment from 'moment';
import MultiSwitch from '@/themes/default/components/MultiSwitch';

// @vue/component
export default {
    name: 'EventReturnHeader',
    props: {
        event: { type: Object, required: true },
        hasStarted: Boolean,
    },
    data() {
        return {
            displayGroup: 'categories',
        };
    },
    computed: {
        hasMultipleParks() {
            return this.$store.state.parks.list.length > 1;
        },

        endDate() {
            return moment(this.event.end_date);
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        setDisplayGroup(group) {
            this.displayGroup = group;
            this.$emit('displayGroupChange', group);
        },
    },
    render() {
        const {
            $t: __,
            event,
            hasStarted,
            endDate,
            displayGroup,
            setDisplayGroup,
            // hasMultipleParks,
        } = this;

        return (
            <div class="EventReturnHeader">
                <div class="EventReturnHeader__infos">
                    <div class="EventReturnHeader__info">
                        {__('return-scheduled-on')}<br />
                        <strong class="EventReturnHeader__info__important">
                            {endDate ? endDate.format('LL') : ''}
                        </strong>
                    </div>
                    {event.beneficiaries.length > 0 && (
                        <div class="EventReturnHeader__info">
                            {__('beneficiary')}<br />
                            <strong class="EventReturnHeader__info__important">
                                {event.beneficiaries[0] ? event.beneficiaries[0].full_name : ''}
                            </strong>
                        </div>
                    )}
                    {event.location && (
                        <div class="EventReturnHeader__info">
                            {__('location')}<br />
                            <strong class="EventReturnHeader__info__important">
                                {event.location}
                            </strong>
                        </div>
                    )}
                </div>
                {hasStarted && (
                    <div class="EventReturnHeader__actions">
                        <div class="EventReturnHeader__group-by">
                            <span class="EventReturnHeader__group-by__label">{__('grouped-by')}</span>
                            <MultiSwitch
                                options={[
                                    { value: 'categories', label: __('categories') },
                                    // FIXME: Réhabiliter le groupage par parc pour le faire fonctionner avec les unités
                                    // { value: 'parks', label: __('parks'), isDisplayed: hasMultipleParks },
                                    { value: null, label: __('not-grouped') },
                                ]}
                                value={displayGroup}
                                onChange={setDisplayGroup}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    },
};
