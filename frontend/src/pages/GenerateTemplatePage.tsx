// src/pages/GenerateTemplatePage.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileCode, faDownload, faTrash, faCopy, faSyncAlt,
    faCogs, faFileZipper, faFileUpload, faPaste, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import { Link, useLocation } from 'react-router-dom';

// IMPORTER LES FONCTIONS DE SERVICE ET LES TYPES NÉCESSAIRES
import {
    generateTemplateApiCall,      // Fonction pour générer le ZIP
    saveProjectMetadataApiCall, // Fonction pour sauvegarder les métadonnées
    // TemplateGenerationResult    // Ce type est défini dans templateService.ts, pas besoin de l'importer ici si non utilisé directement
} from '../services/templateService';
import { SaveGeneratedProjectPayload } from '../types'; // Importer depuis votre fichier de types centralisé (ex: src/types.ts ou src/types/templateTypes.ts)

// --- IMPORT LAYOUT COMPONENTS ---
import Sidebar from '../components/layout/Sidebar';
// import Header from '../components/layout/Header'; // Si vous l'utilisez

// --- Importations CodeMirror ---
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { githubDark } from '@uiw/codemirror-theme-github';
import { useAuth } from '../context/AuthContext'; // Pour obtenir le token

interface GenerateTemplatePageProps {
    initialJson?: string;
}

const tryFormatJson = (jsonString: string): string => {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        // Si ce n'est pas un JSON valide, retourner la chaîne originale
        // ou une chaîne vide, ou lancer une erreur plus spécifique
        console.warn("tryFormatJson: La chaîne n'est pas un JSON valide.", e);
        return jsonString;
    }
};

