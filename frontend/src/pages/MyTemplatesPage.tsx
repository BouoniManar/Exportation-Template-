// src/pages/MyTemplatesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faDownload, faTrashAlt, faPlusCircle, faSpinner, faEdit } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';

import Sidebar from '../components/layout/Sidebar';
import { getMyTemplates, deleteSavedTemplate } from '../services/templateService';
import api from '../services/api';
import { GeneratedTemplateResponse } from '../types';

const MyTemplatesPage: React.FC = () => {
    const [templates, setTemplates] = useState<GeneratedTemplateResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getMyTemplates();
            console.log("Templates reçus du backend:", data);
            setTemplates(data);
        } catch (err: any) {
            const errorMessage = err.message || "Impossible de charger les templates.";
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
        toast.info(`Téléchargement de "${templateName}" en cours...`);
        try {
            const response = await api.get<Blob>(
                `/api/projects/${templateId}/download`,
                { responseType: 'blob' }
            );
            saveAs(response.data, `${templateName}.zip`);
            toast.success(`"${templateName}.zip" téléchargé !`);
        } catch (err: any) {
            toast.error(`Échec du téléchargement: ${err.message || 'Erreur inconnue'}`);
        }
    };

    const handleDelete = async (templateId: number, templateName: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le template "${templateName}" ? Cette action est irréversible.`)) {
            try {
                await deleteSavedTemplate(templateId);
                toast.success(`Template "${templateName}" supprimé avec succès.`);
                setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateId));
            } catch (err: any) {
                toast.error(`Échec de la suppression: ${err.message || 'Erreur inconnue'}`);
            }
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 text-gray-800"> {/* Fond légèrement différent */}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8"> {/* Plus de padding */}
                    <ToastContainer position="bottom-right" autoClose={3000} theme="colored" hideProgressBar={false} />
                    <div className="max-w-full mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-300">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                                <FontAwesomeIcon icon={faFolderOpen} className="mr-3 text-indigo-600" />
                                Mes Templates Générés
                            </h1>
                            <Link
                                to="/generate-template"
                                className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all duration-150"
                            >
                                <FontAwesomeIcon icon={faPlusCircle} className="mr-2 h-5 w-5" />
                                Générer un Nouveau Template
                            </Link>
                        </div>

                        {isLoading && (
                            <div className="flex justify-center items-center py-16">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-500" />
                                <p className="ml-4 text-xl text-slate-600">Chargement des templates...</p>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md shadow-md" role="alert">
                                <p className="font-bold">Erreur de chargement</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {!isLoading && !error && templates.length === 0 && (
                            <div className="text-center text-slate-500 py-16 bg-white rounded-xl shadow-lg p-8">
                                <FontAwesomeIcon icon={faFolderOpen} size="4x" className="mb-6 text-slate-400" />
                                <p className="text-2xl font-semibold mb-2">Aucun template sauvegardé.</p>
                                <p className="text-md">
                                    Commencez par en <Link to="/generate-template" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">générer un nouveau</Link> !
                                </p>
                            </div>
                        )}

                        {!isLoading && !error && templates.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {templates.map((template) => (
                                    <div key={template.id} className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between border border-slate-200 hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                        <div className="mb-4">
                                            <h2 className="text-md font-semibold text-slate-700 truncate mb-1" title={template.template_name}>
                                                {template.template_name || "Template Sans Nom"}
                                            </h2>
                                            <p className="text-xs text-slate-500 mb-3">
                                                Créé le: {new Date(template.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                            {template.description && (
                                                <p className="text-sm text-slate-600 mb-3 h-10 text-ellipsis overflow-hidden" title={template.description}>
                                                    {/* Simple line clamp - pour un meilleur clamp, des solutions JS ou CSS plus avancées sont nécessaires */}
                                                    {template.description.length > 60 ? template.description.substring(0, 57) + "..." : template.description}
                                                </p>
                                            )}
                                        </div>
                                        {/* MODIFICATION DES BOUTONS ICI */}
                                        <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-slate-200">
                                            <Link
                                                to={`/generate-template?json=${encodeURIComponent(template.json_data)}`}
                                                className="p-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                title="Modifier ce template"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                                {/* Texte optionnel pour écrans plus larges si souhaité : <span className="ml-1.5 hidden sm:inline">Éditer</span> */}
                                            </Link>
                                            <button
                                                onClick={() => handleDownload(template.id, template.template_name)}
                                                className="p-2.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center"
                                                title="Télécharger le ZIP"
                                            >
                                                <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                                                {/* <span className="ml-1.5 hidden sm:inline">ZIP</span> */}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id, template.template_name)}
                                                className="p-2.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center"
                                                title="Supprimer le template"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" />
                                                {/* <span className="ml-1.5 hidden sm:inline">Suppr.</span> */}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyTemplatesPage;