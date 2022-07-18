<template>
    <form class="Form EventStep1" method="POST" @submit="saveAndBack">
        <Fieldset>
            <FormField
                v-model="eventData.title"
                name="title"
                label="title"
                required
                :errors="errors.title"
                @input="checkIsSavedEvent"
            />
            <div class="EventStep1__dates">
                <div class="EventStep1__dates__fields">
                    <FormField
                        v-model="dates"
                        label="dates"
                        type="date"
                        required
                        :errors="errors.start_date || errors.end_date"
                        :datepickerOptions="datepickerOptions"
                        @change="setEventDates"
                    />
                </div>
                <div class="EventStep1__dates__duration">
                    <span v-if="duration > 0">
                        {{ $t('duration-days', { duration }, duration) }}
                    </span>
                </div>
            </div>
        </Fieldset>
        <Fieldset :title="$t('event-details')">
            <FormField
                v-model="eventData.location"
                name="location"
                label="location"
                class="EventStep1__location"
                :errors="errors.location"
                @input="checkIsSavedEvent"
            />
            <FormField
                v-model="eventData.description"
                name="description"
                label="description"
                type="textarea"
                class="EventStep1__description"
                :errors="errors.description"
                @input="checkIsSavedEvent"
            />
            <div v-if="showIsBillable" class="EventStep1__is-billable">
                <FormField
                    v-model="eventData.is_billable"
                    name="is_billable"
                    label="is-billable"
                    type="switch"
                    :errors="errors.is_billable"
                    @change="checkIsSavedEvent"
                />
                <div class="EventStep1__is-billable__help">
                    <i class="fas fa-arrow-right" />
                    <span v-if="!eventData.is_billable">
                        {{ $t(`is-not-billable-help`) }}
                    </span>
                    <span v-if="eventData.is_billable">
                        {{ $t(`is-billable-help`) }}
                    </span>
                </div>
            </div>
        </Fieldset>
        <section class="Form__actions">
            <button class="EventStep1__save-btn info" type="submit">
                <i class="fas fa-arrow-left" />
                {{ $t('page.event-edit.save-and-back-to-calendar') }}
            </button>
            <button class="EventStep1__save-btn success" @click="saveAndNext">
                {{ $t('page.event-edit.save-and-continue') }}
                <i class="fas fa-arrow-right" />
            </button>
        </section>
    </form>
</template>

<script src="./index.js"></script>
