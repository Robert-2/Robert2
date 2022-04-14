/* eslint-disable quotes */

export default {
    errors: {
        'generic': "Erreur\u00a0: {message}",
        'unexpected-while-saving': "Une erreur inattendue s'est produite lors de l'enregistrement, veuillez ré-essayer.",
        'unexpected-while-deleting': "Une erreur inattendue s'est produite lors de la suppression, veuillez ré-essayer.",
        'api-unreachable': "Désolé, mais l'API de Robert2 est inaccessible... Veuillez vérifier votre accès au réseau.",
        'not-found': "Cet enregistrement n'existe pas.",
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
        'details-request': "Requête API\u00a0:",
        'details-message': "Message de l'erreur",
        'details-file': "Fichier\u00a0:",
        'details-stacktrace': "Trace de la pile\u00a0:",
        'critical': [
            "Une erreur s'est produite, veuillez actualiser la page.",
            "Si le problème persiste, veuillez contacter un administrateur.",
        ].join('\n'),

        'file-type-not-allowed': "Le type '{type}' n'est pas pris en charge.",
        'file-size-exceeded': "Fichier trop gros. Maximum {max}.",
        'file-already-exists': "Ce fichier est déjà présent dans la liste.",
    },
};
