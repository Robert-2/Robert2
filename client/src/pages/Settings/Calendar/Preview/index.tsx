import './index.scss';

import type { Component } from '@vue/composition-api';

// @vue/component
const CalendarSettingsPreview: Component = () => () => (
    <div class="CalendarSettingsPreview">
        <div class="CalendarSettingsPreview__background">
            {Array.from({ length: 30 }).map((_: any, index: number) => (
                <div key={index} class="CalendarSettingsPreview__background__col" />
            ))}
        </div>
        <div class="CalendarSettingsPreview__events">
            <div class="CalendarSettingsPreview__event">
                Du contenu.
            </div>
            <div class="CalendarSettingsPreview__event">
                Du contenu.
            </div>
            <div class="CalendarSettingsPreview__event">
                Du contenu.
            </div>
        </div>
    </div>
);

export default CalendarSettingsPreview;
