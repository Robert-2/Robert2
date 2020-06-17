# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.8.0 (2020-06-17)

- Whole project restructuration.

## 0.7.2 (2020-04-08)

- Update webClient to version `0.7.2`.

## 0.7.1 (2020-04-04)

- Escape warning when deleting a PDF and permissions denied.
- Fix errors in English version of installation wizard.
- Fix missing materials bad counting in events (#96).
- Allow extra characters in companies' locality field (#98).
- Allow to skip installation step 6 (admin user creation) if some admins already exist in DB (#87).
- Fix migrations when using a prefix for tables (#97).
- Ignore execution time limit when doing migrations in step 5 of install wizard (#104).
- Update webClient to version `0.7.1`.

## 0.7.0 (2020-03-02)

- Event's location is now optional at creation (#84).
- Sub-categories can now have very short names (at least 2 characters still) (#86).
- Fix an error when installing the app using an existing well structured database (#83).
- Add a way to create PDFs from HTML files (#76).
- Add API endpoints to get, create and delete bills (#77).
- Add `is_discountable` field in `materials` table (#90).
- Fix CORS support to help dev of webclient.
- Remove forcing of SSL from public htaccess.
- Add a filter to materials getAll() to retreive only the material that is attached to an event.
- Add "company" step in installation wizard, and simplify complex steps (#91).
- Add the choice of billing mode in installation wizard, and add "is_billable" field to events (#57).
- Search materials in listings by name and reference (#89).
- Use tags for companies (#92).
- Allow sort persons by company legal name (#93).
- Inverse first name and last name to display person's full name.

## 0.6.4 (2020-02-09)

- Update webClient to version `0.6.2`.

## 0.6.3 (2020-02-07)

- Fix version of webClient (`0.6.1`) in entrypoint's twig view.

## 0.6.2 (2020-02-05)

- Update webClient to version `0.6.1`.

## 0.6.1 (2020-02-05)

- Fix logo in apidoc template
- Fix getAll countries to not be paginated
- Fix release script and ignore release ZIP file

## 0.6.0 (2020-02-01)

- Add _LICENCE.md_ file at project's root.
- Add a bash script to create a release ZIP file automatically (#82).
- Add countries list to initialize database data at install (#80).
- Fix and improve install wizard (#81).
- Fix ACL for Visitors (#79).
- Fix error when creating parks without country (#69).

## 0.5.2 (2019-12-29)

- Fix material modification bug when saving tags (#68).

## 0.5.1 (2019-12-29)

- Fix materials event save when quantity = 0 (#66).
- Fix tags name field validation.
- Limit _out-of-order_ quantity to _stock quantity_, and disallow negative numbers for _stock quantity_ (#67).

## 0.5.0 (2019-12-29)

- Fix `setTags` method in `Taggable` trait.
- Improve taggable _get all filtered_ method.
- Get materials remaining quantities for a given period (#63).
- Fix error when save materials with tags in payload (#62).
- Extend materials data with ability to assign it arbitrary attributes (#19).
- Add an endpoint to check missing materials of an event (#64).
- Update webClient to version `0.5.0`.

## 0.4.1 (2019-10-27)

- Update webClient to version `0.4.1`.

## 0.4.0 (2019-10-26)

- Add filter of materials by park (#56).
- Expose some configuration data to front-end via `__SERVER_CONFIG__` javascript var (#54).
- Add a step in install wizard for extra settings.
- Redesign install wizard a bit to improve UX.
- Add informations  `person_id`, `company_id`, `street`, `postal_code`, `locality`, `country_id`,
  `opening_hours` and `notes` to parks (#53).
- Add main park's name in _"settings"_ step of installation wizard (#53).
- Add a command-line tool to quickly import data from Robert 0.6 (#38). At the moment, only materials
  and technicians can be imported this way.
- Add support of `orderBy` and `ascending` query-strings in controllers `getAll()` methods (#59).
- Change manner to search for an entity: Route `.../search` is replaced by the use of query-strings
  `search` and `searchBy` for searching (#60).
- Fix database potential bug due to MySQL charset `utf8mb4` and indexed fields limit (#52).
- Remove pagination when fetching events, use start and end dates instead to limit the results (#51).

## 0.3.12 (2019-10-05)

- Update dependencies.
- Update webClient to version `0.3.2`.

## 0.3.11 (2019-09-29)

- Update webClient to version `0.3.1`.

## 0.3.10 (2019-09-29)

- Update webClient to version `0.3.0`.

## 0.3.9 (2019-09-25)

- Add `countries` API endpoint.

## 0.3.8 (2019-09-21)

- Add possibility to save Events with their Assignees, Beneficiaries and Materials in the same PUT request.
- Use custom pivot to use quantity for events-materials relationship.
- Update postman collection & API documentation.

## 0.3.7 (2019-09-16)

- Fix login (`TokenController` and `User` model) to accept pseudo as well as e-mail for credentials.

## 0.3.6 (2019-09-15)

- Fix Event model, and Events controller's `update` method.

## 0.3.5 (2019-09-12)

- Fix unit tests and JS configuration for Staging.

## 0.3.4 (2019-09-12)

- Fix some unwanted validation errors in models Event & Person.
- Update client build version to latest `0.2.3` (intermediary build)

## 0.3.3 (2019-08-07)

- Update client build version to `0.2.3`

## 0.3.2 (2019-08-05)

- Fix a unit test

## 0.3.1 (2019-08-03)

- Add Cookie support for JWT Auth, when Auth header not found.

## 0.3.0 (2019-07-04)

- Integrate [Robert2-WebClient](https://gitlab.com/robertmanager/Robert2-WebClient) to serve a nice UI (#50).
- Fix a PHP notice in install process (#48).
- Modify unicity constraint on sub-categories: two names can be the same if not in the same parent category (#49).

## 0.2.3 (2019-07-01)

### Fixes

- Fix persons validation
- Fix existing Tags handling when bulk add tags
- Fix a typo in French i18n locale
- Set orderBy for hasMany-related models of Category and User
- Add possibility to get all materials by category and sub-category

## 0.2.2 (2019-02-05)

### Fixes

- Add `httpAuthHeader` into settings, to allow custom header name for HTTP Authorization Bearer token data (#46).
- Fix some issues with `.htaccess` files.

## 0.2.1 (2019-02-03)

### Fixes

- Improve `.htaccess` files.
- Fix some issues when deploying the application on shared servers.

## 0.2.0 (2019-02-02)

### New features

- Use [Docker](https://www.docker.com/) containers to have unified environments (php & mysql) for dev (#33).
- Use [Phinx](https://phinx.org/) to handle database migrations (#17).
- Add `Event` model and API endpoints (#26).
- Use config's `prefix` optional setting for tables names (#37).
- Add groups of users, and create "admin", "member" & "visitor" groups (#18).
- Add `tags` for `material` entity (#22).
- Add API documentation generated from Postman collection (only version 1 at the moment) (#11).
- Add `UserSettings` model and API enpoints (#36).
- Add i18n module and translate the validation errors messages (#41).
- Translate the installation wizard pages (#40).
- Use custom token validity duration, according to value set in user settings (#21).
- Add API endpoints to restore soft-deleted records (#43).
- ACL: limit access to certain resources' actions by user groups (#39).
- Add API endpoints to manage sub-categories independently from categories (#44).

### Fixes

- Fix `sub_category_id` field of `materials` table, which can now be `null`.
- Remove password from Auth Token response data.
- Fix usage of `displayErrorDetails` setting.
- Use `public/version.txt` to centralize version number that will be displayed in views.
- Throw an error when fixtures dataseed fails, in order to stop unit tests if incomplete data (#35).
- Don't serve the soft-deleted records when querying data (#42)

## 0.1.0 (2018-11-24)

First Robert API's milestone. Yay!

This is the very first time we can use the Robert2-api, with JWT authentication in place, and several basic entities available, like users, persons, companies, tags, categories, parks and materials. Check this in details below!

### New features

- Basic __app__ (Slim 3 Framework) structure in place.
- First API __auth system__ (JWT).
- Integration __testing__ system in place (#1).
- Use a __configuration manager__ (php class) (#5).
- Add `install/` and `apidoc/` routes, and create __base of UI__ for those views using _twig_ (#6).
- Create an __installation wizard__ : initiate configuration, create database and its structure, and create first user (#7).
- Add step to install wizard : __database structure__ creation, using SQL files (#8).
- Use Illuminate Database and __Eloquent ORM__ for all models, and adapt unit tests (#4).
- Add `Category` & `SubCategory` models and API endpoints (#14).
- Use `password_hash` and `password_verify` in `User` model (#20).
- Improve models with mutators and values cast (#30).
- Use JWT Auth Middleware to authenticate requests for api routes using Json Web Token (#32).
- Add `Park` model and API endpoints (#13).
- Add `Material` model and API endpoints (#15).
- Set pagination in controllers (not models) (#31).
- Add `update` and `delete` API endoints and controller methods (#27).

### Fixes

- _n/a_
