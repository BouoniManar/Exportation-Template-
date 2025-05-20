// src/services/templateService.ts
// import { toast } from 'react-toastify'; // Pas utilisé ici
import api from './api'; // Votre instance Axios configurée

// IMPORTER LES TYPES DEPUIS VOTRE FICHIER DE TYPES CENTRALISÉ
import { 
    GeneratedTemplateResponse, 
    SaveGeneratedProjectPayload, // <--- Assurez-vous que ce nom correspond à ce qui est dans types.ts
    SavedProjectResponse,      // <--- Assurez-vous que ce nom correspond à ce qui est dans types.ts
    TemplateGenerationResult   // <--- Assurez-vous que ce nom correspond à ce qui est dans types.ts
} from '../types'; // Ou '../types/index' ou '../types/templateTypes' selon le nom du fichier

// L'URL de base est gérée par l'instance Axios `api`

// L'interface TemplateGenerationResult doit être définie ici ou importée si elle est dans types.ts
// Si elle est déjà dans types.ts, vous pouvez supprimer cette définition locale.
// Sinon, gardez-la ici ou déplacez-la vers types.ts.
// Pour l'instant, je suppose qu'elle est dans types.ts avec les autres.

export const generateTemplateApiCall = async (
    jsonInput: string,
    token: string | null
): Promise<TemplateGenerationResult> => { // Utilise le type importé ou défini
    const requestBody = { json_config: jsonInput };

    try {
        const response = await api.post(
            '/api/v1/templates/generate-template',
            requestBody,
            {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'blob',
            }
        );

        const contentDisposition = response.headers['content-disposition'];
        let filename = "template.zip";
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = decodeURIComponent(filenameMatch[1]);
            }
        }

        const serverFilePath = response.headers['x-template-server-path'];

        if (!(response.data instanceof Blob) || response.data.size === 0) {
             throw new Error("La réponse reçue n'est pas un fichier ZIP valide ou est vide.");
        }

        return {
            blob: response.data,
            filename: filename,
            server_file_path: serverFilePath
        };

    } catch (error: any) {
        // ... votre gestion d'erreur ...
        console.error('Erreur API (generateTemplateApiCall):', error.response?.data || error.message, error);
        let detail = "Erreur lors de la génération du template ZIP.";
        if (error.response && error.response.data) {
            if (error.response.data instanceof Blob) {
                try {
                    const errorText = await error.response.data.text();
                    const errorJson = JSON.parse(errorText);
                    detail = errorJson.detail || errorText;
                } catch (e) { /* Ignorer */ }
            } else if (error.response.data.detail) {
                detail = error.response.data.detail;
            } else if (typeof error.response.data === 'string') {
                detail = error.response.data;
            }
        } else if (error.message) {
            detail = error.message;
        }
        throw new Error(detail);
    }
};

export const saveProjectMetadataApiCall = async (
    payload: SaveGeneratedProjectPayload, // Utilise le type importé
    token: string | null
): Promise<SavedProjectResponse> => { // Utilise le type importé
    try {
        const response = await api.post<SavedProjectResponse>(
            '/api/projects/save-metadata',
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error: any) {
        // ... votre gestion d'erreur ...
        console.error('Erreur API (saveProjectMetadataApiCall):', error.response?.data || error.message, error);
        let detail = "Erreur lors de la sauvegarde des métadonnées du projet.";
        if (error.response?.data?.detail) { detail = error.response.data.detail; }
        throw new Error(detail);
    }
};

export const getMyTemplates = async (): Promise<GeneratedTemplateResponse[]> => {
    try {
        const response = await api.get<GeneratedTemplateResponse[]>('/api/projects/my-saved-templates');
        return response.data;
    } catch (error: any) {
        // ... votre gestion d'erreur ...
        console.error('Erreur API (getMyTemplates):', error.response?.data || error.message, error);
        throw new Error(error.response?.data?.detail || error.message || "Erreur de récupération des templates.");
    }
};

export const deleteSavedTemplate = async (templateId: number): Promise<void> => {
    try {
        await api.delete(`/api/projects/${templateId}`);
    } catch (error: any) {
        // ... votre gestion d'erreur ...
        console.error(`Erreur API lors de la suppression du template ${templateId}:`, error.response?.data || error.message, error);
        throw new Error(error.response?.data?.detail || error.message || "Erreur de suppression du template.");
    }
};