export default {
    errors: {
        'unexpected-while-saving': "An unexpected error occurred while saving, please try again.",
        'unexpected-while-deleting': "An unexpected error occurred while deleting, please try again.",
        'unexpected-while-restoring': "An unexpected error occurred while restoring, please try again.",
        'unexpected-while-calculating': "An unexpected error occurred while calculating, please try again.",
        'unexpected-while-fetching': "An unexpected error occurred while retrieving the data.",
        'api-unreachable': "Sorry, but the API is unreachable... Please check your access to network.",
        'record-not-found': "This record does not exist.",
        'page-not-found': "The requested page does not exist.",
        'unknown': "Unknown error.",
        'validation': "Please check form informations.",
        'already-exists': "This record already exists.",
        'show-details': "Show error details",
        'details-title': "Details of error",
        'details-intro1': "You can copy and paste the following to get help from the community.",
        'details-intro2': "Please copy it as is, because it's written in markdown to help reading on",
        'details-intro-forum': "the forum",
        'details-intro3': "or on",
        'details-intro-not-detailed': "To get more details about the error, you can modify the parameter `displayErrorDetails` to 'true' in file 'src/App/Config/settings.json'.",
        'details-request': "API request:",
        'details-message': "Error message",
        'details-file': "File:",
        'details-stacktrace': "Stack trace:",
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
