
/**
 * Service de synchronisation Google Drive pour Ets Haddoud Moncef.
 * Note: Pour une utilisation en production, un CLIENT_ID valide doit être configuré 
 * dans la console Google Cloud avec l'API Google Drive activée.
 */

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // À remplacer par le vrai Client ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'Haddoud_Moncef_Management_Backup.json';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

/**
 * Initialise les bibliothèques Google API.
 */
export const initGoogleDriveApi = () => {
  return new Promise<void>((resolve) => {
    // Charger le client GAPI
    (window as any).gapi.load('client', async () => {
      await (window as any).gapi.client.init({
        // apiKey: 'YOUR_API_KEY', // Optionnel si on utilise drive.file
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      gapiInited = true;
      checkInitialization();
    });

    // Initialiser le client GIS (Google Identity Services)
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // défini lors de l'appel
    });
    gisInited = true;
    checkInitialization();

    function checkInitialization() {
      if (gapiInited && gisInited) {
        resolve();
      }
    }
  });
};

/**
 * Obtient un jeton d'accès et exécute une action.
 */
const withAuth = (action: (token: string) => Promise<void>) => {
  return new Promise<void>((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }
      try {
        await action(resp.access_token);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    if ((window as any).gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

/**
 * Sauvegarde les données locales sur Google Drive.
 */
export const saveToGoogleDrive = async () => {
  const dataToSave = {
    prod_users: localStorage.getItem('prod_users'),
    prod_records: localStorage.getItem('prod_records'),
    prod_prestation_prod: localStorage.getItem('prod_prestation_prod'),
    prod_prestation_etuvage: localStorage.getItem('prod_prestation_etuvage'),
    prod_purchases: localStorage.getItem('prod_purchases'),
    prod_stock_outs: localStorage.getItem('prod_stock_outs'),
    prod_master_data: localStorage.getItem('prod_master_data'),
    exportDate: new Date().toISOString(),
    accountHint: 'ets.haddoudmoncef@gmail.com'
  };

  await withAuth(async (token) => {
    // 1. Rechercher si le fichier existe déjà
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}'&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const searchResult = await response.json();
    const existingFile = searchResult.files && searchResult.files[0];

    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(dataToSave)], { type: 'application/json' }));

    let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFile) {
      uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
      method = 'PATCH';
    }

    const uploadResponse = await fetch(uploadUrl, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    if (!uploadResponse.ok) {
      throw new Error('Échec de l\'envoi vers Google Drive');
    }
  });
};

/**
 * Restaure les données depuis Google Drive.
 */
export const restoreFromGoogleDrive = async () => {
  let finalData: any = null;

  await withAuth(async (token) => {
    // 1. Rechercher le fichier
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}'&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const searchResult = await searchResponse.json();
    const file = searchResult.files && searchResult.files[0];

    if (!file) {
      throw new Error('Aucun fichier de sauvegarde trouvé sur Google Drive.');
    }

    // 2. Télécharger le contenu
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    finalData = await downloadResponse.json();
  });

  return finalData;
};
