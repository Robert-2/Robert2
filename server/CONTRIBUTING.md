# Robert2 API: development guide

## Getting started

### Installation

At first, to install dependencies, just run:

```bash
composer install
```

Then, you can access the _installation wizard_, by visiting the Robert2 URL!

### Coding standards

Please use the `.editorconfig` file for your IDE.

You can use __PHP code sniffer__ (`phpCS`) for linting. In your terminal, just run :

```bash
composer lint
```

### Database migrations

We use [Phinx](https://phinx.org/) to migrate database tables, so please make sure
to never change the schema "by hand"! Instead, please create a migration file by
using the following command:

```bash
composer create-migration NameOfYourMigration
```

Please be specific for your migration's name.

Then, you can use these phinx commands:

```bash
composer migration-status # Show the current status of your database
composer migrate # runs all migration files until it reaches the last one
composer rollback # rollbacks the database to the state of the last migration
```

Note: you can rollback several times to rewind the database state over previous
migrations, one by one.

### Running tests

In Robert2, we're using __Integration Tests__ AND __Unit tests__ for models. It
means we are testing the API endpoints, as well as each model methods individually.

First, you must create an __empty MySQL database__, named the same as your Robert2
one, but suffixed mith `_test`. For example: `robert2_test`.

Finally, you can run all tests at once, with:

```bash
composer test
```

Several other commands are available:

```bash
# Run models tests only, with a keyword to filter tests by name.
# To run all models tests, use 'test' as keyword.
composer testmodels keyword

# Run integration tests only, with a keyword to filter tests by name.
# To run all integration tests, use 'test' as keyword.
composer testapi keyword

# Run other tests only (like config, etc.).
composer testother keyword
```

In order to generate HTML __code coverage reports__, you must have __xDebug__
installed in your system. You can install it (on Debian like system) with the
following command:

```bash
sudo apt install php-xdebug
```

Code coverage HTML report is viewable by opening `/tests/coverage/index.html`.

### Routing

If you have chosen to use routing cache (choice made at 2nd install step), when
adding or modifying a route to `ApiRouter`, don't forget to delete the router
cache file `src/var/cache/routes.php` (it's actually ignored by git).

### UI: Integrated Web Client

In order to have a nice UI for the API, the project
[Robert2-WebClient](https://gitlab.com/robertmanager/Robert2-WebClient) is compiled
and integrated to Robert2-API. It consists in some JS and CSS files placed into the
`src/public/static` folder. These files must be called (using `src=""`) into the file
`src/views/entrypoint.twig`. There is a version number in their filenames to prevent
caching, so these calls must be updated at the same time when the files are updated.

### ACL

If you add an API endpoint to the application, don't forget to limit access to it
for groups of users (if needed), within `Config/Acl.php` file.

### About Configuration and Installation wizard

When adding or modifying some __configuration settings__ (see `src/App/Config`),
we absolutely __must__, in the same time (same branch) __update the installation
wizard__ accordingly. Even add a new step, if necessary.

### API documentation

Another extremely important point is to keep the API documentation __up to date__
with every aspects of the application (endpoints, requests payloads, responses etc.)!

To do so, there is a *[Postman](https://www.getpostman.com/) collection* and a
sample environment file, available in folder `utilities/postman/`.

After having modified the collection with latest changes and exported it to this folder,
we can rebuild the API documentation using [Postmanerator](https://github.com/aubm/postmanerator),
program, with the following command:

```bash
composer build-api-doc
```

And voilà!

## Frameworks & dependencies

This application uses mainly:

- [Slim (v3)](https://www.slimframework.com/docs/v3/) microframework, for controllers.
- [Eloquent ORM (v5)](https://laravel.com/docs/5.8/eloquent) (from Laravel), for models.
- [Twig (v3)](https://twig.symfony.com/doc/3.x/) for view's templating system.
- [Phinx](https://book.cakephp.org/phinx/0/en/index.html) (from CakePHP) for database migrations.

Among other small dependencies.

## Folders structure

### Project root

- `/bin`: Utility *scripts* (bash, or whatever you want).
- `/dist`: Where the *release* process comes up, and the release ZIP file is stored.
- `/src`: Source code of the application (see above for details). The release ZIP basically contains all the stuff in there.
- `/tests`: All unit- and integration-tests, as well as fixtures system and data.
- ~~`/utilities`: Useless, this one will be removed soon.~~

### Main source code

Into `/src` folder, we have:

- `/src/App`: Application *models,* *controllers* and *configuration* files.
- `/src/database`: DB migrations files (using phinx), and data import scripts.
- `/src/install`: Install process utility class and data.
- `/src/public`: Main entrypoint (`index.php`) of the application. The `.htaccess` files redirect all requests to this folder. Also, this is where we can found the compiled version of [`Robert2-WebClient`](https://gitlab.com/robertmanager/Robert2-WebClient/), and all CSS and JS files.
- `/src/var`: The place to find *cache* data, and *log* files.
- `/src/vendor`: All the dependencies source code goes here (see `composer.json`).
- `/src/views`: All the served views of the application, using [`Twig 3`](https://twig.symfony.com/doc/3.x/) as templating system.

### Application

Into `/src/App` folder (= PHP namespace `\Robert2\App`), we cand find:

- `/src/App/Config`: *Configuration*, *ACLs*, and *global constants* & *functions*.
- `/src/App/Controllers`: Endpoints (API and others) controllers (see `/src/App/ApiRouter.php`).
- `/src/App/Errors`: Error handling and *custom exceptions* classes.
- ~~`/src/App/Formater`: Utility classes to format data~~ (will be moved soon in `Lib/` folder).
- `/src/App/I18n`: Locales *translations* (backend only).
- `/src/App/Lib`: *Domain objects* and non-business classes (available soon).
- `/src/App/Middlewares`: Slim middlewares classes *(ACL*, *JWT Auth*, and *Pagination*).
- `/src/App/Models`: Application *[Eloquent](https://laravel.com/docs/5.8/eloquent)* models.
- `/src/App/Validation`: Validator class (may need to be moved elsewhere?).

## Releasing

### Client (if has modifications)

- Change version number in `client/package.json` file
- Set release date in `client/CHANGELOG.md` file
- Run `cd client && yarn release`
- Check paths and filenames in `server/src/public/webclient/precache-manifest.x.x.x.js` file
  according to `server/src/public/webclient` files
- Update versions of CSS and JS sources in `server/src/views/entrypoint.twig` file

### Server (to do always)

- Set version number in `server/public/version.txt` file
- Set release date in `server/CHANGELOG.md` file
- Run `cd server && composer release`
- Done! you can grab the zip file created in `server/dist/` and give it to the world!
