import './index.scss';
import { ref } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

import type { Component } from '@vue/composition-api';

// @vue/component
const CalendarSettings: Component = () => {
    const __ = useI18n();
    const isSaving = ref(false);

    const handleSubmit = (e: SubmitEvent): void => {
        e.preventDefault();

        isSaving.value = true;
        const data = getFormDataAsJson(e.target);
        console.log('=> Submit', data);
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
                        // value={true}
                        // errors={errors?.eventSummary.materialDisplayMode}
                    />
                    <FormField
                        type="switch"
                        label="Afficher le bénéficiaire / emprunteur ?"
                        name="calendar.event.showBorrower"
                        // value={true}
                        // errors={errors?.eventSummary.materialDisplayMode}
                    />
                </section>
                {/*
                <section class="CalendarSettings__section">
                    <h3>Couleurs des événements du calendrier</h3>
                </section>
                */}
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
