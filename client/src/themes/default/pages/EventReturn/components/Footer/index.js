import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import IconMessage from '@/themes/default/components/IconMessage';
import Button from '@/themes/default/components/Button';

// @vue/component
const EventReturnFooter = defineComponent({
    name: 'EventReturnFooter',
    props: {
        isDone: { type: Boolean, required: false },
        isSaving: { type: Boolean, required: false },
        canTerminate: { type: Boolean, required: true },
    },
    emits: ['save', 'terminate'],
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleClickSave() {
            this.$emit('save');
        },

        handleClickTerminate() {
            this.$emit('terminate');
        },
    },
    render() {
        const {
            $t: __,
            isDone,
            isSaving,
            canTerminate,
            handleClickSave,
            handleClickTerminate,
        } = this;

        return (
            <div class="EventReturnFooter">
                {isDone && (
                    <div class="EventReturnFooter__done">
                        {__('page.event-return.inventory-done')}
                    </div>
                )}
                {!isDone && (
                    <Fragment>
                        <Button
                            type="primary"
                            class="EventReturnFooter__action"
                            onClick={handleClickSave}
                            disabled={isSaving}
                            icon="save"
                            loading={isSaving}
                        >
                            {isSaving ? __('saving') : __('save-draft')}
                        </Button>
                        {canTerminate && (
                            <Button
                                class="EventReturnFooter__action"
                                onClick={handleClickTerminate}
                                disabled={isSaving}
                                tooltip={__('warning-terminate-inventory')}
                                icon="check"
                                loading={isSaving}
                            >
                                {isSaving ? __('saving') : __('terminate-inventory')}
                            </Button>
                        )}
                        {!canTerminate && (
                            <div class="EventReturnFooter__warning">
                                <IconMessage
                                    name="exclamation-triangle"
                                    message={__('page.event-return.not-finished-yet-alert')}
                                />
                            </div>
                        )}
                    </Fragment>
                )}
            </div>
        );
    },
});

export default EventReturnFooter;
