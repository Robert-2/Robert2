import './index.scss';
import moment from 'moment';
import getMainIcon from '@/utils/timeline-event/getMainIcon';

export default {
    name: 'MaterialAvailabilitiesItem',
    props: {
        data: Object,
        units: Array,
    },
    computed: {
        start() {
            return moment(this.data.start_date);
        },

        end() {
            return moment(this.data.end_date);
        },

        fromToDates() {
            return {
                from: this.start.format('L'),
                to: this.end.format('L'),
            };
        },

        isMultipleDayLong() {
            return !this.start.isSame(this.end, 'day');
        },

        isPast() {
            return this.end.isBefore(moment(), 'day');
        },

        isCurrent() {
            return moment().isBetween(this.start, this.end, 'day', '[]');
        },

        materialQuantity() {
            return this.data.pivot.quantity;
        },

        classnames() {
            return {
                'MaterialAvailabilitiesItem--future': !this.isPast,
                'MaterialAvailabilitiesItem--current': this.isCurrent,
                'MaterialAvailabilitiesItem--confirmed': this.data.is_confirmed,
            };
        },

        unitsDisplay() {
            const usedUnits = this.units.filter((unit) => this.data.pivot.units.includes(unit.id));
            return usedUnits.map((unit) => unit.reference).join(', ');
        },

        mainIcon() {
            return getMainIcon(this.data);
        },

        hasWarning() {
            if (this.data.hasNotReturnedMaterials) {
                return true;
            }

            return this.units
                .filter((unit) => this.data.pivot.units.includes(unit.id))
                .some((unit) => (unit.is_broken || unit.is_lost));
        },
    },
    methods: {
        handleClick() {
            this.$emit('click', this.data.id);
        },

        handleOpenEvent() {
            this.$emit('openEvent', this.data.id);
        },
    },
};
