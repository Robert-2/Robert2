<template>
    <div class="Progressbar">
        <div class="Progressbar__progress" :style="{ width: `${percent}%` }">
            <span v-if="percent < 100">{{ humanPercent }}%</span>
            <span v-if="percent === 100">{{ $t('almost-done') }}</span>
        </div>
    </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Progressbar';
</style>

<script>
export default {
    name: 'Progressbar',
    props: {
        percent: { type: Number, required: true },
    },
    computed: {
        humanPercent() {
            return Math.round(this.percent);
        },
    },
};
</script>
