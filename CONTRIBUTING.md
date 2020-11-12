# Guide de contribution

Pour le guide concernant la partie client de l'applciation [voir ici](./client/CONTRIBUTING.md), pour la partie serveur, c'est [ici](./server/CONTRIBUTING.md) que ça se passe.

### Versions & Changelog

Robert2 utilise la nomenclature de version [Semantic Versionning (semver)](https://semver.org/) pour ses numéros de version. La version actuelle qui correspond à celle se trouvant dans la branche `master` est définie dans le fichier `server/src/public/version.txt`.

Un fichier de changelog est présent à la racine des deux dossiers principaux du projet, montrant l'évolution des fonctionnalités au fil du temps et des versions. Il est (et doit être) impérativement maintenu à jour.

### Routing

Le point d'entrée principal de l'application (`/`) déclenche le rendu de la partie "front" (voir ci-dessus).

L'URL `/apidoc` affiche une page de documentation complète de toutes les routes et méthodes d'API.

Ces routes d'API sont accessibles sous l'URL `/api/...`. Voir la documentation de l'API pour les voir en détail.

### Tests unitaires & linting

Le projet suit des règles strictes de linting (avec PHPCS pour la partie back, et ESLint pour la partie Front). Un fichier `.editorconfig` existe à la racine du projet pour permettre aux IDE d'automatiser la présentation de base du code.

Côté back, des tests unitaires sont en place pour tester les models, les routes d'API, ainsi que diverses autres classes et fonctions. Le code coverage est visible en haut de cette page.
