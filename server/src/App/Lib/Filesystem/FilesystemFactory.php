<?php
declare(strict_types=1);

namespace Robert2\Lib\Filesystem;

use Aws\S3\S3Client;
use League\Flysystem\AwsS3V3\AwsS3V3Adapter as S3Adapter;
use League\Flysystem\AwsS3V3\PortableVisibilityConverter as AwsS3PortableVisibilityConverter;
use League\Flysystem\Filesystem as Flysystem;
use League\Flysystem\Ftp\FtpAdapter;
use League\Flysystem\Ftp\FtpConnectionOptions;
use League\Flysystem\FilesystemAdapter as FlysystemAdapter;
use League\Flysystem\PhpseclibV3\SftpAdapter;
use League\Flysystem\PhpseclibV3\SftpConnectionProvider;
use League\Flysystem\Local\LocalFilesystemAdapter as LocalAdapter;
use League\Flysystem\UnixVisibility\PortableVisibilityConverter;
use League\Flysystem\Visibility;

class FilesystemFactory
{
    /**
     * Permet de créer un manipulateur de système de fichier local.
     *
     * Options disponibles:
     * - `root`: Le dossier racine à partir duquel tous les chemins seront résolus.
     * - `links`: Que faire des liens symboliques ? Peut valoir:
     *    - `skip`: Les liens symboliques sont ignorés.
     *    - `disallow`: Liens liens symboliques sont interdits, une exception est levée si rencontrés (défaut).
     * - `lock`: Verrou à appliquer lors de la lecture / écriture (defaut: LOCK_EX).
     * - `directory_visibility`: La visibilité par défaut des dossiers (default: `private`).
     * - `permissions`: Les permissions CHMOD à appliquer aux fichiers / dossiers publics / privés.
     *   {@see https://flysystem.thephpleague.com/docs/usage/unix-visibility/}
     *
     * @param array $config Les options à applquer au driver.
     *                      Voir "Options disponibles" ci-dessus.
     *
     * @return Filesystem Le manipulateur de système de fichier local.
     */
    public static function createLocalDriver(array $config): Filesystem
    {
        $visibility = PortableVisibilityConverter::fromArray(
            $config['permissions'] ?? [],
            $config['directory_visibility'] ?? $config['visibility'] ?? Visibility::PRIVATE
        );

        $links = ($config['links'] ?? null) === 'skip'
            ? LocalAdapter::SKIP_LINKS
            : LocalAdapter::DISALLOW_LINKS;

        $adapter = new LocalAdapter($config['root'], $visibility, $config['lock'] ?? LOCK_EX, $links);
        return static::createFilesystem($adapter, $config);
    }

    /**
     * Permet de créer un manipulateur de système de fichier FTP.
     *
     * Options disponibles:
     * - `root`: Le dossier racine à partir duquel tous les chemins seront résolus (défaut: racine).
     * - `host`: L'hôte auquel se connecter (requis).
     * - `username`: Le nom d'utilisateur à utiliser pour la connexion (requis).
     * - `password`: Le mot de passe à utiliser pour la connexion (requis).
     * - `port`: Le port à utiliser pour la connexion. (défaut: 21)
     * - `ssl`: Doit-on utiliser SSL ? (défaut: `false`)
     * - `utf8`: Forcer l'utilisation du mode UTF8 ? (défaut: `false`)
     * - `timeout`: Délai de connexion après lequel une exception est levée. (défaut: 90)
     * - `passive`: Doit-on utiliser le mode passif pour déterminer le port à utiliser ? (défaut: `true`)
     * - `transferMode`: Le mode de transfert. Doit être soit `FTP_ASCII`, soit `FTP_BINARY`. (défaut: `FTP_BINARY`)
     * - `systemType`: Quel est le type de système ? Utile pour la normalisation des réponses.
     *                 (`windows` ou `unix` | défaut: `null`)
     * - `ignorePassiveAddress`: Doit-on ignorer l'adresse IP retournée par le serveur FTP en réponse à la commande
     *                           PASV et utilise plutôt l'adresse IP fournie dans le ftp_connect().
     *                           (`true` ou `false` | défaut: `null`)
     * - `timestampsOnUnixListingsEnabled`: Doit-on activer la récupération de la dernière modification dans les
     *                                      listings ? (défaut: `false`)
     * - `recurseManually`: Doit-on procéder aux récursions manuellement ou s'appuyer sur les
     *                      fonctions FTP ? (défaut: `true`)
     *
     * @param array $config Les options à applquer au driver.
     *                      Voir "Options disponibles" ci-dessus.
     *
     * @return Filesystem Le manipulateur de système de fichier local.
     */
    public static function createFtpDriver(array $config): Filesystem
    {
        if (!isset($config['root'])) {
            $config['root'] = '';
        }

        $adapter = new FtpAdapter(FtpConnectionOptions::fromArray($config));
        return static::createFilesystem($adapter, $config);
    }

