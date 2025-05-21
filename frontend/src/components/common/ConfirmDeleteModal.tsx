// src/components/common/ConfirmDeleteModal.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faTimesCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // faCheckCircle n'est pas utilisé ici

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    templateName: string;
    isLoading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    templateName,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 animate-modalAppear"> {/* La classe animate-modalAppear est conservée */}
                <div className="flex items-center mb-6">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 text-3xl mr-4" />
                    <h2 className="text-xl font-semibold text-slate-800">Confirmer la Suppression</h2>
                </div>
                <p className="text-slate-600 mb-6 text-sm md:text-base">
                    Êtes-vous sûr de vouloir supprimer définitivement le template
                    <strong className="text-slate-700"> "{templateName}"</strong> ?
                    <br />
                    Cette action est irréversible.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-2 opacity-70" />
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Suppression...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                Supprimer
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* La balise <style jsx global> a été supprimée */}
        </div>
    );
};

export default ConfirmDeleteModal;