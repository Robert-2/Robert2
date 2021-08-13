<template>
    <header class="AssignTagsHeader">
        <h4 class="AssignTagsHeader__title">
            <i class="fas fa-tags" />
            {{ title }}
        </h4>
        <button class="close" @click="$emit('close')">
            <i class="fas fa-times" />
        </button>
    </header>
</template>

<style lang="scss">
    @import '../../../themes/default/index';
    @import './Header';
</style>

<script>
export default {
    name: 'AssignTagsHeader',
    props: ['title'],
};
</script>
