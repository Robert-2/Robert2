<template>
    <div class="content">
        <div class="content__main-view">
            <div class="Event">
                <div class="Event__panel">
                    <Breadcrumb
                        :event="event"
                        :steps="steps"
                        :current-step="currentStep"
                        @openStep="openStep"
                    />
                    <MiniSummary />
                    <div class="Event__panel__help">
                        <Help :message="help" :error="error" :isLoading="isLoading" />
                    </div>
                </div>
                <EventStep1
                    v-if="currentStep === 1"
                    :event="event"
                    @loading="startLoading"
                    @error="displayError"
                    @updateEvent="setEventData"
                    @gotoStep="openStep"
                />
                <EventStep2
                    v-if="currentStep === 2"
                    :event="event"
                    @loading="startLoading"
                    @stopLoading="stopLoading"
                    @error="displayError"
                    @updateEvent="setEventData"
                    @gotoStep="openStep"
                />
                <EventStep3
                    v-if="currentStep === 3"
                    :event="event"
                    @loading="startLoading"
                    @stopLoading="stopLoading"
                    @error="displayError"
                    @updateEvent="setEventData"
                    @gotoStep="openStep"
                />
                <EventStep4
                    v-if="currentStep === 4"
                    :event="event"
                    @loading="startLoading"
                    @error="displayError"
                    @updateEvent="setEventData"
                    @gotoStep="openStep"
                />
                <EventStep5
                    v-if="currentStep === 5"
                    :event="event"
                    @error="displayError"
                    @updateEvent="setEventData"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import '../../themes/default/index';
    @import './Event';
</style>

<script src="./index.js"></script>
