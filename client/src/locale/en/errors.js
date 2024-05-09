export default {
    errors: {
        'unexpected': "An unexpected error occurred, please try again.",
        'unexpected-while-saving': "An unexpected error occurred while saving, please try again.",
        'unexpected-while-deleting': "An unexpected error occurred while deleting, please try again.",
        'unexpected-while-restoring': "An unexpected error occurred while restoring, please try again.",
        'unexpected-while-calculating': "An unexpected error occurred while calculating, please try again.",
        'unexpected-while-fetching': "An unexpected error occurred while retrieving the data.",
        'api-unreachable': "The service is currently unreachable. Please check your internet connection and try again.",
        'record-not-found': "This record does not exist.",
        'page-not-found': "The requested page does not exist.",
        'unknown': "Unknown error.",
        'validation': "Please check the information provided in the form.",
        'already-exists': "This record already exists.",
        'critical': [
            "A critical error has occurred, please refresh the page.",
            "If the problem persists, please contact an administrator.",
        ].join('\n'),

        //
        // - Erreurs liées à un fichier.
        //

        'file-upload-failed': "An unexpected error occurred while sending the file.",
        'file-type-not-allowed': "This file type is not supported.",
        'file-size-exceeded': "File too large. Maximum {max}.",
        'file-already-exists': "This file already exists in the list.",
        'file-not-a-valid-image': "The file is not part of the accepted image types.",
        'file-unknown-error': "Unknown error occurred with the file.",
    },
};
