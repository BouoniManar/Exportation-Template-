// src/pages/GenerateTemplatePage.tsx
import React, { useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileCode, faDownload, faTrash, faCopy, faSyncAlt,
    faCogs, faFileZipper, faFileUpload, faPaste
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver'; // <<< IMPORT saveAs

// --- IMPORT DU SERVICE ---
import { generateTemplateApiCall } from '../services/templateService';
// --- Importations CodeMirror ---
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { githubDark } from '@uiw/codemirror-theme-github'; // Thème sombre
// -----------------------------

interface GenerateTemplatePageProps {
    initialJson?: string;
}

// --- Fonction pour essayer de formater le JSON ---
const tryFormatJson = (jsonString: string): string => {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        return jsonString;
    }
};
// ----------------------------------------------

const GenerateTemplatePage: React.FC<GenerateTemplatePageProps> = ({ initialJson = '' }) => {

    // Formate le JSON initial
    const [jsonInput, setJsonInput] = useState<string>(tryFormatJson(initialJson));
    const [generationOutput, setGenerationOutput] = useState<string>("Le fichier ZIP généré apparaîtra ici...");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGenerated, setIsGenerated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---

    const handleLoadSampleData = useCallback(() => {
        const sample = { /* ... ton objet JSON exemple ... */
          "mon_site": {
             "site": {"title": "Nouveau Site", "image_source_base": "backend/assets/img/default"},
             "theme": {"primary_color": "#4E087D", /* ... */ "border_radius": "4px"},
             "header": {"style": {"position": "fixed", /* ... */ "box_shadow": "0 2px 4px rgba(0,0,0,0.1)"}},
             "navigation": {"links": [{"id": `link_${Date.now()}`, "text": "Accueil", "url": "#"}]},
             "pages": [],
             "footer": {"style": {"padding": "20px", /* ... */ }, "copyright_text": `© ${new Date().getFullYear()} Mon Site`}
           }
        };
        const jsonString = JSON.stringify(sample, null, 2);
        setJsonInput(jsonString);
        setError(null); setIsGenerated(false);
        setGenerationOutput("Exemple JSON chargé. Prêt à générer.");
    }, []);

    const handleClearInput = useCallback(() => {
        setJsonInput(''); setError(null); setIsGenerated(false);
        setGenerationOutput("Le fichier ZIP généré apparaîtra ici...");
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const handleImportClick = useCallback(() => { fileInputRef.current?.click(); }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/json") {
             setError("Veuillez sélectionner un fichier JSON valide (.json)."); toast.error("Type de fichier incorrect.");
             if (fileInputRef.current) fileInputRef.current.value = ''; return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const formattedText = tryFormatJson(text); // Formate
                setJsonInput(formattedText);
                setError(null); setIsGenerated(false);
                setGenerationOutput(`Fichier "${file.name}" chargé.`); toast.success(`Fichier "${file.name}" chargé.`);
            } catch (parseError) {
                 setError("Le fichier contient un JSON invalide."); toast.error("JSON invalide dans le fichier.");
            } finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
        };
        reader.onerror = () => { setError("Erreur lecture fichier."); toast.error("Erreur lecture fichier."); if (fileInputRef.current) fileInputRef.current.value = ''; };
        reader.readAsText(file);
    }, []);

    const handlePasteClick = useCallback(async () => {
        try {
            if (!navigator.clipboard?.readText) { toast.warn("Fonction 'Coller' non supportée/autorisée."); setError("Fonctionnalité non supportée."); return; }
            const text = await navigator.clipboard.readText();
            if (!text) { toast.info("Presse-papiers vide."); return; }
            try {
                const formattedText = tryFormatJson(text); // Formate
                setJsonInput(formattedText);
                setError(null); setIsGenerated(false);
                setGenerationOutput("Contenu collé."); toast.success("Contenu collé !");
            } catch (parseError) { setError("Contenu collé invalide (JSON)."); toast.error("JSON collé invalide."); }
        } catch (err) { setError("Impossible de lire le presse-papiers."); toast.error("Échec lecture presse-papiers."); }
    }, []);

    // --- NOUVEAU Handler pour CodeMirror ---
     const handleEditorChange = useCallback((value: string) => {
        setJsonInput(value);
        if (error) setError(null); // Efface l'erreur en tapant
        if (isGenerated) { // Réinitialise si l'entrée change après génération
             setIsGenerated(false);
             setGenerationOutput("JSON modifié. Régénérez si nécessaire.");
        }
    }, [error, isGenerated]); // Dépendances pour la logique interne
    // -------------------------------------

    const handleGenerateTemplate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setIsGenerated(false);
        setGenerationOutput("Génération en cours...");

       // Récupère le token (adapte à ta méthode de stockage)
       const token = localStorage.getItem("access_token");
       // Décommente si l'authentification est requise pour l'endpoint
       // if (!token) {
       //     toast.error("Authentification requise pour générer.");
       //     setError("Authentification requise.");
       //     setIsLoading(false);
       //     return;
       // }

       // Validation JSON Côté Client
       try {
           JSON.parse(jsonInput);
       } catch (parseError) {
           setError("Le JSON saisi est invalide.");
           toast.error("Le JSON est invalide !");
           setIsLoading(false);
           return;
       }

       try {
           // --- APPEL AU SERVICE ---
           const result = await generateTemplateApiCall(jsonInput, token); // Passe le JSON et le token
           // ------------------------

           // --- Succès : Déclenche le téléchargement ---
           saveAs(result.blob, result.filename); // Utilise le blob et le nom de fichier retournés

           setGenerationOutput(`Template "${result.filename}" prêt pour téléchargement !`);
           setIsGenerated(true);
           toast.success("Téléchargement démarré !");

       } catch (err: any) {
           // --- Gestion des erreurs venant du service ---
           console.error("Erreur de génération (attrapée dans le composant):", err);
           // Affiche le message d'erreur renvoyé par le service (ou l'erreur de fetch)
           const errorMessage = err.message || "Une erreur inconnue est survenue.";
           setError(errorMessage);
           setGenerationOutput("Échec de la génération.");
           toast.error(`Erreur: ${errorMessage}`);
           setIsGenerated(false);
       } finally {
           // Assure que le chargement s'arrête dans tous les cas
           setIsLoading(false);
       }
   }, [jsonInput]); // Dépendance à jsonInput





   const handleDownload = useCallback(() => {
    // Ce bouton est maintenant redondant car handleGenerateTemplate
    // déclenche directement le téléchargement.
    // Tu peux soit le supprimer, soit le laisser désactivé,
    // soit lui donner un autre rôle (ex: retélécharger le dernier?).
    if (isGenerated) {
         toast.info("Le téléchargement a déjà été lancé après la génération.");
    } else {
         toast.warn("Générez d'abord le template pour pouvoir le télécharger.");
    }
}, [isGenerated]);

    const handleCopyOutputInfo = useCallback(() => { /* ... logique ... */ }, [generationOutput]);
    const handleClearOutput = useCallback(() => { /* ... logique ... */ }, []);

    // --- RENDER ---
    return (
        <div className="flex h-screen bg-gray-900 text-white p-4 gap-4">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />

            {/* --- Panneau Gauche --- */}
             {/* Ajout min-h-0 ici aussi */}
            <div className="flex flex-col w-1/3 bg-gray-100 rounded-lg shadow-lg overflow-hidden min-h-0">
                {/* Header - Ajout flex-shrink-0 */}
                <div className="bg-gray-800 text-white p-3 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-semibold"> <FontAwesomeIcon icon={faFileCode} className="mr-2" /> Importer JSON </h2>
                    <div className="flex items-center gap-4"> {/* Icônes */}
                         <button title="Importer (.json)" onClick={handleImportClick} className="text-gray-300 hover:text-white transition-colors"> <FontAwesomeIcon icon={faFileUpload} size="lg" /> </button>
                         <button title="Coller" onClick={handlePasteClick} className="text-gray-300 hover:text-white transition-colors"> <FontAwesomeIcon icon={faPaste} size="lg"/> </button>
                         <span className="border-l border-gray-600 h-5"></span>
                         <button title="Charger exemple" onClick={handleLoadSampleData} className="text-gray-300 hover:text-white transition-colors"> <FontAwesomeIcon icon={faSyncAlt} size="lg"/> </button>
                         <button title="Vider" onClick={handleClearInput} className="text-gray-300 hover:text-white transition-colors"> <FontAwesomeIcon icon={faTrash} size="lg"/> </button>
                    </div>
                </div>

                {/* === REMPLACEMENT Textarea par CodeMirror === */}
                <div className="flex-grow overflow-auto min-h-0"> {/* Wrapper pour taille/scroll */}
                     <CodeMirror
                        value={jsonInput}
                        height="100%" // S'adapte au conteneur parent
                        extensions={[json()]} // Mode JSON
                        theme={githubDark} // Thème sombre
                        onChange={handleEditorChange} // Nouveau handler
                        basicSetup={{ // Options utiles
                            lineNumbers: true,
                            foldGutter: true,
                            highlightActiveLine: true,
                            autocompletion: true,
                            bracketMatching: true, // Surligne les paires d'accolades/crochets
                            closeBrackets: true,   // Ferme automatiquement les accolades/crochets
                        }}
                        style={{ fontSize: '13px' }} // Ajuste la taille de police si besoin
                    />
                </div>
                {/* ========================================= */}

                {/* Erreur - Ajout flex-shrink-0 */}
                 {error && (
                     <div className="p-2 bg-red-100 text-red-700 text-sm border-t border-red-300 flex-shrink-0">
                         <strong>Erreur:</strong> {error}
                     </div>
                  )}
            </div>

            {/* --- Panneau Central --- */}
            {/* Assure-toi que le fond ici correspond à ce que tu veux (ex: bg-gray-800) */}
            <div className="flex flex-col items-start justify-center w-1/5 bg-gray-600 rounded-lg shadow-lg p-6 gap-6">
                 <button onClick={handleGenerateTemplate} disabled={isLoading || !jsonInput.trim()} className={`flex items-center text-white text-lg font-medium hover:opacity-80 transition-opacity duration-200 ${isLoading || !jsonInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FontAwesomeIcon icon={faCogs} className={`mr-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Génération...' : 'Générer Template'}
                 </button>
                 <button onClick={handleDownload} disabled={!isGenerated || isLoading} className={`flex items-center text-white text-lg font-medium hover:opacity-80 transition-opacity duration-200 ${!isGenerated || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FontAwesomeIcon icon={faDownload} className="mr-3" />
                    Télécharger ZIP
                 </button>
            </div>

            {/* --- Panneau Droit --- */}
            <div className="flex flex-col w-1/3 bg-gray-100 rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                     <h2 className="text-lg font-semibold"> <FontAwesomeIcon icon={faFileZipper} className="mr-2" /> Résultat Génération </h2>
                     <div className="flex items-center gap-3">
                         <button title="Copier infos" onClick={handleCopyOutputInfo} disabled={!generationOutput || generationOutput.startsWith("Le fichier")} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <FontAwesomeIcon icon={faCopy} /> </button>
                         <button title="Vider la sortie" onClick={handleClearOutput} className="text-gray-300 hover:text-white transition-colors"> <FontAwesomeIcon icon={faTrash} /> </button>
                     </div>
                </div>
                {/* Output Area */}
                <div className="flex-grow p-3 text-gray-800 bg-white border-t border-gray-300 overflow-auto">
                   <pre className="text-sm whitespace-pre-wrap">{generationOutput}</pre>
                </div>
            </div>
        </div>
    );
};

export default GenerateTemplatePage;