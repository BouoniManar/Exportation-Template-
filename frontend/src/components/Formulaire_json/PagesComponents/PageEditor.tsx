// src/components/PagesComponents/PageEditor.tsx
import React, { useCallback } from 'react';
// Importez les types nécessaires
import { PageConfig, PageEditorProps, MainContentComponent } from '../../../types';
// Importez les composants enfants
import ComponentSelector from './ComponentSelector';
import ComponentEditor from './ComponentEditor'; // <--- IMPORT DU VRAI ÉDITEUR
// Importez les styles
   // Fichier CSS spécifique pour cette section (à créer/utiliser)
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
const PageEditor: React.FC<PageEditorProps> = ({
    pageData,
    onChange,
    onDelete,
    onAddComponent,
    onComponentChange,
    onComponentDelete
}) => {

    // Handler pour les changements des métadonnées de la page (nom, slug, options)
    const handlePageMetadataChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        let targetValue: string | boolean | undefined = value;
        const nameParts = name.split('.');

        if (nameParts[0] === 'options' && nameParts.length > 1) {
            const optionKey = nameParts[1] as keyof NonNullable<PageConfig['options']>;
             if (type === 'checkbox') {
                targetValue = checked;
                const newOptions = { ...(pageData.options || {}), [optionKey]: targetValue };
                // Appelle onChange avec l'objet pageData mis à jour (uniquement options)
                onChange({ ...pageData, options: newOptions });
            }
        } else if (name === 'page_name' || name === 'page_slug') {
             // Appelle onChange avec l'objet pageData mis à jour (nom ou slug)
             onChange({ ...pageData, [name]: targetValue });
        }

    }, [pageData, onChange]);

    // Handler pour la suppression de la page
    const handleDeletePage = useCallback(() => {
        if (window.confirm(`Supprimer la page "${pageData.page_name || pageData.id}" ?\nCette action est irréversible.`)) {
            onDelete(pageData.id);
        }
    }, [pageData.id, pageData.page_name, onDelete]);

     // Appelé par ComponentSelector pour demander l'ajout d'un composant
    const handleAddComponentRequest = useCallback((componentType: string) => {
        // Relais vers le parent (App.tsx) qui gère la création du composant
        onAddComponent(pageData.id, componentType);
    }, [pageData.id, onAddComponent]);

    // --- Relais des Handlers pour les composants enfants ---
    // Ces fonctions sont directement passées à ComponentEditor
    const handleChildComponentChange = useCallback((updatedComponent: MainContentComponent) => {
        onComponentChange(pageData.id, updatedComponent);
    }, [pageData.id, onComponentChange]);

    const handleChildComponentDelete = useCallback((componentId: string) => {
        if (typeof componentId === 'string' && componentId) {
             // La confirmation pourrait être ajoutée dans ComponentEditor ou ici
             onComponentDelete(pageData.id, componentId);
        } else {
            console.error("Tentative de suppression de composant avec ID invalide:", componentId);
        }
    }, [pageData.id, onComponentDelete]);

    return (
        // Conteneur principal pour une page dans l'éditeur
        <div className="page-item" data-page-id={pageData.id}>
            {/* En-tête avec nom, slug, bouton supprimer */}
            <div className="page-item-header">
                 <span className="drag-handle page-drag-handle" title="Réorganiser Pages"><i className="fas fa-grip-vertical"></i></span>
                 <div className="form-group page-name-group">
                     <input type="text" id={`page_name_${pageData.id}`} className="page_name" name="page_name" value={pageData.page_name ?? ''} onChange={handlePageMetadataChange} placeholder="Nom de la Page" required aria-label="Nom de la page"/>
                 </div>
                  <div className="form-group page-slug-group">
                    <input type="text" id={`page_slug_${pageData.id}`} className="page_slug" name="page_slug" value={pageData.page_slug ?? ''} onChange={handlePageMetadataChange} placeholder="Slug (ex: accueil)" aria-label="Slug de la page"/>
                 </div>
                 <button type="button" className="button-remove page-remove-btn" title="Supprimer cette page" onClick={handleDeletePage} aria-label={`Supprimer la page ${pageData.page_name || ''}`}>
                     <i className="fas fa-trash"></i>
                 </button>
            </div>

            {/* Corps contenant les options et les composants */}
            <div className="page-item-body">
                 {/* Options de la page */}
                 <div className="form-group page-options">
                    <label className="options-label">Options:</label>
                    <div className="checkbox-grid">
                        <label><input type="checkbox" name="options.is_homepage" checked={pageData.options?.is_homepage ?? false} onChange={handlePageMetadataChange}/> Page d'Accueil</label>
                         <label><input type="checkbox" name="options.has_breadcrumb" checked={pageData.options?.has_breadcrumb ?? false} onChange={handlePageMetadataChange}/> Inclure Fil d'Ariane</label>
                         <label><input type="checkbox" name="options.has_sidebar" checked={pageData.options?.has_sidebar ?? false} onChange={handlePageMetadataChange}/> Inclure Sidebar</label>
                    </div>
                </div>

                 {/* Conteneur des composants de cette page */}
                <div className="components-container">
                    <h4 className="components-title">Composants <span className="component-count">({pageData.components?.length || 0})</span>:</h4>
                    {/* Vérifie s'il y a des composants à afficher */}
                    {pageData.components && pageData.components.length > 0 ? (
                         // Itération et rendu de chaque ComponentEditor
                         pageData.components.map((component) => (
                             <ComponentEditor
                                 key={component.id} // Clé React unique
                                 componentData={component} // Passe les données du composant
                                 onChange={handleChildComponentChange} // Passe la fonction de MAJ
                                 onDelete={handleChildComponentDelete} // Passe la fonction de suppression
                             />
                         ))
                     ) : (
                         // Message si aucun composant
                         <p className="no-components-message">Aucun composant ajouté. Utilisez le sélecteur ci-dessous.</p>
                     )}
                </div>

                 {/* Section pour ajouter de nouveaux composants */}
                 <div className="add-component-section">
                    <ComponentSelector onAddComponent={handleAddComponentRequest} />
                 </div>
            </div> {/* End page-item-body */}
        </div> // End page-item
    );
};

export default PageEditor;