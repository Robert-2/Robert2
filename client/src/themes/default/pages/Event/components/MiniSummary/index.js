import './index.scss';
import moment from 'moment';
import config from '@/globals/config';
import formatAmount from '@/utils/formatAmount';
import Icon from '@/themes/default/components/Icon';
import EventStore from '../../EventStore';

// @vue/component
export default {
    name: 'EventMiniSummary',
    computed: {
        title() { return EventStore.state.title; },
        dates() { return EventStore.state.dates; },
        duration() { return EventStore.state.duration; },
        location() { return EventStore.state.location; },
        totalWithoutTaxes() { return EventStore.state.totalWithoutTaxes; },
        degressiveRate() { return EventStore.state.degressiveRate; },
        isConfirmed() { return EventStore.state.isConfirmed; },
        isSaved() { return EventStore.state.isSaved; },

        showPrices() {
            return config.billingMode !== 'none' && EventStore.state.isBillable;
        },

        fromToDates() {
            const { start, end } = this.dates;
            return {
                from: start ? moment(start).format('L') : '',
                to: end ? moment(end).format('L') : '',
            };
        },
    },
    render() {
        const {
            $t: __,
            isConfirmed,
            isSaved,
            title,
            location,
            duration,
            fromToDates,
            dates,
            showPrices,
            totalWithoutTaxes,
            degressiveRate,
        } = this;

        return (
            <div
                class={['EventMiniSummary', {
                    'EventMiniSummary--confirmed': isConfirmed,
                    'EventMiniSummary--not-saved': !isSaved,
                }]}
            >
                {!isSaved && (
                    <div
                        v-tooltip={{ placement: 'right-end', content: __('page.event-edit.not-saved') }}
                        class="EventMiniSummary__not-saved"
                    >
                        <Icon name="exclamation-triangle" />
                    </div>
                )}
                {!!title && (
                    <div class="EventMiniSummary__title">
                        {title}
                    </div>
                )}
                {!!location && (
                    <div class="EventMiniSummary__detail">{__('in', { location })}</div>
                )}
                {(!!dates.start && !!dates.end) && (
                    <div class="EventMiniSummary__detail">
                        {duration.days === 1 && __('on-date', { date: fromToDates.from })}
                        {duration.days > 1 && __('from-date-to-date', fromToDates)}
                        <br />
                        {__('duration-days', { duration: duration.days }, duration.days)}
                        {showPrices && <div>{__('ratio')} {degressiveRate.toString()}</div>}
                    </div>
                )}
                {showPrices && (
                    <div class="EventMiniSummary__total">
                        {__('total')} <strong>{formatAmount(totalWithoutTaxes.toNumber())}</strong>
                    </div>
                )}
                <div class="EventMiniSummary__detail">
                    <Icon
                        name={isConfirmed ? 'check' : 'question-circle'}
                        class="EventMiniSummary__status-icon"
                    />
                    {isConfirmed ? __('confirmed') : __('not-confirmed')}
                </div>
            </div>
        );
    },
};
