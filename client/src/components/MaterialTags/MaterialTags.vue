<template>
  <ul class="MaterialTags">
      <li
        v-for="tag in tags"
        :key="tag.id"
        class="MaterialTags__item"
      >
        <i class="fas fa-tag" />
        {{ tag.name }}
      </li>
  </ul>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './MaterialTags';
</style>

<script>
export default {
  name: 'MaterialTags',
  props: {
    tags: Array,
  },
};
</script>
