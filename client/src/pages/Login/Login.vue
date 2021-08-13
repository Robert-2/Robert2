<template>
    <Layout>
        <div class="Login">
            <div class="Login__message" :class="`Login__message--${message.type}`">
                <i v-if="message.isLoading" class="fa fa-circle-o-notch fa-spin" />
                {{ message.text }}
            </div>
            <div class="Login__body">
                <form class="Login__form" @submit.prevent="login">
                    <input
                        v-model="credentials.identifier"
                        type="text"
                        autocomplete="username"
                        class="Login__form__input"
                        :placeholder="$t('email-address-or-pseudo')"
                    >
                    <input
                        v-model="credentials.password"
                        type="password"
                        autocomplete="current-password"
                        class="Login__form__input"
                        :placeholder="$t('password')"
                    >
                    <button type="submit" class="Login__form__submit info">
                        <i class="fa fa-user-alt" />
                        {{ $t('page-login.connexion') }}
                    </button>
                </form>
            </div>
        </div>
    </Layout>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Login';
</style>

<script src="./index.js"></script>