    /**
     * Permet de créer un manipulateur de système de fichier SFTP.
     *
     * Options disponibles:
     * - `root`: Le dossier racine à partir duquel tous les chemins seront résolus (défaut: racine).
     * - `host`: L'hôte auquel se connecter (requis).
     * - `username`: Le nom d'utilisateur à utiliser pour la connexion (requis).
     * - `password`: Le mot de passe à utiliser pour la connexion. (défaut: `null`)
     *               (Peut-être `null` si la clé privée (`privateKey`) est utilisée)
     * - `privateKey`: La clé privée à utiliser pour la connexion. (défaut: `null`)
     *                 (Peut-être `null` si le mot de passe (`password`) est utilisé)
     * - `passphrase`: L'éventuelle passphrase à utiliser avec la clé privée. (défaut: `null`)
     * - `port`: Le port à utiliser pour la connexion. (défaut: 22)
     * - `useAgent`: Doit-on utiliser un agent SSH pour l'authentification ? (défaut: `false`)
     * - `timeout`: Délai de connexion après lequel une exception est levée. (défaut: 10)
     * - `maxTries`: Nom de tentative de connexion avant de lever une exception. (défaut: 4)
     * - `hostFingerprint`: L'emprunte attendue du serveur distant, si l'empreinte renvoyée
     *                      ne correspond pas, une exception sera levée. (défaut: `null`)
     * - `permissions`: Les permissions CHMOD à appliquer aux fichiers / dossiers publics / privés.
     *                  {@see https://flysystem.thephpleague.com/docs/usage/unix-visibility/}
     *
     * @param array $config Les options à applquer au driver.
     *                      Voir "Options disponibles" ci-dessus.
     *
     * @return Filesystem Le manipulateur de système de fichier local.
     */
    public static function createSftpDriver(array $config): Filesystem
    {
        $root = $config['root'] ?? '/';
        $provider = SftpConnectionProvider::fromArray($config);
        $visibility = PortableVisibilityConverter::fromArray(
            $config['permissions'] ?? []
        );

        $adapter = new SftpAdapter($provider, $root, $visibility);
        return static::createFilesystem($adapter, $config);
    }

    /**
     * Permet de créer un manipulateur de système de fichier AWS S3.
     *
     * NOTE: Pour utiliser ce driver, un profil IAM correctement configuré du côté de AWS est nécessaire.
     *       Voir {@see https://flysystem.thephpleague.com/docs/adapter/aws-s3-v3/} à ce sujet.
     *
     * Options disponibles:
     * - `root`: Le "dossier" racine à partir duquel tous les chemins seront résolus (défaut: racine du bucket).
     * - `key`: La clé AWS à utiliser pour la connexion (requis).
     * - `secret`: Le secret AWS à utiliser pour la connexion (requis).
     * - `token`: Le token AWS à utiliser pour la connexion.
     * - `bucket`: Le nom du bucket (requis).
     * - `region`: La région AWS qui héberge le bucket (requis).
     * - `retries`: Nom de tentative de connexion avant de lever une exception. (défaut: 3)
     * - `options`: Les options AWS par défaut à appliquer aux requêtes.
     *              Options AWS disponibles:
     *              'ACL', 'CacheControl', 'ContentDisposition', 'ContentEncoding',
     *              'ContentLength', 'ContentType', 'Expires', 'GrantFullControl',
     *              'GrantRead', 'GrantReadACP', 'GrantWriteACP', 'Metadata',
     *              'MetadataDirective', 'RequestPayer', 'SSECustomerAlgorithm',
     *              'SSECustomerKey', 'SSECustomerKeyMD5', 'SSEKMSKeyId',
     *              'ServerSideEncryption', 'StorageClass', 'Tagging',
     *              'WebsiteRedirectLocation',
     * - `visibility`: La visibilité par défaut des dossiers. (`public` ou `private` | défaut: `public`)
     * - `stream_reads`: Doit+on utiliser le streaming lors de la lecture ? (défaut: `false`)
     * - ... d'autres options bas-niveaux propres à AWS sont aussi utilisables pour la connexion.
     *       Voir {@see https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_configuration.html}
     *
     * @param array $config Les options à applquer au driver.
     *                      Voir "Options disponibles" ci-dessus.
     *
     * @return Filesystem Le manipulateur de système de fichier local.
     */
    public function createS3Driver(array $config): Filesystem
    {
        $s3Config = $config + ['version' => 'latest'];
        if (!empty($s3Config['key']) && !empty($s3Config['secret'])) {
            $s3Config['credentials'] = array_with_keys($s3Config, ['key', 'secret', 'token']);
        }

        $root = (string) ($s3Config['root'] ?? '');
        $streamReads = $s3Config['stream_reads'] ?? false;
        $visibility = new AwsS3PortableVisibilityConverter(
            $config['visibility'] ?? Visibility::PUBLIC
        );

        $client = new S3Client($s3Config);
        $adapter = new S3Adapter(
            $client,
            $s3Config['bucket'],
            $root,
            $visibility,
            null,
            $config['options'] ?? [],
            $streamReads,
        );

        return static::createFilesystem($adapter, $config);
    }

    /**
     * Crée une instance de FlySystem wrappée par une implémentation ajoutant
     * diverses méthdoes utiles au fonctionnement de l'application.
     *
     * @param FlysystemAdapter $adapter L'instance de l'adapter Flysystem bas-niveau.
     * @param array            $config  La configuration Flysystem / du wrapper haut-niveau.
     *
     * @return Filesystem L'instance du wrapper FlySystem haut-niveau.
     */
    protected static function createFilesystem(FlysystemAdapter $adapter, array $config): Filesystem
    {
        $flysystemConfig = array_with_keys($config, ['directory_visibility', 'visibility']);
        return new Filesystem(new Flysystem($adapter, $flysystemConfig));
    }
}
