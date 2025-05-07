// src/components/ComponentConfigs/InfoDetailsConfigForm.tsx
import React, { useCallback } from 'react';
import {
    InfoDetailsConfigFormProps,
    InfoDetailsComponentConfig,
    InfoDetailItem,
    StyleConfig
} from'../../../types';
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
// Helper pour mise à jour imbriquée (peut être externalisé)
const updateNestedPropID = (config: InfoDetailsComponentConfig, path: Array<string | number>, value: any): InfoDetailsComponentConfig => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;
    for(let i = 0; i < path.length - 1; i++) { const key = path[i]; if(current[key] === undefined || current[key] === null) { current[key] = (typeof path[i+1] === 'number') ? [] : {}; } if (typeof current[key] !== 'object') { console.warn(`Reset path ${key}`); current[key] = {}; } current = current[key]; }
    if (typeof current === 'object' && current !== null) { current[path[path.length - 1]] = value; } else { console.error("Cannot set prop:", current, "at key:", path[path.length - 1]); }
    return newConfig;
}


const InfoDetailsConfigForm: React.FC<InfoDetailsConfigFormProps> = ({ config, onChange }) => {

    // Handler pour les champs simples (titre, styles)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
         if (name.startsWith('style.') || name.startsWith('title_style.') || name.startsWith('item_style.')) {
            const newConfig = updateNestedPropID(config, name.split('.'), value);
            onChange(newConfig);
        } else {
             onChange({ ...config, [name]: value }); // Pour title
        }
    }, [config, onChange]);

     // --- Gestion de la liste d'items ---

    const handleItemChange = useCallback((itemId: string, field: keyof Omit<InfoDetailItem, 'id'>, value: string) => {
        const itemIndex = (config.items || []).findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        const newConfig = updateNestedPropID(config, ['items', itemIndex, field], value);
        onChange(newConfig);
    }, [config, onChange]);

    const handleAddItem = useCallback(() => {
        const newItemId = `infoItem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newItem: InfoDetailItem = {
            id: newItemId,
            icon: '❓', // Icône par défaut
            text: 'Nouveau détail'
        };
        const newItems = [...(config.items || []), newItem];
        onChange({ ...config, items: newItems });
    }, [config, onChange]);

     const handleRemoveItem = useCallback((itemIdToRemove: string) => {
         const newItems = (config.items || []).filter(item => item.id !== itemIdToRemove);
         onChange({ ...config, items: newItems });
     }, [config, onChange]);

    return (
        <div className="component-body">
             {/* Titre Optionnel de la Section */}
            <div className="form-group">
                <label htmlFor={`infoDetails_title_${config.id}`}>Titre Section (Optionnel):</label>
                <input
                    type="text"
                    id={`infoDetails_title_${config.id}`}
                    name="title"
                    value={config.title ?? ''}
                    onChange={handleInputChange}
                    placeholder="Ex: Informations Utiles"
                />
                 {/* Ajouter config pour title_style si besoin */}
            </div>

             <hr />

             {/* Liste des Items */}
            <div className="form-subsection repeatable-list info-details-list">
                <h4><i className="fas fa-list-ul"></i> Détails (`items`)</h4>
                {(config.items || []).map((item) => (
                    <div key={item.id} className="repeatable-item info-details-item">
                        <div className="form-row">
                             {/* Input pour l'icône (emoji ou classe) */}
                            <div className="form-group" style={{ flexBasis: '60px', flexGrow: 0}}>
                                <label htmlFor={`infoItem_icon_${item.id}`}>Icône:</label>
                                <input
                                    type="text"
                                    id={`infoItem_icon_${item.id}`}
                                    value={item.icon ?? ''}
                                    onChange={(e) => handleItemChange(item.id, 'icon', e.target.value)}
                                    placeholder="🍴"
                                    maxLength={5} // Limite la taille pour emojis/petites classes
                                />
                            </div>
                             {/* Input pour le texte */}
                            <div className="form-group" style={{ flexGrow: 3 }}> {/* Prend plus de place */}
                                <label htmlFor={`infoItem_text_${item.id}`}>Texte:</label>
                                <input
                                    type="text"
                                    id={`infoItem_text_${item.id}`}
                                    value={item.text ?? ''}
                                    onChange={(e) => handleItemChange(item.id, 'text', e.target.value)}
                                    placeholder="Détail de l'information"
                                />
                            </div>
                             {/* Bouton Supprimer */}
                            <div className="form-group button-group">
                                 <button
                                    type="button"
                                    className="button-remove remove-repeatable-item-btn"
                                    title="Supprimer ce détail"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                         {/* Ajouter config pour item_style si besoin */}
                    </div>
                ))}
                 <button
                    type="button"
                    className="button-add add-repeatable-item-btn"
                    onClick={handleAddItem}
                >
                    <i className="fas fa-plus"></i> Ajouter un Détail
                </button>
            </div>

             {/* Ajouter config pour le style global du composant (config.style) si besoin */}

        </div>
    );
};

export default InfoDetailsConfigForm;