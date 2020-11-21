<template>
  <div class="login">
    <div class="login__logo">
      <Logo />
    </div>
    <div class="login__message" :class="`login__message--${message.type}`">
      <i v-if="message.isLoading" class="fa fa-circle-o-notch fa-spin" />
      {{ message.text }}
    </div>
    <form class="login__form login-form" @submit.prevent="login">
      <input
        v-model="credentials.identifier"
        type="text"
        class="login-form__input"
        :placeholder="$t('email-address-or-pseudo')"
      >
      <input
        v-model="credentials.password"
        type="password"
        class="login-form__input"
        :placeholder="$t('password')"
      >
      <button type="submit" class="login-form__submit info">
        <i class="fa fa-user-alt" />
        {{ $t('page-login.connexion') }}
      </button>
    </form>
    <div class="login__footer">
      {{ $t('page-login.footer') }}<br>
      | <a href="http://robertmanager.org" target="_blank">{{ $t('page-login.official-website') }}</a>
      | <a href="http://forum.robertmanager.org" target="_blank">{{ $t('page-login.community-forum') }}</a>
      | <a href="https://github.com/robert-2/Robert2" target="_blank">Github project</a> |
      v{{ apiVersion }}
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Login';
  @import './LoginForm';
</style>

<script src="./index.js"></script>
