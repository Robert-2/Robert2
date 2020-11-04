# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.10.0 (UNRELEASED)

- Ajoute un filtre sur le calendrier permettant de n'afficher que les événements qui ont du matériel manquant (#42).
- Permet la modification des événements passés dans le calendrier (#41).
- Affiche une alerte dans les événements qui n'ont pas de bénéficiaire, et cache leur bouton "imprimer".
- Trie les personnes (bénéficiaires et techniciens) sur le nom de famille par défaut (#37).

## 0.9.2 (2020-10-13)

- Update dependencies

## 0.9.1 (2020-08-04)

- Fix materials list columns visibility in event step 4 when billing mode 'none' or when event is not billable (#30).

## 0.9.0 (2020-07-31)

- Update dependencies
- Fix totals of items in parks listing, and add total in stock (#6).
- Display an icon (warning) on timeline events when they miss some materials (#16).
- Add a tooltip when hovering events on the timeline with information about event' status.
- Add a column "quantity" on the left of materials choice table in event's step 4 (#19).
- Fix interactive updates of quantities, amounts and buttons in event's materials choice table.
- Make the event summary printable (#15).

## 0.8.1 (2020-07-02)

- Fix color of events in calendar (#11).

## 0.8.0 (2020-06-17)

- Whole project restructuration.
- Add a bash script to help releasing new versions of the projet (Gitlab Issue 77).

## 0.7.2 (2020-04-08)

- Fix double-click problem on calendar timeline, and double-tap on events on touch screens (Gitlab Issue 90).

## 0.7.1 (2020-04-03)

- Use [vue-visjs](https://github.com/sjmallon/vue-visjs) instead of [vue2vis](https://github.com/alexcode/vue2vis) (Gitlab Issue 60).
- Save (debounced) the materials list in events, directly when changes are made (Gitlab Issue 84).
- Improve errors display in UI using Help component (Gitlab Issue 87).
- Improve dates change in first step of event's edition (Gitlab Issue 85).

## 0.7.0 (2020-03-02)

- Add bill-related fields ("is discountable" and "is hidden on bill") in materials edit page (Gitlab Issue 78).
- Add links to beneficiaries and technicians in event details modal window.
- Add a link to OpenStreetMap search on event location in event details modal window.
- Add billing section in event details modal window (Gitlab Issue 59).
- Use tabs in event modal window to display details (infos, materials, bill) (Gitlab Issue 79).
- Add a switch to display only selected materials in event's step 4 (Gitlab Issue 76).
- Sort materials by price in event summaries (Gitlab Issue 69).
- Add support of not billable events and loan mode (Gitlab Issue 80).
- Add company edit form & routes (Gitlab Issue 64).
- Allow beneficiaries to be attached to companies (Gitlab Issue 64).

## 0.6.2 (2020-02-09)

- Fix grand total calculation in event summary (Gitlab Issue 66).
- Fix display of extra-attributes when creating a new material (Gitlab Issue 63).

## 0.6.1 (2020-02-05)

- Fix an error in step 5 of event creation / modification.

## 0.6.0 (2020-02-01)

- Display technicians (assignees) in event's details modal window (Gitlab Issue 56).
- Add a button in calendar header to manually refresh events data (Gitlab Issue 50).
- Shrink menu sidebar when screen si smaller, and hide it when smallest (Gitlab Issue 53).
- Improve responsive design of menus & header (Gitlab Issue 53).
- Fix visitor access to calendar and user's view (Gitlab Issue 58).
- Improve log in / log out messages, and remember last visited page.
- Add a button in Attributes edit page, to go back to the last edited material (Gitlab Issue 51).
- Improve listings by showing extra columns (Gitlab Issue 55).

## 0.5.1 (2019-12-29)

- Hide "loading" icon when resizing/moving an event is done (Gitlab Issue 49).
- Disable "center on today" button in calendar, when the current centered date is already today.
- Filter materials with quantity of 0 when saving event at step 4 (Gitlab Issue 48).
- Fix display of missing materials count in event summaries (Gitlab Issue 48).
- Improve interface of event summaries, with more messages when there is no materials.

## 0.5.0 (2019-12-29)

- Add _tags_ management page (Gitlab Issue 44).
- Use tags assignment on materials (Gitlab Issue 44).
- Filter materials by _tags_ in listing page (Gitlab Issue 44).
- Add fourth step of _Events_ creation / modification: materials (Gitlab Issue 24).
- Improve mini-summary of event creation / modification by displaying a red border when event has not-saved modifications.
- Make the content scroll instead of whole app.
- Improve UX of multiple-items selector (loading, error message).
- Add last step of _Events_ creation / modification: final summary page (Gitlab Issue 25).
- Add extra informations to material's modification page (Gitlab Issue 43).
- Add a page to manage extra informations (attributes) (Gitlab Issue 43).
- Display missing materials in event's summary (Gitlab Issue 47).
- Add a datepicker on the calendar to center the view on a specific date (Gitlab Issue 45). Help section was moved to the bottom of the view.
- Memorize (localStorage) the last period viewed in calendar (Gitlab Issue 46).

## 0.4.1 (2019-10-27)

- Fix CSS differences between Chrome / Firefox and Build / serve.

## 0.4.0 (2019-10-26)

- Add _parks_ managment (index & edit) pages (Gitlab Issue 35).
- Add filter by _park_ in materials list page (Gitlab Issue 35).
- Use settings passed by the Robert2-api server (Gitlab Issue 36).
- Redesign event's edition breadcrumbs and add a mini summary slot.
- Use global state for Parks, Categories and Countries (Gitlab Issue 39).
- Use ServerTable from `vue-tables-2` component, to be able to use server-side pagination (Gitlab Issue 37).
- Add a way to display soft-deleted items in listings, and to restore or permanently delete elements (Gitlab Issue 40).
- Use new fetching system for events in calendar (specify period when fetching) to optimize loading.

## 0.3.2 (2019-10-05)

- Update all dependencies to latest versions, and use `vue-cli 3` (Gitlab Issue 34).
- Improve locales files structure for better i18n handling in code.

## 0.3.1 (2019-09-29)

- Fix a small CSS bug when built for production.

## 0.3.0 (2019-09-29)

- Improve login system
- Replace broken Plantt module by Vue2Vis to display event in a timeline (Gitlab Issue 19).
- Retreive all events from the API to display on the timeline (Gitlab Issue 20)
- Open event in a modal window when double-clicking on it in the timeline. Basic
  event's informations are displayed after a fetch from the API. (Gitlab Issue 26)
- Add _Technicians_ listing page, _Technician_ form to add and edit, and technicians deletion (Gitlab Issue 22).
- Add first step of _Events_ creation / modification: required informations (Gitlab Issue 21).
- Implement events steps system with a breadcrumb module.
- Add the `MultipleItem` component.
- Add second step of _Events_ creation / modification: beneficiaries (Gitlab Issue 23).
- Add third step of _Events_ creation / modification: technicians (assignees) (Gitlab Issue 31).
- Improve login page presentation, and add a loading when submit login (Gitlab Issue 28).
- Improve tables design.
- Add country select in Person Form.
- Improve SweetAlert design and Categories page.
- Add current users's profile modification page (Gitlab Issue 29).
- Add current users's settings modification page (Gitlab Issue 29).

## 0.2.3 (2019-08-07)

- Fix i18n locale setting at startup

## 0.2.2 (2019-07-04)

- Optimize build.

## 0.2.1 (2019-07-04)

- Add `dist/` (build result) folder to git.

## 0.2.0 (2019-07-04)

- Make the _"search bar"_ component usable in whole application, and
use it in "Users" page (Gitlab Issue 6).
- Add a "_help_" global component and use it in "Calendar" and "Users" page (Gitlab Issue 4).
- Switch from `vue-resource` to `axios` module, for HTTP Ajax system (Gitlab Issue 14).
- Improve _error messages_ on login page (Gitlab Issue 12).
- Add `v-tooltip` to dependencies, and use it in _side bar_, _main header_ and
_Users_ page (on actions buttons) (Gitlab Issue 5).
- Add `vue-tables-2` to dependencies, to have tables with header, order by and
pagination. And, use it in _Users_ page (Gitlab Issue 1, #2 and #3).
- Add _User_ creation / modification page (Gitlab Issue 11).
- Add _User_ soft delete (Gitlab Issue 15).
- Add _Beneficiaries_ page (listing) (Gitlab Issue 8).
- Add _Beneficiaries_ creation / modification page (Gitlab Issue 9).
- Add _Materials_ page (listing), with filter by categories & sub-categories (Gitlab Issue 16).
- Add _Materials_ creation / modification page (Gitlab Issue 17).
- Add _Categories_ creation / modification page (Gitlab Issue 18).
- Use [external Plantt](https://github.com/polosson/vue-plantt) component (Gitlab Issue 7).

## 0.1.0 (2017-12-16)

- Initialize App using _Vue.js CLI_.
- Add global state management (_vuex_).
- Add _i18n_ management.
- First contact with API (_auth user_).
- Add _Users list_ page.
- Use _sweet modal_ for alerts and modals.
- Add basic calendar (_Plantt for Vue.js_ not complete yet).
- Add a _changelog_, a _contributing_ file, and rewrite a bit the _readme_.
- Update dependencies and add the _.gitlab-ci.yml_ file.
