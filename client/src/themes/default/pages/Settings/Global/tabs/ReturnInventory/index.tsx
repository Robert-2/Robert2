import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import apiSettings from '@/stores/api/settings';
import { ApiErrorCode } from '@/stores/api/@codes';
import Help from '@/themes/default/components/Help';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';

import type { ReturnInventoryMode } from '@/stores/api/settings';

type Data = {
    isSaving: boolean,
    validationErrors: Record<string, string> | null,
    mode: ReturnInventoryMode,
};

// @vue/component
const ReturnInventoryGlobalSettings = defineComponent({
    name: 'ReturnInventoryGlobalSettings',
    data(): Data {
        return {
            isSaving: false,
            validationErrors: null,
            mode: this.$store.state.settings.returnInventory.mode,
        };
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e: SubmitEvent) {
            e.preventDefault();

            this.save();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isSaving) {
                return;
            }

            const { $t: __, mode } = this;
            this.isSaving = true;

            try {
                await apiSettings.update({ returnInventory: { mode } });

                this.validationErrors = null;

                this.$store.dispatch('settings/fetch');
                this.$toasted.success(__('page.settings.return-inventory.saved'));
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                        return;
                    }
                }

                this.$toasted.error(__('errors.unexpected-while-saving'));
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const { $t: __, handleSubmit, validationErrors, isSaving } = this;

        return (
            <form class="ReturnInventoryGlobalSettings" onSubmit={handleSubmit}>
                <Help
                    message={__('page.settings.return-inventory.help')}
                    error={validationErrors ? __('errors.validation') : null}
                />
                <section class="ReturnInventoryGlobalSettings__mode">
                    <FormField
                        type="custom"
                        label="page.settings.return-inventory.mode"
                        class="ReturnInventoryGlobalSettings__mode__field"
                        errors={validationErrors?.['returnInventory.mode']}
                    >
                        <div class="ReturnInventoryGlobalSettings__mode__input">
                            <input
                                id="modeStartEmptyRadio"
                                type="radio"
                                name="returnInventory.mode"
                                value="start-empty"
                                v-model={this.mode}
                                class="ReturnInventoryGlobalSettings__mode__input__radio"
                            />
                            <label
                                for="modeStartEmptyRadio"
                                class="ReturnInventoryGlobalSettings__mode__input__label"
                            >
                                {__('page.settings.return-inventory.modes.start-empty')}
                            </label>
                        </div>
                        <div class="ReturnInventoryGlobalSettings__mode__input">
                            <input
                                id="modeStartFullRadio"
                                type="radio"
                                name="returnInventory.mode"
                                value="start-full"
                                v-model={this.mode}
                                class="ReturnInventoryGlobalSettings__mode__input__radio"
                            />
                            <label
                                for="modeStartFullRadio"
                                class="ReturnInventoryGlobalSettings__mode__input__label"
                            >
                                {__('page.settings.return-inventory.modes.start-full')}
                            </label>
                        </div>
                    </FormField>
                </section>
                <section class="ReturnInventoryGlobalSettings__actions">
                    <Button
                        icon="save"
                        htmlType="submit"
                        type="success"
                        loading={isSaving}
                    >
                        {isSaving ? __('saving') : __('save')}
                    </Button>
                </section>
            </form>
        );
    },
});

export default ReturnInventoryGlobalSettings;
