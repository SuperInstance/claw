/**
 * Translation File Generator for Spreadsheet Moment i18n
 * This script generates translation files for all 37 supported languages
 */

const fs = require('fs');
const path = require('path');

// Base translation structure (English)
const baseTranslations = {
  common: {
    appName: "Spreadsheet Moment",
    welcome: "Welcome",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    export: "Export",
    import: "Import",
    share: "Share",
    settings: "Settings",
    help: "Help",
    about: "About",
    yes: "Yes",
    no: "No",
    ok: "OK",
    close: "Close",
    submit: "Submit",
    reset: "Reset",
    apply: "Apply",
    clear: "Clear",
    copy: "Copy",
    paste: "Paste",
    cut: "Cut",
    undo: "Undo",
    redo: "Redo",
    selectAll: "Select All",
    deselect: "Deselect",
    refresh: "Refresh",
    download: "Download",
    upload: "Upload",
    print: "Print",
    email: "Email",
    phone: "Phone",
    address: "Address",
    name: "Name",
    description: "Description",
    title: "Title",
    date: "Date",
    time: "Time",
    price: "Price",
    quantity: "Quantity",
    total: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax",
    shipping: "Shipping",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    failed: "Failed",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
    confirm: "Confirm",
    decline: "Decline",
    accept: "Accept",
    reject: "Reject",
    approve: "Approve",
    deny: "Deny"
  },
  spreadsheet: {
    cell: { one: "1 cell", other: "{{count}} cells" },
    row: { one: "1 row", other: "{{count}} rows" },
    column: { one: "1 column", other: "{{count}} columns" },
    sheet: { one: "1 sheet", other: "{{count}} sheets" },
    formula: "Formula",
    value: "Value",
    format: "Format",
    insertRow: "Insert Row",
    insertColumn: "Insert Column",
    deleteRow: "Delete Row",
    deleteColumn: "Delete Column",
    mergeCells: "Merge Cells",
    unmergeCells: "Unmerge Cells",
    freezeRow: "Freeze Row",
    freezeColumn: "Freeze Column",
    unfreeze: "Unfreeze",
    hideRow: "Hide Row",
    hideColumn: "Hide Column",
    unhide: "Unhide",
    autoFit: "AutoFit",
    autoSum: "AutoSum",
    sortAscending: "Sort Ascending",
    sortDescending: "Sort Descending",
    filterData: "Filter Data",
    clearFilter: "Clear Filter",
    dataValidation: "Data Validation",
    conditionalFormatting: "Conditional Formatting",
    chart: "Chart",
    pivotTable: "Pivot Table",
    function: "Function",
    range: "Range",
    reference: "Reference",
    calculation: "Calculation",
    iteration: "Iteration",
    precision: "Precision",
    rounding: "Rounding",
    absolute: "Absolute",
    relative: "Relative",
    mixed: "Mixed",
    namedRange: "Named Range",
    comment: "Comment",
    note: "Note",
    hyperlink: "Hyperlink",
    image: "Image",
    shape: "Shape",
    sparkline: "Sparkline",
    chartType: "Chart Type",
    axis: "Axis",
    legend: "Legend",
    gridlines: "Gridlines",
    dataLabels: "Data Labels",
    chartTitle: "Chart Title"
  },
  ui: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    reports: "Reports",
    collaborators: "Collaborators",
    notifications: "Notifications",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",
    home: "Home",
    menu: "Menu",
    sidebar: "Sidebar",
    header: "Header",
    footer: "Footer",
    breadcrumb: "Breadcrumb",
    pagination: "Pagination",
    previous: "Previous",
    next: "Next",
    first: "First",
    last: "Last",
    page: "Page",
    perPage: "Per Page",
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    noResults: "No results found",
    loadingData: "Loading data...",
    noData: "No data available",
    retry: "Retry",
    back: "Back",
    forward: "Forward",
    expand: "Expand",
    collapse: "Collapse",
    more: "More",
    less: "Less",
    view: "View",
    edit: "Edit",
    remove: "Remove",
    add: "Add",
    new: "New",
    open: "Open",
    close: "Close"
  },
  errors: {
    generic: "An error occurred",
    network: "Network error",
    unauthorized: "Unauthorized access",
    forbidden: "Access forbidden",
    notFound: "Not found",
    serverError: "Server error",
    timeout: "Request timeout",
    validation: "Validation error",
    required: "This field is required",
    invalidEmail: "Invalid email address",
    invalidPhone: "Invalid phone number",
    invalidDate: "Invalid date",
    invalidNumber: "Invalid number",
    minLength: "Minimum length is {{min}} characters",
    maxLength: "Maximum length is {{max}} characters",
    minValue: "Minimum value is {{min}}",
    maxValue: "Maximum value is {{max}}",
    patternMismatch: "Format does not match",
    fileTooLarge: "File is too large (max {{maxSize}})",
    invalidFileType: "Invalid file type",
    duplicateEntry: "Duplicate entry",
    dependencyError: "Dependency error",
    conflict: "Conflict detected",
    rateLimitExceeded: "Rate limit exceeded",
    insufficientPermissions: "Insufficient permissions",
    sessionExpired: "Session expired",
    invalidCredentials: "Invalid credentials",
    accountLocked: "Account locked",
    emailAlreadyExists: "Email already exists",
    usernameAlreadyExists: "Username already exists"
  },
  messages: {
    saved: "Changes saved",
    deleted: "Item deleted",
    shared: "Shared successfully",
    copied: "Copied to clipboard",
    moved: "Item moved",
    renamed: "Item renamed",
    uploaded: "File uploaded",
    downloaded: "File downloaded",
    sent: "Message sent",
    received: "Message received",
    welcomeBack: "Welcome back!",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    confirmDelete: "Are you sure you want to delete this item?",
    confirmSave: "Save changes before leaving?",
    unsavedChanges: "You have unsaved changes",
    discardChanges: "Discard changes?",
    operationSuccessful: "Operation completed successfully",
    operationFailed: "Operation failed. Please try again.",
    loadingComplete: "Loading complete",
    processingComplete: "Processing complete",
    noUpdates: "No updates available",
    newVersion: "New version available",
    maintenanceMode: "System under maintenance",
    offline: "You are offline",
    online: "You are back online",
    syncComplete: "Synchronization complete"
  },
  time: {
    second: { one: "1 second", other: "{{count}} seconds" },
    minute: { one: "1 minute", other: "{{count}} minutes" },
    hour: { one: "1 hour", other: "{{count}} hours" },
    day: { one: "1 day", other: "{{count}} days" },
    week: { one: "1 week", other: "{{count}} weeks" },
    month: { one: "1 month", other: "{{count}} months" },
    year: { one: "1 year", other: "{{count}} years" },
    ago: "{{time}} ago",
    in: "in {{time}}",
    now: "now",
    today: "today",
    yesterday: "yesterday",
    tomorrow: "tomorrow"
  },
  file: {
    file: { one: "1 file", other: "{{count}} files" },
    folder: { one: "1 folder", other: "{{count}} folders" },
    document: "Document",
    spreadsheet: "Spreadsheet",
    presentation: "Presentation",
    image: "Image",
    video: "Video",
    audio: "Audio",
    archive: "Archive",
    download: "Download",
    upload: "Upload",
    share: "Share",
    rename: "Rename",
    move: "Move",
    copy: "Copy",
    delete: "Delete",
    restore: "Restore",
    properties: "Properties",
    size: "Size",
    type: "Type",
    created: "Created",
    modified: "Modified",
    accessed: "Accessed"
  }
};

