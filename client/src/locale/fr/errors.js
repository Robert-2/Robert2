export default {
    errors: {
        'unexpected-while-saving': "Une erreur inattendue s'est produite lors de l'enregistrement, veuillez ré-essayer.",
        'unexpected-while-deleting': "Une erreur inattendue s'est produite lors de la suppression, veuillez ré-essayer.",
        'unexpected-while-restoring': "Une erreur inattendue s'est produite lors de la restauration, veuillez ré-essayer.",
        'unexpected-while-calculating': "Une erreur inattendue s'est produite lors du calcul, veuillez ré-essayer.",
        'unexpected-while-fetching': "Une erreur inattendue s'est produite lors de la récupération des données.",
        'api-unreachable': "Désolé, mais l'API est inaccessible... Veuillez vérifier votre accès au réseau.",
        'record-not-found': "Cet enregistrement n'existe pas.",
        'page-not-found': "La page demandée n'existe pas ou plus.",
        'validation': "Veuillez vérifier les informations du formulaire.",
        'unknown': "Erreur inconnue.",
        'already-exists': "Cet enregistrement existe déjà.",
        'show-details': "Voir le détail de l'erreur",
        'details-title': "Détails de l'erreur",
        'details-intro1': "Vous pouvez copier ce qui suit, pour obtenir de l'aide de la part de la communauté.",
        'details-intro2': "Merci de le copier tel quel, car c'est écrit en markdown pour faciliter la lecture sur",
        'details-intro-forum': "le forum",
        'details-intro3': "ou sur",
        'details-intro-not-detailed': "Pour obtenir plus de détails sur l'erreur, vous pouvez modifier le paramètre `displayErrorDetails` à 'true' dans le fichier 'src/App/Config/settings.json'.",
        'details-request': "Requête API\u00A0:",
        'details-message': "Message de l'erreur",
        'details-file': "Fichier\u00A0:",
        'details-stacktrace': "Trace de la pile\u00A0:",
        'critical': [
            "Une erreur s'est produite, veuillez actualiser la page.",
            "Si le problème persiste, veuillez contacter un administrateur.",
        ].join('\n'),

        //
        // - Erreurs liées à un fichier.
        //

        'file-upload-failed': "Une erreur inattendue s'est produite lors de l'envoi du fichier.",
        'file-type-not-allowed': "Ce type de fichier n'est pas pris en charge.",
        'file-size-exceeded': "Fichier trop gros. Maximum {max}.",
        'file-already-exists': "Ce fichier est déjà présent dans la liste.",
        'file-not-a-valid-image': "Le fichier ne fait pas partie des types d'image acceptés.",
        'file-unknown-error': "Erreur inconnue survenue avec le fichier",
    },
};
