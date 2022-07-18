import { AUTHORIZED_FILE_TYPES } from '@/globals/constants';
import config from '@/globals/config';

type FileErrorCode = 'type-not-allowed' | 'size-exceeded' | 'already-exists';

const getFileError = (file: File, existingFiles?: File[]): FileErrorCode | null => {
    const { type, size, name } = file;

    if (!AUTHORIZED_FILE_TYPES.includes(type)) {
        return 'type-not-allowed';
    }

    if (size > config.maxFileUploadSize) {
        return 'size-exceeded';
    }

    if (!existingFiles || existingFiles.length === 0) {
        return null;
    }

    const fileExists = existingFiles.some(({ name: existingName }: File) => existingName === name);
    if (fileExists) {
        return 'already-exists';
    }

    return null;
};

export default getFileError;
