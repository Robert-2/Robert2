# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.8.0 (2020-06-17)

- Whole project restructuration.
- Add a bash script to help releasing new versions of the projet (#77).

## 0.7.2 (2020-04-08)

- Fix double-click problem on calendar timeline, and double-tap on events on touch screens (#90).

## 0.7.1 (2020-04-03)

- Use [vue-visjs](https://github.com/sjmallon/vue-visjs) instead of [vue2vis](https://github.com/alexcode/vue2vis) (#60).
- Save (debounced) the materials list in events, directly when changes are made (#84).
- Improve errors display in UI using Help component (#87).
- Improve dates change in first step of event's edition (#85).

## 0.7.0 (2020-03-02)

- Add bill-related fields ("is discountable" and "is hidden on bill") in materials edit page (#78).
- Add links to beneficiaries and technicians in event details modal window.
- Add a link to OpenStreetMap search on event location in event details modal window.
- Add billing section in event details modal window (#59).
- Use tabs in event modal window to display details (infos, materials, bill) (#79).
- Add a switch to display only selected materials in event's step 4 (#76).
- Sort materials by price in event summaries (#69).
- Add support of not billable events and loan mode (#80).
- Add company edit form & routes (#64).
- Allow beneficiaries to be attached to companies (#64).

## 0.6.2 (2020-02-09)

- Fix grand total calculation in event summary (#66).
- Fix display of extra-attributes when creating a new material (#63).

## 0.6.1 (2020-02-05)

- Fix an error in step 5 of event creation / modification.

## 0.6.0 (2020-02-01)

- Display technicians (assignees) in event's details modal window (#56).
- Add a button in calendar header to manually refresh events data (#50).
- Shrink menu sidebar when screen si smaller, and hide it when smallest (#53).
- Improve responsive design of menus & header (#53).
- Fix visitor access to calendar and user's view (#58).
- Improve log in / log out messages, and remember last visited page.
- Add a button in Attributes edit page, to go back to the last edited material (#51).
- Improve listings by showing extra columns (#55).

## 0.5.1 (2019-12-29)

- Hide "loading" icon when resizing/moving an event is done (#49).
- Disable "center on today" button in calendar, when the current centered date is already today.
- Filter materials with quantity of 0 when saving event at step 4 (#48).
- Fix display of missing materials count in event summaries (#48).
- Improve interface of event summaries, with more messages when there is no materials.

## 0.5.0 (2019-12-29)

- Add _tags_ management page (#44).
- Use tags assignment on materials (#44).
- Filter materials by _tags_ in listing page (#44).
- Add fourth step of _Events_ creation / modification: materials (#24).
- Improve mini-summary of event creation / modification by displaying a red border when event has not-saved modifications.
- Make the content scroll instead of whole app.
- Improve UX of multiple-items selector (loading, error message).
- Add last step of _Events_ creation / modification: final summary page (#25).
- Add extra informations to material's modification page (#43).
- Add a page to manage extra informations (attributes) (#43).
- Display missing materials in event's summary (#47).
- Add a datepicker on the calendar to center the view on a specific date (#45). Help section was moved to the bottom of the view.
- Memorize (localStorage) the last period viewed in calendar (#46).

## 0.4.1 (2019-10-27)

- Fix CSS differences between Chrome / Firefox and Build / serve.

## 0.4.0 (2019-10-26)

- Add _parks_ managment (index & edit) pages (#35).
- Add filter by _park_ in materials list page (#35).
- Use settings passed by the Robert2-api server (#36).
- Redesign event's edition breadcrumbs and add a mini summary slot.
- Use global state for Parks, Categories and Countries (#39).
- Use ServerTable from `vue-tables-2` component, to be able to use server-side pagination (#37).
- Add a way to display soft-deleted items in listings, and to restore or permanently delete elements (#40).
- Use new fetching system for events in calendar (specify period when fetching) to optimize loading.

## 0.3.2 (2019-10-05)

- Update all dependencies to latest versions, and use `vue-cli 3` (#34).
- Improve locales files structure for better i18n handling in code.

## 0.3.1 (2019-09-29)

- Fix a small CSS bug when built for production.

## 0.3.0 (2019-09-29)

- Improve login system
- Replace broken Plantt module by Vue2Vis to display event in a timeline (#19).
- Retreive all events from the API to display on the timeline (#20)
- Open event in a modal window when double-clicking on it in the timeline. Basic
  event's informations are displayed after a fetch from the API. (#26)
- Add _Technicians_ listing page, _Technician_ form to add and edit, and technicians deletion (#22).
- Add first step of _Events_ creation / modification: required informations (#21).
- Implement events steps system with a breadcrumb module.
- Add the `MultipleItem` component.
- Add second step of _Events_ creation / modification: beneficiaries (#23).
- Add third step of _Events_ creation / modification: technicians (assignees) (#31).
- Improve login page presentation, and add a loading when submit login (#28).
- Improve tables design.
- Add country select in Person Form.
- Improve SweetAlert design and Categories page.
- Add current users's profile modification page (#29).
- Add current users's settings modification page (#29).

## 0.2.3 (2019-08-07)

- Fix i18n locale setting at startup

## 0.2.2 (2019-07-04)

- Optimize build.

## 0.2.1 (2019-07-04)

- Add `dist/` (build result) folder to git.

## 0.2.0 (2019-07-04)

- Make the _"search bar"_ component usable in whole application, and
use it in "Users" page (#6).
- Add a "_help_" global component and use it in "Calendar" and "Users" page (#4).
- Switch from `vue-resource` to `axios` module, for HTTP Ajax system (#14).
- Improve _error messages_ on login page (#12).
- Add `v-tooltip` to dependencies, and use it in _side bar_, _main header_ and
_Users_ page (on actions buttons) (#5).
- Add `vue-tables-2` to dependencies, to have tables with header, order by and
pagination. And, use it in _Users_ page (#1, #2 and #3).
- Add _User_ creation / modification page (#11).
- Add _User_ soft delete (#15).
- Add _Beneficiaries_ page (listing) (#8).
- Add _Beneficiaries_ creation / modification page (#9).
- Add _Materials_ page (listing), with filter by categories & sub-categories (#16).
- Add _Materials_ creation / modification page (#17).
- Add _Categories_ creation / modification page (#18).
- Use [external Plantt](https://github.com/polosson/vue-plantt) component (#7).

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
