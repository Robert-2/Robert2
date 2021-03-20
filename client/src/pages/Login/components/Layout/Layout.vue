<template>
  <div class="LoginLayout">
    <div class="LoginLayout__logo">
      <Logo />
    </div>
    <div class="LoginLayout__body">
      <slot />
    </div>
    <div class="LoginLayout__footer">
      {{ $t('page-login.footer') }}<br />
      | <a href="http://robertmanager.org" target="_blank">{{ $t('page-login.official-website') }}</a>
      | <a href="http://forum.robertmanager.org" target="_blank">{{ $t('page-login.community-forum') }}</a>
      | <a href="https://github.com/robert-2/Robert2" target="_blank">Github project</a> |
      v{{ apiVersion }}
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../themes/default/index';
  @import './Layout';
</style>

<script src="./index.js"></script>
