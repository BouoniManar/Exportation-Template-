// src/components/ComponentConfigs/CardGridConfigForm.tsx
import React, { useCallback, useState, useEffect } from 'react'; // Ajout de useState et useEffect
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
import {
    CardGridComponentConfig,
    CardGridConfigFormProps,
    CardItem,
    // ImageConfig, // Non utilisé directement si CardItem a image.src etc.
    // ButtonConfig,
    // StyleConfig
} from '../../../types';

// URL de base de votre API backend (doit être cohérente avec les autres formulaires)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001'; // MODIFIÉ POUR UTILISER LE PORT 8001

const updateNestedPropCG = (config: CardGridComponentConfig, path: Array<string | number>, value: any): CardGridComponentConfig => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;
    for(let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        const shouldBeArray = typeof path[i+1] === 'number';
        if(current[key] === undefined || current[key] === null || typeof current[key] !== 'object' || (shouldBeArray && !Array.isArray(current[key]))) {
            current[key] = shouldBeArray ? [] : {};
        }
        current = current[key];
    }
    const finalKey = path[path.length - 1];
    if (typeof current === 'object' && current !== null) {
        if (typeof finalKey === 'number' && Array.isArray(current)) {
            if (finalKey >= 0 && finalKey < current.length) {
                current[finalKey] = value;
            }
        } else {
            current[finalKey] = value;
        }
    }
    return newConfig;
};

