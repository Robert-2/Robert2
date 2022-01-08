import { ref } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

import type { Component } from '@vue/composition-api';

// @vue/component
const CalendarSettings: Component = () => {
    const __ = useI18n();
    const isSaving = ref(false);

    const handleSubmit = (e: SubmitEvent): void => {
        e.preventDefault();
    };

    return () => (
        <div class="CalendarSettings">
            <form class="CalendarSettings__form" onSubmit={handleSubmit}>
                <section class="CalendarSettings__section">
                    <h3>Données affichées dans les événements du calendrier</h3>
                    <FormField
                        type="switch"
                        label="Afficher le lieu de l'événement ?"
                        name="calendar.event.showLocation"
                    />
                    <FormField
                        type="switch"
                        label="Afficher le bénéficiaire / emprunteur ?"
                        name="calendar.event.showBorrower"
                    />
                </section>
                <section class="CalendarSettings__actions">
                    <Button
                        icon="save"
                        htmlType="submit"
                        class="success"
                        disabled={isSaving.value}
                    >
                        {isSaving.value ? __('saving') : __('save')}
                    </Button>
                </section>
            </form>
        </div>
    );
};

export default CalendarSettings;
