/**
 * Service de synchronisation Google Drive pour Ets Haddoud Moncef.
 */

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'Haddoud_Moncef_Management_Backup.json';

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

/**
 * Initialise les bibliothèques Google API de manière sécurisée.
 */
export const initGoogleDriveApi = () => {
  return new Promise<void>((resolve, reject) => {
    // Timeout de sécurité pour ne pas bloquer l'app si les scripts Google ne chargent jamais
    const timeout = setTimeout(() => {
      console.warn("Google Drive API initialization timed out.");
      resolve(); 
    }, 10000);

    try {
      const gapi = (window as any).gapi;
      if (!gapi) {
        console.warn("GAPI script not found yet.");
        clearTimeout(timeout);
        resolve();
        return;
      }

      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          gapiInited = true;
          checkInitialization();
        } catch (e) {
          console.error("Erreur gapi init", e);
          resolve(); // On résout quand même pour ne pas bloquer l'UI
        }
      });

      const checkGoogleInterval = setInterval(() => {
        const google = (window as any).google;
        if (google && google.accounts && google.accounts.oauth2) {
          clearInterval(checkGoogleInterval);
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', 
          });
          gisInited = true;
          checkInitialization();
        }
      }, 500);

      function checkInitialization() {
        if (gapiInited && gisInited) {
          clearTimeout(timeout);
          resolve();
        }
      }
    } catch (err) {
      console.error("Critical Google Drive init error:", err);
      clearTimeout(timeout);
      resolve();
    }
  });
};

const withAuth = (action: (token: string) => Promise<void>) => {
  return new Promise<void>((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google Identity Service non initialisé."));
      return;
    }

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

    const gapi = (window as any).gapi;
    if (!gapi || !gapi.client || gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const saveToGoogleDrive = async () => {
  const dataToSave = {
    prod_users: localStorage.getItem('prod_users'),
    prod_records: localStorage.getItem('prod_records'),
    prod_prestation_prod: localStorage.getItem('prod_prestation_prod'),
    prod_prestation_etuvage: localStorage.getItem('prod_prestation_etuvage'),
    prod_purchases: localStorage.getItem('prod_purchases'),
    prod_stock_outs: localStorage.getItem('prod_stock_outs'),
    prod_master_data: localStorage.getItem('prod_master_data'),
    exportDate: new Date().toISOString()
  };

  await withAuth(async (token) => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchResult = await response.json();
    const existingFile = searchResult.files && searchResult.files[0];

    const metadata = { name: BACKUP_FILENAME, mimeType: 'application/json' };
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

    if (!uploadResponse.ok) throw new Error('Échec de l\'envoi vers Google Drive');
  });
};

export const restoreFromGoogleDrive = async () => {
  let finalData: any = null;
  await withAuth(async (token) => {
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchResult = await searchResponse.json();
    const file = searchResult.files && searchResult.files[0];

    if (!file) throw new Error('Aucun fichier trouvé.');

    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    finalData = await downloadResponse.json();
  });
  return finalData;
};