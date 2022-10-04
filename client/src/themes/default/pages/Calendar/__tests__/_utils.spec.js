import moment from 'moment';
import { formatEvent } from '../_utils';

describe('Calendar/utils.formatEvent', () => {
    test('returns data of event formatted for timeline usage with classes and popups texts', () => {
        const rawEvent = {
            id: 1,
            title: 'Test event',
            start_date: '2019-10-01 00:00:00',
            end_date: '2019-10-02 23:59:59',
            is_confirmed: false,
            is_archived: false,
            has_missing_materials: null,
            is_return_inventory_done: false,
            has_not_returned_materials: true,
            location: 'Testville',
            beneficiaries: [
                { id: 1, full_name: 'Jean Benef' },
            ],
            technicians: [
                {
                    id: 1,
                    start_time: '2019-10-01 08:00:00',
                    end_time: '2019-10-01 12:00:00',
                    position: 'Régisseur',
                    technician: {
                        id: 1,
                        first_name: 'Marc',
                        last_name: 'Tekos',
                        full_name: 'Marc Tekos',
                    },
                },
                {
                    id: 2,
                    start_time: '2019-10-02 14:00:00',
                    end_time: '2019-10-02 23:00:00',
                    position: 'Régisseur',
                    technician: {
                        id: 1,
                        first_name: 'Marc',
                        last_name: 'Tekos',
                        full_name: 'Marc Tekos',
                    },
                },
            ],
        };

        const result1 = formatEvent(rawEvent, (s) => s);
        expect(result1).toBeDefined();
        expect(result1.title).toEqual(
            '<strong>Test event</strong>' +
            '\n\n<i class="fas fa-map-marker-alt"></i> Testville' +
            '\n<i class="fas fa-clock"></i> from-date-to-date' +
            '\n<i class="fas fa-address-book"></i> for Jean Benef' +
            '\n<i class="fas fa-people-carry"></i> with Marc Tekos' +
            '\n\n<i class="fas fa-exclamation-triangle"></i> @event.statuses.has-not-returned-materials' +
            '\n<i class="fas fa-history"></i> @event.statuses.is-past' +
            '\n<i class="fas fa-exclamation-triangle"></i> @event.statuses.needs-its-return-inventory',
        );
        expect(result1.content).toEqual([
            '<i class="fas fa-question"></i> <i class="fas fa-exclamation-triangle"></i> Test event',
            '<i class="fas fa-map-marker-alt"></i> Testville',
        ].join(' - '));
        expect(result1.className).toEqual(
            'timeline-event timeline-event--past timeline-event--not-confirmed timeline-event--with-warning',
        );
        expect(result1.editable).toBe(true);
        expect(result1.hasMissingMaterials).toBe(null);
        expect(result1.isInventoryDone).toBe(false);
        expect(result1.hasNotReturnedMaterials).toBe(true);
        expect(result1.start).toBeInstanceOf(moment);
        expect(result1.end).toBeInstanceOf(moment);

        // - Modifie les informations du "summary" (1)
        const result2 = formatEvent(rawEvent, (s) => s, { showLocation: false, showBorrower: true });
        expect(result2.content).toEqual([
            '<i class="fas fa-question"></i> <i class="fas fa-exclamation-triangle"></i> Test event',
            '<i class="fas fa-user"></i> Jean Benef',
        ].join(' - '));

        // - S'il y a plusieurs bénéficiaires et qu'on veut les afficher dans le "summary"
        //   => On affiche une icône spécifique et on indique combien il y a d'autres bénéficiaires
        const rawEvent2 = {
            ...rawEvent,
            beneficiaries: [
                { id: 3, full_name: 'Marcel Tunasse' },
                { id: 2, full_name: 'Kévin Incorporated', company: { legal_name: 'Foo inc.' } },
                { id: 1, full_name: 'Jean Benef' },
            ],
        };
        const result3 = formatEvent(rawEvent2, (s) => s, { showBorrower: true });
        expect(result3.content).toEqual([
            '<i class="fas fa-question"></i> <i class="fas fa-exclamation-triangle"></i> Test event',
            '<i class="fas fa-map-marker-alt"></i> Testville',
            '<i class="fas fa-users"></i> Marcel Tunasse and-n-others',
        ].join(' - '));

        // - S'il n'y a qu'un seul bénéficiaire et qu'il représente une société
        //   => On affiche le nom de la société et on change l'icône.
        const rawEvent3 = {
            ...rawEvent,
            beneficiaries: [
                { id: 1, full_name: 'Kévin Incorporated', company: { legal_name: 'Foo inc.' } },
            ],
        };
        const result4 = formatEvent(rawEvent3, (s) => s, { showLocation: false, showBorrower: true });
        expect(result4.content).toEqual([
            '<i class="fas fa-question"></i> <i class="fas fa-exclamation-triangle"></i> Test event',
            '<i class="fas fa-industry"></i> Foo inc.',
        ].join(' - '));
    });
});