// All 37 supported locales with their native names
const locales = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', name: 'Farsi (Persian)', nativeName: 'فارسی' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' }
];

// Create stub translations for each locale (placeholder for actual translations)
function generateStubTranslation(locale) {
  // For English variants, use the base translations
  if (locale.code.startsWith('en')) {
    return JSON.stringify(baseTranslations, null, 2);
  }

  // For other languages, create a stub that includes the locale info
  const stub = {
    _locale: locale.code,
    _name: locale.name,
    _nativeName: locale.nativeName,
    _status: 'stub', // Mark as stub translation
    _contribute: 'This is a stub translation. Please contribute translations at: https://github.com/SuperInstance/polln',
    ...baseTranslations
  };

  return JSON.stringify(stub, null, 2);
}

// Generate all translation files
function generateAllTranslations() {
  const localesDir = path.join(__dirname);

  console.log(`Generating translation files for ${locales.length} locales...`);

  locales.forEach(locale => {
    const filename = `${locale.code}.json`;
    const filepath = path.join(localesDir, filename);

    // Skip if file already exists and is not English
    if (fs.existsSync(filepath) && !locale.code.startsWith('en')) {
      console.log(`  Skipping ${filename} (already exists)`);
      return;
    }

    const content = generateStubTranslation(locale);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  Generated ${filename}`);
  });

  console.log('\nTranslation files generated successfully!');
  console.log('\nNote: Most files are stubs. To contribute translations:');
  console.log('1. Fork the repository');
  console.log('2. Update the translation file for your language');
  console.log('3. Submit a pull request');
}

// Run the generator
if (require.main === module) {
  generateAllTranslations();
}

module.exports = { generateAllTranslations, locales, baseTranslations };
