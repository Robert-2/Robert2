<template>
    <div class="MaterialViewUnits">
        <v-client-table :data="material.units" :columns="columns" :options="options">
            <template #park="unit">
                {{ getParkName(unit.row.park_id) }}
            </template>
            <template #owner="unit">
                <span v-if="unit.row.owner">
                    {{ unit.row.owner.full_name }}
                </span>
            </template>
            <template #is_broken="unit">
                <span v-if="unit.row.is_broken" class="MaterialViewUnits__yes-warning">
                    {{ $t('yes') }}
                </span>
                <span v-else class="MaterialViewUnits__no-ok">{{ $t('no') }}</span>
            </template>
            <template #is_lost="unit">
                <span v-if="unit.row.is_lost" class="MaterialViewUnits__yes-danger">
                    {{ $t('yes') }}
                </span>
                <span v-else class="MaterialViewUnits__no-ok">{{ $t('no') }}</span>
            </template>
            <template #state="unit">
                {{ getUnitStateName(unit.row.state) }}
            </template>
            <template #purchase_date="unit">
                {{ formatDate(unit.row.purchase_date) }}
            </template>
            <template #actions="unit">
                <a
                    target="_blank"
                    :href="getFileUrl(unit.row.id)"
                    class="button item-actions__button info"
                >
                    <i class="fas fa-barcode" />
                </a>
                <router-link
                    v-tooltip="$t('action-edit')"
                    :to="`/materials/${material.id}/units/${unit.row.id}`"
                    custom
                    v-slot="{ navigate }"
                >
                    <button class="item-actions__button info" @click="navigate">
                        <i class="fas fa-edit" />
                    </button>
                </router-link>
                <button
                    v-tooltip="$t('action-delete')"
                    class="item-actions__button danger"
                    @click="deleteUnit(unit.row.id)"
                >
                    <i class="fas fa-trash-alt" />
                </button>
            </template>
        </v-client-table>
    </div>
</template>

<script src="./index.js"></script>
