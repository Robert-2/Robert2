# ROBERT2

## Présentation

Robert2 est une application web de gestion de parc de matériel simple, efficace, modulable et open-source.

Site web officiel : [robertmanager.org](https://robertmanager.org)  
Forum de la communauté : [forum.robertmanager.org](https://forum.robertmanager.org)  
Abonnement à la newsletter : [newsletter.robertmanager.org/abo](https://newsletter.robertmanager.org/abo.php)

### Robert2, c'est pour qui ?

Si vous êtes une association, une institution, une école ou université, une entreprise ou même un petit entrepreneur, et que vous avez du matériel à louer ou à prêter, Robert2 est fait pour vous.  
Il vous aidera à gérer votre parc de matériel, vos prestations, événements, bénéficiaires et techniciens.

### Robert2, comment ça marche ?

Sur votre ordinateur, tablette ou smartphone, vous vous connectez à Robert2 grâce à un navigateur web, comme Firefox, Chrome, Opera ou Edge, en visitant simplement l'adresse sur laquelle il est installé.

Une fois entré dans l'application, vous pouvez l'utiliser !

## Fonctionnalités

### Calendrier

Clair, pratique et réactif : Visualisation des événements sur une frise temporelle, pour tout voir en un coup d'oeil.

### Parcs de matériel

Gestion du stock : Plusieurs parcs de matériel, catégories libres, caractéristiques personnalisées, gestion des pannes...

### Bénéficiaires

Gestion des clients : Liste des particuliers, entreprises ou associations qui bénéficient de vos services.

### Événements

Gestion des événements : Assignation de listes de matériel et de techniciens à des périodes de temps. Sous-totaux par catégorie, et affichage du matériel manquant dans la période donnée.

### Techniciens

Gestion du personnel : Gestion des personnes (techniciens) qui peuvent être assignées à des événements.

### Devis & Factures

Édition simple et rapide : Création et impression facile de vos factures et devis au format PDF.

### Facile à installer

Robert2 est écrit en PHP et Javascript, et utilise une base de données MySQL. Cela lui permet d'être installé sur la plupart des serveurs, même les moins puissants ! De plus, un assistant d'installation vous aide lors de vos premiers pas.

### Accessible partout

Une fois l'application installée sur votre serveur, vous pouvez l'utiliser depuis n'importe où via internet, et un navigateur web, sur votre ordinateur, tablette ou même votre smartphone !

## Description technique

Vous remarquerez que partout, les noms de *variables,* de *classes* et de *méthodes,* les messages de *commits,* les entrées du *Changelog,* etc. à part le présent *Readme,* tout est rédigé en Anglais. Ceci est un choix délibéré, afin de laisser la possibilité à des personnes non-francophones de mettre les "mains dans le code". L'Anglais étant (malheureusement) la langue la plus comprise par les développeurs dans le monde.

Plus de détails concernant cette partie sont disponibles (en Anglais) dans le fichier [Contributing](/CONTRIBUTING.md) à la racine des deux dossiers principaux du projet.

### Versions & Changelog

Robert2 utilise la nomenclature de version [Semantic Versionning (semver)](https://semver.org/) pour ses numéros de version. La version actuelle qui correspond à celle se trouvant dans la branche `master` est définie dans le fichier `src/public/version.txt`.

Chaque version correspond à *"Milestone"* dans GitLab.

Un fichier de [Changelog](/CHANGELOG.md) est présent à la racine des deux dossiers principaux du projet, montrant l'évolution des fonctionnalités au fil du temps et des versions. Il est (et doit être) impérativement maintenu à jour.

### Docker

Robert2 offre la possibilité de lancer l'application dans un container docker. Voir [le Readme](/docker/README.md) dédié à ceci dans le dossier `server/docker`.

### Routing

Le point d'entrée principal de l'application (`/`) déclenche le rendu de la partie "front" (voir ci-dessus).

L'URL `/apidoc` affiche une page de documentation complète de toutes les routes et méthodes d'API.

Ces routes d'API sont accessibles sous l'URL `/api/...`. Voir la documentation de l'API pour les voir en détail.

### Tests unitaires & linting

Le projet suit des règles strictes de linting (avec PHPCS pour la partie back, et ESLint pour la partie Front). Un fichier `.editorconfig` existe à la racine du projet pour permettre aux IDE d'automatiser la présentation de base du code.

Côté back, des tests unitaires sont en place pour tester les models, les routes d'API, ainsi que diverses autres classes et fonctions. Le code coverage est visible en haut de cette page.

### Contributeurs

Le principal contributeur du projet est [Paul Maillardet (Polosson)](https://polosson.com).

## Licence

Cette application web est distribuée dans l'espoir qu'elle soit utile, mais SANS AUCUNE GARANTIE.

Robert2 est modifiable et redistribuable sous les termes de la [Licence Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr). Elle es utilisable, modifiable et redistribuable dans le cadre de l'usage privé ou personnel. Aucune utilisation commerciale du **code source** de l'application ne peut en être faite (pas de distribution du code source en tant que service commercial).

Pour plus de détails, voir le fichier [LICENCE.md](/LICENCE.md) à la racine du projet.