const GenerateTemplatePage: React.FC<GenerateTemplatePageProps> = ({ initialJson = '' }) => {
    const [jsonInput, setJsonInput] = useState<string>('');
    const [generationOutput, setGenerationOutput] = useState<string>("Le fichier ZIP généré apparaîtra ici...");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGenerated, setIsGenerated] = useState<boolean>(false); // Indique si un ZIP a été généré dans la session actuelle
    const [lastGeneratedBlob, setLastGeneratedBlob] = useState<Blob | null>(null);
    const [lastGeneratedFilename, setLastGeneratedFilename] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth(); // Obtenir le token depuis AuthContext

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const jsonFromQuery = queryParams.get('json');
        if (jsonFromQuery) {
            try {
                const decodedJson = decodeURIComponent(jsonFromQuery);
                setJsonInput(tryFormatJson(decodedJson));
                toast.info("Configuration JSON chargée depuis l'URL pour édition.");
                setGenerationOutput("JSON chargé. Prêt à générer ou modifier.");
                setIsGenerated(false); // Réinitialiser pour une nouvelle génération
                setLastGeneratedBlob(null);
                setLastGeneratedFilename("");
            } catch (e) {
                toast.error("Erreur lors du chargement du JSON depuis l'URL.");
                if (initialJson) setJsonInput(tryFormatJson(initialJson));
                else setJsonInput(''); // Ou charger un exemple par défaut
            }
        } else if (initialJson) {
             setJsonInput(tryFormatJson(initialJson));
        } else {
            // Optionnel: charger un exemple vide ou un message par défaut
            setJsonInput(tryFormatJson('{\n  "votre_site": {\n    "message": "Commencez ici !"\n  }\n}'));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, initialJson]); // Réagir aux changements d'URL ou à initialJson

    const handleLoadSampleData = useCallback(() => {
       const sample = {
            "mon_site": {
              "site": {
                "title": "Nouveau Site",
                "image_source_base": "Backend/app/generation_template/assets/img/test",
                "logo_url": "Backend/app/generation_template/assets/img/test/logo.png"
              },
              "theme": {
                "primary_color": "#0c0113",
                "secondary_color": "#E74C3C",
                "accent_color": "#F1C40F",
                "background_light": "#F9F6F1",
                "background_white": "#FFFFFF",
                "text_dark": "#333333",
                "text_light": "#FFFFFF",
                "text_medium": "#6c757d",
                "border_color": "#010509",
                "font": "Roboto, sans-serif",
                "secondary_font": "Open Sans, sans-serif",
                "heading_font": "Roboto Slab, serif",
                "base_size": "16px",
                "border_radius": "4px"
              },
              "header": {
                "style": {
                  "position": "fixed",
                  "height": "60px",
                  "z_index": 1000,
                  "background_color": "#dadcdd",
                  "box_shadow": "0 2px 4px rgba(0,0,0,0.1)",
                  "color": "#087d5f"
                },
                "login_button": {
                  "text": "Connexion"
                }
              },
              "navigation": {
                "links": [
                  {
                    "id": "link_1746432304271", // Vous pouvez garder des ID dynamiques ou les fixer
                    "text": "Accueil",
                    "url": "#",
                    "active": true
                  },
                  {
                    "id": "mainNav_link_1746432554486_ub28i",
                    "text": "About",
                    "url": "#",
                    "active": false
                  },
                  {
                    "id": "mainNav_link_1746432558485_74jy7",
                    "text": "Service",
                    "url": "#",
                    "active": false
                  }
                ],
                "style": {
                  "background_color": "#087d5f",
                  "color": "#000c24"
                }
              },
              "pages": [
                {
                  "id": "page_1746432596761_s8xbp",
                  "page_name": "", // Laissez vide ou mettez une valeur par défaut
                  "page_slug": "", // Laissez vide ou mettez une valeur par défaut
                  "components": [
                    {
                      "id": "comp_1746432608639_8e3vj",
                      "type": "hero",
                      "style": {
                        "padding": "60px 20px",
                        "background_color": "#F9F6F1"
                      },
                      "text_content": {
                        "title": {
                          "text": "" // Laissez vide ou mettez une valeur par défaut
                        },
                        "button": {
                          "text": "" // Laissez vide ou mettez une valeur par défaut
                        },
                        "style": {
                          "text_align": "center"
                        }
                      },
                      "image": {
                        "alt": "", // Laissez vide ou mettez une valeur par défaut
                        "style": {
                          "border_radius": "8px"
                        },
                        "src": "Backend/app/generation_template/assets/img/test/banner.png"
                      }
                    },
                    {
                      "id": "comp_1746432679332_ay25k",
                      "type": "card_grid",
                      "title": "Liste des Médicments", // "Médicaments" avec un "a"
                      "cards": [
                        {
                          "id": "card_1746432701136_y5l20",
                          "title": "",
                          "text": "",
                          "image": {
                            "alt": "",
                            "src": "Backend/app/generation_template/assets/img/test/prod1.png"
                          },
                          "button": {
                            "text": "Détails",
                            "url": "#"
                          }
                        },
                        {
                          "id": "card_1746432739257_nz73k",
                          "title": "",
                          "text": "",
                          "image": {
                            "alt": "Nouvelle image",
                            "src": "Backend/app/generation_template/assets/img/test/prod2.png"
                          },
                          "button": {
                            "text": "Détails",
                            "url": "#"
                          }
                        }
                      ],
                      "card_style": {
                        "background_color": ""
                      }
                    }
                  ],
                  "options": {
                    "is_homepage": true,
                    "has_breadcrumb": true,
                    "has_sidebar": true
                  }
                }
              ],
              "footer": {
                "style": {
                  "padding": "20px",
                  "text_align": "center",
                  "background_color": "#087d5f",
                  "color": "#022645"
                },
                "copyright_text": "© 2025 Mon Site"
              }
            }
          };
        const jsonString = JSON.stringify(sample, null, 2);
        setJsonInput(jsonString);
        setError(null); setIsGenerated(false); setLastGeneratedBlob(null); setLastGeneratedFilename("");
        setGenerationOutput("Exemple JSON chargé. Prêt à générer.");
        toast.success("Exemple JSON chargé.");
    }, []);

    const handleClearInput = useCallback(() => {
        setJsonInput(''); setError(null); setIsGenerated(false); setLastGeneratedBlob(null); setLastGeneratedFilename("");
        setGenerationOutput("Le fichier ZIP généré apparaîtra ici...");
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.info("Éditeur JSON vidé.");
    }, []);

    const handleImportClick = useCallback(() => { fileInputRef.current?.click(); }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/json") {
             setError("Veuillez sélectionner un fichier JSON valide (.json).");
             toast.error("Type de fichier incorrect. Veuillez choisir un fichier .json.");
             if (fileInputRef.current) fileInputRef.current.value = ''; return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                setJsonInput(tryFormatJson(text)); // Formater pour la lisibilité
                setError(null); setIsGenerated(false); setLastGeneratedBlob(null); setLastGeneratedFilename("");
                setGenerationOutput(`Fichier "${file.name}" chargé et formaté.`);
                toast.success(`Fichier "${file.name}" chargé.`);
            } catch (parseError) {
                 setError("Le fichier contient un JSON invalide.");
                 toast.error("JSON invalide dans le fichier importé.");
            } finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
        };
        reader.onerror = () => { setError("Erreur lors de la lecture du fichier."); toast.error("Erreur lors de la lecture du fichier."); if (fileInputRef.current) fileInputRef.current.value = ''; };
        reader.readAsText(file);
    }, []);

    const handlePasteClick = useCallback(async () => {
        try {
            if (!navigator.clipboard?.readText) { toast.warn("La fonction 'Coller' n'est pas supportée ou autorisée par votre navigateur."); setError("Fonctionnalité non supportée."); return; }
            const text = await navigator.clipboard.readText();
            if (!text) { toast.info("Le presse-papiers est vide."); return; }
            setJsonInput(tryFormatJson(text)); // Formater pour la lisibilité
            setError(null); setIsGenerated(false); setLastGeneratedBlob(null); setLastGeneratedFilename("");
            setGenerationOutput("Contenu collé depuis le presse-papiers et formaté.");
            toast.success("Contenu collé !");
        } catch (err) { setError("Impossible de lire le presse-papiers."); toast.error("Échec de la lecture du presse-papiers."); }
    }, []);

    const handleEditorChange = useCallback((value: string) => {
        setJsonInput(value);
        if (error) setError(null); // Effacer l'erreur si l'utilisateur modifie le JSON
        if (isGenerated) { // Si un ZIP a été généré, il n'est plus à jour
             setIsGenerated(false);
             setLastGeneratedBlob(null);
             setLastGeneratedFilename("");
             setGenerationOutput("JSON modifié. Veuillez régénérer le template.");
        }
    }, [error, isGenerated]);

    const handleGenerateTemplate = useCallback(async () => {
        if (!jsonInput.trim()) {
            toast.error("L'entrée JSON ne peut pas être vide.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setIsGenerated(false);
        setLastGeneratedBlob(null);
        setLastGeneratedFilename("");
        setGenerationOutput("Génération du template en cours...");

        let parsedJsonForValidation;
        try {
            parsedJsonForValidation = JSON.parse(jsonInput); // Valider que c'est du JSON
        } catch (e) {
            setError("Le JSON fourni n'est pas valide. Veuillez corriger les erreurs.");
            toast.error("JSON invalide.");
            setIsLoading(false);
            setGenerationOutput("Échec : JSON invalide.");
            return;
        }

        try {
            // Étape 1: Générer le template et obtenir le blob, nom de fichier, et chemin serveur
            const generationResult = await generateTemplateApiCall(jsonInput, token);

            // Étape 2: Permettre à l'utilisateur de télécharger le ZIP
            saveAs(generationResult.blob, generationResult.filename);
            setGenerationOutput(`Template "${generationResult.filename}" généré et téléchargement lancé !`);
            setIsGenerated(true);
            setLastGeneratedBlob(generationResult.blob); // Sauvegarder pour re-téléchargement
            setLastGeneratedFilename(generationResult.filename);
            toast.success(`"${generationResult.filename}" téléchargé !`);

            // Étape 3: Sauvegarder les métadonnées dans la base de données
            if (generationResult.server_file_path) {
                setGenerationOutput(prev => prev + "\nSauvegarde des informations du template en cours...");
                
                const projectPayload: SaveGeneratedProjectPayload = {
                    name: generationResult.filename.replace(/\.zip$/, ''),
                    server_file_path: generationResult.server_file_path,
                    json_config_snapshot: jsonInput, // Envoyer le JSON brut utilisé
                    description: `Template ${generationResult.filename.replace(/\.zip$/, '')} généré le ${new Date().toLocaleDateString()}`,
                    // source_json_file_id: ... // À gérer si vous avez un ID pour le JSON source lié
                };

                const savedProject = await saveProjectMetadataApiCall(projectPayload, token);
                setGenerationOutput(prev => prev + `\nTemplate sauvegardé dans votre espace (ID: ${savedProject.id}).`);
                toast.success("Template enregistré dans votre espace !");
            } else {
                setGenerationOutput(prev => prev + "\nAttention: Le chemin du fichier serveur est manquant. La sauvegarde en base de données n'a pas pu être effectuée. Le template a été téléchargé uniquement.");
                toast.warn("Sauvegarde en BDD impossible (information manquante de l'API). Le template a seulement été téléchargé.");
            }

        } catch (err: any) {
            const errorMessage = err.message || "Une erreur inconnue est survenue lors de la génération ou sauvegarde.";
            setError(errorMessage);
            setGenerationOutput(`Échec: ${errorMessage}`);
            toast.error(`Erreur: ${errorMessage}`);
            setIsGenerated(false);
        } finally {
            setIsLoading(false);
        }
    }, [jsonInput, token]);


   const handleDownload = useCallback(() => {
    if (isGenerated && lastGeneratedBlob && lastGeneratedFilename) {
         saveAs(lastGeneratedBlob, lastGeneratedFilename);
         toast.info(`téléchargement de "${lastGeneratedFilename}".`);
    } else {
         toast.warn("Veuillez d'abord générer un template pour pouvoir le télécharger.");
    }
    }, [isGenerated, lastGeneratedBlob, lastGeneratedFilename]);

    const handleCopyOutputInfo = useCallback(() => {
        if (generationOutput && !generationOutput.startsWith("Le fichier")) {
            navigator.clipboard.writeText(generationOutput)
                .then(() => toast.success("Informations de sortie copiées dans le presse-papiers!"))
                .catch(() => toast.error("Échec de la copie des informations."));
        } else {
            toast.warn("Aucune information de sortie à copier ou état initial.");
        }
    }, [generationOutput]);

    const handleClearOutput = useCallback(() => {
        setGenerationOutput("Le fichier ZIP généré apparaîtra ici...");
        setIsGenerated(false); // Réinitialiser aussi l'état de génération pour le bouton de téléchargement
        setLastGeneratedBlob(null);
        setLastGeneratedFilename("");
        // setError(null); // Optionnel: garder ou non l'erreur affichée
        toast.info("Panneau de sortie nettoyé.");
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* <Header /> */} {/* Décommentez si vous avez un Header/Topbar distinct */}

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

                    <div className="max-w-full mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                    Générer le Template Web
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">Importez votre JSON et générez le template ZIP.</p>
                            </div>
                            <Link
                                to="/generate-json" // Ou la route vers votre éditeur JSON si différente
                                className="mt-3 sm:mt-0 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 group font-medium py-2 px-3 border border-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Retour à l'Éditeur JSON
                            </Link>
                        </div>

                        <div className="flex flex-col lg:flex-row h-[calc(100vh-13rem)] min-h-[400px] gap-4">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />

                            {/* Panneau Gauche: Importer JSON */}
                            <div className="flex flex-col w-full lg:w-2/5 bg-white rounded-lg shadow-lg overflow-hidden min-h-0 border border-gray-200">
                                <div className="bg-slate-700 text-white p-3 flex justify-between items-center flex-shrink-0">
                                    <h2 className="text-md sm:text-lg font-semibold">
                                        <FontAwesomeIcon icon={faFileCode} className="mr-2" /> Importer JSON
                                    </h2>
                                    <div className="flex items-center gap-1 sm:gap-2"> {/* Réduit le gap pour petits écrans */}
                                        <button title="Importer (.json)" onClick={handleImportClick} className="text-gray-300 hover:text-white transition-colors p-1 sm:px-1"> <FontAwesomeIcon icon={faFileUpload} size="sm" /> </button>
                                        <button title="Coller" onClick={handlePasteClick} className="text-gray-300 hover:text-white transition-colors p-1 sm:px-1"> <FontAwesomeIcon icon={faPaste} size="sm"/> </button>
                                        <span className="border-l border-gray-600 h-4 mx-1 sm:mx-2"></span>
                                        <button title="Charger exemple" onClick={handleLoadSampleData} className="text-gray-300 hover:text-white transition-colors p-1 sm:px-1"> <FontAwesomeIcon icon={faSyncAlt} size="sm"/> </button>
                                        <button title="Vider" onClick={handleClearInput} className="text-gray-300 hover:text-white transition-colors p-1 sm:px-1"> <FontAwesomeIcon icon={faTrash} size="sm"/> </button>
                                    </div>
                                </div>
                                <div className="flex-grow overflow-auto min-h-0"> {/* Assure que CodeMirror peut scroller */}
                                    <CodeMirror
                                        value={jsonInput}
                                        height="100%" // Prend toute la hauteur disponible
                                        extensions={[json()]}
                                        theme={githubDark}
                                        onChange={handleEditorChange}
                                        basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, autocompletion: true, bracketMatching: true, closeBrackets: true }}
                                        style={{ fontSize: '13px', height: '100%' }} // Forcer la hauteur ici aussi
                                    />
                                </div>
                                {error && (
                                    <div className="p-2 bg-red-100 text-red-700 text-sm border-t border-red-300 flex-shrink-0">
                                        <strong>Erreur:</strong> {error}
                                    </div>
                                 )}
                            </div>

                            {/* Panneau Central: Actions */}
                            <div className="flex flex-col items-center lg:items-start justify-center w-full lg:w-1/5 bg-gray-50 border border-gray-200 rounded-lg shadow-lg p-4 sm:p-6 gap-4">
                                <button
                                    onClick={handleGenerateTemplate}
                                    disabled={isLoading || !jsonInput.trim()}
                                    className={`w-full flex items-center justify-center text-white text-sm sm:text-base font-medium py-2.5 px-4 rounded-md shadow-sm transition-all duration-200 ease-in-out
                                                ${isLoading || !jsonInput.trim()
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                                >
                                    <FontAwesomeIcon icon={faCogs} className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'En cours...' : 'Générer & Sauvegarder'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={!isGenerated || isLoading}
                                    className={`w-full flex items-center justify-center text-gray-700 text-sm sm:text-base font-medium py-2.5 px-4 rounded-md shadow-sm border border-gray-300 hover:bg-gray-100 transition-all duration-200 ease-in-out
                                                ${!isGenerated || isLoading
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'}`}
                                >
                                    <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
                                    Télécharger ZIP
                                </button>
                            </div>

                            {/* Panneau Droit: Résultat */}
                            <div className="flex flex-col w-full lg:w-2/5 bg-white rounded-lg shadow-lg overflow-hidden min-h-0 border border-gray-200">
                               <div className="bg-slate-700 text-white p-3 flex justify-between items-center flex-shrink-0">
                                    <h2 className="text-md sm:text-lg font-semibold">
                                        <FontAwesomeIcon icon={faFileZipper} className="mr-2" /> Résultat Génération
                                    </h2>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <button title="Copier infos" onClick={handleCopyOutputInfo} disabled={!generationOutput || generationOutput.startsWith("Le fichier")} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1 sm:px-1"> <FontAwesomeIcon icon={faCopy} size="sm" /> </button>
                                        <button title="Vider la sortie" onClick={handleClearOutput} className="text-gray-300 hover:text-white transition-colors p-1 sm:px-1"> <FontAwesomeIcon icon={faTrash} size="sm" /> </button>
                                    </div>
                                </div>
                                <div className="flex-grow p-3 text-gray-700 bg-gray-50 border-t border-gray-200 overflow-auto">
                                   <pre className="text-xs sm:text-sm whitespace-pre-wrap break-all">{generationOutput}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GenerateTemplatePage;