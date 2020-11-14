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

De la même façon, sous MacOs, certains des utilitaires globaux (tel que `sed`, `grep`, etc.) diffèrent des utilitaires GNU linux.  
Pour ceux-ci, nous vous conseillons d'installer les paquets Homebrew liés (`coreutils`, `gnu-sed`, etc.) et de mettre ces exécutables par défaut via votre $PATH.  
(ceci sera au moins à faire pour `sed` sans quoi vous ne pourrez pas exécuter le script de releasing)

## Installation

Pour ce qui est de l'installation de Robert2 en lui-même, veuillez suivre [la procédure d'installation avancée](https://robertmanager.org/wiki/install)   
telle que documentée sur le site de Robert, il n'y a pas de changement par rapport à celle-ci.

Pour ce qui est de la partie client, veuillez vous rendre à la racine du dossier `client/` et exécutez `yarn install`.  

## Langue du projet

Nous avons fait le choix de communiquer exclusivement en __français__ partout dans les outils liés à Robert.  
Les fichiers markdown, commentaires, entrées de CHANGELOG, outils CLI, messages de commit et tickets   
doivent donc être rédigés en français uniquement.

Le code, lui, à l'exception des commentaires, doit être exclusivement en anglais, pas de variable ou de nom de migration en français.

Attention ⚠️ , cela ne veut pas dire que Robert n'est pas traduit : Robert2 est aussi disponible en anglais et doit continuer à l'être.  
Merci donc de bien vouloir prendre en compte le fait que chaque texte affiché dans l'interface de Robert doit pouvoir être traduit et si possible,
veuillez spécifier les traductions anglaises de vos ajouts en français dans vos pull requests.

## Version et Changelog

Robert2 utilise la nomenclature de version [Semantic Versionning (semver)](https://semver.org/) pour ses numéros de version. La version actuelle qui 
correspond à celle se trouvant dans la branche `master` est définie dans le fichier `/VERSION`.

Un fichier de changelog est présent à la racine du projet, montrant l'évolution des fonctionnalités au fil du temps et des versions.   
__Il est (et doit être) impérativement maintenu à jour.__

## Releasing

Pour créer une release de Robert2, veuillez suivre les étapes suivantes :

1. Exécutez `./bin/release [NuméroDeVersion]` en étant à la racine du projet.  
   (Note: si vous ne spécifiez pas de version, la version actuellement dans le fichier `/VERSION` sera utilisée).
2. Terminé ! Vous pouvez récupérer le fichier ZIP qui a été créé dans le dossier `/dist`.

## Build de la partie client

Si vous intervenez sur la partie client, vous aurez besoin de compiler celle-ci pour que votre instance locale   
reflète directement les changements que vous apportez au code.

Pour cela, vous avez à disposition deux commandes (à exécuter depuis la racine du dossier `/client`) :  

#### `yarn start`

Cette commande vous permet de lancer un serveur de développement front avec prise en charge du Hot Reloading.  
C'est cette méthode qu'il faudra utiliser  pendant la plupart de vos développements front.

#### `yarn build`

Cette commande va créer un build de production de la partie client en compilant et compressant les sources.  
_(Pensez à exécuter cette commande et à commiter le résultat dans votre PR lorsque vous modifiez la partie client)_

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

Nous utilisons __Jest__ pour les tests unitaires côté front et __PHPUnit__ pour les tests unitaires côté back.  

Pour pouvoir lancer les tests de la partie client, il n'y a pas de pre-requis, par contre pour les tests back, 
vous aurez besoin d'une base de données dédiée aux tests, nommée de la même manière que votre base de données
Robert2, mais suffixée avec `_test` (exemple : `robert2_test`).

Une fois les indications ci-dessus suivis, exécutez les tests via :

```bash
# - Pour la partie client
yarn test [--watch]

# - Pour la partie serveur
composer test
```

### Qu'est-ce que l'on teste ?

Côté back, des tests unitaires doivent être mis en place au moins pour tous les modèles, les routes d'API   
ainsi que pour les fonctions et classes utilitaires.  

Côté front, tous les utilitaires doivent être testés.

N'hésitez pas, bien sûr, à tester aussi des parties du code qui ne sont pas spécifiées ci-dessus, plus il y a de test, mieux c'est !

## Linting

Le projet suit des règles strictes de linting (avec PHPCS pour la partie back et ESLint pour la partie Front).   
Un fichier `.editorconfig` existe à la racine du projet pour permettre aux IDE d'automatiser la présentation de base du code.

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
├── bin                            # - Executables globaux (`./bin/release`, etc.)
│
├── client
│   ├── dist                       # - Contient les sources compilées de la partie client.
│   ├── node_modules               # - Dépendances de la partie client.
│   ├── src
│   │   ├── components             # - Components Vue réutilisables.
│   │   ├── config                 # - Fichiers de configuration de la partie client (constantes, configuration globale, etc.).
│   │   ├── locale                 # - Fichiers de traduction de la partie client dans les différentes langues supportées.
│   │   ├── pages                  # - Chaque sous-dossier représente une page de l'application.
│   │   ├── stores                 # - Contient les différents stores (Vuex) globaux de l'application.
│   │   ├── style                  # - Contient le style global de l'application (reset, fonts, style de base, variables globales, etc.).
│   │   ├── themes                 # - Contient les différents thèmes de Robert2.
│   │   │   └── default
│   │   └── utils
│   └── tests                      # - Contient les tests unitaires (Jest) de la partie client.
│
└── server
    ├── bin                        # - Executables spécifiques à la partie serveur.
    ├── src                        # - Code source back-end de l'application.
    │   ├── App                    # - Modèles, controller, configurations et autres fichiers du coeur de l'application.
    │   │   ├── Config             # - Configuration, ACLs et constantes et fonctions globales.
    │   │   ├── Controllers        # - Contrôleurs de l'application (contenant principalement les endpoints d'API)
    │   │   ├── Errors             # - Gestion des erreurs et classes d'exceptions customs.
    │   │   ├── I18n
    │   │   │   └── locales        # - Fichiers de traduction de la partie serveur dans les différentes langues supportées.
    │   │   ├── Lib                # - Classes métiers et autres classes d'abstraction (PDF, etc.).
    │   │   ├── Middlewares        # - Middlewares Slim (ACL, JWT Auth, pagination, etc.).
    │   │   ├── Models             # - Modèles (Eloquent) de l'application.
    │   │   ├── Validation         # - Contient les utilitaires liés à la validation des données.
    │   │   └── ApiRouter.php      # - Fichier contenant les routes back-end de l'application (mise en relation chemin <=> action de contrôleur).
    │   ├── database
    │   │   └── migrations         # - Fichiers de migration de la base de données (générés via `composer create-migration [MigrationName]`)
    │   ├── install                # - Classes et utilitaires liés à l'assistant d'installation de Robert2.
    │   ├── public
    │   │   ├── css/, js/, img/    # - Dossiers contenant des fichiers d'asset utilisés spécifiquement dans les vues de la partie serveur.
    │   │   ├── webclient          # - Lien symbolique vers les sources compilées de la partie `/client` de Robert2.
    │   │   └── index.php          # - Point d'entrée de l'application (tous les `.htaccess` redirigent vers ce fichier).
    │   ├── var
    │   │   ├── cache              # - Fichiers de cache (contenu à supprimer en cas de modification du code qui semble sans effet)
    │   │   ├── logs               # - Fichiers de log de l'application.
    │   │   └── tmp                # - Fichiers temporaires.
    │   ├── vendor                 # - Dépendances (composer) de la partie serveur.
    │   └── views                  # - Dossier contenant les vues Twig de l'application.
    └── tests                      # - Contient les tests unitaires (PHPUnit) de la partie serveur (ainsi que les fixtures liées).
```
