window.gapiInited = false;
window.gisInited = false;
window.tokenClient = null;

// Google Calendar API configuration
const CONFIG = {
    CLIENT_ID: '414948469205-j34rpvkhs4ld01oirmdi6etsto9nrndb.apps.googleusercontent.com',
    API_KEY: 'AIzaSyDAQ1T3C6gr4qiqAYUIoknUcW9EIYAE_2k',
    DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    SCOPES: 'https://www.googleapis.com/auth/calendar.events'
};

function gapiLoaded() {
    console.log("GAPI loading...");
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: CONFIG.API_KEY,
            discoveryDocs: [CONFIG.DISCOVERY_DOC],
        });
        window.gapiInited = true;
        console.log("GAPI initialized successfully");
        maybeEnableButtons();
    } catch (error) {
        console.error("Error initializing GAPI:", error);
    }
}

function gisLoaded() {
    console.log("GIS loading...");
    window.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: CONFIG.SCOPES,
        callback: '', // Will be defined later
    });
    window.gisInited = true;
    console.log("GIS initialized successfully");
    maybeEnableButtons();
}

function maybeEnableButtons() {
    console.log("Checking API status - GAPI:", window.gapiInited, "GIS:", window.gisInited);
    if (window.gapiInited && window.gisInited) {
        console.log("Both APIs initialized, enabling buttons");
        document.querySelectorAll('.schedule-interview').forEach(btn => {
            console.log("Enabling button:", btn);
            btn.disabled = false;
        });
    }
}

//functions to global scope
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;

// Debug helper
window.addEventListener('load', () => {
    console.log("Window loaded, checking API status:");
    console.log("GAPI Initialized:", window.gapiInited);
    console.log("GIS Initialized:", window.gisInited);
}); 
