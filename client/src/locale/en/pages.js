/* eslint-disable quotes */
/* eslint-disable quote-props */
export default {
  'page-login': {
    'title': "Login",
    'welcome': "Hello! Who are you?",
    'connexion': "Enter Robert",
    'please-wait': "Authentication, please wait...",
    'bye': "See you\u00a0!",
    'footer': "Robert2 is a free (as in 'freedom') software. You can copy and redistribute it freely, except for commercial purpose.",
    'official-website': "Official website",
    'community-forum': "Community Forum",

    'error': {
      'bad-infos': "Given infos ar not correct. Please give your e-mail address or pseudo, and your password.",
      'expired-session': "Your session has expired. Please log back in!",
      'not-allowed': "You tried to visit a page with restricted access. Please log in with an account who can access this page.",
    },
  },

  'page-profile': {
    'title': "Your profile",
    'help': "If you change your email, pseudo or password, do not forget them before logging-out!",
    'you-are-group': "You are: {group}.",
    'edit-password': "Change your password",
    'password-confirmation': "Password confirmation",
    'password-confirmation-must-match': "Password and its confirmation must be identical.",
    'password-modified': "Your password was modified.",
    'saved': "Your profile was saved.",
  },

  'page-settings': {
    'title': "Your settings",
    'help': "The « duration of a session » is the time allowed before you're automatically logged out.",
    'auth-token-validity-duration': "Max. duration of a session",
    'interface': "Interface",
    'language': "Language",
    'hours': "hours",
    'saved': "Settings saved.",
  },

  'page-calendar': {
    'title': "Calendar",
    'help': (
      `Click and drag to move timeline.
      Use mouse wheel to zoom in / out.
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
  },

  'page-events': {
    'help-edit': "",
    'back-to-calendar': "Back to calendar",
    'add': "New event",
    'edit': "Modify event «\u00a0{pageSubTitle}\u00a0»",
    'edit-event': "Modify event",
    'save-and-back-to-calendar': "Save and back to calendar",
    'save-and-continue': "Save and continue",
    'step': "Step",
    'event-informations': "Informations",
    'event-beneficiaries': "Beneficiaries",
    'event-technicians': "Technicians",
    'event-materials': "Materials",
    'event-summary': "Summary",
    'event-confirmation': "Confirmation",
    'saved': "Event saved.",
    'not-saved': "Event has not saved modifications",
    'display-only-selected-materials': "Display event's selected materials only?",
    'display-all-materials-to-add-some': "Display all materials to add some",
    'display-only-event-materials': "Display only event's materials",
    'event-not-confirmed-help': "The event is not confirmed yet. It is subject to change at any time.",
    'event-confirmed-help': "The event is confirmed: its information should no longer change.",
    'event-missing-materials': "Missing materials",
    'event-missing-materials-help': "These are the missing materials for the period of the event, because it is used in another event, the number needed is too high, or there are some out of order. These materials must therefore be added to the park, or rented from another company.",
    'warning-no-material': "Warning: this event is empty, there is no material at the moment!",
    'warning-no-beneficiary': "Warning: this event has no beneficiaries!",
    'beneficiary-billing-help': "Only the first beneficiary in the list will be displayed on the bill.",
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
    'title': "Return of the material of event «\u00a0{pageSubTitle}\u00a0»",
    'help': "",
    'this-event-is-not-past': "This event is not finished, so it is not possible to check its return at the moment.",
    'warning-terminate': "Beware, once this return inventory terminated, it will no longer be modifiable.",
    'confirm-terminate-title': "Do you really want to terminate this return inventory?",
    'confirm-terminate-text': "Please note that it will no longer be possible to modify it.",
    'confirm-terminate-text-with-broken': "This will update all the «\u00a0out of order\u00a0» quantities for the concerned materials, and it will no longer be possible to modify this inventory.",
    'terminate-inventory': "Terminate this inventory",
    'validation-error': "Some quantities are not valid. Please double-check the list.",
    'inventory-done': "Inventory done",
    'some-material-is-missing': "Some materials did not return from this event!",
    'all-material-returned': "Congratulations! All materials were returned for this event.",
    'some-material-came-back-broken': "Some materials came back broken.",
  },

  'page-users': {
    'title': "Users",
    'help': "You can send an email to an user by clicking on his/her address.",
    'help-edit': (
      `- Group «\u00a0Administrator\u00a0» group gives all access rights to user.
      - Group «\u00a0Member\u00a0» allow user to use most parts of Robert application.
      - Group «\u00a0Visitor\u00a0» group gives a limited access to some data.`
    ),
    'action-add': "New user",
    'add': "New user",
    'edit': "Modify user «\u00a0{pageSubTitle}\u00a0»",
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
    'edit': "Modify beneficiary «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modify beneficiary",
    'beneficiary-type': "Beneficiary type",
    'person': "Natural person (individual)",
    'company': "Legal entity (company)",
    'help-edit': (
      `Only first name and last name are mandatory.
      The «\u00a0reference\u00a0» is a customer or member number for your internal management, which will appear on the output sheets, estimates and bills. It must be unique.`
    ),
    'confirm-delete': "Move this beneficiary in trash bin?",
    'confirm-permanently-delete': "Do you really want to permanently delete this beneficiary?",
    'confirm-restore': "Do you really want to restore this beneficiary?",
    'saved': "Beneficiary saved.",
  },

  'page-companies': {
    'title': "Companies",
    'add': "New company",
    'edit': "Modify company «\u00a0{pageSubTitle}\u00a0»",
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
    'remaining-quantities-on-date': (
      `Remaining quantities
      on {date}`
    ),
    'add': "New material",
    'edit': "Modify material «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modify material",
    'help-edit': (
      `Give a short name, and use the description field to detail the material if needed.

      The material picture must be of type JPG, PNG or WEBP, and cannot exceed 10\u00a0MB.`
    ),
    'view': "Details of material «\u00a0{pageSubTitle}\u00a0»",
    'confirm-delete': "Move this material in trash bin?",
    'confirm-permanently-delete': "Do you really want to permanently delete this material?",
    'confirm-restore': "Do you really want to restore this material?",
    'saved': "Material saved.",
    'clear-filters': "Clear filters",
  },

  'page-materials-view': {
    'infos': {
      'click-to-open-image': "Click to open image in a new tab.",
    },
    'documents': {
      'no-document': "No document yet.",
      'drag-and-drop-files-here': "Drag and drop files here ↓ to add them.",
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
      Once created, only the name of a special attribute can be modified.`
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
  },

  'page-subcategories': {
    'add': "Do you really want to delete this category?",
    'prompt-add': "New sub-category of «\u00a0{categoryName}\u00a0»",
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
    'edit': "Modify technician «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modify technician",
    'help-edit': "Only first name and last name are mandatory.",
    'confirm-delete': "Move this technician in trash bin?",
    'confirm-permanently-delete': "Do you really want to permanently delete this technician?",
    'confirm-restore': "Do you really want to restore this technician?",
    'saved': "Technician saved.",
  },

  'page-parks': {
    'title': "Material parks",
    'help': "You can click on the number of items in the park to display the list.",
    'action-add': "New materials park",
    'add': "New materials park",
    'edit': "Modify park «\u00a0{pageSubTitle}\u00a0»",
    'edit-title': "Modify park",
    'help-edit': "Only the name of the park is mandatory.",
    'confirm-delete': "Move this park in trash bin? This won't delete materials in this park.",
    'confirm-permanently-delete': "Do you really want to permanently delete this park? WARNING: this will delete all materials of this park!!",
    'confirm-restore': "Do you really want to restore this park?",
    'saved': "Park saved.",
    'total-items': 'Totals',
    'display-events-for-park': "See events",
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

  'page-estimate': {
    'confirm-delete': "Do you really want to delete this estimate?",
  },
};
/* eslint-enable quotes */
/* eslint-enable quote-props */
