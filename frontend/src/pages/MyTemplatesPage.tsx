// src/pages/MyTemplatesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFolderOpen,
    faDownload,
    faTrashAlt,
    faPlusCircle,
    faSpinner,
    faEdit, // Pour un éventuel bouton éditer
    faEye,  // Pour un éventuel bouton visualiser
    faFileZipper // Icône pour la miniature (optionnel)
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';

import Sidebar from '../components/layout/Sidebar';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal'; // Assurez-vous que le chemin est correct
import { getMyTemplates, deleteSavedTemplate } from '../services/templateService'; // Assurez-vous que les chemins sont corrects
import api from '../services/api'; // Assurez-vous que le chemin est correct
import { GeneratedTemplateResponse } from '../types'; // Assurez-vous que le chemin est correct
import Header from '../components/layout/Header';

const MyTemplatesPage: React.FC = () => {
    const [templates, setTemplates] = useState<GeneratedTemplateResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State pour la modale de suppression
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getMyTemplates();
            // Trier les templates par date de création, les plus récents en premier
            const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setTemplates(sortedData);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || "Impossible de charger les templates.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleDownload = async (templateId: number, templateName: string) => {
        const toastId = toast.loading(`Téléchargement de "${templateName}" en cours...`);
        try {
            const response = await api.get<Blob>(
                `/api/projects/${templateId}/download`, // Vérifiez cet endpoint
                { responseType: 'blob' }
            );
            saveAs(response.data, `${templateName || 'template'}.zip`); // Nom par défaut si templateName est vide
            toast.update(toastId, { render: `"${templateName || 'template'}.zip" téléchargé !`, type: 'success', isLoading: false, autoClose: 3000 });
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.message || 'Erreur inconnue lors du téléchargement.';
            toast.update(toastId, { render: `Échec du téléchargement: ${errorMsg}`, type: 'error', isLoading: false, autoClose: 5000 });
        }
    };

    const openDeleteConfirmModal = (id: number, name: string) => {
        setTemplateToDelete({ id, name: name || "ce template" }); // Nom par défaut si vide
        setIsDeleteModalOpen(true);
    };

    const closeDeleteConfirmModal = () => {
        setIsDeleteModalOpen(false);
        setTemplateToDelete(null);
    };

    const confirmDeleteHandler = async () => {
        if (templateToDelete) {
            setIsDeleting(true);
            const toastId = toast.loading(`Suppression de "${templateToDelete.name}" en cours...`);
            try {
                await deleteSavedTemplate(templateToDelete.id);
                toast.update(toastId, { render: `Template "${templateToDelete.name}" supprimé.`, type: 'success', isLoading: false, autoClose: 3000 });
                setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateToDelete.id));
            } catch (err: any) {
                const errorMsg = err.response?.data?.detail || err.message || 'Erreur inconnue lors de la suppression.';
                toast.update(toastId, { render: `Échec de la suppression: ${errorMsg}`, type: 'error', isLoading: false, autoClose: 5000 });
            } finally {
                setIsDeleting(false);
                closeDeleteConfirmModal();
            }
        }
    };

    // Fonctionnalité Éditer (à implémenter si nécessaire)
    // const handleEdit = (jsonData: string | null) => {
    //     if (jsonData) {
    //         // Naviguer vers la page de génération avec le JSON pré-rempli
    //         // L'URL pourrait être quelque chose comme /generate-template?mode=edit&data=ENCODED_JSON_DATA
    //         // Ou vous pourriez stocker le JSON dans le state global (Redux, Zustand, Context)
    //         // et la page de génération le lirait à partir de là.
    //         console.log("Éditer ce JSON:", jsonData);
    //         toast.info("Fonctionnalité d'édition à implémenter.");
    //         // Exemple de navigation (nécessite useNavigate de react-router-dom)
    //         // navigate(`/generate-template?json=${encodeURIComponent(jsonData)}`);
    //     } else {
    //         toast.warn("Aucune donnée JSON disponible pour éditer ce template.");
    //     }
    // };


    return (
        <div className="flex h-screen bg-slate-50 text-slate-800"> {/* Fond plus clair */}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                   <Header /> 
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-10 bg-slate-50"> {/* Padding ajusté */}
                    <ToastContainer position="top-right" autoClose={4000} theme="colored" hideProgressBar={false} />
                    <div className="max-w-full mx-auto"> {/* Enlever max-w-7xl pour pleine largeur */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-5 border-b border-slate-300">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-700 flex items-center">
                                <FontAwesomeIcon icon={faFolderOpen} className="mr-3 text-indigo-500" />
                                Mes Templates Générés
                            </h1>
                            <Link
                                to="/generate-template" // Assurez-vous que cette route existe
                                className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <FontAwesomeIcon icon={faPlusCircle} className="mr-2 h-5 w-5" />
                                Générer un Nouveau Template
                            </Link>
                        </div>

                        {isLoading && (
                            <div className="flex flex-col justify-center items-center py-20 text-center">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-500 mb-4" />
                                <p className="text-xl text-slate-600">Chargement des templates...</p>
                            </div>
                        )}
                        {error && !isLoading && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md" role="alert">
                                <p className="font-bold text-lg mb-2">Erreur de chargement</p>
                                <p>{error}</p>
                                <button
                                    onClick={fetchTemplates}
                                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                    Réessayer
                                </button>
                            </div>
                        )}

                        {!isLoading && !error && templates.length === 0 && (
                            <div className="text-center text-slate-500 py-20 bg-white rounded-xl shadow-lg p-10">
                                <FontAwesomeIcon icon={faFolderOpen} size="4x" className="mb-8 text-slate-400" />
                                <p className="text-2xl font-semibold mb-3 text-slate-700">Aucun template sauvegardé pour le moment.</p>
                                <p className="text-md mb-6">
                                    Créez votre premier template personnalisé en quelques clics !
                                </p>
                                <Link
                                    to="/generate-template"
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow hover:shadow-md"
                                >
                                    Commencer la génération
                                </Link>
                            </div>
                        )}

                        {!isLoading && !error && templates.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"> {/* Ajout de xl:grid-cols-5 pour potentiellement plus de cartes */}
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col border border-slate-200 overflow-hidden group"
                                    >
                                        <div className="h-20 bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex items-center justify-center border-b border-slate-200">
                                            <FontAwesomeIcon icon={faFileZipper} className="text-indigo-300 text-5xl group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h2 className="text-base font-semibold text-slate-700 truncate mb-1 group-hover:text-indigo-600 transition-colors" title={template.template_name}>
                                                {template.template_name || "Template Sans Nom"}
                                            </h2>
                                            <p className="text-xs text-slate-400 mb-3">
                                                Créé le: {new Date(template.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                            <div className="text-sm text-slate-600 mb-4 flex-grow  line-clamp-3" title={template.description || "Aucune description"}> {/* Utilisation de line-clamp */}
                                                {template.description || <span className="italic text-slate-400">Aucune description fournie.</span>}
                                            </div>

                                            <div className="mt-auto flex items-center justify-start gap-2 pt-4 border-t border-slate-100 -mx-5 px-4 pb-1"> {/* Ajustement padding */}
                                                <Link
                                                    to={`/generate-template?edit_id=${template.id}`} // Lien pour éditer, à adapter à votre logique
                                                    className="p-2 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-md transition-all duration-150"
                                                    title="Modifier ce template (charge la configuration)"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
                                                </Link>
                                                {/* <button
                                                    // onClick={() => handlePreview(template.id)} // Pour une future fonctionnalité de prévisualisation
                                                    className="p-2 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-sky-100 hover:text-sky-600 rounded-md transition-all duration-150"
                                                    title="Visualiser le template"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                                                </button> */}
                                                <button
                                                    onClick={() => handleDownload(template.id, template.template_name)}
                                                    className="p-2 text-xs font-medium text-green-600 bg-green-100 hover:bg-green-600 hover:text-white rounded-md transition-all duration-150 flex items-center justify-center"
                                                    title="Télécharger le ZIP"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirmModal(template.id, template.template_name)}
                                                    className="p-2 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-600 hover:text-white rounded-md transition-all duration-150 flex items-center justify-center ml-auto" // ml-auto pour pousser à droite
                                                    title="Supprimer le template"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {templateToDelete && (
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteConfirmModal}
                    onConfirm={confirmDeleteHandler}
                    templateName={templateToDelete.name}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
};

export default MyTemplatesPage;