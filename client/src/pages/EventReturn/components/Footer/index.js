import './index.scss';
import Fragment from '@/components/Fragment';
import Icon from '@/components/Icon';
import Button from '@/components/Button';

// @vue/component
export default {
    name: 'EventReturnFooter',
    props: {
        isDone: Boolean,
        isSaving: Boolean,
        hasEnded: Boolean,
    },
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
            hasEnded,
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
                        {hasEnded && (
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
                        {!hasEnded && (
                            <p class="EventReturnFooter__warning">
                                <Icon name="exclamation-triangle" />
                                {__('page.event-return.this-event-is-not-past')}
                            </p>
                        )}
                    </Fragment>
                )}
            </div>
        );
    },
};
