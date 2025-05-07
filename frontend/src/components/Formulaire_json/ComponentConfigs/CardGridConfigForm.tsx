// src/components/ComponentConfigs/CardGridConfigForm.tsx
import React, { useCallback } from 'react';
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
// Assurez-vous que tous les types nécessaires sont définis et exportés
import {
    CardGridComponentConfig,
    CardGridConfigFormProps, // Assurez-vous que ce type existe et est exporté dans types.ts
    CardItem,
    ImageConfig,
    ButtonConfig,
    StyleConfig
} from '../../../types'// Ajustez le chemin

// Définition des Props (doit être dans types.ts et exportée)
// Si non fait, décommentez et déplacez dans types.ts
/*
export interface CardGridConfigFormProps {
    config: CardGridComponentConfig;
    onChange: (newConfig: CardGridComponentConfig) => void;
}
*/

// Helper pour mise à jour imbriquée (peut être externalisé dans un fichier utils si utilisé ailleurs)
const updateNestedPropCG = (config: CardGridComponentConfig, path: Array<string | number>, value: any): CardGridComponentConfig => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;
    for(let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        // Crée objet ou tableau si inexistant ou mauvais type
        const shouldBeArray = typeof path[i+1] === 'number';
        if(current[key] === undefined || current[key] === null || typeof current[key] !== 'object' || (shouldBeArray && !Array.isArray(current[key]))) {
            current[key] = shouldBeArray ? [] : {};
        }
        current = current[key];
    }
    const finalKey = path[path.length - 1];
    if (typeof current === 'object' && current !== null) {
        // Vérifie si on met à jour un tableau par index
        if (typeof finalKey === 'number' && Array.isArray(current)) {
            if (finalKey >= 0 && finalKey < current.length) { // Assure que l'index est valide
                current[finalKey] = value;
            } else {
                 console.error("Invalid index for array update:", finalKey, "in", current);
            }
        } else {
            current[finalKey] = value;
        }
    } else {
         console.error("Cannot set property on non-object/array:", current, "at key:", finalKey, "in path:", path);
    }
    return newConfig;
}


