/* eslint-disable babel/quotes */

export default {
    errors: {
        'generic': "Error: {message}",
        'api-unreachable': "Sorry, but Robert2 API is unreachable... Please check your access to network.",
        'not-found': "This record does not exist.",
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
            "A critical error has occured, please refresh the page.",
            "If the problem persists, please contact an administrator.",
        ].join('\n'),

        'file-type-not-allowed': "Type '{type}' not supported.",
        'file-size-exceeded': "File too large. Maximum {max}.",
        'file-already-exists': "This file already exists in the list.",
    },
};
