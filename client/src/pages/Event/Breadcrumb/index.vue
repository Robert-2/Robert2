<template>
    <div class="Breadcrumb">
        <div
            v-for="step in steps"
            :key="step.id"
            class="Breadcrumb__step"
            :class="{
                'Breadcrumb__step--current': isCurrent(step),
                'Breadcrumb__step--active': isActive(step),
                'Breadcrumb__step--validated': !isCurrent(step) && isValidated(step),
            }"
            @click="openStep(step)"
        >
            <i v-if="isCurrent(step)" class="fas fa-arrow-right" />
            <i v-if="!isCurrent(step) && isValidated(step)" class="fas fa-check" />
            {{ step.id }} -
            <span class="Breadcrumb__step__name">
                {{ step.name }}
            </span>
        </div>
    </div>
</template>

<script src="./index.js"></script>
