/* eslint-disable quotes */

export default {
    'page-login': {
        'title': "Login",
        'welcome': "Hello! Who are you?",
        'connexion': "Enter Robert",
        'please-wait': "Authentication, please wait...",
        'bye': "See you\u00a0!",
        'error': {
            'bad-infos': "Given infos ar not correct. Please give your e-mail address or pseudo, and your password.",
            'expired-session': "Your session has expired. Please log back in!",
            'not-allowed': "You tried to visit a page with restricted access. Please log in with an account who can access this page.",
        },
    },

    'page-calendar': {
        'title': "Calendar",
        'help': (
            `Click and drag to move timeline.
            Use mouse wheel to zoom in / out.
            Hover an event with your mouse to display details about it.
            Double-click on an empty column to create an event with start date pre-filled.`
        ),
        'help-center-view-on-today': "Center calendar on today",
        'help-add-event': "Create a new event",
        'add-event': "New event",
        'confirm-delete': "Move this event in trash bin?",
        'confirm-permanently-delete': "Do you really want to permanently delete this event?",
        'confirm-restore': "Do you really want to restore this event?",
        'event-deleted': "The event was deleted.",
        'event-saved': "The event was saved.",
        'loading-event': "Loading event...",
        'help-timeline-event-operations': (
            `Click once to select the event, in order to move, resize or delete it.
            Double-click on an event to open its preview, and modify its details.`
        ),
        'center-on-today': "Center on today",
        'center-on': "Center on",
        'this-event-is-past': "This event is past.",
        'this-event-is-currently-running': "This event is currently running.",
        'this-event-is-confirmed': "This event is confirmed.",
        'this-event-is-not-confirmed': "This event is not confirmed yet!",
        'this-event-is-archived': "This event is archived.",
        'this-event-is-locked': "This event is locked because it's confirmed or its return inventory is done.",
        'this-event-has-missing-materials': "This event has missing materials.",
        'this-event-needs-its-return-inventory': "It's necessary to make the return inventory of this event!",
        'this-event-has-not-returned-materials': "This event has some not-returned materials.",
        'all-events': "All events",
        'event-with-missing-material-only': "Events with missing material only?",
        'display-all-parks': "All parks",
        'caption': {
            'title': "Caption:",
            'archived': "Archived",
            'past-and-ok': "Past, inventory done and OK",
            'past-material-not-returned': "Material not returned!",
            'past-no-inventory': "Past without inventory",
            'past-not-confirmed': "Past and not confirmed",
            'current-confirmed': "Current and confirmed",
            'current-not-confirmed': "Current not confirmed",
            'future-confirmed': "Future and confirmed",
            'future-not-confirmed': "Future not confirmed",
        },
    },

    'page-events': {
        'help-edit': "",
        'back-to-calendar': "Back to calendar",
        'add': "New event",
        'edit': "Modify event \"{pageSubTitle}\"",
        'edit-event': "Modify event",
        'save-and-back-to-calendar': "Save and back to calendar",
        'save-and-continue': "Save and continue",
        'continue': "Continue",
        'step': "Step",
        'event-informations': "Informations",
        'event-beneficiaries': "Beneficiaries",
        'event-technicians': "Technicians",
        'event-materials': "Materials",
        'event-summary': "Summary",
        'event-confirmation': "Confirmation",
        'no-technician-pass-this-step': (
            `There is no technician available for this period.
            You can skip this step.`
        ),
        'technician-item': {
            'confirm-permanently-delete': "Do you really want to remove this technician assignment?",
        },
        'assign-technician': "Assign {name} as a technician",
        'assign-name': "Assign {name}",
        'modify-assignment': "Modify assignment",
        'remove-assignment': "Remove assignment",
        'period-assigned': "Assigned period",
        'start-end-dates-and-time': "Start and End dates and times",
        'saved': "Event saved.",
        'not-saved': "Event has not saved modifications",
        'event-not-confirmed-help': "The event is not confirmed yet. It is subject to change at any time.",
        'event-confirmed-help': "The event is confirmed: its information should no longer change.",
        'event-missing-materials': "Missing materials",
        'event-missing-materials-help': "These are the missing materials for the period of the event, because it is used in another event, the number needed is too high, or there are some out of order. These materials must therefore be added to the park, or rented from another company.",
        'warning-no-material': "Warning: this event is empty, there is no material at the moment!",
        'warning-no-beneficiary': "Warning: this event has no beneficiaries!",
        'beneficiary-billing-help': "Only the first beneficiary in the list will be displayed on the bill.",
        'technicians-help': "Double-click on a technician's line to assign her/him to the event at the needed start date/time.",
        'missing-material-count': "Need {quantity}, missing\u00a0{missing}!",
        'problems-on-returned-materials': "Problems on returned materials",
        'return-inventory-not-done-yet': "Materials return inventory hasn't been done yet, or is not finished.",
        'do-or-terminate-return-inventory': "Do or finish the return inventory",
        'view-return-inventory': "View the return inventory in details",
        'not-returned-material-count': [
            "{returned} returned on {out}\u00a0! Missing {missing}.",
            "{returned} returned on {out}\u00a0! Missing {missing}.",
        ],
        'broken-material-count': [
            "{broken} returned broken\u00a0!",
            "{broken} returned broken\u00a0!",
        ],
    },

    'page-event-return': {
        'title': "Return of the material of event \"{pageSubTitle}\"",
        'help': "",
        'this-event-not-started-yet': "This event has not yet started, so it is not possible to check its return at the moment.",
        'this-event-is-not-past': "This event is not yet finished, you can start its inventory, but you cannot terminate it.",
        'confirm-terminate-title': "Do you really want to terminate this return inventory?",
        'confirm-terminate-text': "Please note that it will no longer be possible to modify it.",
        'confirm-terminate-text-with-broken': "This will update all the \"out of order\" quantities for the concerned materials, and it will no longer be possible to modify this inventory.",
        'inventory-done': "Inventory done",
        'some-material-is-missing': "Some materials did not return from this event!",
        'all-material-returned': "Congratulations! All materials were returned for this event.",
        'some-material-came-back-broken': "Some materials came back broken.",
    },

    'page-users': {
        'title': "Users",
        'help': "You can send an email to an user by clicking on his/her address.",
        'help-edit': (
            `- Group "Administrator" group gives all access rights to user.
            - Group "Member" allow user to use most parts of Robert application.
            - Group "Visitor" group gives a limited access to some data.`
        ),
        'action-add': "New user",
        'add': "New user",
        'edit': "Modify user \"{pageSubTitle}\"",
        'edit-title': "Modify user",
        'confirm-delete': "Move this user in trash bin?",
        'confirm-permanently-delete': "Do you really want to permanently delete this user?",
        'confirm-restore': "Do you really want to restore this user?",
        'saved': "User saved.",
        'profile-missing-or-deleted': "Profile missing or deleted",
    },

    'page-beneficiaries': {
        'title': "Beneficiaries",
        'help': "You can send an email to a beneficiary by clicking on his/her address.",
        'action-add': "New beneficiary",
        'add': "New beneficiary",
        'edit': "Modify beneficiary \"{pageSubTitle}\"",
        'edit-title': "Modify beneficiary",
        'beneficiary-type': "Beneficiary type",
        'person': "Natural person (individual)",
        'company': "Legal entity (company)",
        'help-edit': (
            `Only first name and last name are mandatory.
            The "reference" is a customer or member number for your internal management, which will appear on the output sheets, estimates and bills. It must be unique.`
        ),
        'confirm-delete': "Move this beneficiary in trash bin?",
        'confirm-permanently-delete': "Do you really want to permanently delete this beneficiary?",
        'confirm-restore': "Do you really want to restore this beneficiary?",
        'saved': "Beneficiary saved.",
    },

    'page-companies': {
        'title': "Companies",
        'add': "New company",
        'edit': "Modify company \"{pageSubTitle}\"",
        'edit-title': "Modify company",
        'edit-btn': "Modify company",
        'create-new': "Add a new company",
        'help-edit': "The legal name of the company is mandatory.",
        'attached-persons': "People attached to the company",
        'saved': "Company saved.",
    },

    'page-materials': {
        'title': "Materials",
        'help': "You can choose a park, a category or some tags to filter materials.",
        'action-add': "New material",
        'manage-attributes': "Manage special attributes",
        'display-quantities-at-date': "Display quantities at date...",
        'add': "New material",
        'edit': "Modify material \"{pageSubTitle}\"",
        'help-edit': (
            `Give a short name, and use the description field to detail the material if needed.

            The material picture must be of type JPG, PNG or WEBP, and cannot exceed 10\u00a0MB.`
        ),
        'confirm-delete': "Move this material in trash bin?",
        'confirm-permanently-delete': "Do you really want to permanently delete this material?",
        'confirm-restore': "Do you really want to restore this material?",
        'saved': "Material saved.",
        'print-complete-list': "Print the complete materials list",
    },

    'page-materials-view': {
        'title': "Details of material \"{pageSubTitle}\"",
        'infos': {
            'click-to-open-image': "Click to open image in a new tab.",
        },
        'documents': {
            'no-document': "No document yet.",
            'drag-and-drop-files-here': "Drag and drop files here ↓ to add them.",
            'max-size': "Maximum size {size}",
            'choose-files': "Or click here to choose files to add",
            'send-files': [
                "Send file",
                "Send {count} files",
            ],
            'click-to-open': "Click to open / download file",
            'confirm-permanently-delete': "Do you really want to permanently delete this document?",
            'saved': "Documents saved.",
            'deleted': "Document deleted.",
        },
    },

    'page-attributes': {
        'title': "Material special attributes",
        'help': (
            `Here you can add fields that allows you to describe your material according to your own criteria.
            Once created, a special attribute cannot be modified (except for its name).`
        ),
        'go-back-to-material': "Back to material",
        'name': "Name of the attribute",
        'type': "Attribute type",
        'unit': "Unit",
        'max-length': "Max. length",
        'type-string': "Text",
        'type-integer': "Integer number",
        'type-float': "Decimal number",
        'type-boolean': "Boolean (Yes/No)",
        'type-date': "Date",
        'no-limit': "No limit",
        'add-attributes': "Add attributes",
        'no-attribute-yet': "No attribute yet.",
        'add-btn': "Add an attribute",
        'limited-to-categories': "Limited to categories",
        'confirm-permanently-delete': (
            `Do you really want to permanently delete this special attribute?

            WARNING: All data related to this special attribute will be deleted DEFINITIVELY!!`
        ),
        'second-confirm': {
            'confirm-permanently-delete': (
                `Sorry to insist, but this operation is IRREVERSIBLE.

        Do you REALLY want to remove this special attribute?`
            ),
        },
    },

    'page-categories': {
        'title': "Categories",
        'help': "Manage material's categories and sub-categories.",
        'action-add': "New category",
        'prompt-add': "New category",
        'category-name': "Category name",
        'create': "Create category",
        'prompt-modify': "Add a sub-category",
        'confirm-delete': "Move this category in trash bin?",
        'confirm-permanently-delete': "Do you really want to permanently delete this category?",
        'confirm-restore': "Do you really want to restore this category?",
        'saved': "Category saved.",
        'deleted': "Category deleted.",
        'display-materials': "See the material of this category",
        'no-category': "No category.",
        'create-a-category': "Create a category",
        'cannot-delete-not-empty': "Impossible to delete this category, because it's not empty!",
        'more-attribute-when-category-selected': "When a category is selected, some other special attributes may appear.",
    },

    'page-subcategories': {
        'add': "Do you really want to delete this category?",
        'prompt-add': "New sub-category of \"{categoryName}\"",
        'sub-category-name': "Sub-category name",
        'create': "Create sub-category",
        'prompt-modify': "Modify sub-category",
        'confirm-delete': "Move this sub in trash bin-category?",
        'confirm-permanently-delete': "Do you really want to permanently delete this sub-category?",
        'confirm-restore': "Do you really want to restore this sub-category?",
        'saved': "Sub-category saved.",
        'deleted': "Sub-category deleted.",
        'display-materials': "See the material of this sub-category",
    },

    'page-technicians': {
        'title': "Technicians",
        'help': "You can send an email to a technician by clicking on his/her address.",
        'action-add': "New technician",
        'add': "New technician",
        'edit': "Modify technician \"{pageSubTitle}\"",
        'edit-title': "Modify technician",
        'help-edit': "Only first name and last name are mandatory.",
        'confirm-delete': "Move this technician in trash bin?",
        'confirm-permanently-delete': "Do you really want to permanently delete this technician?",
        'confirm-restore': "Do you really want to restore this technician?",
        'saved': "Technician saved.",
        'period-of-availability': "Period of availability",
    },

    'page-technician-view': {
        'title': "Technicien \"{name}\"",
        'modify-associated-user': "Modify associated user",
    },

    'page-parks': {
        'title': "Material parks",
        'help': "You can click on the number of items in the park to display the list.",
        'action-add': "New materials park",
        'add': "New materials park",
        'edit': "Modify park \"{pageSubTitle}\"",
        'edit-title': "Modify park",
        'help-edit': "Only the name of the park is mandatory.",
        'confirm-delete': "Move this park in trash bin? This won't delete materials in this park.",
        'confirm-permanently-delete': "Do you really want to permanently delete this park? WARNING: this will delete all materials of this park!!",
        'confirm-restore': "Do you really want to restore this park?",
        'saved': "Park saved.",
        'total-items': 'Totals',
        'display-events-for-park': "See events",
        'display-materials-of-this-park': "See materials list of this park",
        'print-materials-of-this-park': "Print list of this park",
    },

    'page-tags': {
        'title': "Tags",
        'help': "Non-modifiables tags are those used by the system.",
        'no-item': "No tag yet.",
        'no-item-in-trash': "No tag in trash bin.",
        'action-add': "New tag",
        'prompt-add': "New tag",
        'tag-name': "Tag name",
        'create': "Create tag",
        'add': "New tag",
        'prompt-modify': "Modify tag",
        'confirm-delete': "Move this tag in trash bin?",
        'confirm-permanently-delete': "Do you really want to permanently delete this tag?",
        'confirm-restore': "Do you really want to restore this tag?",
        'saved': "Tag saved.",
        'deleted': "Tag deleted.",
    },

    'page-settings': {
        'title': "Application settings",
        'event-summary': {
            'title': "Event summaries",
            'help': "Here you can customize the PDF event summaries",
            'header': "Top of page",
            'display-legal-numbers': "Display legal numbers?",
            'material-list': "Materials list",
            'display-mode': "Display mode",
            'list-display-mode-categories': "Sorted by categories",
            'list-display-mode-sub-categories': "Sorted by sub-categories",
            'list-display-mode-parks': "Sorted by parks",
            'list-display-mode-flat': "Not sorted",
            'custom-text': "Custom text (bottom of page)",
            'custom-text-title': "Text title",
            'custom-text-content': "Text content",
            'saved': "Event summaries settings has been successfully saved.",
        },
        'calendar': {
            'title': "Calendar",
            'help': "Here you can customize the calendar and the events that are displayed on it.",
            'saved': "Calendar settings has been successfully saved.",
            'events-display-section-title': "Data that will be displayed in the calendar events",
            'showLocation': "Show the location of the event?",
            'showBorrower': "Show the beneficiary / borrower?",
            'public-calendar-section-title': "Calendar external subscription",
            'enable-public-calendar': "Enable external calendar access?",
            'public-calendar-url': "External calendar URL",
            'save-to-get-calendar-url': "Please save your changes to get the calendar URL.",
            'public-calendar-help': (
                `This allows you to publish the main calendar. Any person in possession of this link will be able to consult the events of your calendar, without being connected to the application! So be sure to only share this link with people you trust.\n
                To use this link, go to your compatible calendar application, and look for the "New Calendar Subscription" feature. Please note that the refresh rate in these applications is highly variable, so they may display event changes with a delay.`
            ),
            'public-calendar-url-reset-help': "If you suspect that the calendar link has been shared with unwanted third parties, you can re-generate the link by clicking here:",
            'public-calendar-url-reset-warning': (
                "If you regenerate the link, the previous one will be revoked and you will need to communicate this new link again to people who legitimately have access to the calendar since theirs will be revoked.\n\n" +
                "Do you really want to proceed?"
            ),
            'public-calendar-url-reset-error': "An error occurred while regenerating the public calendar link, please try again.",
            'public-calendar-url-reset-success': "The public calendar link has been successfully re-generated! The new one is available above.",
        },
    },

    'page-user-settings': {
        'title': "Your settings",
        'profile': {
            'title': "Your profile",
            'help': "If you change your email, pseudo or password, do not forget them before logging-out!",
            'new-password': "New password",
            'new-password-help': "Only fill this section if you want to change your password.",
            'password-confirmation': "Password confirmation",
            'password-confirmation-must-match': "Password and its confirmation must be identical.",
            'password-modified': "Your password was modified.",
            'saved': "Your informations have been successfully saved.",
            'saved-with-password': "Your informations and your new password have been successfully saved.",
        },
        'interface': {
            'title': "Interface",
            'help': "The \"duration of a session\" is the time allowed before you're automatically logged out.",
            'auth-token-validity-duration': "Max. duration of a session",
            'language': "Language",
            'hours': "hours",
            'saved': "Settings saved.",
        },
    },

    'page-estimate': {
        'confirm-delete': "Do you really want to delete this estimate?",
    },
};
