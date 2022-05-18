import config from '@/globals/config';
import getFileError from '@/utils/getFileError';

describe('getFileError', () => {
    it('returns null with a file OK', () => {
        const file = new File(['fakeContent'], 'test.txt', { type: 'text/plain' });
        expect(getFileError(file)).toBeNull();
    });

    it('returns null with an empty file', () => {
        const file = new File([], 'test.txt', { type: 'text/plain' });
        expect(getFileError(file)).toBeNull();
    });

    it('returns "type-not-allowed" with a file of not allowed type', () => {
        const file = new File(['fakeContent'], 'test.js', { type: 'text/javascript' });
        expect(getFileError(file)).toEqual('type-not-allowed');
    });

    it('returns "size-exceeded" with a file that is too big', () => {
        const file = new File(['fakeContent', 'too big'], 'test.jpeg', { type: 'image/jpeg' });
        Object.defineProperty(file, 'size', { value: config.maxFileUploadSize + 1 });
        expect(getFileError(file)).toEqual('size-exceeded');
    });

    it('returns "already-exists" with a file that has the same name of one given in an array of files', () => {
        const existingFiles = [
            new File(['fakeContent1'], 'test1.txt', { type: 'text/plain' }),
            new File(['fakeContent2'], 'test2.txt', { type: 'text/plain' }),
            new File(['fakeContent3'], 'test3.txt', { type: 'text/plain' }),
        ];
        const file = new File(['fakeContent2'], 'test2.txt', { type: 'text/plain' });
        expect(getFileError(file, existingFiles)).toEqual('already-exists');
    });
});
