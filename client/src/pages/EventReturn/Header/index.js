import './index.scss';
import moment from 'moment';
import Help from '@/components/Help';
import MultiSwitch from '@/components/MultiSwitch';

// @vue/component
const EventReturnHeader = {
    name: 'EventReturnHeader',
    components: { Help, MultiSwitch },
    props: {
        isLoading: Boolean,
        error: Error,
        help: String,
        eventData: Object,
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
            return this.eventData.id ? moment(this.eventData.end_date) : null;
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');
    },
    methods: {
        setDisplayGroup(group) {
            this.displayGroup = group;
            this.$emit('displayGroupChange', group);
        },
    },
    render() {
        const { isLoading, eventData, error } = this;

        if (isLoading || !eventData.id) {
            return (
                <div class="EventReturnHeader">
                    <Help message="" error={error} isLoading={isLoading} />
                </div>
            );
        }

        const {
            $t: __,
            help,
            endDate,
            displayGroup,
            setDisplayGroup,
            hasMultipleParks,
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
                    <div class="EventReturnHeader__info">
                        {__('beneficiary')}<br />
                        <strong class="EventReturnHeader__info__important">
                            {eventData.beneficiaries[0] ? eventData.beneficiaries[0].full_name : ''}
                        </strong>
                    </div>
                    {eventData.location && (
                        <div class="EventReturnHeader__info">
                            {__('location')}<br />
                            <strong class="EventReturnHeader__info__important">
                                {eventData.location}
                            </strong>
                        </div>
                    )}
                </div>
                <Help message={help} error={error} />
                <div class="EventReturnHeader__actions">
                    <div class="EventReturnHeader__group-by">
                        <span class="EventReturnHeader__group-by__label">{__('grouped-by')}</span>
                        <MultiSwitch
                            options={[
                                { value: 'categories', label: __('categories') },
                                { value: 'parks', label: __('parks'), isDisplayed: hasMultipleParks },
                                { value: null, label: __('not-grouped') },
                            ]}
                            value={displayGroup}
                            onChange={setDisplayGroup}
                        />
                    </div>
                </div>
            </div>
        );
    },
};

export default EventReturnHeader;
