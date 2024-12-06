import type { RawGlobalConfig } from '../config';

declare global {
    type ServerMessage = {
        type: 'success' | 'info' | 'error',
        message: string,
    };

    declare var __SERVER_CONFIG__: RawGlobalConfig | undefined;
    declare var __SERVER_MESSAGES__: ServerMessage[] | undefined;
}
