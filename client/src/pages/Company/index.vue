<template>
    <div class="content">
        <div class="content__main-view Company">
            <div class="Company__main">
                <CompanyForm v-if="isFetched" :company="company" :errors="errors" @submit="save" />
                <div class="Company__extras">
                    <Help :message="help" :error="error" :isLoading="isLoading" />
                    <div v-if="persons.length > 0" class="Company__persons">
                        <h4 class="Company__persons__title">
                            {{ $t('page-companies.attached-persons') }}
                        </h4>
                        <ul class="Company__persons__list">
                            <li
                                v-for="person in persons"
                                :key="person.id"
                                class="Company__persons__item"
                            >
                                <i class="fas fa-user" />
                                <router-link :to="`/beneficiaries/${person.id}`">
                                    {{ person.full_name }}
                                </router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script src="./index.js"></script>
