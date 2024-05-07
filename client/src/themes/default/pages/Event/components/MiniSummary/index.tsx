import './index.scss';
import Decimal from 'decimal.js';
import { defineComponent } from '@vue/composition-api';
import config from '@/globals/config';
import formatAmount from '@/utils/formatAmount';
import Icon from '@/themes/default/components/Icon';
import Fragment from '@/components/Fragment';
import IconMessage from '@/themes/default/components/IconMessage';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';

type Props = {
    /**
     * L'événement en cours d'édition.
     *
     * Si l'événement n'a pas encore été sauvegardé, cette prop. doit être à `null`.
     */
    event: EventDetails | null,

    /**
     * L'édition en cours est-t'elle "dirty" ?
     *
     * On entend par "dirty" des données modifiées mais pas encore persistées.
     */
    isDirty: boolean,
};

/** Résumé rapide de l'événement en cours d'édition.  */
const EventMiniSummary = defineComponent({
    name: 'EventMiniSummary',
    props: {
        event: {
            type: Object as PropType<Props['event']>,
            default: null,
        },
        isDirty: {
            type: Boolean as PropType<Props['isDirty']>,
            required: true,
        },
    },
    computed: {
        duration(): number | undefined {
            return this.event?.operation_period.asDays();
        },

        isConfirmed(): boolean {
            return this.event?.is_confirmed ?? false;
        },

        showBillingAmounts(): boolean {
            if (config.billingMode === 'none') {
                return false;
            }
            return this.event?.is_billable ?? true;
        },

        totalWithoutTaxes(): Decimal | undefined {
            if (!this.showBillingAmounts) {
                return undefined;
            }
            return this.event?.is_billable
                ? this.event.total_without_taxes
                : new Decimal(0);
        },
    },
    render() {
        const {
            $t: __,
            event,
            duration,
            isDirty,
            isConfirmed,
            totalWithoutTaxes,
            showBillingAmounts,
        } = this;

        return (
            <div
                class={['EventMiniSummary', {
                    'EventMiniSummary--confirmed': isConfirmed,
                    'EventMiniSummary--not-saved': isDirty,
                }]}
            >
                {isDirty && (
                    <Icon
                        name="exclamation-triangle"
                        class="EventMiniSummary__not-saved"
                        v-tooltip={{
                            placement: 'right',
                            content: __('page.event-edit.not-saved'),
                        }}
                    />
                )}
                <div class="EventMiniSummary__content">
                    {(event !== null) && (
                        <Fragment>
                            <div class="EventMiniSummary__title">
                                {event.title}
                            </div>
                            {!!(event?.location && event.location.length > 0) && (
                                <div class="EventMiniSummary__detail">
                                    {__('in', { location: event.location })}
                                </div>
                            )}
                            <div class="EventMiniSummary__detail">
                                {event.operation_period.toReadable(__)}
                                <br />
                                {__('duration-days', { duration }, duration)}
                                {(showBillingAmounts && event.is_billable) && (
                                    <div>{__('ratio')} {event.degressive_rate.toString()}</div>
                                )}
                            </div>
                        </Fragment>
                    )}
                    {showBillingAmounts && (
                        <div class="EventMiniSummary__total">
                            {__('total')} <strong>{formatAmount(totalWithoutTaxes)}</strong>
                        </div>
                    )}
                    <div class="EventMiniSummary__detail">
                        <IconMessage
                            name={isConfirmed ? 'check' : 'question-circle'}
                            message={isConfirmed ? __('confirmed') : __('not-confirmed')}
                        />
                    </div>
                </div>
            </div>
        );
    },
});

export default EventMiniSummary;
