import type { EventTechnician } from '@/stores/api/events';
import type { Technician } from '@/stores/api/technicians';

export type TechnicianPeriod = {
    id: EventTechnician['id'],
    period: EventTechnician['period'],
    position: EventTechnician['position'],
};

export type TechnicianWithPeriods = {
    id: Technician['id'],
    name: Technician['full_name'],
    phone: Technician['phone'],
    periods: TechnicianPeriod[],
};

const formatEventTechniciansList = (eventTechnicians: EventTechnician[] | null | undefined): TechnicianWithPeriods[] => {
    if (!Array.isArray(eventTechnicians) || eventTechnicians.length === 0) {
        return [];
    }

    const technicians = new Map<EventTechnician['id'], TechnicianWithPeriods>();
    eventTechnicians.forEach(({ technician, id: periodId, period, position }: EventTechnician) => {
        if (!technician) {
            return;
        }

        const { id, full_name: name, phone } = technician;

        if (!technicians.has(id)) {
            technicians.set(id, { id, name, phone, periods: [] });
        }

        technicians.get(id)!.periods.push({ id: periodId, period, position });
    });

    return Array.from(technicians.values());
};

export default formatEventTechniciansList;
