/* eslint-disable quotes */
/* eslint-disable quote-props */
export default {
  'page-login': {
    'title': "Connexion",
    'welcome': "Bonjour\u00a0! Qui êtes vous\u00a0?",
    'connexion': "Connexion",
    'login-with-cas': "Connexion via CAS",
    'please-wait': "Authentification, merci de patienter...",
    'bye': "À bientôt\u00a0!",
    'footer': "Robert2 est un logiciel libre. Vous pouvez le copier et le redistribuer librement, sauf pour une utilisation commerciale.",
    'official-website': "Site web officiel",
    'community-forum': "Forum de la communauté",

    'error': {
      'bad-infos': "Les informations fournies sont incorrectes. Utilisez votre adresse e-mail ou votre pseudo, et votre mot de passe.",
      'expired-session': "Votre session a expiré. Merci de vous reconnecter\u00a0!",
      'not-allowed': "Vous avez essayé d'accéder à une page dont l'accès vous est interdit. Merci de vous connecter avec un compte qui y a accès.",
    },
  },

  'page-profile': {
    'title': "Votre profil",
    'help': "Si vous modifiez votre email, votre pseudo ou votre mot de passe, ne les oubliez pas avant de vous déconnecter\u00a0!",
    'you-are-group': "Vous êtes\u00a0: {group}.",
    'edit-password': "Modifier votre mot de passe",
    'password-confirmation': "Confirmation du mot passe",
    'password-confirmation-must-match': "Le mot de passe et sa confirmation doivent être identiques.",
    'password-modified': "Votre mot de passe a bien été modifié.",
    'saved': "Votre profil a bien été sauvegardé.",
  },

  'page-settings': {
    'title': "Vos paramètres",
    'help': "La « durée d'une session » est le temps imparti avant votre déconnexion automatique de l'application.",
    'auth-token-validity-duration': "Durée max. d'une session",
    'interface': "Interface",
    'language': "Langue",
    'hours': "heures",
    'saved': "Paramètres sauvegardés.",
  },

  'page-calendar': {
    'title': "Calendrier",
    'help': (
      `Cliquez-glissez pour déplacer la frise temporelle.
      Utilisez la molette pour zoomer / dézoomer.
      Double-cliquez sur une colonne vide pour créer un événement avec la date de départ pré-remplie.`
    ),
    'help-center-view-on-today': "Centrer le calendrier sur aujourd'hui",
    'help-add-event': "Créer un nouvel événement",
    'add-event': "Nouvel événement",
    'confirm-delete': "Mettre cet événement à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement cet événement\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer cet événement\u00a0?",
    'event-deleted': "L'événement a bien été supprimé.",
    'event-saved': "L'événement a bien été sauvegardé.",
    'loading-event': "Chargement de l'événement...",
    'help-timeline-event-operations': (
      `Cliquez une fois pour sélectionner l'événement, afin de le déplacer, le redimensionner ou le supprimer.
      Double-cliquez sur l'événement pour en ouvrir l'aperçu, et en modifier les détails.`
    ),
    'center-on-today': "Centrer sur aujourd'hui",
    'center-on': "Centrer sur le",
    'this-event-is-past': "Cet événement est passé.",
    'this-event-is-currently-running': "Cet événement se déroule en ce moment.",
    'this-event-is-confirmed': "Cet événement est confirmé.",
    'this-event-is-locked-past-confirmed': "Cet événement est verrouillé car il est confirmé, et déjà passé.",
    'this-event-has-missing-materials': "Cet événement a du matériel manquant.",
    'all-events': "Tous les événements",
    'event-with-missing-material-only': "Événements en manque de matériel uniquement\u00a0?",
    'display-all-parks': "Tous les parcs",
  },

  'page-events': {
    'help-edit': "",
    'back-to-calendar': "Retour au calendrier",
    'add': "Nouvel événement",
    'edit': "Modifier l'événement «\u00a0{pageSubTitle}\u00a0»",
    'edit-event': "Modifier l'événement",
    'save-and-back-to-calendar': "Sauvegarder et retour au calendrier",
    'save-and-continue': "Sauvegarder et continuer",
    'step': "Étape",
    'event-informations': "Informations",
    'event-beneficiaries': "Bénéficiaires",
    'event-technicians': "Techniciens",
    'event-materials': "Matériel",
    'event-summary': "Récapitulatif",
    'event-confirmation': "Confirmation",
    'saved': "Événement sauvegardé.",
    'not-saved': "L'événement comporte des modifications non sauvegardées",
    'display-only-selected-materials': "Afficher uniquement le matériel de l'événement\u00a0?",
    'display-all-materials-to-add-some': "Afficher tout le matériel pour en ajouter",
    'display-only-event-materials': "Afficher uniquement le matériel de l'événement",
    'event-not-confirmed-help': "L'événement n'est pas encore confirmé, il est susceptible de changer à tout moment.",
    'event-confirmed-help': "L'événement est confirmé\u00a0: Ses informations ne devraient plus changer.",
    'event-missing-materials': "Matériel manquant",
    'event-missing-materials-help': "Il s'agit du matériel manquant pour la période de l'événement, car il est utilisé dans un autre événement, le nombre voulu est trop important, ou quelques uns sont en panne. Ce matériel doit donc être ajouté au parc, ou bien loué auprès d'une autre société.",
    'warning-no-material': "Attention, cet événement est vide, il ne contient aucun matériel pour le moment\u00a0!",
    'warning-no-beneficiary': "Attention, cet événement n'a aucun bénéficiaire\u00a0!",
    'missing-material-count': "Besoin de {quantity}, il en manque\u00a0{missing}\u00a0!",
    'beneficiary-billing-help': "Seul le premier bénéficiaire de la liste apparaîtra sur la facture.",
    'no-units-available': "Aucune unité disponible pendant cet événement pour ce matériel.",
  },

  'page-users': {
    'title': "Utilisateurs",
    'help': "Vous pouvez envoyer un email à un utilisateur en cliquant sur son adresse.",
    'help-edit': (
      `- Le groupe «\u00a0Administrateur\u00a0» donne tous les droits à l'utilisateur.
      - Le groupe «\u00a0Membre\u00a0» permet à l'utilisateur d'utiliser la plupart des fonctions de Robert.
      - Le groupe «\u00a0Visiteur\u00a0» donne un accès limité à certaines données.`
    ),
    'action-add': "Nouvel utilisateur",
    'add': "Nouvel utilisateur",
    'edit': "Modifier l'utilisateur «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modifier l'utilisateur",
    'confirm-delete': "Mettre cet utilisateur à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement cet utilisateur\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer cet utilisateur\u00a0?",
    'saved': "Utilisateur sauvegardé.",
    'profile-missing-or-deleted': "Profil manquant ou supprimé",
    'parks-access': "Accès aux parcs de matériel",
    'restrict-access-to-parks': "Restreindre l'accès à certains parcs",
  },

  'page-beneficiaries': {
    'title': "Bénéficiaires",
    'help': "Vous pouvez envoyer un email à un bénéficiaire en cliquant sur son adresse.",
    'action-add': "Nouveau bénéficiaire",
    'add': "Nouveau bénéficiaire",
    'edit': "Modifier le bénéficiaire «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modifier le bénéficiaire",
    'beneficiary-type': "Type de bénéficiaire",
    'person': "Personne physique (individu)",
    'company': "Personne morale (entreprise)",
    'help-edit': "Seuls le nom et le prénom de la personne sont obligatoires.",
    'confirm-delete': "Mettre ce bénéficiaire à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement ce bénéficiaire\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer ce bénéficiaire\u00a0?",
    'saved': "Bénéficiaire sauvegardé.",
  },

  'page-companies': {
    'title': "Sociétés",
    'add': "Nouvelle société",
    'edit': "Modifier la société «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modifier la société",
    'edit-btn': "Modifier la société",
    'create-new': "Ajouter une nouvelle société",
    'help-edit': "La raison sociale (nom de la société) est obligatoire.",
    'attached-persons': "Personnes associées à la société",
    'saved': "Société sauvegardée.",
  },

  'page-materials': {
    'title': "Matériel",
    'help': "Vous pouvez choisir un parc, une catégorie ou des étiquettes pour filtrer le matériel.",
    'action-add': "Nouveau matériel",
    'manage-attributes': "Gérer les caractéristiques spéciales",
    'display-quantities-at-date': "Afficher les quantités à date...",
    'remaining-quantities-on-date': (
      `Quantités restantes
      le {date}`
    ),
    'add': "Nouveau matériel",
    'edit': "Modifier le matériel «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modifier le matériel",
    'help-edit': (
      `Utilisez un nom assez court pour le matériel, et la description pour entrer dans les détails.\n
      Si vous cochez la case «\u00a0identification unitaire\u00a0», vous aurez la possibilité de spécifier des
      unités de ce matériel dans l'onglet «\u00a0unités\u00a0» de la page du matériel, après avoir sauvegardé
      le présent formulaire.`
    ),
    'view': "Détails du matériel «\u00a0{pageSubTitle}\u00a0»",
    'confirm-delete': "Mettre ce matériel à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement ce matériel\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer ce matériel\u00a0?",
    'saved': "Matériel sauvegardé.",
    'clear-filters': "Réinitialiser les filtres",
  },

  'page-materials-view': {
    'title': "Détails du matériel",
    'documents': {
      'no-document': "Aucun document pour le moment.",
      'drag-and-drop-files-here': "Glissez-déposez des fichiers ici ↓ pour les ajouter.",
      'choose-files': "Ou cliquez ici pour choisir des fichiers à ajouter",
      'send-files': [
        "Envoyer le fichier",
        "Envoyer {count} fichiers",
      ],
      'click-to-open': "Cliquez pour ouvrir / télécharger le fichier",
      'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement ce document\u00a0?",
      'saved': "Documents sauvegardés.",
      'deleted': "Document supprimé.",
    },
    'booking-periods': {
      'title': "Périodes de réservation",
      'used-units': "Unités utilisées",
      'currently-out': "Actuellement sorti",
      'done': "Terminé",
      'expected-to-be-out-on': "Sortie prévue le {date}",
    },
    'add-unit': "Ajouter une unité",
  },

  'page-material-units': {
    'add': "Nouvelle unité pour le matériel «\u00a0{pageSubTitle}\u00a0»",
    'edit': "Modifier l'unité «\u00a0{pageSubTitle}\u00a0»",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement cette unité\u00a0?",
    'saved': "Unité sauvegardée.",
  },

  'page-attributes': {
    'title': "Caractéristiques spéciales du matériel",
    'help': (
      `Ici vous pouvez ajouter les champs qui permettent de décrire votre matériel selon vos propres critères.
      Une fois créée, une caractéristique spéciale ne pourra plus être modifiée (sauf son nom).`
    ),
    'go-back-to-material': "Retourner au matériel",
    'name': "Nom de la caractéristique",
    'type': "Type de donnée",
    'unit': "Unité",
    'max-length': "Taille max.",
    'type-string': "Texte",
    'type-integer': "Nombre entier",
    'type-float': "Nombre décimal",
    'type-boolean': "Booléen (Oui / Non)",
    'type-date': "Date",
    'no-limit': "Sans limite",
    'add-attributes': "Ajouter des caractéristiques",
    'no-attribute-yet': "Aucune caractéristique spéciale pour le moment.",
    'add-btn': "Ajouter une caractéristique",
    'limited-to-categories': "Limitée aux catégories",
    'confirm-permanently-delete': (
      `Voulez-vous vraiment supprimer définitivement cette caractéristique spéciale\u00a0?

      ATTENTION\u00a0: Toutes les données relative à cette caractéristique spéciale seront supprimées DÉFINITIVEMENT\u00a0!!`
    ),
    'second-confirm': {
      'confirm-permanently-delete': (
        `Désolé d'insister, mais cette opération IRRÉVERSIBLE.

        Voulez-vous VRAIMENT supprimer cette caractéristique spéciale\u00a0?`
      ),
    },
  },

  'page-categories': {
    'title': "Catégories",
    'help': "Gestion des catégories et sous-catégories de matériel.",
    'action-add': "Nouvelle catégorie",
    'prompt-add': "Nouvelle catégorie",
    'category-name': "Nom de la catégorie",
    'create': "Créer la catégorie",
    'prompt-modify': "Modifier la catégorie",
    'confirm-delete': "Mettre cette catégorie à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement cette catégorie\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer cette catégorie\u00a0?",
    'saved': "Catégorie sauvegardée.",
    'deleted': "Catégorie supprimée.",
    'display-materials': "Voir le matériel de la catégorie",
  },

  'page-subcategories': {
    'add': "Ajouter une sous-catégorie",
    'prompt-add': "Nouvelle sous-catégorie de «\u00a0{categoryName}\u00a0»",
    'sub-category-name': "Nom de la sous-catégorie",
    'create': "Créer la sous-catégorie",
    'prompt-modify': "Modifier la sous-catégorie",
    'confirm-delete': "Mettre cette sous-catégorie à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement cette sous-catégorie\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer cette sous-catégorie\u00a0?",
    'saved': "Sous-catégorie sauvegardée.",
    'deleted': "Sous-catégorie supprimée.",
    'display-materials': "Voir le matériel de la sous-catégorie",
  },

  'page-technicians': {
    'title': "Techniciens",
    'help': "Vous pouvez envoyer un email à un technicien en cliquant sur son adresse.",
    'action-add': "Nouveau technicien",
    'add': "Nouveau technicien",
    'edit': "Modifier le technicien «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modifier le technicien",
    'help-edit': "Seuls le nom et le prénom de la personne sont obligatoires.",
    'confirm-delete': "Mettre ce technicien à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement ce technicien\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer ce technicien\u00a0?",
    'saved': "Technicien sauvegardé.",
  },

  'page-parks': {
    'title': "Parcs de matériel",
    'help': "Vous pouvez cliquer sur le nombre d'articles que contient le parc pour en afficher la liste.",
    'action-add': "Nouveau parc de matériel",
    'add': "Nouveau parc de matériel",
    'edit': "Modifier le parc «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modifier le parc",
    'help-edit': "Seul le nom du parc est obligatoire.",
    'confirm-delete': "Mettre ce parc à la corbeille\u00a0? Cela ne supprimera pas le matériel qu'il contient.",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement ce parc\u00a0? ATTENTION, cela supprimera tout le matériel contenu dans ce parc\u00a0!!",
    'confirm-restore': "Voulez-vous vraiment restaurer ce parc\u00a0?",
    'saved': "Parc sauvegardé.",
    'total-items': 'Totaux',
    'display-events-for-park': "Voir les événements",
  },

  'page-tags': {
    'title': "Étiquettes",
    'help': "Les étiquettes non modifiables sont celles utilisées par le système.",
    'no-item': "Aucune étiquette.",
    'no-item-in-trash': "Aucune étiquette dans la corbeille.",
    'action-add': "Nouvelle étiquette",
    'prompt-add': "Nouvelle étiquette",
    'tag-name': "Nom de l'étiquette",
    'create': "Créer l'étiquette",
    'add': "Nouvelle étiquette",
    'prompt-modify': "Modifier l'étiquette",
    'confirm-delete': "Mettre cette étiquette à la corbeille\u00a0?",
    'confirm-permanently-delete': "Voulez-vous vraiment supprimer définitivement cette étiquette\u00a0?",
    'confirm-restore': "Voulez-vous vraiment restaurer cette étiquette\u00a0?",
    'saved': "Étiquette sauvegardée.",
    'deleted': "Étiquette supprimée.",
  },

  'page-estimate': {
    'confirm-delete': "Voulez-vous vraiment supprimer ce devis\u00a0?",
  },
};
/* eslint-enable quotes */
/* eslint-enable quote-props */
