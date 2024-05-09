# Changelog

Tous les changements notables sur le projet sont documentés dans ce fichier.

Ce projet adhère au principe du [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.24.0 (UNRELEASED)

- __[CHANGEMENT CRITIQUE]__ Loxya requiert maintenant au minimum PHP 8.1 pour fonctionner.
- L'application utilise maintenant le nom "Loxya" partout (plutôt que "Loxya (Robert2)").
- Ajoute le support PHP 8.2 et PHP 8.3.
- Le compte des événements pour les unités de matériel tient compte des événements supprimés (Premium).
- Les événements supprimés ne sont plus affichés dans le calendrier des techniciens.
- Dans la fiche bénéficiaire, un onglet "Historique" affiche la liste des e-mails qui ont été envoyés
  au bénéficiaire. Dans les fenêtres des événements et réservations, un onglet "Historique" affiche
  la liste des messages de rappels qui ont été envoyés aux bénéficiaires (Premium).
- Prend en charge l'utilisation d'un wildcard (`*`) pour configurer la création automatique du
  bénéficiaire lié à l'utilisateur se connectant via un service externe (CAS ou SAML2) (Premium).
- Ajout de la possibilité de définir les événements à l'heure près. Ceci se choisit à la première
  étape de l'édition d'un événement, en cochant, ou non, "Jours entiers?" (activé par défaut)
  dans le sélecteur des dates de l'événement. 
- Pour les réservations publiques, l'administrateur a la possibilité de configurer les
  réservations pour qu'elles soient basées sur des créneaux horaires précis ou sur des
  journées entières. Cette configuration est disponible dans les paramètres de réservation (Premium).
- Ajoute la possibilité de distinguer la période de l'événement (et donc de facturation si 
  celle-ci est activée), parfois appelée "Période d'exploitation", de la période de mobilisation
  du matériel. Ceci peut par exemple être utile pour inclure le temps nécessaire à l'installation
  et à la désinstallation du matériel avant et après l'événement.  
  La planification de cette période de mobilisation peut être effectuée lors de l'édition d'un événement. 
  Quoi qu'il en soit, la mobilisation du matériel commencera dès que l'inventaire de départ aura été marqué
  comme terminé (si celui-ci est effectué avant la date de mobilisation initialement prévue).
  Pour ce qui est du retour, c'est l'inventaire de retour qui permettra de signifier que le matériel est
  de retour en stock (ou bien la date de fin de mobilisation prévue en l'absence d'inventaire de retour
  avant celle-ci).
- __Attention__ lors de la mise à jour à l'étape de migration de la base de données, les dates
  de mobilisation des événements existants qui ont un inventaire de départ et/ou de retour terminé
  seront synchronisées avec les dates de ces inventaires. Si vous êtes abonné à une offre SaaS et que
  vous ne souhaitez pas que ces dates soient modifiées, mais plutôt que ce soient les dates des inventaires
  de départ et retour qui soient modifiées pour correspondre aux dates des événements, merci de _contacter
  le support_ avant de demander la mise à jour.
- Ajoute une page qui liste tous les événements (et réservations pour la Premium), avec une pagination,
  une recherche intelligente sur le titre, le lieu et le bénéficiaire, et un filtre par parc
  et par catégorie.
- Ajoute un paramètre utilisateur permettant de choisir la vue par défaut entre la frise
  temporelle (calendrier), et la liste paginée des événements et réservations.
- Lors de la modification des dates d'un événement (que ce soit en le déplaçant, ou en le faisant commencer 
  plus tôt ou terminer plus tard), les assignations des techniciens ne seront plus déplacées par l'application
  car celle-ci n'avait aucune garantie que le technicien était réellement disponible aux nouvelles dates et heures assignées
  (qui pouvaient d'ailleurs se retrouver au beau milieu de la nuit en fonction de la nouvelle date et heure de début de l'événement).
  Pour chaque assignation de technicien:
  - Si celle-ci est encore "réalisable" pendant les nouvelles dates sans changer quoi que ce soit, celle-ci sera conservée inchangée.
  - Si les nouvelles dates impactent en partie l'assignation, celle-ci sera tronquée / raccourcie.
  - Si les nouvelles périodes n'incluent plus du tout l'assignation, celle-ci sera supprimée.
  Une alerte a été ajoutée au moment d'éditer les dates pour rappeler à l'opérateur d'ajuster les assignations 
  après avoir changé les dates.
