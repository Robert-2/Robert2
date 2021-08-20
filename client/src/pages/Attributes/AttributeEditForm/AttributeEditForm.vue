<template>
    <table class="AttributeEditForm">
        <tr>
            <td class="AttributeEditForm__name">
                <input
                    ref="InputName"
                    type="text"
                    class="AttributeEditForm__input"
                    :placeholder="$t('page-attributes.name')"
                />
                <div
                    v-if="errors.name"
                    class="AttributeEditForm__error"
                    style="word-break: break-all"
                >
                    {{ errors.name[0] }}
                </div>
            </td>
            <td class="AttributeEditForm__type">
                <select
                    ref="InputType"
                    class="AttributeEditForm__select"
                    @change="handleTypeChange"
                >
                    <option value="integer">{{ $t('page-attributes.type-integer') }}</option>
                    <option value="float">{{ $t('page-attributes.type-float') }}</option>
                    <option value="date">{{ $t('page-attributes.type-date') }}</option>
                    <option value="string">{{ $t('page-attributes.type-string') }}</option>
                    <option value="boolean">{{ $t('page-attributes.type-boolean') }}</option>
                </select>
                <ul v-if="errors.type" class="AttributeEditForm__error">
                    <li v-for="typeError in errors.type" :key="typeError">
                        {{ typeError }}
                    </li>
                </ul>
            </td>
            <td class="AttributeEditForm__unit">
                <input
                    ref="InputUnit"
                    v-if="hasUnit"
                    type="text"
                    class="AttributeEditForm__input"
                    :placeholder="$t('page-attributes.unit')"
                />
                <div v-if="errors.unit" class="AttributeEditForm__error">
                    {{ errors.unit[0] }}
                </div>
            </td>
            <td class="AttributeEditForm__max-length">
                <input
                    ref="InputMaxLength"
                    v-if="hasMaxLength"
                    type="number"
                    class="AttributeEditForm__input"
                    :placeholder="$t('page-attributes.max-length')"
                />
                <div v-if="errors.max_length" class="AttributeEditForm__error">
                    {{ errors.max_length[0] }}
                </div>
            </td>
            <td class="AttributeEditForm__categories">
                <button
                    v-for="categoryOption in categoriesOptions"
                    class="AttributeEditForm__categories__item"
                    :class="{
                        'AttributeEditForm__categories__item--selected': isSelected(categoryOption.value)
                    }"
                    :key="categoryOption.value"
                    @click="toggleCategory(categoryOption.value)"
                >
                    {{ categoryOption.label }}
                </button>
            </td>
        </tr>
    </table>
</template>

<style lang="scss">
    @import '../../../themes/default/index';
    @import './AttributeEditForm';
</style>

<script src="./index.js"></script>
