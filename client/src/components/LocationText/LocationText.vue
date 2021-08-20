<template>
    <div class="LocationText">
        <i class="fas fa-map-marker-alt" />
        {{ $t('in') }}
        <strong>{{ location }}</strong>
        <a
            :href="`https://www.openstreetmap.org/search?query=${location}`"
            target="_blank"
            :title="$t('open-in-openstreetmap')"
        >
            &nbsp; <i class="fas fa-external-link-alt" />
        </a>
    </div>
</template>

<style lang="scss">
    @import '../../themes/default/index';
    @import './LocationText';
</style>

<script>
export default {
    name: 'LocationText',
    props: {
        location: { type: String, required: true },
    },
};
</script>
