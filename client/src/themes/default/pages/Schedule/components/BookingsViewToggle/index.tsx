import { defineComponent } from '@vue/composition-api';
import { BookingsViewMode } from '@/stores/api/users';
import MultiSwitch from '@/themes/default/components/MultiSwitch';

import type { OptionData as MultiSwitchOptionData } from '@/themes/default/components/MultiSwitch/Option';

import type { PropType } from '@vue/composition-api';

type Props = {
    /** La valeur du mode d'affichage courant. */
    mode: BookingsViewMode,
};

/** Affiche un toggle qui permet de choisir entre deux modes d'affichage. */
const BookingsViewToggle = defineComponent({
    name: 'BookingsViewToggle',
    props: {
        mode: {
            type: String as PropType<Props['mode']>,
            required: true,
        },
    },
    computed: {
        options(): MultiSwitchOptionData[] {
            const { $t: __ } = this;

            return [
                {
                    value: BookingsViewMode.CALENDAR,
                    icon: 'calendar-alt',
                    label: __('page.schedule.toggle.calendar'),
                },
                {
                    value: BookingsViewMode.LISTING,
                    icon: 'list',
                    label: __('page.schedule.toggle.listing'),
                },
            ];
        },
    },
    methods: {
        handleChange(value: BookingsViewMode) {
            this.$router.push({ name: `schedule:${value}` });
        },
    },
    render() {
        const { options, mode, handleChange } = this;

        return (
            <MultiSwitch
                options={options}
                value={mode}
                onChange={handleChange}
            />
        );
    },
});

export default BookingsViewToggle;
