import type { Event } from '@/stores/api/events';
import type { Role } from '@/stores/api/roles';
import type { TechnicianEvent } from '@/stores/api/technicians';

export type AssignmentGroupEvent = {
    event: Event,
    assignments: TechnicianEvent[],
};

export type AssignmentGroupRole = {
    role: Role | null,
    assignments: TechnicianEvent[],
};
