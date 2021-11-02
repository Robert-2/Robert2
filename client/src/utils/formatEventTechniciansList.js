import moment from 'moment';

const formatEventTechniciansList = (eventTechnicians) => {
    if (!Array.isArray(eventTechnicians) || eventTechnicians.length === 0) {
        return [];
    }

    const technicians = new Map();
    eventTechnicians.forEach(
        ({ technician, id: periodId, start_time: startTime, end_time: endTime, position }) => {
            if (!technician) {
                return;
            }

            const { id, full_name: name, phone } = technician;

            if (!technicians.has(id)) {
                technicians.set(id, { id, name, phone, periods: [] });
            }

            const currentTechnician = technicians.get(id);
            const from = moment.utc(startTime).local();
            const to = moment.utc(endTime).local();
            currentTechnician.periods.push({ id: periodId, from, to, position });
        },
    );

    return Array.from(technicians.values());
};

export default formatEventTechniciansList;
