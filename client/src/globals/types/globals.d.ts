type GlobalConfig = {
    baseUrl: string,
    version: string,
    billingMode: 'all' | 'partial' | 'none',
    defaultLang: string,
    api: {
        url: string,
        headers: Record<string, string>,
    },
    auth: {
        cookie: string,
        timeout: number | null,
    },
    currency: {
        symbol: string,
        name: string,
        iso: string,
    },
    companyName: string | null,
    defaultPaginationLimit: number,
    maxConcurrentFetches: number,
    maxFileUploadSize: number,
    authorizedFileTypes: string[],
    authorizedImageTypes: string[],
    colorSwatches: string[] | null,
};

declare var __SERVER_CONFIG__: GlobalConfig | undefined;

type ServerMessage = {
    type: 'success' | 'info' | 'error',
    message: string,
};

declare var __SERVER_MESSAGES__: ServerMessage[] | undefined;
