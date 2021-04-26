# Guide de contribution

## Pré-requis

Pour pouvoir commencer à développer sur ce projet, votre IDE doit être configuré pour
prendre en compte les configurations `.editorconfig`, ESLint et PHP code sniffer, 
ce qui nous permet de nous assurer de l'homogénéité du formatage des fichiers soumis dans le projet.

En plus des ["outils" globaux requis](https://robertmanager.org/wiki/install#install-before) pour une installation normale de Robert2 (PHP, MySQL, etc), 
vous devrez aussi installer la dernière version de __[Node](https://nodejs.org/fr/)__ pour pouvoir lancer les commandes de build 
(si vous touchez à la partie front).

Pour pouvoir générer un rapport de couverture en HTML (pour la partie serveur), il faut que __xDebug__ soit installé sur votre système.  
Vous pouvez l'installer via la commande suivante (sur les systèmes Debian-like) : `sudo apt install php-xdebug`.

À noter que dans ce guide de contribution, nous utiliserons __[Yarn v1](https://classic.yarnpkg.com/fr/)__ pour les commandes côté client.  
Nous vous invitons donc à l'installer et à l'utiliser lorsque vous intervenez sur Robert2.

### Pour les développeurs sous MacOs / Windows

Cette application est avant tout pensée pour être développée dans un environnement Linux-like.  

Par exemple, dans l'installation de développement, des liens symboliques sont utilisés à certains endroits 
(`/server/src/VERSION` et `/server/src/public/webclient`) et ceux-ci devront être re-créés manuellement avec leur équivalent 
sous windows qui ne supporte pas les liens symboliques tel qu'ils apparaissent dans le repository.

De la même façon, sous MacOs, certains des utilitaires globaux (tel que `sed`, `grep`, etc.) diffèrent des utilitaires GNU utilisés sous linux.  
Pour ceux-ci, nous vous conseillons d'installer les paquets [Homebrew](https://brew.sh/index_fr) liés (`coreutils`, `gnu-sed`, etc.) et de mettre 
ces exécutables par défaut via votre $PATH.  
(ceci sera au moins à faire pour `grep` et `sed` sans quoi vous ne pourrez pas exécuter le script de releasing)

## Installation

Pour ce qui est de l'installation de Robert2 en lui-même, veuillez suivre [la procédure d'installation avancée](https://robertmanager.org/wiki/install)   
telle que documentée sur le site de Robert, il n'y a pas de changement par rapport à celle-ci.

Pour ce qui est de la partie client, veuillez vous rendre à la racine du dossier `client/` et exécutez `yarn install`.  

## Langue du projet

Nous avons fait le choix de communiquer exclusivement en __français__ partout dans les outils liés à Robert.  
Les fichiers markdown, commentaires, entrées de CHANGELOG, outils CLI, messages de commit et tickets   
doivent donc être rédigés en français uniquement.

Le code, lui, à l'exception des commentaires, doit être exclusivement en anglais, pas de variable ou de nom de migration en français.

Attention ⚠️, cela ne veut pas dire que Robert n'est pas traduit : Robert2 est aussi disponible en anglais et doit continuer à l'être.  
Merci donc de bien vouloir prendre en compte le fait que chaque texte affiché dans l'interface de Robert doit pouvoir être traduit et si possible,
veuillez spécifier les traductions anglaises de vos ajouts en français dans vos pull requests.

## Version et Changelog

Robert2 utilise la nomenclature de version [Semantic Versionning (semver)](https://semver.org/) pour ses numéros de version. La version actuelle qui 
correspond à celle se trouvant dans la branche `master` est définie dans le fichier `/VERSION`.

Un fichier de changelog est présent à la racine du projet, montrant l'évolution des fonctionnalités au fil du temps et des versions.   
__Il est (et doit être) impérativement maintenu à jour.__

## Releasing

Pour créer une release de Robert2, veuillez suivre les étapes suivantes :

1. Exécutez `./bin/release -v [NuméroDeVersion]` en étant à la racine du projet.  
   (Note : si vous ne spécifiez pas de version, la version actuellement dans le fichier `/VERSION` sera utilisée.
   Vous pouvez aussi spécifier le terme `testing` pour la version, afin de créer une release temporaire qui ne
   met pas à jour le Changelog ni le fichier de version).
2. Terminé ! Vous pouvez récupérer le fichier ZIP qui a été créé dans le dossier `/dist`.

## Build de la partie client

Si vous intervenez sur la partie client, vous aurez besoin de compiler celle-ci pour que votre instance locale   
reflète directement les changements que vous apportez au code.

Pour cela, vous avez à disposition deux commandes (à exécuter depuis la racine du dossier `/client`) :  

#### `yarn start`

C'est cette méthode qu'il faudra utiliser pendant la plupart de vos développements front-end.

Cette commande vous permet de lancer un serveur de développement front-end, avec prise en charge du Hot Reloading,
qui servira les sources JS, CSS et les assets, à l'adresse `http://localhost:8081/`.  

Pour travailler, créez un fichier `.env` dans le dossier `server/` qui contient la variable `APP_ENV=development`,
puis ouvrez l'application sur son serveur back-end (par ex. `http://robert.local`).

#### `yarn build`

Cette commande va créer un build de production de la partie client en compilant et compressant les sources.  
_(Pensez à exécuter cette commande et à commiter le résultat dans votre PR lorsque vous modifiez la partie client)_

## URL de l'API en développement

En développement, l'hôte par défaut utilisé par la partie client pour communiquer avec l'API est `http://robert.local`.  

Si vous souhaitez modifier ceci, vous pouvez créer un fichier `.env.development.local` à la racine du dossier
client et surcharger la variable d'environnement `VUE_APP_API_URL` avec votre propre URL d'API (par
exemple `http://localhost/robert2`).

## Migration de la base de données

Nous utilisons [Phinx](https://phinx.org/) pour les mises à jour de la structure de la base de données.  
C'est pourquoi vous ne devez pas modifier le schéma "manuellement". À la place, créez un fichier de migration
via la commande suivante :

```bash
composer create-migration [NameOfYourMigration]
```

Merci d'être précis dans le nommage de vos migrations, par exemple : `composer create-migration AddEmailToTechnicians`.

Ensuite, vous pourrez utiliser les commandes suivantes :

```bash
composer migration-status # Affiche le statut de migration de votre base de données.
composer migrate          # Migration de votre base de données en prenant en compte tous les fichiers de migration non exécutés.
composer rollback         # Annule la dernière migration exécutée sur votre base de données (peut être lancée plusieurs fois).
```

## Tests unitaires

Nous utilisons __Jest__ pour les tests unitaires côté front. Il n'y a pas de pre-requis, il suffit
de les lancer comme ceci :

```bash
# - Se placer dans le dossier client/
cd client

# - Lancer tous les tests
yarn test

# - Ou bien, en mode watch
yarn test --watch
```

Pour les tests unitaires côté back, nous utilisons __PHPUnit__. Pour ceux-ci, vous aurez besoin d'une
base de données dédiée aux tests. Par défaut, cette base s'appelle `robert2_test`, mais vous pouvez
spécifier un autre nom en ajoutant la ligne `"testDatabase": "le_nom_que_vous_voulez"` dans le fichier
`server/src/App/Config/settings.json`.

Ensuite, vous pouvez exécuter les tests via :

```bash
# - Se placer dans le dossier server/
cd server

# - Lancer tous les tests
composer test

# - Pour ne lancer qu'une testSuite à la fois :
composer testapi Test     # - testSuite des contrôleurs
composer testmodels Test  # - testSuite des modèles
composer testlibs Test    # - testSuite des libs
composer testother Test   # - testSuite des "autres" (fonctions, config, install...)

# - On peut aussi ne lancer qu'un seul fichier de test en particulier, par ex. :
composer testmodels EventTest # - Lance les tests du fichier tests/models/EventTest.php
```

### Qu'est-ce que l'on teste ?

Côté back, des tests unitaires doivent être mis en place au moins pour tous les modèles, les routes d'API   
ainsi que pour les fonctions et classes utilitaires.

Côté front, tous les utilitaires doivent être testés.

N'hésitez pas, bien sûr, à tester aussi des parties du code qui ne sont pas spécifiées ci-dessus,
plus il y a de test, mieux c'est !

## Linting

Le projet suit des règles strictes de linting (avec PHPCS pour le back et ESLint pour le Front).   
Un fichier `.editorconfig` existe à la racine du projet pour permettre aux IDE d'automatiser la
présentation de base du code (voir [editorconfig.org](https://editorconfig.org/), ainsi que
[l'extension VSCode](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) dédiée).

Vous avez la possibilité de vérifier que votre code respecte bien ces conventions via :  

```bash
# - Pour la partie client
yarn lint

# - Pour la partie serveur
composer lint
```

## Structure de l'application

```
.
├── bin                          # - Executables globaux (`./bin/release`, etc.)
│
├── client
│   ├── dist                     # - Contient les sources compilées de la partie client.
│   ├── node_modules             # - Dépendances de la partie client.
│   ├── src
│   │   ├── components           # - Components Vue réutilisables.
│   │   ├── config               # - Fichiers de configuration de la partie client (constantes, configuration globale, etc.).
│   │   ├── locale               # - Fichiers de traduction de la partie client dans les différentes langues supportées.
│   │   ├── pages                # - Chaque sous-dossier représente une page de l'application.
│   │   ├── stores               # - Contient les différents stores (Vuex) globaux de l'application.
│   │   ├── style                # - Contient le style global de l'application (reset, fonts, style de base, variables globales, etc.).
│   │   ├── themes               # - Contient les différents thèmes de Robert2.
│   │   │   └── default
│   │   └── utils                # - Fonctions JS utilitaires
│   └── tests                    # - Contient les tests unitaires (Jest) de la partie client.
│
└── server
    ├── data                     # - Fichiers associés aux données (matériel, etc.)
    ├── src
    │   ├── App                  # - Modèles, controller, configurations et autres fichiers du cœur de l'application.
    │   │   ├── Config           # - Configuration, ACLs et constantes et fonctions globales.
    │   │   ├── Controllers      # - Contrôleurs de l'application (contenant principalement les endpoints d'API)
    │   │   ├── Errors           # - Gestion des erreurs et classes d'exceptions customs.
    │   │   ├── I18n
    │   │   │   └── locales      # - Fichiers de traduction de la partie serveur dans les différentes langues supportées.
    │   │   ├── Lib              # - Classes métiers et autres classes d'abstraction (PDF, etc.).
    │   │   ├── Middlewares      # - Middlewares Slim (ACL, JWT Auth, pagination, etc.).
    │   │   ├── Models           # - Modèles (Eloquent) de l'application.
    │   │   ├── Services         # - Contient les services, comme le système d'authentification.
    │   │   ├── Validation       # - Contient les utilitaires liés à la validation des données.
    │   │   └── ApiRouter.php    # - Fichier contenant les routes back-end de l'application (mise en relation chemin <=> action de contrôleur).
    │   ├── database
    │   │   └── migrations       # - Fichiers de migration de la base de données (générés via `composer create-migration [MigrationName]`)
    │   ├── install              # - Classes et utilitaires liés à l'assistant d'installation de Robert2.
    │   ├── public
    │   │   ├── css/, js/, img/  # - Dossiers contenant des fichiers d'asset utilisés spécifiquement dans les vues de la partie serveur.
    │   │   ├── webclient        # - Lien symbolique vers les sources compilées de la partie `/client` de Robert2.
    │   │   └── index.php        # - Point d'entrée de l'application (tous les `.htaccess` redirigent vers ce fichier).
    │   ├── var
    │   │   ├── cache            # - Fichiers de cache (contenu à supprimer en cas de modification du code qui semble sans effet)
    │   │   ├── logs             # - Fichiers de log de l'application.
    │   │   └── tmp              # - Fichiers temporaires.
    │   ├── vendor               # - Dépendances (composer) de la partie serveur.
    │   └── views                # - Dossier contenant les vues Twig de l'application.
    │   │   ├── blocks           # - Les blocks communs, comme le loading, etc.
    │   │   ├── install          # - Toutes les pages de l'assistant d'installation
    │   │   ├── pdf              # - Les vues des sorties PDF (factures, fiches d'événement, etc.)
    │   │   ├── webclient.twig   # - Point d'entrée de l'application Robert2 (front-end)
    │   │   └── install.twig     # - Point d'entrée de l'assistant d'installation
    ├── tests
    │   ├── endpoints            # - Tests unitaires (PHPUnit) des controllers.
    │   ├── Fixtures
    │   │   ├── files            # - Fichiers associés aux données (voir server/data) à utiliser pour les fixtures.
    │   │   ├── seed             # - Données utilisées pour les tables de la DB de test, au format JSON.
    │   │   └── tmp              # - Dossier utilisé pour stocker la structure SQL (créée à la volée) de la DB de test, pour reset.
    │   ├── libs                 # - Tests unitaires (PHPUnit) des libs.
    │   ├── models               # - Tests unitaires (PHPUnit) des modèles.
    │   └── other                # - Tests unitaires (PHPUnit) des fonctions utilitaires et autres classes.
```
