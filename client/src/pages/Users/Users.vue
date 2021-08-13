<template>
    <div class="content Users">
        <div class="content__header header-page">
            <div class="header-page__help">
                <Help
                    :message="help"
                    :error="error"
                    :isLoading="isLoading"
                />
            </div>
            <div class="header-page__actions">
                <router-link :to="`/users/new`" v-slot="{ navigate }" custom>
                    <button @click="navigate" class="Users__create success" >
                        <i class="fas fa-user-plus" />
                        {{ $t('page-users.action-add') }}
                    </button>
                </router-link>
            </div>
        </div>

        <div class="content__main-view">
            <v-server-table
                ref="DataTable"
                name="UsersTable"
                :columns="columns"
                :options="options"
            >
                <div slot="pseudo" slot-scope="user">
                    <i class="fas" :class="user.row.id === currentUserId ? 'fa-user-circle' : 'fa-user'" />
                    {{ user.row.pseudo }}
                </div>
                <div slot="full_name" slot-scope="user">
                    <span v-if="user.row.person">
                        {{ user.row.person.first_name }} {{ user.row.person.last_name }}
                    </span>
                    <span v-else class="Users__no-profile">
                        {{$t('page-users.profile-missing-or-deleted')}}
                    </span>
                </div>
                <div slot="group_id" slot-scope="user">
                    {{ $t(user.row.group_id) }}
                </div>
                <div slot="email" slot-scope="user">
                    <a v-if="user.row.id !== currentUserId" :href="`mailto:${user.row.email}`">
                        {{ user.row.email }}
                    </a>
                    <span v-else>{{ user.row.email }}</span>
                </div>
                <div slot="phone" slot-scope="user">
                    <span v-if="user.row.person">
                        {{ user.row.person.phone }}
                    </span>
                </div>
                <div slot="address" slot-scope="user">
                    {{ user.row.person.street }}<br>
                    {{ user.row.person.postal_code }} {{ user.row.person.locality }}
                </div>
                <div slot="actions" slot-scope="user" class="Users__actions">
                    <div v-if="user.row.id === currentUserId">
                        <router-link
                            to="/profile"
                            v-slot="{ navigate }"
                            custom
                        >
                            <button @click="navigate" class="info">
                                <i class="fas fa-edit" />
                                {{$t('your-profile')}}
                            </button>
                        </router-link>
                    </div>
                    <div v-else>
                        <router-link
                            v-if="!isTrashDisplayed"
                            v-tooltip="$t('action-edit')"
                            :to="`/users/${user.row.id}`"
                            v-slot="{ navigate }"
                            custom
                        >
                            <button @click="navigate" class="item-actions__button info">
                                <i class="fas fa-edit" />
                            </button>
                        </router-link>
                        <button
                            v-if="!isTrashDisplayed && user.row.group_id !== 'admin'"
                            v-tooltip="$t('action-trash')"
                            class="item-actions__button warning"
                            @click="deleteUser(user.row.id)"
                        >
                            <i class="fas fa-trash" />
                        </button>
                        <button
                            v-if="isTrashDisplayed"
                            v-tooltip="$t('action-restore')"
                            class="item-actions__button info"
                            @click="restoreUser(user.row.id)"
                        >
                            <i class="fas fa-trash-restore" />
                        </button>
                        <button
                            v-if="isTrashDisplayed && user.row.group_id !== 'admin'"
                            v-tooltip="$t('action-delete')"
                            class="item-actions__button danger"
                            @click="deleteUser(user.row.id)"
                        >
                            <i class="fas fa-trash-alt" />
                        </button>
                    </div>
                </div>
            </v-server-table>
        </div>
        <div class="content__footer">
            <button
                class="Users__show-trashed"
                :class="isTrashDisplayed ? 'info' : 'warning'"
                @click="showTrashed()"
            >
                <span v-if="!isTrashDisplayed">
                    <i class="fas fa-trash"></i>
                    {{ $t('open-trash-bin') }}
                </span>
                <span v-if="isTrashDisplayed">
                    <i class="fas fa-eye"></i>
                    {{ $t('display-not-deleted-items') }}
                </span>
            </button>
        </div>
    </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Users';
</style>

<script src="./index.js"></script>
