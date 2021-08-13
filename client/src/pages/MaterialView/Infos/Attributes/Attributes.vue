<template>
    <div class="MaterialViewInfosAttributes">
        <h3>{{ $t('special-attributes') }}</h3>
        <ul class="MaterialViewInfosAttributes__list" v-if="attributes.length > 0">
            <li
                class="MaterialViewInfosAttributes__list__item"
                v-for="attribute in attributes"
                :key="attribute.id"
            >
                {{ attribute.name }}:
                <span
                    v-if="!['boolean', 'date'].includes(attribute.type)"
                    class="MaterialViewInfosAttributes__list__item__value"
                >
                    {{ attribute.value }}
                    {{ attribute.unit }}
                </span>
                <span
                    v-if="attribute.type === 'date'"
                    class="MaterialViewInfosAttributes__list__item__value"
                >
                    {{ formatDate(attribute.value) }}
                </span>
                <span
                    v-if="attribute.type === 'boolean'"
                    class="MaterialViewInfosAttributes__list__item__value"
                >
                    {{ attribute.value ? $t('yes') : $t('no') }}
                </span>
            </li>
        </ul>
    </div>
</template>

<style lang="scss">
    @import '../../../../themes/default/index';
    @import './Attributes';
</style>

<script>
import moment from 'moment';

export default {
    name: 'MaterialViewInfosAttributes',
    props: {
        attributes: { required: true, type: Array },
    },
    methods: {
        formatDate(value) {
            return moment(value).format('DD/MM/yyyy');
        },
    },
};
</script>
