<template>
    <form class="Form EventStep4" method="POST" @submit="saveAndBack">
        <section class="Form__fieldset">
            <MaterialsList :event="event" @change="handleChange" />
        </section>
        <section class="Form__actions">
            <button class="info" type="submit">
                <i class="fas fa-arrow-left" />
                {{ $t('page-events.save-and-back-to-calendar') }}
            </button>
            <button class="success" @click="saveAndNext">
                {{ $t('page-events.save-and-continue') }}
                <i class="fas fa-arrow-right" />
            </button>
        </section>
    </form>
</template>

<script src="./index.js"></script>
