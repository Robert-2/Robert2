import './index.scss';
import moment from 'moment';
import { toRefs, computed } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';

// @vue/component
const SearchEventResultItem = (props, { emit }) => {
    const __ = useI18n();
    const { data } = toRefs(props);
    const start = computed(() => moment(data.value.startDate));
    const end = computed(() => moment(data.value.endDate));
    const duration = computed(() => end.value.diff(start.value, 'days') + 1);

    const handleSelect = () => {
        emit('select', data.value.id);
    };

    return () => (
        <li class="SearchEventResultItem">
            <span class="SearchEventResultItem__title">
                {data.value.title} {data.value.location && <em>({data.value.location})</em>}
            </span>
            <span class="SearchEventResultItem__dates">
                {duration.value === 1 && __('on-date', { date: start.value.format('LL') })}
                {duration.value > 1 && __(
                    'from-date-to-date',
                    { from: start.value.format('L'), to: end.value.format('L') },
                )}
            </span>
            <button type="button" class="SearchEventResultItem__select info" onClick={handleSelect}>
                {__('choose')}
            </button>
        </li>
    );
};

SearchEventResultItem.props = {
    data: { type: Object, required: true },
};

SearchEventResultItem.emits = ['select'];

export default SearchEventResultItem;
