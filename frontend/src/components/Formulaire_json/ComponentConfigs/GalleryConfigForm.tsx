// src/components/ComponentConfigs/GalleryConfigForm.tsx
import React, { useCallback } from 'react';
import {
    GalleryConfigFormProps,
    GalleryComponentConfig,
    GalleryImageItem,
    StyleConfig 
} from '../../../types'
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
// Helper pour mettre à jour l'état imbriqué 
const updateNestedPropGallery = (config: GalleryComponentConfig, path: Array<string | number>, value: any): GalleryComponentConfig => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;
    for(let i = 0; i < path.length - 1; i++) { const key = path[i]; if(current[key] === undefined || current[key] === null) { current[key] = (typeof path[i+1] === 'number') ? [] : {}; } if (typeof current[key] !== 'object') { console.warn(`Reset path ${key}`); current[key] = {}; } current = current[key]; }
    if (typeof current === 'object' && current !== null) { current[path[path.length - 1]] = value; } else { console.error("Cannot set prop:", current, "at key:", path[path.length - 1]); }
    return newConfig;
}

const GalleryConfigForm: React.FC<GalleryConfigFormProps> = ({ config, onChange }) => {

    // Handler pour les champs simples (titre, styles globaux)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Utilise le helper pour les styles imbriqués ou met à jour directement
        if (name.startsWith('style.') || name.startsWith('title_style.') || name.startsWith('gallery_style.')) {
            const newConfig = updateNestedPropGallery(config, name.split('.'), value);
            onChange(newConfig);
        } else {
             onChange({ ...config, [name]: value }); // Pour title
        }
    }, [config, onChange]);

     // --- Gestion de la liste d'images ---

    const handleImageChange = useCallback((imageId: string, field: keyof GalleryImageItem, value: string) => {
        const imageIndex = (config.images || []).findIndex(img => img.id === imageId);
        if (imageIndex === -1) return;
        // Utilise l'helper pour cibler la propriété dans la bonne image du tableau
        const newConfig = updateNestedPropGallery(config, ['images', imageIndex, field], value);
        onChange(newConfig);
    }, [config, onChange]);

    const handleAddImage = useCallback(() => {
        const newImageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newImage: GalleryImageItem = {
            id: newImageId,
            src: '',
            alt: 'Image Galerie'
        };
        const newImages = [...(config.images || []), newImage];
        onChange({ ...config, images: newImages });
    }, [config, onChange]);

     const handleRemoveImage = useCallback((imageIdToRemove: string) => {
         const newImages = (config.images || []).filter(img => img.id !== imageIdToRemove);
         onChange({ ...config, images: newImages });
     }, [config, onChange]);

    return (
        <div className="component-body">
            {/* Titre de la Galerie */}
            <div className="form-group">
                <label htmlFor={`gallery_title_${config.id}`}>Titre de la Galerie:</label>
                <input
                    type="text"
                    id={`gallery_title_${config.id}`}
                    name="title" // Clé directe de GalleryComponentConfig
                    value={config.title ?? ''}
                    onChange={handleInputChange}
                    placeholder="Ex: Nos Réalisations"
                />
            </div>

            <hr />
             <div className="form-subsection">
                 <h4><i className="fas fa-th"></i> Style de la Grille (`gallery_style`)</h4>
                 <div className="form-row">
                    <div className="form-group">
                        <label>Colonnes (CSS Grid):</label>
                        <input
                            type="text"
                            name="gallery_style.grid_template_columns"
                            value={config.gallery_style?.grid_template_columns ?? 'repeat(auto-fit, minmax(180px, 1fr))'}
                            onChange={handleInputChange}
                            placeholder="ex: repeat(auto-fit, minmax(180px, 1fr))"
                        />
                         <small>Utilise la syntaxe CSS grid-template-columns.</small>
                    </div>
                    <div className="form-group">
                        <label>Espace entre images:</label>
                        <input
                            type="text"
                            name="gallery_style.gap"
                            value={config.gallery_style?.gap ?? '15px'}
                            onChange={handleInputChange}
                            placeholder="ex: 15px"
                        />
                    </div>
                 </div>
             </div>

            <hr />
            {/* Liste des Images */}
            <div className="form-subsection repeatable-list gallery-image-list">
                <h4><i className="fas fa-images"></i> Images (`images`)</h4>
                {(config.images || []).map((image) => (
                    <div key={image.id} className="repeatable-item gallery-image-item">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor={`img_src_${image.id}`}>URL/Chemin Image:</label>
                                <input
                                    type="text"
                                    id={`img_src_${image.id}`}
                                    value={image.src ?? ''}
                                    onChange={(e) => handleImageChange(image.id, 'src', e.target.value)}
                                    placeholder="https://... ou backend/assets/..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`img_alt_${image.id}`}>Texte Alternatif:</label>
                                <input
                                    type="text"
                                    id={`img_alt_${image.id}`}
                                    value={image.alt ?? ''}
                                    onChange={(e) => handleImageChange(image.id, 'alt', e.target.value)}
                                    placeholder="Description de l'image"
                                />
                            </div>
                        </div>
                       
                          <div className="form-group">
                             <label>Arrondi Image:</label>
                             <input
                                type="text"
                              
                                placeholder="ex: 6px" disabled title="Style par image non implémenté dans cet exemple"
                             />
                         </div>
                        <button
                            type="button"
                            className="button-remove remove-repeatable-item-btn"
                            title="Supprimer cette image"
                            onClick={() => handleRemoveImage(image.id)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
                 <button
                    type="button"
                    className="button-add add-repeatable-item-btn"
                    onClick={handleAddImage}
                >
                    <i className="fas fa-plus"></i> Ajouter une Image
                </button>
            </div>
         
        </div>
    );
};

export default GalleryConfigForm;