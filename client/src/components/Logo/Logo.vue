<template>
  <img :src="src" alt="Robert²" />
</template>

<script>
import minimalistLogoSrc from './assets/logo-R.svg';
import logoSrc from './assets/logo.svg';

export default {
  name: 'Logo',
  props: {
    minimalist: Boolean,
  },
  computed: {
    src() {
      return this.minimalist ? minimalistLogoSrc : logoSrc;
    },
  },
};
</script>
