/* eslint-disable import/prefer-default-export */

import hasIncludes from '@/utils/hasIncludes';

interface FileObject {
    name: string;
    size: number;
    type: string | null;
}

export const getIconFromFile = (file: FileObject): string => {
    if (file.type) {
        if (file.type === 'application/pdf') {
            return 'file-pdf';
        }
        if (file.type.startsWith('image/')) {
            return 'file-image';
        }
        if (file.type.startsWith('video/')) {
            return 'file-video';
        }
        if (file.type.startsWith('audio/')) {
            return 'file-audio';
        }
        if (file.type.startsWith('text/')) {
            return 'file-alt';
        }
        if (hasIncludes(file.type, ['zip', 'octet-stream', 'x-rar', 'x-tar', 'x-7z'])) {
            return 'file-archive';
        }
        if (hasIncludes(file.type, ['sheet', 'excel'])) {
            return 'file-excel';
        }
        if (hasIncludes(file.type, ['wordprocessingml.document', 'msword'])) {
            return 'file-word';
        }
        if (hasIncludes(file.type, ['presentation', 'powerpoint'])) {
            return 'file-powerpoint';
        }
    }
    return 'file';
};
