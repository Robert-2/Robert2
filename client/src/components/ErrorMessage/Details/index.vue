<template>
    <div class="ErrorDetails">
        <div class="ErrorDetails__header">
            <h2 class="ErrorDetails__title">
                {{ $t('errors.details-title') }}
            </h2>
            <button class="ErrorDetails__btn-close" @click="$emit('close')">
                <i class="fas fa-times" />
            </button>
        </div>
        <div class="ErrorDetails__main">
            <p>
                {{ $t('errors.details-intro1') }}
                {{ $t('errors.details-intro2') }}
                <a href="https://forum.robertmanager.org" target="_blank">
                    {{ $t('errors.details-intro-forum') }}
                </a>
                {{ $t('errors.details-intro3') }}
                <a href="https://github.com/Robert-2/Robert2/issues" target="_blank">Github</a>.
            </p>
            <p v-if="!details" class="ErrorDetails__no-details-info">
                <i class="fas fa-info-circle" />
                {{ $t('errors.details-intro-not-detailed') }}
            </p>
            <hr class="ErrorDetails__separator" />
            <div class="ErrorDetails__content" ref="errorContent">
                <div v-if="requested">
                    <h3 class="ErrorDetails__subtitle">#### {{ $t('errors.details-request') }}</h3>
                    <p class="ErrorDetails__request">`{{ requested }}`</p>
                </div>
                <h3 class="ErrorDetails__subtitle">
                    #### {{ $t('errors.details-message') }}
                    (<span class="ErrorDetails__code">{{ code }}</span>) :
                </h3>
                <p class="ErrorDetails__message">`{{ message }}`</p>
                <div v-if="file.length > 0">
                    <h3 class="ErrorDetails__subtitle">#### {{ $t('errors.details-file') }}</h3>
                    <p class="ErrorDetails__file">`{{ file }}`</p>
                </div>
                <div v-if="trace.length > 0">
                    <h3 class="ErrorDetails__subtitle">
                        #### {{ $t('errors.details-stacktrace') }}
                    </h3>
                    <div class="ErrorDetails__trace">
                        >! Details<br />
                        ```log<br />
                        <div v-for="(traceItem, index) in trace" :key="index" class="ErrorDetails__trace-item">
                            <span class="ErrorDetails__trace-item__index">- {{ index }}:&nbsp;</span>
                            <span class="ErrorDetails__trace-item__info">
                                <span v-if="traceItem.class">{{ traceItem.class }}::</span>{{ traceItem.function }}
                                <br />
                            </span>
                            <span v-if="traceItem.file" class="ErrorDetails__trace-item__info">
                                File: {{ traceItem.file }}, line {{ traceItem.line }}
                            </span>
                        </div>
                        ```
                    </div>
                </div>
            </div>
            <hr class="ErrorDetails__separator" />
            <div class="ErrorDetails__footer">
                <p v-if="isCopied" class="ErrorDetails__is-copied">
                    <i class="fas fa-check" />
                    {{ $t('copied-in-clipboard') }}
                </p>
                <button @click="copyErrorContent" class="info">
                    <i class="fas fa-clipboard" />
                    {{ $t('copy-to-clipboard') }}
                </button>
                <button @click="$emit('close')">
                    <i class="fas fa-times" />
                    {{ $t('close') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script src="./index.js"></script>