- Lors de la duplication des événements, l'assignation des techniciens ne sera plus dupliquée automatiquement.
  En effet, l'application n'avait aucune garantie que les techniciens assignés au précédent événement étaient réellement 
  disponibles aux nouvelles dates et heures dupliqués. L'assignation de techniciens nécessite dans la majorité des cas
  une validation humaine, d'autant qu'en fonction de l'heure de départ du nouvel événement, les assignations pouvaient se
  retrouver en dehors des heures ouvrables.
- Les réservations publiques (Premium) prennent maintenant en compte les heures et jours d'ouverture de l'établissement.
  Pour mettre en place ces plages sur votre instance hébergée par nos soins, n'hésitez pas à prendre contact avec nos services.
- Affiche le commentaire du demandeur dans la fenêtre d'une réservation, onglet "informations" (Premium).
- Corrige la suppression définitive d'un utilisateur ayant un bénéficiaire (ou technicien) lié dans la corbeille.
- Corrige le comportement des inventaires de retour quand un matériel qui a été supprimé est
  présent dans la liste.
- Ajoute la prise en charge de l'envoi des e-mails via le service inclut dans les abonnements SaaS.
- Ajoute une section dans les paramètres généraux, onglet "fiches de sortie", qui permet de choisir
  si on veut afficher ou non les colonnes "valeur de remplacement", "description du matériel",
  les "tags" associés au matériel, numéros de série des unités (Premium), et la photo du matériel.
- Ajoute la possibilité de joindre la fiche de sortie aux e-mails qui notifient les bénéficiaires que leur
  réservation a été approuvée (choix dans les paramètres globaux, onglet "Réservations en ligne") (Premium).
- Dans la fenêtre d'un événement ou d'une réservation, un nouveau bouton permet d'envoyer la liste
  du matériel par e-mail au(x) bénéficiaire(s) (Premium).
- À l'étape 3 ("techniciens") de l'édition des événements, un champ de recherche permet de chercher
  un technicien dans la liste, par son nom, son prénom ou son adresse e-mail.
- À l'étape 4 de l'édition des événements, les détails du matériel (avec la photo) sont affichés quand le
  curseur de la souris survole une ligne dans la liste.
- Dans la fenêtre d'un événement, un nouveau bouton permet d'envoyer la fiche de sortie en PDF à
  tous les techniciens qui sont assignés à l'événement (Premium).
- Dans la fenêtre d'un événement ou d'une réservation, un nouveau bouton permet de copier le permalien
  de la fiche de sortie dans le presse-papier. Toute personne utilisant ce lien pourra télécharger
  la fiche de sortie actualisée, au format PDF, même sans être connecté au logiciel (Premium).
- Il est maintenant possible de remettre les inventaires de départ et de retour en attente.
  Cela revient à annuler leur état "terminé" et à rétablir le stock en réintégrant les quantités cassés.

## 0.23.3 (2024-04-11)

- Limite le nombre de vérifications différées simultanées du matériel manquant (2 par défaut).

## 0.23.2 (2024-02-12)

- Sur le calendrier, la vérification du matériel manquant est différée pour optimiser les temps de chargement.
- Dans les devis et factures, le calcul de la remise s'applique sur le montant total, non plus sur le total journalier.

## 0.23.1 (2023-12-16)

- Les fiches de sorties des événements peuvent être éditées même en l'absence d'un bénéficiaire.
- Désactive TEMPORAIREMENT la vérification de l'absence de pénuries dans les inventaires de départ / retour
  en attendant la gestion horaire des événements / réservations (sans quoi cela pouvait être problématique 
  pour les événements / réservations avec retour / départ le même jour)
- Corrige une incohérence au niveau de la limitation de la remise applicable aux événements contenant du
  matériel non remisable. Le système proposait de définir un pourcentage de remise sur la totalité du prix
  (en fonction du matériel remisable) mais limitait l'application de ce pourcentage à la partie remisable (#402).
  Seuls les nouveaux devis / factures utiliseront ce nouveau mode de fonctionnement, plus logique, les anciens
  devis / factures ne seront évidemment pas modifies (les données étant de toute façon figées).
