import { DocumentSchema } from '@/stores/api/documents';
import data from '@fixtures/documents';

import type { SafeParseSuccess } from 'zod';

describe('Documents Api', () => {
    test('Schema', () => {
        data.default().forEach((datum: any) => {
            const result = DocumentSchema.safeParse(datum);
            expect(result.success).toBeTruthy();
            expect((result as SafeParseSuccess<unknown>).data).toMatchSnapshot();
        });
    });
});