const CardGridConfigForm: React.FC<CardGridConfigFormProps> = ({ config, onChange }) => {
    // États pour gérer le téléversement (pourrait être complexifié pour suivre par carte si besoin)
    const [isUploadingCardImage, setIsUploadingCardImage] = useState<string | null>(null); // Stocke l'ID de la carte en cours de téléversement
    const [uploadCardImageError, setUploadCardImageError] = useState<{ [cardId: string]: string | null }>({});

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const path = name.split('.');
        const newConfig = updateNestedPropCG(config, path, value);
        onChange(newConfig);
    }, [config, onChange]);

    const handleCardChange = useCallback((cardId: string, fieldPath: Array<string | number>, value: any) => {
        const cardIndex = (config.cards || []).findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        let processedValue = value;
        if (fieldPath.length === 2 && fieldPath[0] === 'image' && fieldPath[1] === 'src' && typeof value === 'string') {
            processedValue = value.replace(/\\/g, '/');
        }
        
        const fullPath = ['cards', cardIndex, ...fieldPath];
        const newConfig = updateNestedPropCG(config, fullPath, processedValue);
        onChange(newConfig);
    }, [config, onChange]);

    const handleCardImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, cardId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingCardImage(cardId); // Indique quelle carte est en cours de téléversement
        setUploadCardImageError(prev => ({ ...prev, [cardId]: null }));

        const formData = new FormData();
        formData.append('imageFile', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/upload_image/card_images`, { // Catégorie "card_images"
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `Erreur de téléversement: ${response.statusText}` }));
                throw new Error(errorData.detail || `Erreur de téléversement: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.filePath) {
                // Mettre à jour config.cards[index].image.src
                handleCardChange(cardId, ['image', 'src'], result.filePath);
            } else {
                throw new Error("Le chemin du fichier n'a pas été retourné par le serveur.");
            }

        } catch (error: any) {
            console.error(`Erreur lors du téléversement de l'image pour la carte ${cardId}:`, error);
            setUploadCardImageError(prev => ({ ...prev, [cardId]: error.message || "Une erreur est survenue." }));
        } finally {
            setIsUploadingCardImage(null);
            e.target.value = ''; 
        }
    }, [config, onChange, handleCardChange]); // Ajout de handleCardChange aux dépendances

    const handleAddCard = useCallback(() => {
        const newCardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newCard: CardItem = {
            id: newCardId,
            title: 'Nouvelle Carte',
            text: 'Description...',
            image: { src: '', alt: 'Nouvelle image' }, // Initialise image.src à vide
            button: { text: 'Détails', url: '#' }
        };
        const newCards = [...(config.cards || []), newCard];
        onChange({ ...config, cards: newCards });
    }, [config, onChange]);

     const handleRemoveCard = useCallback((cardIdToRemove: string) => {
         const newCards = (config.cards || []).filter(c => c.id !== cardIdToRemove);
         onChange({ ...config, cards: newCards });
     }, [config, onChange]);

    // Fonction pour obtenir l'URL d'aperçu d'une image de carte
    const getCardImagePreviewUrl = (imageSrc: string | undefined): string | null => {
        if (!imageSrc || imageSrc.trim() === '') return null;
        if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('data:image')) {
            return imageSrc;
        }
        return `${API_BASE_URL}/${imageSrc.startsWith('/') ? imageSrc.substring(1) : imageSrc}`;
    };

    return (
        <div className="component-body">
             {/* ... (Titre Section, Style de la Grille, Style Global des Cartes restent les mêmes) ... */}
            <div className="form-group">
                <label htmlFor={`cardgrid_title_${config.id}`}>Titre Section (Optionnel):</label>
                <input type="text" id={`cardgrid_title_${config.id}`} name="title" value={config.title ?? ''} onChange={handleInputChange} placeholder="Ex: Nos Services"/>
            </div>
            <hr className="form-hr"/>
             <div className="form-subsection">
                 <h4><i className="fas fa-th"></i> Style de la Grille</h4>
                  <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`cardgrid_gridstyle_cols_${config.id}`}>Colonnes (CSS Grid):</label>
                        <input type="text" id={`cardgrid_gridstyle_cols_${config.id}`} name="grid_container_style.grid_template_columns" value={config.grid_container_style?.grid_template_columns ?? 'repeat(auto-fit, minmax(250px, 1fr))'} onChange={handleInputChange} />
                      </div>
                       <div className="form-group">
                        <label htmlFor={`cardgrid_gridstyle_gap_${config.id}`}>Espace (Gap):</label>
                        <input type="text" id={`cardgrid_gridstyle_gap_${config.id}`} name="grid_container_style.gap" value={config.grid_container_style?.gap ?? '30px'} onChange={handleInputChange} placeholder="ex: 30px"/>
                      </div>
                  </div>
             </div>
             <div className="form-subsection">
                  <h4><i className="fas fa-id-card"></i> Style Global des Cartes (`card_style`)</h4>
                   <div className="form-row">
                      <div className="form-group">
                          <label htmlFor={`cardgrid_cardstyle_padding_${config.id}`}>Padding Interne Carte:</label>
                          <input type="text" id={`cardgrid_cardstyle_padding_${config.id}`} name="card_style.padding" value={config.card_style?.padding ?? '20px'} onChange={handleInputChange}/>
                      </div>
                       <div className="form-group color-group">
                          <label htmlFor={`cardgrid_cardstyle_bg_${config.id}`}>Fond Carte:</label>
                          <div><input type="color" id={`cardgrid_cardstyle_bg_${config.id}`} name="card_style.background_color" value={config.card_style?.background_color ?? '#FFFFFF'} onChange={handleInputChange}/></div>
                       </div>
                        <div className="form-group">
                          <label htmlFor={`cardgrid_cardstyle_radius_${config.id}`}>Arrondi Carte:</label>
                          <input type="text" id={`cardgrid_cardstyle_radius_${config.id}`} name="card_style.border_radius" value={config.card_style?.border_radius ?? '8px'} onChange={handleInputChange}/>
                       </div>
                        <div className="form-group">
                          <label htmlFor={`cardgrid_cardstyle_shadow_${config.id}`}>Ombre Carte:</label>
                           <input type="text" id={`cardgrid_cardstyle_shadow_${config.id}`} name="card_style.box_shadow" value={config.card_style?.box_shadow ?? '0 2px 5px rgba(0,0,0,0.1)'} onChange={handleInputChange}/>
                       </div>
                   </div>
             </div>
            <hr className="form-hr"/>

             {/* Liste des Cartes (MODIFIÉ) */}
            <div className="form-subsection repeatable-list card-list">
                <h4><i className="fas fa-clone"></i> Cartes Individuelles (`cards`)</h4>
                 {(config.cards || []).map((card) => {
                    const cardImagePreview = getCardImagePreviewUrl(card.image?.src);
                    const currentUploadError = uploadCardImageError[card.id];
                    return (
                     <div key={card.id} className="repeatable-item card-item-config">
                         <h5>Carte (ID: {card.id.substring(0,10)}...)</h5> {/* Tronquer ID pour affichage */}
                         {/* ... (champs titre et texte de la carte restent les mêmes) ... */}
                        <div className="form-group">
                            <label htmlFor={`card_${card.id}_title`}>Titre Carte:</label>
                            <input type="text" id={`card_${card.id}_title`} value={card.title ?? ''} onChange={(e) => handleCardChange(card.id, ['title'], e.target.value)} />
                         </div>
                          <div className="form-group">
                            <label htmlFor={`card_${card.id}_text`}>Texte Carte:</label>
                            <textarea id={`card_${card.id}_text`} value={card.text ?? ''} onChange={(e) => handleCardChange(card.id, ['text'], e.target.value)} rows={3}></textarea>
                         </div>

                         {/* Section Image de la Carte (MODIFIÉ) */}
                         <div className="form-group">
                            <label htmlFor={`card_image_upload_${card.id}`}>Téléverser Image Carte:</label>
                            {cardImagePreview && (
                                <div className="image-preview mb-2">
                                    <img 
                                        src={cardImagePreview} 
                                        alt={card.image?.alt || 'Aperçu Carte'} 
                                        style={{ maxWidth: '100px', maxHeight: '100px', border:'1px solid #ccc', objectFit: 'contain' }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                id={`card_image_upload_${card.id}`}
                                className="image-upload"
                                onChange={(e) => handleCardImageUpload(e, card.id)}
                                accept="image/png, image/jpeg, image/gif, image/svg+xml, image/webp"
                                disabled={isUploadingCardImage === card.id}
                            />
                            {isUploadingCardImage === card.id && <small>Téléversement...</small>}
                            {currentUploadError && <small style={{ color: 'red' }}>{currentUploadError}</small>}
                         </div>

                         <div className="form-group">
                              <label htmlFor={`card_${card.id}_image_src_fallback`}>Image Carte (URL Externe Fallback):</label>
                              <input
                                  type="text"
                                  id={`card_${card.id}_image_src_fallback`}
                                  value={card.image?.src ?? ''}
                                  onChange={(e) => handleCardChange(card.id, ['image', 'src'], e.target.value)}
                                  placeholder="https://... (si pas de téléversement)"
                                  title="Entrez une URL directe si vous ne téléversez pas d'image pour cette carte."
                              />
                          </div>
                           <div className="form-group">
                              <label htmlFor={`card_${card.id}_image_alt`}>Texte Alt Image:</label>
                              <input
                                type="text"
                                id={`card_${card.id}_image_alt`}
                                value={card.image?.alt ?? ''}
                                onChange={(e) => handleCardChange(card.id, ['image', 'alt'], e.target.value)} 
                                placeholder="Description de l'image de la carte"
                                />
                           </div>
                           
                           {/* ... (Bouton de la carte reste le même) ... */}
                           <div className="form-subsection">
                               <h6>Bouton Carte (Optionnel)</h6>
                               <div className="form-row">
                                   <div className="form-group">
                                       <label htmlFor={`card_${card.id}_button_text`}>Texte Bouton:</label>
                                       <input type="text" id={`card_${card.id}_button_text`} value={card.button?.text ?? ''} onChange={(e) => handleCardChange(card.id, ['button', 'text'], e.target.value)} />
                                   </div>
                                   <div className="form-group">
                                       <label htmlFor={`card_${card.id}_button_url`}>URL Bouton:</label>
                                       <input type="text" id={`card_${card.id}_button_url`} value={card.button?.url ?? ''} onChange={(e) => handleCardChange(card.id, ['button', 'url'], e.target.value)} placeholder="#" />
                                   </div>
                               </div>
                           </div>
                         <button type="button" className="button-remove remove-repeatable-item-btn" onClick={() => handleRemoveCard(card.id)}><i className="fas fa-times"></i> Supprimer Carte</button>
                     </div>
                 )})}
                 <button type="button" className="button-add add-repeatable-item-btn" onClick={handleAddCard}>
                    <i className="fas fa-plus"></i> Ajouter une Carte
                </button>
            </div>
        </div>
    );
};

export default CardGridConfigForm;