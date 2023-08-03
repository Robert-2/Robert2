import './index.scss';
import throttle from 'lodash/throttle';
import { defineComponent } from '@vue/composition-api';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import { Group } from '@/stores/api/groups';
import apiEvents from '@/stores/api/events';
import Notepad from '@/themes/default/components/Notepad';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { Event } from '@/stores/api/events';
import type { DebouncedMethod } from 'lodash';

/**
 * Nombre d'essai de sauvegarde au-delà duquel:
 * - Une erreur est affichée à l'utilisateur.
 * - Le système ne re-tente plus de sauvegarder.
 * - La sauvegarde passe en mode manuel.
 */
const MAX_AUTOMATIC_SAVE_ATTEMPTS: number = 2;

type Props = {
    /** L'événement dont on souhaite afficher l'onglet des notes. */
    event: Event,
};

enum SaveMode {
    AUTOMATIC = 'automatic',
    MANUAL = 'manual',
}

type InstanceProperties = {
    throttledSave: (
        | DebouncedMethod<typeof EventDetailsNote, 'save'>
        | undefined
    ),
};

type State = {
    value: string,
    isSaving: boolean,
    shouldReSave: boolean,
    saveRetryAttempts: number,
    saveMode: SaveMode,
};

// @vue/component
const EventDetailsNote = defineComponent({
    name: 'EventDetailsNote',
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
        },
    },
    setup: (): InstanceProperties => ({
        throttledSave: undefined,
    }),
    data(): State {
        return {
            value: this.event.note ?? '',
            saveMode: SaveMode.AUTOMATIC,
            saveRetryAttempts: 0,
            shouldReSave: false,
            isSaving: false,
        };
    },
    computed: {
        readOnly() {
            return this.$store.getters['auth/is'](Group.VISITOR);
        },
    },
    created() {
        this.throttledSave = throttle(this.save.bind(this), DEBOUNCE_WAIT, { leading: false });
    },
    beforeDestroy() {
        this.throttledSave?.flush();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleInput(newValue: string) {
            this.value = newValue;

            if (this.saveMode === SaveMode.AUTOMATIC) {
                this.throttledSave!();
            }
        },

        handleChange(newValue: string) {
            if (this.value === newValue) {
                return;
            }
            this.value = newValue;

            if (this.saveMode === SaveMode.AUTOMATIC) {
                this.throttledSave!.cancel();
                this.save();
            }
        },

        handleSubmit(e: SubmitEvent) {
            e.preventDefault();

            this.throttledSave!.cancel();
            this.save();
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isSaving) {
                this.shouldReSave = true;
                return;
            }

            const { $t: __, event, value: note } = this;
            this.shouldReSave = false;
            this.isSaving = true;

            try {
                const updatedEvent = await apiEvents.update(event.id, { note });

                this.saveRetryAttempts = 0;
                this.$emit('updated', updatedEvent);
            } catch {
                if (this.saveMode === SaveMode.MANUAL || this.saveRetryAttempts >= MAX_AUTOMATIC_SAVE_ATTEMPTS) {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                    this.saveRetryAttempts = 0;
                    this.saveMode = SaveMode.MANUAL;
                } else if (!this.shouldReSave) {
                    this.saveRetryAttempts += 1;
                    this.shouldReSave = true;
                }
            } finally {
                this.isSaving = false;

                if (this.shouldReSave) {
                    this.save();
                }
            }
        },
    },
    render() {
        const {
            $t: __,
            value,
            isSaving,
            readOnly,
            saveMode,
            handleChange,
            handleInput,
            handleSubmit,
        } = this;

        return (
            <form class="EventDetailsNote" onSubmit={handleSubmit}>
                <div class="EventDetailsNote__body">
                    <Notepad
                        value={value}
                        onInput={handleInput}
                        onChange={handleChange}
                        disabled={readOnly}
                    />
                </div>
                {saveMode === SaveMode.MANUAL && (
                    <div class="EventDetailsNote__footer">
                        <Button type="primary" htmlType="submit" loading={isSaving}>
                            {isSaving ? __('saving') : __('manually-save')}
                        </Button>
                    </div>
                )}
            </form>
        );
    },
});

export default EventDetailsNote;
