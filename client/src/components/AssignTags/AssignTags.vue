<template>
  <div class="AssignTags">
    <Header :title="title" @close="$emit('close')" />
    <div class="AssignTags__content">
      <p class="AssignTags__help">{{ $t('choose-tags-below') }}</p>
      <div class="AssignTags__form">
        <VueSelect
          v-model="tags"
          :options="$store.getters['tags/options']"
          :close-on-select="false"
          multiple
        />
        <button
          v-tooltip="$t('remove-all-tags')"
          class="AssignTags__form__remove-all"
          @click="removeAll"
        >
          <i class="fas fa-backspace" />
        </button>
      </div>
    </div>
    <div class="AssignTags__actions">
      <p v-if="error" class="AssignTags__error">{{error}}</p>
      <button
        class="success"
        @click="save"
      >
        <i v-if="isLoading" class="fas fa-circle-notch fa-spin" />
        <span v-if="isLoading">{{ $t('saving') }}</span>
        <span v-else>{{ $t('save') }}</span>
      </button>
      <button @click="$emit('close')">
        {{ $t('cancel') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './AssignTags';
</style>

<script src="./index.js"></script>