- Corrige une erreur 403 qui s'affichait lorsqu'un serveur HTTP de type Apache était utilisé pour "servir" l'application.

## 0.23.0 (2023-12-14)

- Mise à jour des dépendances du projet.
- Ajoute la prise en charge complète de l'authentification SAML 2.0 (Premium).
- La clé de configuration `apiUrl` a été renommée `baseUrl` dans le fichier de configuration.  
  L'ancien nom est toujours pris en charge pour le moment pour une question de rétro-compatibilité. 
  (il sera toutefois supprimé dans une future version, pensez à mettre à jour vos 
  `settings.json` si vous ne disposez pas d'une offre SaaS)
- Ajoute une commande permettant d'envoyer un e-mail de test via la console (Premium).
- L'import de bénéficiaires en masse est maintenant possible depuis un fichier CSV (Premium).
- Corrige l'affichage des disponibilités des techniciens à l'étape 3 de la modification d'événement.
- Ajoute un endpoint `/healthcheck` (désactivé par défaut) pour vérifier l'état de l'instance,
  et la date de dernière modification de son matériel, événements ou réservations.
- Corrige le champ de recherche des demandes de réservations.
- Permet la modification du matériel des réservations jusqu'au dernier jour de sortie (Premium).
- Prise en charge des inventaires de départ des événements et réservations.
- Corrige un souci lors de la sauvegarde d'une unité de matériel avec une référence déjà 
  existante pour le même matériel (l'erreur de sauvegarde faisait penser à un bug de l'application).
- Il est maintenant possible de chercher dans les événements par lieu.
- Prise en charge des retour à la ligne dans l'affichage de description des matériels.
- Corrige l'affichage et le tri des quantités cassées dans le matériel.
- Ajoute une page permettant de consulter les informations d'un bénéficiaire, son historique de commandes,
  ainsi que la liste des devis et factures qui lui ont été adressés.
- Corrige la duplication d'événement lorsque des unités de l'événement d'origine sont 
  déjà utilisées au même moment que dans le nouvel événement (Premium).
- Corrige la duplication d'événement lorsque des techniciens de l'événement d'origine sont 
  déjà mobilisés au même moment que dans le nouvel événement (voir #346).
- Améliore les sélecteurs de dates, notamment en permettant de choisir des périodes pré-définies quand 
  c'est utile (par exemple dans les filtres de période matériels et techniciens).
- Corrige un problème de performance lors de la récupération des réservations et événements liés
  aux matériels et bénéficiaires. La récupération se fait maintenant de manière séquentielle (voir #387).

## 0.22.2 (2023-08-11)

- Enlève le tri par liste dans les fiches de sorties classées par parc (Premium).
- Supprime la contrainte d'unicité sur l'e-mail de la table `persons` (#394).
- Ajoute des observers qui suppriment automatiquement les enregistrements "orphelins"
  de la table `persons` (#394).
- Corrige un problème d'affichage impactant les quantités dans le sélecteur de 
  matériel lors de la suppression d'un matériel de la liste.

## 0.22.1 (2023-08-04)

- L'utilisation d'un champ de tri non autorisé ne provoque plus de dysfonctionnement dans les pages de listing.
- Corrige les boutons de modification et suppression des emplacements de parc (Premium).

## 0.22.0 (2023-08-03)

- Ajoute la possibilité de choisir un emplacement de rangement pour chaque matériel
  au sein d'un parc, et affiche cette information dans les fiches de sorties et les
  inventaires de retour (Premium #294).
- Dans les inventaires de retour des événements, un bouton permet d'envoyer une notification
  par e-mail aux techniciens assignés à l'événement, tant que le matériel n'a pas été
  complètement retourné, ou que l'inventaire n'est pas terminé (Premium #293).
- Dans le calendrier, un nouveau filtre permet de filtrer les événements par catégorie
  du matériel qu'il contient (Premium #297).
- Affiche la durée des événements et réservations dans l'onglet "périodes de réservation"
  de la fiche matériel (Premium #204).
- Ajoute la notion de technicien "préparateur de commande" : à l'étape 1 de la modification
  des événements, on peut choisir un préparateur de commande. Celui-ci sera ensuite notifié
  automatiquement la veille du premier jour de l'événement, par un e-mail qui contient la
  fiche de sortie en pièce jointe (Premium #295).
- Corrige le calcul du prochain numéro de facture en prenant en compte le numéro des factures 
  supprimées.
- Améliore grandement les performances de calcul des disponibilités du matériel. Cela se traduit
  par des temps de chargement divisés par 5 (donc un gain de 500% !) dans le calendrier, mais aussi
  à l'étape 4 de l'édition d'événement, et dans l'onglet "périodes de réservation" du matériel (Premium #321).
- Ajoute la possibilité de télécharger la fiche de sortie avec une page par parc de matériel (Premium #290).
- Les événements peuvent maintenant avoir plusieurs sous-listes de matériel distinctes (Premium #289).

## 0.21.2 (2023-05-15)

- Corrige l'édition des modèles de liste (Premium).
- Corrige la modification du matériel des événements qui se terminent le jour courant.

## 0.21.1 (2023-05-15)

- Corrige les inventaires de retour qui n'affichaient plus la liste du matériel.
- Corrige la prise en charge de la configuration des fichiers autorisés à l'upload côté Front (Premium #313).
- Corrige le comportement des onglets dans les fiches matériel et technicien.

## 0.21.0 (2023-05-11)

- Dans la liste du matériel, le champ "Afficher les quantités restantes à date" est pré-rempli avec
  la date courante, et la quantité disponible est affichée à côté de la quantité totale en stock,
  pour faciliter la comparaison.
- Corrige le comportement de la pagination des listings quand on essaye de charger une plage de données
  qui n'existe pas ou plus (Premium #229).
- Les caractéristiques spéciales peuvent être totalisées en bas de la liste du matériel
  de la fiche de sortie des événements et réservations (Premium #266). Un nouveau champ "Totalisable"
  permet de contrôler si la caractéristique doit être utilisée ou non dans les totaux.
- Tous les champs des caractéristiques spéciales du matériel peuvent être modifiés, à l'exception du
  champ "type", qui ne peut pas changer.
- Ajout de la possibilité de personnaliser les échantillons de couleurs proposés dans le sélecteur de 
  couleur via la clé `colorSwatches` dans configuration JSON du projet (`settings.json`).
- Il est maintenant possible de rattacher des documents aux techniciens, aux réservations et aux 
  événements (Premium #264, #298).
- L'URL de la partie "réservation en ligne" (/external) peut être copiée directement depuis la page des
  paramètres de la réservation en ligne.
- Un nouvel onglet dans les paramètres du logiciel permet de contrôler le comportement des inventaires
  de retour : soit l'inventaire est vide au départ, et doit être rempli manuellement (comportement par
  défaut), soit les quantités retournées sont pré-remplies, et il faut décocher ce qui n'est pas revenu.
- Ajoute la possibilité de modifier la liste du matériel des réservations approuvées ou en attente,
  tant que la facturation n'est pas activée (Premium #287).
- Les unités de matériel qui sont utilisées dans les événements ou les réservations sont à nouveau
  affichées dans l'onglet "Périodes de réservation" de la fiche matériel (Premium #284).
- Les références des unités utilisées dans un événement ou une réservation sont affichées dans
  l'onglet "materiel" de la fenêtre de l'événement ou réservation (Premium #284).
- Quand l'utilisateur connecté a des parcs restreints et qu'il n'a accès qu'à un seul parc de matériel,
  le filtre par parc du calendrier est pré-rempli avec ce parc (Premium #163).

## 0.20.6 (2023-04-14)

- Pour les réservations en ligne, le comportement du délai minimum avant réservation a été revu
  pour permettre la création d'une réservation pour le jour même.
- Dans la réservation en ligne, l'ajout au panier d'un matériel faisant partie d'un parc
  restreint n'est plus possible même via l'API (Premium #163).
- Il est maintenant possible d'assigner un technicien dès minuit du premier jour de l'événement,
  et jusqu'à minuit du dernier jour. On peut également assigner le même technicien sur
  des créneaux horaires qui se suivent (premium #288).

## 0.20.5 (2023-03-28)

- Corrige un problème d'accès aux événements du calendrier pour les utilisateurs ne faisant pas
  partie du groupe "administrateurs".
- Lors de l'assignation des techniciens à un événement, les indisponibilités des techniciens affichent
  maintenant le bon titre des événements sur lesquels ils sont déjà assignés.

## 0.20.4 (2023-03-24)

- Les utilisateurs du groupe "visiteur" ne voient plus l'entrée de menu "Demandes de réservation",
  car ils n'y ont pas accès.
- Quand la liste du matériel est filtrée par parc, le calcul de la quantité en panne du matériel unitaire
  prend maintenant en compte ce filtre (Premium #169).

## 0.20.3 (2023-03-20)

- Les unités de matériel sont maintenant triées par références (Premium #271).
- Utilise maintenant des dates au format britannique ([Jour]/[Mois]/[Année]) plutôt 
  qu'americain ([Mois]/[Jour]/[Année]) lorsque l'anglais est utilisé comme langue de l'interface.

## 0.20.2 (2023-03-17)

- Spécifie que la version de PHP requise doit être 64 bits.
- Ajoute une migration qui met le champ `is_billable` de tous les événements à `false` quand la facturation
  est désactivée dans la configuration globale.
- Corrige un problème (introduit dans la version 0.20.0) dans le calcul des disponibilités 
  du matériel pour le matériel non unitaire qui avait tendance à sous-évaluer les quantités 
  restantes en stock. 

## 0.20.1 (2023-03-16)

- Corrige un problème qui empêchait de lancer la mise à jour de la base de données sur certaines installations.

## 0.20.0 (2023-03-14)

- __[CHANGEMENT CRITIQUE]__ Loxya (Robert2) requiert maintenant au minimum PHP 8.0 pour fonctionner (OSS #375).
- Ajoute le support PHP 8.1 (OSS #328).
- Change le nom de l'application en "Loxya (Robert2)" partout.
- Corrige divers problèmes de sécurité liés aux comptes utilisateurs.
- Corrige la traduction anglaise du mot "facture" ("bill" → "invoice") partout (OSS #377).
- Améliore le système de traduction, et formate des dates correctement pour la langue anglaise (OSS #378).
- Corrige la copie via le bouton "Copier" dans le champ d'URL du calendrier public (OSS #369).
- Ajoute l'extension `iconv` dans la liste des extensions requises lors de l'installation (OSS #371).
- Corrige le filtre sur les périodes de disponibilités dans le listing des techniciens qui ne prenait pas 
  correctement en compte les événements dont la date de début était antérieure à la date de début du filtre 
  (+ idem pour les dates de fin).
- Corrige, sur la page de calendrier sur mobile, l'affichage de la fenêtre de détails des événements
  lors du double-click (OSS #359).
- Dans la fenêtre des événements, les totaux affichent plus de détails (montants H.T. et T.T.C., et remise éventuelle).
- Dans la fenêtre des événements, les coordonnées du bénéficiaire principal sont affichées dans l'onglet "informations".
- Dans la liste du matériel d'un événement, améliore l'affichage des quantités utilisées.

### Changements spécifiques à la variante Premium

- __[CHANGEMENT CRITIQUE]__ Dorénavant, si aucun groupe n'a pu être récupéré lors de la connexion CAS, l'utilisateur ne 
  sera plus assigné au groupe "Visiteur" mais sera __déconnecté__. Pour rétablir le fonctionnement précédent, assignez la
  valeur `visitor` à la nouvelle option `auth.CAS.defaultGroup`.
- Corrige l'authentification CAS : le nom et le prénom des utilisateurs CAS sont maintenant obligatoires.
- Il est maintenant possible de paramétrer le groupe assigné par défaut lorsqu'aucun groupe n'a 
  pu être récupéré lors de la connexion CAS (via l'option de configuration `auth.CAS.defaultGroup`). 
  Il est aussi possible d'empêcher la connexion lorsqu'aucun groupe n'a pu être récupéré (Premium #38).
- Une nouvelle option de configuration CAS `auth.CAS.beneficiaryGroups` permet d'associer la présence de certains 
  groupes parmi les groupes CAS retournés avec la création d'un profil bénéficiaire pour l'utilisateur. Ceci ne
  remplace pas le mapping du groupe vers un groupe Robert 2 / Loxya qu'il faudra quand même configurer.  
  Par exemple, supposons que vous ayez un groupe CAS `Student` pour lequel vous souhaitez autorisé les réservations 
  publiques (qui nécessitent donc un profil bénéficiaire). Vous pourrez configurer l'option `auth.CAS.beneficiaryGroups`
  à `["Student"]` et l'option `auth.CAS.groupsMapping` à `{ "Student": "external" }`.  
  Ceci aura pour effet d'autoriser la connexion de vos élèves en leur assignant un profil bénéficiaire et en autorisant
  seulement l'accès à la partie réservation publique de l'application (et pas le panel d'administration).  
  Si par contre, vous souhaitez leur donner accès au panel, vous pouvez tout à fait modifier `auth.CAS.groupsMapping` 
  en spécifiant par exemple `{ "Student": "visitor" }`.
- Les étiquettes passent maintenant du format 50x25mm à 50x24mm (Premium #197).
- Les unités cassées sont maintenant considérées comme manquantes dans les événements.
- Ajoute la possibilité de lier un utilisateur à un bénéficiaire depuis le formulaire d'édition bénéficiaire (Premium #182).
- Ajoute les "réservations en ligne" : permettre aux bénéficiaires de faire eux-même des demandes de réservation du
  matériel, grâce à leur compte personnel, dans une partie "externe" (Premium #182).
- Ajoute le choix des utilisateurs du groupe "membre" pouvant approuver le matériel dans les demandes de réservation (Premium #182).
- Un nouveau paramètre utilisateur a été ajouté : la possibilité de désactiver les notifications par e-mail (Premium #254).
- Corrige le calcul du nombre d'articles en stock pour les parcs (Premium #224).
- Dans la liste du matériel d'un événement, il est maintenant possible de scanner les unités cassées avec la scanette (Premium #178).

## 0.19.3 (2022-10-28)

- Améliore le temps de chargement des événements dans le calendrier (#210).

## 0.19.2 (2022-07-29)

- Un problème lors de la création du premier utilisateur dans le wizard d'installation a été corrigé (#367).
- Dans la liste du matériel, le clic sur la référence ou le nom d'un matériel ouvre à nouveau sa page.
- La génération des factures fonctionne même si tout le matériel de la liste a une valeur de remplacement totale de 0.
- Il est possible de cliquer sur les noms des techniciens dans la liste pour voir leur fiche.

## 0.19.1 (2022-07-19)

- Corrige le titre de la page d'édition d'événement.
- Corrige les erreurs de validation pour la création des devis et du matériel en mode prêt.
- Corrige l'affichage des horaires de techniciens sur la fiche de sortie (#366).

## 0.19.0 (2022-07-18)

- Empêche la suppression des parcs qui contiennent du matériel (#362).
- Le nom et le prénom des utilisateurs sont maintenant obligatoires (#356).
- Pour le matériel, la catégorie est devenue une donnée facultative. Un matériel sans catégorie est donc classé sous le label 
  "Non catégorisé" dans les listes. Lors de la suppression d'une catégorie, le matériel qui lui était assigné devient donc "non catégorisé".
- Quand la liste du matériel des fiches de sortie est triée par catégories, celles-ci apparaissent maintenant par ordre alphabétique.
- Un problème a été corrigé dans l'agenda ICS "public", qui rendait impossible son utilisation dans certains cas (notamment Google Agenda) (#360).

## 0.18.1 (2022-03-29)

- Corrige la page d'édition des techniciens.

## 0.18.0 (2022-03-28)

- __[CHANGEMENT CRITIQUE]__ Robert2 requiert maintenant au minimum PHP 7.4 pour fonctionner (#327).
- Augmente la taille du champ `degressive_rate` des tables `bills` et `estimates` pour qu'il accepte une valeur jusqu'à 99999,99 (quand un événement est très long), au lieu de juste 99,99 (#329).
- Ajoute la possibilité de configurer les données affichées dans les événements du calendrier 
  via la page des paramètres de l'application (fin du ticket #302).
- Il est maintenant possible de s'abonner depuis votre application de calendrier préférée (Google Agenda, Apple Calendrier, etc.) au calendrier Robert2 / Loxya. 
  Pour plus d'informations, rendez-vous dans les paramètres de votre instance Robert2 / Loxya, onglet "Calendrier" (#326).
- Corrige un problème de formatage des données de configuration lors de l'installation (#100).
- Ajoute une limite de taille des fichiers uploadés dans la configuration générale (valeur par défaut 25 Mo) (#332).
- Ouvre le détail du matériel au clic sur son nom ou sa référence dans la liste (#331).
- Sur la fiche de sortie, supprime la mention inutile "autre matériel" de la liste du matériel triée par sous-catégories, quand la catégorie n'a aucune sous-catégorie (#319).
- Sur la fiche de sortie, affiche l'adresse de la société du bénéficiaire (si elle existe), à la place de celle de la personne (#341).
- Enlève la possibilité de trier sur la colonne "quantité restante" dans la liste du matériel (#324).
- Corrige le comportement du sélecteur de la société associée au bénéficiaire, dans le formulaire d'édition, pour qu'il fonctionne avec un grand nombre de sociétés existantes (#340).
- Corrige le tri des bénéficiaires par nom de la société (#342).
- Corrige le problème de rafraîchissement du calcul du matériel disponible après changement des quantités dans l'édition des événements (#348).
- Conserve la sélection des colonnes affichées dans les listings, même après un rechargement de la page (#144).

## 0.17.1 (2022-01-06)

- Corrige l'erreur de l'étape 5 du wizard d'installation (double boot du kernel).

## 0.17.0 (2022-01-05)

- Enlève la limite de caractères du champ "lieu" des événements (#300).
- Google Maps est maintenant utilisé à la place de OpenStreetMap pour ouvrir les adresses (#300).
- Utilise une période plutôt qu'une simple date pour le calcul des quantités disponibles du matériel (#301).
- Il est maintenant possible de choisir ce qui est affiché ou non dans les événements sur le calendrier (#302).
- Affiche le nom de l'utilisateur qui a créé l'événement dans la fenêtre d'événement.
- Supprime automatiquement la sous-catégorie quand la catégorie change lors de la sauvegarde du matériel (#306).
- Permet la création des inventaires de retour dès le premier jour des événements, sans pouvoir les terminer avant leur dernier jour (#307).
- Ajoute un paramètre permettant d'afficher ou non les numéros légaux sur les fiches de sortie (#310).
- Ajoute une colonne vide "Qté retour" dans la liste du matériel des fiches de sortie (#313).
- Trie les listes de matériel imprimées selon la catégorie (en affichant leur nom) en plus des sous-catégories (#315).
- Améliore les performances du chargement des événements du calendrier (de ~4 secondes à ~150 millisecondes sur un calendrier rempli) (#32).

## 0.16.2 (2021-11-04)

- Corrige la normalisation des horaires d'assignation des techniciens.

## 0.16.1 (2021-11-03)

- Corrige l'affichage de la corbeille dans le listing du matériel.

## 0.16.0 (2021-11-02)

- Commence l'amélioration du code front-end : réécriture en TypeScript, et utilisation de la nouvelle "composition API" de Vue.js.
- Corrige le comportement de la modale d'assignation de technicien (étape 3 de l'édition d'événement) en cas d'erreur serveur (#294).
- Corrige le comportement du calendrier principal quand un technicien a été supprimé (#293).
- Permet l'affichage des techniciens mis à la corbeille (#293).
- Corrige le problème d'assignation de technicien avec MySQL 5.7 (#294).
- À l'étape 4 de l'édition d'événement, ajoute la possibilité de sélectionner un autre événement pour réutiliser sa liste de matériel (#291).

## 0.15.1 (2021-09-21)

- Corrige une migration avec l'utilisation de préfixe de table (#288).

## 0.15.0 (2021-09-08)

- Change l'étape 3 de création / modification d'événement : ajoute une frise temporelle permettant de visualiser les assignations de tous les techniciens pour la période de l'événement, et d'assigner les techniciens à des horaires précis (#193).
- Ajoute une page qui affiche les informations d'un technicien (#188).
- Ajoute un onglet "Agenda" dans la page des techniciens qui montre un calendrier avec toutes les assignations du technicien (#188).
- Ajoute un filtre dans la liste des techniciens permettant de n'afficher que ceux qui sont disponibles dans une période donnée (#189).
- Ajoute la possibilité d'afficher un logo sur les PDF (en ajoutant une clé `company.logo` dans les `settings.json` et un fichier dans `public/img/`).
- Affiche le détail des horaires des techniciens dans les fiches de sortie (#190).
- Adapte l'affichage de la liste des techniciens dans la fenêtre d'événement et à l'étape 5 de l'édition d'événement (#191).
- Ajoute un onglet "Techniciens" dans la fenêtre d'événement qui affiche une frise temporelle des assignations (#192).
- Corrige le comportement des champs de quantité à l'étape 4 de l'édition d'événement (#213).
- Corrige le comportement du bouton "Afficher les quantités à date..." de la page de listing du matériel.
- Sécurise le fichier `progress.json` de l'assistant d'installation si on saute l'étape de création des catégories (#169).
- Conserve en mémoire les données des formulaires en cours de remplissage pour les nouveaux bénéficiaires, techniciens, matériel, parcs et utilisateurs (#173).
- Uniformise l'affichage des principaux formulaires.
- Ferme la fenêtre automatiquement et centre la frise temporelle sur le nouvel événement qui vient d'être créé après une duplication.
- Ajoute une infobulle au dessus des événements lors de leur déplacement dans les frises temporelles pour mieux visualiser les nouvelles dates avant de valider le déplacement (#247).
- Améliore l'utilisation des caractéristiques spéciales dans la page d'ajout / modification du matériel.
- Rend les catégories non-supprimables quand du matériel leur est assigné.
- Affiche systématiquement l'option par défaut dans les listes de sélection, même vides, plutôt qu'aucune option.
- Ajoute des messages d'aide dans l'encart de création de devis et factures, concernant les remises quand du matériel non-remisable est présent dans l'événement (#253).
- Corrige l'étape "3 - société" de l'assistant d'installation.

## 0.14.3 (2021-07-12)

- Corrige la migration qui posait problème avec les préfixes de table (#198).

## 0.14.2 (2021-07-09)

- Améliore les perfs des parcs : pas d'injection du montant total même pour le getOne().

## 0.14.1 (2021-07-08)

- Corrige une migration qui posait problème (#196).

## 0.14.0 (2021-07-07)

- Ajoute la possibilité de vérifier que tout le matériel est bien retourné à la fin d'un événement (#4).
- Simplifie la signification des couleurs des événements dans le calendrier.
- Désactive le cache des routes d'API pour l'environnement de développement.
- Désactive quelques règles ESlint pour faciliter le développement.
- Améliore et corrige le système d'affichage du titre des pages.
- Utilise des icônes cohérents pour le statut des événements dans le calendrier et la fenêtre d'événement.
- Ajoute une petite légende sous le calendrier pour expliquer les couleurs et icônes des événements (#155).
- Affiche les caractéristiques spéciales du matériel dans les fiches de sortie (#147).
- Ajoute la possibilité d'imprimer (en PDF) une liste de tout le matériel (ou de chaque parc séparément), à des fins d'inventaire (#149).
- Ajoute la possibilité d'archiver un événement, s'il est passé et que son inventaire de retour a été effectué (#152) (👏 @adamlarat).
- Ajoute la gestion des paramètres des fiches de sortie (#150), permettant de :
  - Choisir le type de classement pour la liste du matériel (par catégories, sous-catégories, par parc ou bien non classé).
  - Mettre un texte personnalisé en bas de page des fiches de sortie.
- Permet la suppression des utilisateurs qui ont déjà créé des événements (#159).
- À la création d'un matériel, le champ "parc" est pré-rempli uniquement si il n'existe qu'un seul parc dans la liste (#162).
- Met en valeur les champs qui ont des erreurs de validation avec une bordure rouge (#161).
- Regroupe les boutons d'actions secondaires de la fenêtre des événements dans un menu.
- Ajoute une action secondaire dans la fenêtre des événements pour supprimer l'événement.
- Ajoute une action secondaire dans la fenêtre des événements pour cloner l'événement avec de nouvelles dates (#120).
- Optimise le chargement de la liste des parcs en ajoutant un bouton qui récupère le montant total du parc (#171).
- Affiche les totaux du parc dans son formulaire de modification.

## 0.13.2 (2021-05-31)

- Corrige l'affichage de la valeur de remplacement du matériel dans les fiches de sortie en mode "flat" (#156).

## 0.13.1 (2021-05-25)

- Corrige le fonctionnement des filtres à l'étape 4 de l'edition d'un événement.

## 0.13.0 (2021-05-14)

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
