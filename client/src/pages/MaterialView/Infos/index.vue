<template>
    <div class="MaterialViewInfos">
        <section class="MaterialViewInfos__main">
            <h2>{{ material.reference }}</h2>
            <h3>
                <router-link :to="`/materials?${queryStringCategory}`">
                    {{ categoryName }}
                </router-link>
                <span v-if="subCategoryName">/</span>
                <router-link :to="`/materials?${queryStringSubCategory}`" v-if="subCategoryName">
                    {{ subCategoryName }}
                </router-link>
                /
                {{ material.name }}
            </h3>
            <p>{{ material.description }}</p>
            <h3>{{ $t('quantities') }}</h3>
            <ul>
                <li class="MaterialViewInfos__stock-quantity">
                    {{ $t('stock-items-count', { count: material.stock_quantity || 0 }) }}
                </li>
                <li
                    v-if="material.out_of_order_quantity > 0"
                    class="MaterialViewInfos__out-of-order"
                >
                    {{ $t('out-of-order-items-count', { count: material.out_of_order_quantity || 0 }) }}
                </li>
            </ul>
            <div class="MaterialViewInfos__billing" v-if="showBilling && hasPricingData">
                <h3>{{ $t('prices') }}</h3>
                <ul>
                    <li v-if="rentalPrice != null" class="MaterialViewInfos__rental-price">
                        {{ $t('value-per-day', { value: rentalPrice }) }}
                    </li>
                    <li v-if="replacementPrice != null">
                        {{ $t('replacement-price') }} {{ replacementPrice }}
                    </li>
                </ul>
                <h3>{{ $t('billing') }}</h3>
                <p v-if="material.is_hidden_on_bill">
                    {{ $t('material-not-displayed-on-bill') }}
                </p>
                <p v-if="material.is_discountable">
                    {{ $t('material-is-discountable') }}
                </p>
            </div>
            <Attributes v-if="material.attributes.length > 0" :attributes="material.attributes" />
            <div class="MaterialViewInfos__notes" v-if="material.note">
                <h3>{{ $t('notes') }}</h3>
                <p class="MaterialViewInfos__notes">{{ material.note }}</p>
            </div>
        </section>
        <section v-if="material.picture" class="MaterialViewInfos__picture">
            <a
                :href="pictureUrl"
                target="blank"
                :title="$t('page-materials-view.infos.click-to-open-image')"
            >
                <img
                    :src="pictureUrl"
                    :alt="material.picture"
                    class="MaterialViewInfos__picture__img"
                />
            </a>
        </section>
        <section class="MaterialViewInfos__extras">
            <div class="MaterialViewInfos__actions">
                <router-link
                    v-tooltip="$t('action-edit')"
                    :to="`/materials/${material.id}`"
                    v-slot="{ navigate }"
                    custom
                >
                    <button @click="navigate" class="info">
                        <i class="fas fa-edit" />
                        {{ $t('action-edit') }}
                    </button>
                </router-link>
            </div>
            <div class="MaterialViewInfos__categories">
                <p>{{ $t('category') }}: <strong>{{ categoryName }}</strong></p>
                <p v-if="subCategoryName">
                    {{ $t('sub-category') }}: <strong>{{ subCategoryName }}</strong>
                </p>
            </div>
            <MaterialTags v-if="material.tags && material.tags.length > 0" :tags="material.tags" />
            <div class="MaterialViewInfos__dates">
                <p v-if="createDate">{{ $t('created-at') }} {{ createDate }}</p>
                <p v-if="updateDate">{{ $t('updated-at') }} {{ updateDate }}</p>
            </div>
        </section>
    </div>
</template>

<script src="./index.js"></script>
