// src/services/templateService.ts
import { toast } from 'react-toastify';

// Définit l'URL de base de ton API. Mets-la dans un .env idéalement.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001'; // Ajuste si nécessaire

// Interface pour le résultat attendu (Blob + nom de fichier)
interface TemplateGenerationResult {
    blob: Blob;
    filename: string;
}

/**
 * Appelle l'API backend pour générer le template ZIP.
 * @param jsonConfig - La chaîne de configuration JSON.
 * @param token - Le token d'authentification JWT (ou null si non requis).
 * @returns Une promesse résolue avec un objet contenant le Blob du ZIP et le nom de fichier.
 * @throws Une erreur si l'appel API échoue ou si la réponse n'est pas valide.
 */
export const generateTemplateApiCall = async (
    jsonConfig: string,
    token: string | null
): Promise<TemplateGenerationResult> => {

    const apiUrl = `${API_BASE_URL}/api/v1/templates/generate-template`; // Chemin complet de l'endpoint
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Ajoute le header d'authentification si un token est fourni
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log("Sending request to:", apiUrl); // Log pour débogage

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ json_config: jsonConfig }), // Envoie le JSON encapsulé
        });

        console.log("Response status:", response.status); // Log pour débogage

        if (!response.ok) {
            // Essayer de lire le détail de l'erreur FastAPI
            let errorDetail = `Erreur ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || `Erreur serveur ${response.status}`;
                console.error("API Error Detail:", errorData);
            } catch (e) {
                // Si le corps n'est pas JSON ou est vide
                errorDetail = `${response.status}: ${response.statusText || 'Erreur inconnue du serveur'}`;
                console.error("API Error Status Text:", response.statusText);
            }
            // Lance une exception pour être attrapée dans le composant
            throw new Error(errorDetail);
        }

        // Si la réponse est OK (2xx)
        const blob = await response.blob();
        if (!blob || blob.size === 0) {
             throw new Error("La réponse reçue est vide (pas de fichier ZIP).");
        }

        // Extraire le nom de fichier du header Content-Disposition
        const contentDisposition = response.headers.get('content-disposition');
        let filename = "template.zip"; // Nom par défaut
        if (contentDisposition) {
            // Regex pour extraire le nom de fichier (gère les guillemets optionnels)
            const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = decodeURIComponent(filenameMatch[1]); // Décode les caractères spéciaux (ex: %20)
            }
        }
        console.log("Extracted filename:", filename); // Log pour débogage

        return { blob, filename }; // Retourne l'objet avec blob et nom de fichier

    } catch (error) {
        console.error('Erreur lors de l\'appel API de génération:', error);
        // Relance l'erreur pour qu'elle soit gérée par le composant appelant
        // Assure-toi que le message est utile
        if (error instanceof Error) {
            throw error; // Relance l'erreur existante (qui peut venir du throw ci-dessus)
        } else {
            throw new Error("Une erreur réseau ou inconnue est survenue.");
        }
    }
};

// Tu pourrais ajouter d'autres fonctions de service liées aux templates ici