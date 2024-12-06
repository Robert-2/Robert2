import type { EventMaterial } from '@/stores/api/events';

export type EventMaterialWithQuantityDetails = (
    & Omit<EventMaterial, 'quantity' | 'quantity_returned' | 'quantity_returned_broken'>
    & { quantity: Record<'out' | 'returned' | 'missing' | 'broken', number> }
);
