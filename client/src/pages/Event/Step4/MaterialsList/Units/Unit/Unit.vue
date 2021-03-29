<template>
  <tr :class="classNames" @click="handleToggle">
    <td class="MaterialsListUnit__col MaterialsListUnit__col--selector">
      <input
        type="checkbox"
        :disabled="!isAvailable"
        :checked="isSelected"
        @input="handleCheckbox"
      />
    </td>
    <td class="MaterialsListUnit__col MaterialsListUnit__col--serial-number">
      {{data.serial_number}}
    </td>
    <td class="MaterialsListUnit__col MaterialsListUnit__col--is-broken">
      {{data.is_broken ? $t('yes') : $t('no')}}
    </td>
    <td class="MaterialsListUnit__col MaterialsListUnit__col--park">
      {{park}}
    </td>
  </tr>
</template>

<style lang="scss">
  @import '../../../../../../themes/default/index';
  @import './Unit';
</style>

<script src="./index.js"></script>
