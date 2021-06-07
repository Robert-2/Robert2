# Changelog

Tous les changements notables sur le projet sont documentés dans ce fichier.

Ce projet adhère au principe du [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.14.0 (UNRELEASED)

- Corrige l'affichage de la valeur de remplacement du matériel dans les fiches de sortie en mode "flat" (#156).
- Ajoute la possibilité de vérifier que tout le matériel est bien retourné à la fin d'un événement (#4).
- Simplifie la signification des couleurs des événements dans le calendrier.
- Utilise des icônes cohérents pour le statut des événements dans le calendrier et la fenêtre d'événement.
- Ajoute la possibilité d'imprimer (en PDF) une liste de tout le matériel (ou de chaque parc séparément), à des fins d'inventaire (#149).
- Ajoute la possibilité d'archiver un événement, s'il est passé et que son inventaire de retour a été effectué (#152) (👏 @adamlarat).
- Ajoute des données aux unités de matériel, ainsi que la gestion de leurs états (Premium #21).
- Ajoute la gestion des paramètres des fiches de sortie, en ajoutant la possibilité de mettre un texte personnalisé en bas de page des fiches de sortie (#150).

## 0.13.3-premium (2021-05-27)

- Corrige l'affichage des étiquettes et utilise une police monospaced (Premium #42).
- Corrige les quantités des unités affichées dans la fiche de sortie en PDF quand le mode d'affichage est `parks` (Premium #43).

## 0.13.2-premium (2021-05-25)

- Corrige le fonctionnement des filtres à l'étape 4 de l'edition d'un événement.
- Corrige le filtrage par parc pour les unités (Premium #37).

## 0.13.1-premium (2021-05-21)

- Améliore la prise en charge des scanettes.

## 0.13.0-premium (2021-05-20)

- Corrige un problème avec le nom de la base de données de test (#128 et #129).
- Ajoute la création / suppression de devis pour les événements (#5).
- __[CHANGEMENT CRITIQUE]__ Robert2 requiert maintenant au minimum PHP 7.3 pour fonctionner (#78).
- Ajoute le support de la version 8.0 de PHP (#71).
- Ajoute la possibilité de renseigner une référence (numéro client) aux bénéficiaires (#122).
- Améliore les données affichées dans les PDF (fiches de sortie, devis et factures), en y ajoutant la référence
  (numéro client) du bénéficiaire (voir #122) et les numéros de téléphone des techniciens et des bénéficiaires.
- Corrige l'affichage des numéros légaux de l'entreprise (SIRET, etc.) sur les devis et factures.
- Corrige le nom des fichiers uploadés comme documents du matériel pour qu'il conserve son extension (#132).
- N'affiche plus les tags protégés (tags système) dans la page des étiquettes, pour éviter les confusions (#134).
- Accorde en nombre le terme "durée X jour(s)" dans les événements (#135).
- Corrige les problèmes d'affichage de la page de gestion des caractéristiques spéciales de matériel (#133).
- Empêche la suppression d'un événement si celui-ci est confirmé, même si la poubelle est affichée (#137).
- Corrige le problème d'affichage des titres des pages quand on change d'onglet (#142).
- Affiche la description de l'événement dans la fiche de sortie en PDF et améliore son affichage à
  l'étape 5 de la modification d'événement (#139).
- Permet la configuration du type d'affichage du matériel dans les fiches de sortie, pour le classer soit par
  sous-catégories, soit par parcs, ou bien sans classement particulier (#139).
- Ajoute la possibilité de renseigner un poste occupé pour chaque technicien d'un événement (#140).
- Permet l'ajout d'une photo associée au matériel (#138).
- Adapte la page de login avec le terme "Premium" sous le logo, et la licence fermée dans le footer.
- Affiche un message dans la page des disponibilités quand le matériel n'est jamais sorti (Premium #35).
- Utilise une "référence" pour identifier les unités, en gardant le n° de série qui devient facultatif (Premium #22).

## 0.12.2-premium (2021-04-19)

- Corrige un bug sous Firefox avec le séparateur `/` dans les code-barres (rétro-compatible).

## 0.12.1-premium (2021-04-14)

- Corrige la prise en charge des scanettes avec entrée QWERTY.

## 0.12.0 (2021-03-29)

- Améliore le calcul du matériel restant dans les événements.
- Ajoute la possibilité de limiter les caractéristiques spéciales du matériel par catégorie (#91).
- Ajoute le type "date" aux caractéristiques spéciales du matériel (#90).
- Permet l'envoi de documents (fichiers PDF, images JPEG ou PNG) associés à du matériel (#92).
- Ajoute la possibilité d'afficher les quantités de matériel disponibles pour une date donnée, dans le listing du matériel (#93).
- Corrige le lien vers le repo (Github au lieu de Gitlab) dans la modale des détails d'erreur (#97).
- Dans l'édition d'un événement, la modification de la date de début ne change plus la date de fin automatiquement (#99).
- Affiche certains messages d'aide sur plusieurs lignes, et corrige quelques fautes dans ces messages.
- Améliore l'affichage de la page du calendrier.
- Permet la suppression des caractéristiques spéciales de matériel (#101).
- Ajoute la possibilité de mettre des chiffres dans le nom des caractéristiques spéciales (#103).
- Améliore l'affichage de l'onglet "Facturation" des événements pour les utilisateurs du groupe "visiteur" (#104).
- Place le champ "sous-catégorie" en dessous du champ "catégorie" dans l'édition de matériel (#105).
- Pré-rempli le champ "quantité" du formulaire de nouveau matériel à 1 (#106).
- Dans le listing du matériel, ajoute un lien vers la gestion des caractéristiques spéciales.
- Ajoute la possibilité de modifier le nom des caractéristiques spéciales (#107).
- Améliore la disposition des filtres dans les pages de listing du matériel (#114).
- Supprime la pagination côté serveur pour le matériel à l'étape 4 de l'édition d'événement, et améliore l'UX (#115).
- Ajoute quelques informations (dates, bénéficiaires, techniciens) au survol des événements dans le calendrier (#117).
- Augmente le zoom maximum du calendrier à 6 mois pour élargir la vision globale de la frise temporelle (#118).
- Ajoute le titre des pages dans l'onglet du navigateur.
- Améliore le système de recherche des bénéficiaires pour inclure aussi le nom de la structure associée à la personne (#119).
- Permet la gestion et l'identification unitaire du matériel (Premium #5).
- Ajoute la restriction de l'accès des parcs à certains membres (Premium #11).
- Ajoute la visualisation des disponibilités sous forme de timeline dans un onglet de la vue d'un matériel (Premium #8).
- Ajoute la notion de code barre pour les unités et prend en en charge des scanettes à l'étape 4 (Matériel) des événements (Premium #6).
- Ajoute l'authentification via CAS (Premium #1).

## 0.11.0 (2021-01-14)

- Met à jour les dépendances du projet.
- Ajoute un fichier de config pour le "dependabot" de Github (#86).
- Le numéro de version du projet est maintenant centralisé dans un fichier `VERSION` à la racine.
- Les sources du client sont maintenant embarquées dans un dossier `dist/` côté client et non directement côté serveur.  
  Ceci va, par exemple, permettre de simplifier les mises à jour de la version compilée du client (via un simple `yarn build`).
  (Un lien symbolique est utilisé côté serveur pour relier les deux côtés de l'application)
- Corrige l'hôte de développement et permet sa customisation via une variable d'environnement. 
- Améliorations internes de la validation des données.
- Ajoute une page de vue du matériel en détail.
- Utilise des onglets dans la page de vue du matériel.
- Dans l'édition d'événements, la recherche directe des bénéficiaires et techniciens dans le champ multiple permet de tous les retrouver (#36).
- Ajoute des boutons dans la page des catégories, permettant d'ouvrir la liste du matériel d'une catégorie ou sous-catégorie (#51).
- Supprime automatiquement les espaces vides inutiles dans les champs des formulaires (#87).
- Si plusieurs parcs existent, un sélecteur dans le calendrier permet de filtrer les événements qui contiennent au moins un matériel d'un parc sélectionné (#94).
- Dans la liste des parcs (s'il y en a plusieurs), un lien sur chaque parc permet d'ouvrir le calendrier, filtré par ce parc (#94).

## 0.10.2 (2020-11-16)

- Le support de PHP 7.1 malencontreusement supprimé dans la précédente version a été rétabli.

## 0.10.1 (2020-11-10)

- Met à jour les dépendances côté serveur (+ corrige un bug avec Twig) (#55) (👏 @Tuxem).

## 0.10.0 (2020-11-06)

- Ajoute un nouveau champ `reference` à la table `events` permettant d'identifier  
  chaque événement côté machine après un import par exemple (non utilisé dans l'interface) (#45).
- Met à jour Phinx (système de migration de la base de données).
- Change le terme "Salut" en "Bonjour" en haut de l'application (#46).
- Autorise le signe "+" dans la référence du matériel (#43).
- Adapte les factures au cas où la T.V.A n'est pas applicable (#24).
- Ajoute un filtre sur le calendrier permettant de n'afficher que les événements qui ont du matériel manquant (#42).
- Permet la modification des événements passés dans le calendrier (#41).
- Affiche une alerte dans les événements qui n'ont pas de bénéficiaire, et cache leur bouton "imprimer".
- Trie les personnes (bénéficiaires et techniciens) sur le nom de famille par défaut (#37).
- Corrige le bug d'affichage des sociétés et des pays dans le formulaire des personnes (#50).

## 0.9.2 (2020-10-13)

- Met à jour les dépendances front.

## 0.9.1 (2020-08-04)

- Fix display name of beneficiaries in PDF files (bills and event summary) (#31).
- Fix materials list columns visibility in event step 4 when billing mode 'none' or when event is not billable (#30).

## 0.9.0 (2020-07-31)

- Update dependencies
- Remove bills file storage, and always re-create PDFs on demand (#8).
- Change bills numbers to be successive instead of using date of creation (#8).
- Fix total replacement amount of parks material (#6).
- Add a flag `has_missing_materials` in each event's data (#16).
- Fix undefined index in step 6 of install wizard (#26).
- Make the event summary printable (#15).
- Fix the `taggables` table `PRIMARY` constraint (#28).
- Automatically manage duplicate Person (technician / beneficiary) by adding the right tag (#14).
- Fix totals of items in parks listing, and add total in stock (#6).
- Display an icon (warning) on timeline events when they miss some materials (#16).
- Add a tooltip when hovering events on the timeline with information about event' status.
- Add a column "quantity" on the left of materials choice table in event's step 4 (#19).
- Fix interactive updates of quantities, amounts and buttons in event's materials choice table.
- Make the event summary printable (#15).

## 0.8.2 (2020-07-02)

- Fix color of events in calendar (#11).
- Update webclient to version 0.8.1.

## 0.8.1 (2020-07-01)

- Fix `composer.json` & `.htaccess` files, and improve release script.
- Fix color of events in calendar (#11).

## 0.8.0 (2020-06-17)

- Whole project restructuration.
- Whole project restructuration.
- Add a bash script to help releasing new versions of the projet (Gitlab Issue 77).

## 0.7.2 (2020-04-08)

- Fix double-click problem on calendar timeline, and double-tap on events on touch screens (Gitlab Issue 90).

## 0.7.1 (2020-04-04)

- Escape warning when deleting a PDF and permissions denied.
- Fix errors in English version of installation wizard.
- Fix missing materials bad counting in events (Gitlab issue 96).
- Allow extra characters in companies' locality field (Gitlab issue 98).
- Allow to skip installation step 6 (admin user creation) if some admins already exist in DB (Gitlab issue 87).
- Fix migrations when using a prefix for tables (Gitlab issue 97).
- Ignore execution time limit when doing migrations in step 5 of install wizard (Gitlab issue 104).
- Use [vue-visjs](https://github.com/sjmallon/vue-visjs) instead of [vue2vis](https://github.com/alexcode/vue2vis) (Gitlab Issue 60).
- Save (debounced) the materials list in events, directly when changes are made (Gitlab Issue 84).
- Improve errors display in UI using Help component (Gitlab Issue 87).
- Improve dates change in first step of event's edition (Gitlab Issue 85).

## 0.7.0 (2020-03-02)

- Event's location is now optional at creation (Gitlab issue 84).
- Sub-categories can now have very short names (at least 2 characters still) (Gitlab issue 86).
- Fix an error when installing the app using an existing well structured database (Gitlab issue 83).
- Add a way to create PDFs from HTML files (Gitlab issue 76).
- Add API endpoints to get, create and delete bills (Gitlab issue 77).
- Add `is_discountable` field in `materials` table (Gitlab issue 90).
- Fix CORS support to help dev of webclient.
- Remove forcing of SSL from public htaccess.
- Add a filter to materials getAll() to retreive only the material that is attached to an event.
- Add "company" step in installation wizard, and simplify complex steps (Gitlab issue 91).
- Add the choice of billing mode in installation wizard, and add "is_billable" field to events (Gitlab issue 57).
- Search materials in listings by name and reference (Gitlab issue 89).
- Use tags for companies (Gitlab issue 92).
- Allow sort persons by company legal name (Gitlab issue 93).
- Inverse first name and last name to display person's full name.
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

## 0.6.4 (2020-02-09)

- Update webClient to version `0.6.2`.

## 0.6.3 (2020-02-07)

- Fix version of webClient (`0.6.1`) in entrypoint's twig view.

## 0.6.2 (2020-02-05)

- Update webClient to version `0.6.1`.
- Fix grand total calculation in event summary (Gitlab Issue 66).
- Fix display of extra-attributes when creating a new material (Gitlab Issue 63).

## 0.6.1 (2020-02-05)

- Fix logo in apidoc template
- Fix getAll countries to not be paginated
- Fix release script and ignore release ZIP file
- Fix an error in step 5 of event creation / modification.

## 0.6.0 (2020-02-01)

- Add _LICENCE.md_ file at project's root.
- Add a bash script to create a release ZIP file automatically (Gitlab issue 82).
- Add countries list to initialize database data at install (Gitlab issue 80).
- Fix and improve install wizard (Gitlab issue 81).
- Fix ACL for Visitors (Gitlab issue 79).
- Fix error when creating parks without country (Gitlab issue 69).
- Display technicians (assignees) in event's details modal window (Gitlab Issue 56).
- Add a button in calendar header to manually refresh events data (Gitlab Issue 50).
- Shrink menu sidebar when screen si smaller, and hide it when smallest (Gitlab Issue 53).
- Improve responsive design of menus & header (Gitlab Issue 53).
- Fix visitor access to calendar and user's view (Gitlab Issue 58).
- Improve log in / log out messages, and remember last visited page.
- Add a button in Attributes edit page, to go back to the last edited material (Gitlab Issue 51).
- Improve listings by showing extra columns (Gitlab Issue 55).

## 0.5.2 (2019-12-29)

- Fix material modification bug when saving tags (Gitlab issue 68).

## 0.5.1 (2019-12-29)

- Fix materials event save when quantity = 0 (Gitlab issue 66).
- Fix tags name field validation.
- Limit _out-of-order_ quantity to _stock quantity_, and disallow negative numbers for _stock quantity_ (Gitlab issue 67).
- Hide "loading" icon when resizing/moving an event is done (Gitlab Issue 49).
- Disable "center on today" button in calendar, when the current centered date is already today.
- Filter materials with quantity of 0 when saving event at step 4 (Gitlab Issue 48).
- Fix display of missing materials count in event summaries (Gitlab Issue 48).
- Improve interface of event summaries, with more messages when there is no materials.

## 0.5.0 (2019-12-29)

- Fix `setTags` method in `Taggable` trait.
- Improve taggable _get all filtered_ method.
- Get materials remaining quantities for a given period (Gitlab issue 63).
- Fix error when save materials with tags in payload (Gitlab issue 62).
- Extend materials data with ability to assign it arbitrary attributes (Gitlab issue 19).
- Add an endpoint to check missing materials of an event (Gitlab issue 64).
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

- Add filter of materials by park (Gitlab issue 56).
- Expose some configuration data to front-end via `__SERVER_CONFIG__` javascript var (Gitlab issue 54).
- Add a step in install wizard for extra settings.
- Redesign install wizard a bit to improve UX.
- Add informations  `person_id`, `company_id`, `street`, `postal_code`, `locality`, `country_id`,
  `opening_hours` and `notes` to parks (Gitlab issue 53).
- Add main park's name in _"settings"_ step of installation wizard (Gitlab issue 53).
- Add a command-line tool to quickly import data from Robert 0.6 (Gitlab issue 38). At the moment, only materials
  and technicians can be imported this way.
- Add support of `orderBy` and `ascending` query-strings in controllers `getAll()` methods (Gitlab issue 59).
- Change manner to search for an entity: Route `.../search` is replaced by the use of query-strings
  `search` and `searchBy` for searching (Gitlab issue 60).
- Fix database potential bug due to MySQL charset `utf8mb4` and indexed fields limit (Gitlab issue 52).
- Remove pagination when fetching events, use start and end dates instead to limit the results (Gitlab issue 51).
- Add _parks_ managment (index & edit) pages (Gitlab Issue 35).
- Add filter by _park_ in materials list page (Gitlab Issue 35).
- Use settings passed by the Robert2-api server (Gitlab Issue 36).
- Redesign event's edition breadcrumbs and add a mini summary slot.
- Use global state for Parks, Categories and Countries (Gitlab Issue 39).
- Use ServerTable from `vue-tables-2` component, to be able to use server-side pagination (Gitlab Issue 37).
- Add a way to display soft-deleted items in listings, and to restore or permanently delete elements (Gitlab Issue 40).
- Use new fetching system for events in calendar (specify period when fetching) to optimize loading.

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
- Update all dependencies to latest versions, and use `vue-cli 3` (Gitlab Issue 34).
- Improve locales files structure for better i18n handling in code.

## 0.3.1 (2019-08-03)

- Add Cookie support for JWT Auth, when Auth header not found.
- Fix a small CSS bug when built for production.

## 0.3.0 (2019-07-04)

- Integrate [Robert2-WebClient](https://gitlab.com/robertmanager/Robert2-WebClient) to serve a nice UI (Gitlab issue 50).
- Fix a PHP notice in install process (Gitlab issue 48).
- Modify unicity constraint on sub-categories: two names can be the same if not in the same parent category (Gitlab issue 49).
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

## 0.2.3 (2019-07-01)

- Fix persons validation
- Fix existing Tags handling when bulk add tags
- Fix a typo in French i18n locale
- Set orderBy for hasMany-related models of Category and User
- Add possibility to get all materials by category and sub-category
- Fix i18n locale setting at startup

## 0.2.2 (2019-02-05)

- Add `httpAuthHeader` into settings, to allow custom header name for HTTP Authorization Bearer token data (Gitlab issue 46).
- Fix some issues with `.htaccess` files.
- Optimize client build.

## 0.2.1 (2019-02-03)

- Improve `.htaccess` files.
- Fix some issues when deploying the application on shared servers.
- Add `client/dist/` (build result) folder to git.

## 0.2.0 (2019-02-02)

- Use [Docker](https://www.docker.com/) containers to have unified environments (php & mysql) for dev (Gitlab issue 33).
- Use [Phinx](https://phinx.org/) to handle database migrations (Gitlab issue 17).
- Add `Event` model and API endpoints (Gitlab issue 26).
- Use config's `prefix` optional setting for tables names (Gitlab issue 37).
- Add groups of users, and create "admin", "member" & "visitor" groups (Gitlab issue 18).
- Add `tags` for `material` entity (Gitlab issue 22).
- Add API documentation generated from Postman collection (only version 1 at the moment) (Gitlab issue 11).
- Add `UserSettings` model and API enpoints (Gitlab issue 36).
- Add i18n module and translate the validation errors messages (Gitlab issue 41).
- Translate the installation wizard pages (Gitlab issue 40).
- Use custom token validity duration, according to value set in user settings (Gitlab issue 21).
- Add API endpoints to restore soft-deleted records (Gitlab issue 43).
- ACL: limit access to certain resources' actions by user groups (Gitlab issue 39).
- Add API endpoints to manage sub-categories independently from categories (Gitlab issue 44).
- Fix `sub_category_id` field of `materials` table, which can now be `null`.
- Remove password from Auth Token response data.
- Fix usage of `displayErrorDetails` setting.
- Use `public/version.txt` to centralize version number that will be displayed in views.
- Throw an error when fixtures dataseed fails, in order to stop unit tests if incomplete data (Gitlab issue 35).
- Don't serve the soft-deleted records when querying data (Gitlab issue 42)
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

## 0.1.0 (2018-11-24)

First Robert API's milestone. Yay!

This is the very first time we can use the Robert2-api, with JWT authentication in place, and several basic entities available, like users, persons, companies, tags, categories, parks and materials. Check this in details below!

- Basic __app__ (Slim 3 Framework) structure in place.
- First API __auth system__ (JWT).
- Integration __testing__ system in place (Gitlab issue 1).
- Use a __configuration manager__ (php class) (Gitlab issue 5).
- Add `install/` and `apidoc/` routes, and create __base of UI__ for those views using _twig_ (Gitlab issue 6).
- Create an __installation wizard__ : initiate configuration, create database and its structure, and create first user (Gitlab issue 7).
- Add step to install wizard : __database structure__ creation, using SQL files (Gitlab issue 8).
- Use Illuminate Database and __Eloquent ORM__ for all models, and adapt unit tests (Gitlab issue 4).
- Add `Category` & `SubCategory` models and API endpoints (Gitlab issue 14).
- Use `password_hash` and `password_verify` in `User` model (Gitlab issue 20).
- Improve models with mutators and values cast (Gitlab issue 30).
- Use JWT Auth Middleware to authenticate requests for api routes using Json Web Token (Gitlab issue 32).
- Add `Park` model and API endpoints (Gitlab issue 13).
- Add `Material` model and API endpoints (Gitlab issue 15).
- Set pagination in controllers (not models) (Gitlab issue 31).
- Add `update` and `delete` API endoints and controller methods (Gitlab issue 27).
- Initialize App using _Vue.js CLI_.
- Add global state management (_vuex_).
- Add _i18n_ management.
- First contact with API (_auth user_).
- Add _Users list_ page.
- Use _sweet modal_ for alerts and modals.
- Add basic calendar (_Plantt for Vue.js_ not complete yet).
- Add a _changelog_, a _contributing_ file, and rewrite a bit the _readme_.
- Update dependencies and add the _.gitlab-ci.yml_ file.