const CardGridConfigForm: React.FC<CardGridConfigFormProps> = ({ config, onChange }) => {

    // Handler pour les champs simples et les styles directs du composant
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const path = name.split('.');
        const newConfig = updateNestedPropCG(config, path, value);
        onChange(newConfig);
    }, [config, onChange]);

     // --- Gestion de la liste de cartes ---

    // Handler pour les changements DANS une carte spécifique
    const handleCardChange = useCallback((cardId: string, path: Array<string | number>, value: any) => {
        const cardIndex = (config.cards || []).findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        let processedValue = value;
        // *** CORRECTION SLASHES POUR IMAGE CARTE ***
        // Si le chemin modifié est celui de l'image source de la carte
        if (path.length === 2 && path[0] === 'image' && path[1] === 'src') {
             if (typeof value === 'string') { // Vérifie que c'est une string
                processedValue = value.replace(/\\/g, '/');
            }
        }
        // *** FIN CORRECTION ***

        // Construit le chemin complet : ['cards', index, ...path]
        const fullPath = ['cards', cardIndex, ...path];
        const newConfig = updateNestedPropCG(config, fullPath, processedValue);
        onChange(newConfig);
    }, [config, onChange]);

    const handleAddCard = useCallback(() => {
        const newCardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newCard: CardItem = {
            id: newCardId,
            title: 'Nouvelle Carte',
            text: 'Description...',
            image: { alt: 'Nouvelle image' }, // Initialise image
            button: { text: 'Détails', url: '#' } // Initialise button
        };
        const newCards = [...(config.cards || []), newCard];
        onChange({ ...config, cards: newCards });
    }, [config, onChange]);

     const handleRemoveCard = useCallback((cardIdToRemove: string) => {
         const newCards = (config.cards || []).filter(c => c.id !== cardIdToRemove);
         onChange({ ...config, cards: newCards });
     }, [config, onChange]);

    return (
        <div className="component-body">
             {/* Titre Optionnel de la Section */}
            <div className="form-group">
                <label htmlFor={`cardgrid_title_${config.id}`}>Titre Section (Optionnel):</label>
                <input
                    type="text"
                    id={`cardgrid_title_${config.id}`}
                    name="title" // Clé directe du composant card_grid
                    value={config.title ?? ''}
                    onChange={handleInputChange} // Utilise le handler générique pour le titre
                    placeholder="Ex: Nos Services"/>
            </div>

            <hr className="form-hr"/>
             {/* Configuration de la Grille */}
             <div className="form-subsection">
                 <h4><i className="fas fa-th"></i> Style de la Grille</h4>
                  <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`cardgrid_gridstyle_cols_${config.id}`}>Colonnes (CSS Grid):</label>
                        <input
                            type="text"
                            id={`cardgrid_gridstyle_cols_${config.id}`}
                            name="grid_container_style.grid_template_columns" // Note: clé renommée dans ce code vs JSON initial
                            value={config.grid_container_style?.grid_template_columns ?? 'repeat(auto-fit, minmax(250px, 1fr))'}
                            onChange={handleInputChange} />
                        <small>Ex: repeat(3, 1fr) ou repeat(auto-fit, minmax(250px, 1fr))</small>
                      </div>
                       <div className="form-group">
                        <label htmlFor={`cardgrid_gridstyle_gap_${config.id}`}>Espace (Gap):</label>
                        <input
                            type="text"
                            id={`cardgrid_gridstyle_gap_${config.id}`}
                            name="grid_container_style.gap"
                            value={config.grid_container_style?.gap ?? '30px'} // Ajusté pour cohérence
                            onChange={handleInputChange} placeholder="ex: 30px"/>
                      </div>
                  </div>
             </div>

             {/* Styles Globaux des Cartes */}
             <div className="form-subsection">
                  <h4><i className="fas fa-id-card"></i> Style Global des Cartes (`card_style`)</h4>
                   <div className="form-row">
                      <div className="form-group">
                          <label htmlFor={`cardgrid_cardstyle_padding_${config.id}`}>Padding Interne Carte:</label>
                          <input
                            type="text"
                            id={`cardgrid_cardstyle_padding_${config.id}`}
                            name="card_style.padding"
                            value={config.card_style?.padding ?? '20px'} // Ajusté pour cohérence
                            onChange={handleInputChange}/>
                      </div>
                       <div className="form-group color-group">
                          <label htmlFor={`cardgrid_cardstyle_bg_${config.id}`}>Fond Carte:</label>
                          <div>
                           <input
                                type="color"
                                id={`cardgrid_cardstyle_bg_${config.id}`}
                                name="card_style.background_color"
                                value={config.card_style?.background_color ?? '#FFFFFF'}
                                onChange={handleInputChange}/>
                           </div>
                       </div>
                        <div className="form-group">
                          <label htmlFor={`cardgrid_cardstyle_radius_${config.id}`}>Arrondi Carte:</label>
                          <input
                            type="text"
                            id={`cardgrid_cardstyle_radius_${config.id}`}
                            name="card_style.border_radius"
                            value={config.card_style?.border_radius ?? '8px'} // Ajusté
                            onChange={handleInputChange}/>
                       </div>
                        <div className="form-group">
                          <label htmlFor={`cardgrid_cardstyle_shadow_${config.id}`}>Ombre Carte:</label>
                           <input
                                type="text"
                                id={`cardgrid_cardstyle_shadow_${config.id}`}
                                name="card_style.box_shadow"
                                value={config.card_style?.box_shadow ?? '0 2px 5px rgba(0,0,0,0.1)'}
                                onChange={handleInputChange}/>
                       </div>
                   </div>
             </div>

            <hr className="form-hr"/>

             {/* Liste des Cartes */}
            <div className="form-subsection repeatable-list card-list">
                <h4><i className="fas fa-clone"></i> Cartes Individuelles (`cards`)</h4>
                 {(config.cards || []).map((card) => (
                     <div key={card.id} className="repeatable-item card-item-config">
                         <h5>Carte (ID: {card.id})</h5>
                         <div className="form-group">
                            <label htmlFor={`card_${card.id}_title`}>Titre Carte:</label>
                            <input
                                type="text"
                                id={`card_${card.id}_title`}
                                value={card.title ?? ''}
                                onChange={(e) => handleCardChange(card.id, ['title'], e.target.value)}
                            />
                         </div>
                          <div className="form-group">
                            <label htmlFor={`card_${card.id}_text`}>Texte Carte:</label>
                            <textarea
                                id={`card_${card.id}_text`}
                                value={card.text ?? ''}
                                onChange={(e) => handleCardChange(card.id, ['text'], e.target.value)}
                                rows={3}
                            ></textarea>
                         </div>
                          <div className="form-group">
                              <label htmlFor={`card_${card.id}_image_src`}>Image Carte (URL/Relatif):</label>
                              <input
                                  type="text"
                                  id={`card_${card.id}_image_src`}
                                  value={card.image?.src ?? ''}
                                  // Utilise handleCardChange qui contient la correction des slashes
                                  onChange={(e) => handleCardChange(card.id, ['image', 'src'], e.target.value)}
                                  placeholder="backend/assets/..."
                              />
                          </div>
                           <div className="form-group">
                              <label htmlFor={`card_${card.id}_image_alt`}>Texte Alt Image:</label>
                              <input
                                type="text"
                                id={`card_${card.id}_image_alt`}
                                value={card.image?.alt ?? ''}
                                onChange={(e) => handleCardChange(card.id, ['image', 'alt'], e.target.value)} />
                           </div>
                           {/* Pas de link_url dans votre JSON initial, retiré pour l'instant */}
                           {/* Bouton Optionnel */}
                           <div className="form-subsection">
                               <h6>Bouton Carte (Optionnel)</h6>
                               <div className="form-row">
                                   <div className="form-group">
                                       <label htmlFor={`card_${card.id}_button_text`}>Texte Bouton:</label>
                                       <input
                                            type="text"
                                            id={`card_${card.id}_button_text`}
                                            value={card.button?.text ?? ''}
                                            onChange={(e) => handleCardChange(card.id, ['button', 'text'], e.target.value)}
                                        />
                                   </div>
                                   <div className="form-group">
                                       <label htmlFor={`card_${card.id}_button_url`}>URL Bouton:</label>
                                       <input
                                            type="text"
                                            id={`card_${card.id}_button_url`}
                                            value={card.button?.url ?? ''}
                                            onChange={(e) => handleCardChange(card.id, ['button', 'url'], e.target.value)}
                                            placeholder="#"
                                        />
                                   </div>
                                   {/* Ajouter inputs pour le style du bouton si nécessaire */}
                               </div>
                           </div>
                         <button type="button" className="button-remove remove-repeatable-item-btn" onClick={() => handleRemoveCard(card.id)}><i className="fas fa-times"></i></button>
                     </div>
                 ))}
                 <button type="button" className="button-add add-repeatable-item-btn" onClick={handleAddCard}>
                    <i className="fas fa-plus"></i> Ajouter une Carte
                </button>
            </div>

        </div>
    );
};

export default CardGridConfigForm;