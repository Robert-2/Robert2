<template>
    <div class="Help" :class="`Help--${modifier}`">
        <div v-if="isLoading" class="Help__loading">
            <i class="fas fa-circle-notch fa-spin" />
            {{ $t('loading') }}
        </div>
        <ErrorMessage v-if="!isLoading && error" :error="error" />
        <div v-if="$t(messageText) && !error && !isLoading" class="Help__message">
            {{ $t(messageText) }}
        </div>
    </div>
</template>

<style lang="scss">
    @import '../../themes/default/index';
    @import './Help';
</style>

<script>
import ErrorMessage from '@/components/ErrorMessage';

export default {
    name: 'Help',
    components: { ErrorMessage },
    props: {
        message: { type: [String, Object], required: true },
        error: { type: Error, default: null },
        isLoading: { type: Boolean, default: false },
    },
    computed: {
        modifier() {
            if (this.isLoading) {
                return 'info';
            }

            if (this.error) {
                return 'error';
            }

            return this.message.type ? this.message.type : 'info';
        },

        messageText() {
            return this.message.text ? this.message.text : this.message;
        },
    },
};
</script>
