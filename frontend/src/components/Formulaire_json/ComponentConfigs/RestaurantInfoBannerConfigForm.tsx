// src/components/ComponentConfigs/RestaurantInfoBannerConfigForm.tsx
import React, { useCallback } from 'react';
import {
    RestaurantInfoBannerConfigFormProps,
    RestaurantInfoBannerComponentConfig,
    StyleConfig
} from '../../../types'
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
// Helper pour mettre à jour les propriétés imbriquées (peut être externalisé dans un fichier utils)
const updateNestedPropRIB = (
    config: RestaurantInfoBannerComponentConfig,
    path: Array<string | number>, // Ex: ['details', 'title'], ['details', 'quick_info', 'style', 'gap']
    value: any
): RestaurantInfoBannerComponentConfig => {
     const newConfig = JSON.parse(JSON.stringify(config));
     let current: any = newConfig;
     for(let i = 0; i < path.length - 1; i++) {
         const key = path[i];
         // Crée l'objet/tableau parent s'il n'existe pas
         if(current[key] === undefined || current[key] === null) {
             // On ne peut pas savoir à l'avance si c'est un objet ou un tableau ici
             // Pour ce formulaire spécifique, on sait que ce sont des objets
             current[key] = {};
         }
         // Vérifie si on essaie d'écrire dans une propriété qui n'est pas un objet
         if (typeof current[key] !== 'object' && current[key] !== null) {
             console.warn(`Resetting non-object path at ${key} in RestaurantInfoBannerConfig`);
             current[key] = {};
         }
         current = current[key];
     }
      // Vérifie que le niveau final est un objet avant d'assigner
      if (typeof current === 'object' && current !== null) {
          current[path[path.length - 1]] = value;
      } else {
           console.error("Cannot set property on non-object in RestaurantInfoBannerConfig:", current, "at key:", path[path.length - 1]);
      }
     return newConfig;
}

const RestaurantInfoBannerConfigForm: React.FC<RestaurantInfoBannerConfigFormProps> = ({ config, onChange }) => {

    const handleChange = useCallback((path: Array<string | number>, value: any) => {
        const newConfig = updateNestedPropRIB(config, path, value);
        onChange(newConfig);
    }, [config, onChange]);

    // Handler spécifique pour ajouter un item à quick_info.items
    const handleAddQuickInfoItem = useCallback(() => {
        const newItem = { icon: '❓', text: 'Nouvelle info' }; // Valeurs par défaut
        const currentItems = config.details?.quick_info?.items || [];
        const newItems = [...currentItems, newItem];
        const newConfig = updateNestedPropRIB(config, ['details', 'quick_info', 'items'], newItems);
        onChange(newConfig);
    }, [config, onChange]);

    // Handler spécifique pour modifier un item dans quick_info.items
    const handleQuickInfoItemChange = useCallback((index: number, field: 'icon' | 'text', value: string) => {
        const currentItems = config.details?.quick_info?.items || [];
        if (index < 0 || index >= currentItems.length) return; // Vérification de l'index

        const newItems = currentItems.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        const newConfig = updateNestedPropRIB(config, ['details', 'quick_info', 'items'], newItems);
        onChange(newConfig);
    }, [config, onChange]);

    // Handler spécifique pour supprimer un item de quick_info.items
    const handleRemoveQuickInfoItem = useCallback((indexToRemove: number) => {
        const currentItems = config.details?.quick_info?.items || [];
        const newItems = currentItems.filter((_, index) => index !== indexToRemove);
        const newConfig = updateNestedPropRIB(config, ['details', 'quick_info', 'items'], newItems);
        onChange(newConfig);
    }, [config, onChange]);


    return (
        <div className="component-body">
            {/* Style global de la section bannière */}
             <div className="form-subsection">
                 <h4><i className="fas fa-palette"></i> Style Bannière (`style`)</h4>
                 <div className="form-row">
                     <div className="form-group">
                         <label>Padding Bannière:</label>
                         <input
                             type="text"
                             value={config.style?.padding ?? '30px'}
                             onChange={(e) => handleChange(['style', 'padding'], e.target.value)}
                             placeholder="ex: 30px"
                         />
                     </div>
                      <div className="form-group">
                         <label>Couleur Fond Bannière:</label>
                         <input
                             type="color"
                             value={config.style?.background_color ?? '#FFFFFF'}
                             onChange={(e) => handleChange(['style', 'background_color'], e.target.value)}
                         />
                     </div>
                       <div className="form-group">
                         <label>Ombre Bannière:</label>
                         <input
                             type="text"
                             value={config.style?.box_shadow ?? '0 1px 4px rgba(0,0,0,0.06)'}
                             onChange={(e) => handleChange(['style', 'box_shadow'], e.target.value)}
                             placeholder="ex: 0 1px 4px rgba(0,0,0,0.06)"
                         />
                     </div>
                     {/* Ajouter d'autres styles de bannière si besoin */}
                 </div>
             </div>

             {/* Style du logo restaurant */}
             <div className="form-subsection">
                <h4><i className="fas fa-image"></i> Style Logo Resto (`logo_style`)</h4>
                <p><small>Note: L'URL du logo vient de `site.restaurant_logo_url`.</small></p>
                <div className="form-row">
                    <div className="form-group">
                         <label>Largeur Logo:</label>
                         <input type="text" value={config.logo_style?.width ?? '90px'} onChange={(e) => handleChange(['logo_style', 'width'], e.target.value)} placeholder="ex: 90px"/>
                    </div>
                     <div className="form-group">
                         <label>Hauteur Logo:</label>
                         <input type="text" value={config.logo_style?.height ?? '90px'} onChange={(e) => handleChange(['logo_style', 'height'], e.target.value)} placeholder="ex: 90px"/>
                    </div>
                     <div className="form-group">
                         <label>Arrondi Logo:</label>
                         <input type="text" value={config.logo_style?.border_radius ?? '16px'} onChange={(e) => handleChange(['logo_style', 'border_radius'], e.target.value)} placeholder="ex: 16px, 50%"/>
                    </div>
                    {/* Ajouter object_fit, background_color, border si besoin */}
                </div>
             </div>

             {/* Détails du Restaurant */}
             <div className="form-subsection">
                 <h4><i className="fas fa-utensils"></i> Détails Resto (`details`)</h4>
                 <div className="form-group">
                     <label>Titre :</label>
                     <input type="text" value={config.details?.title ?? ''} onChange={(e) => handleChange(['details', 'title'], e.target.value)} />
                 </div>
                 {/* Ajouter config pour details.title_style si besoin */}

                  {/* Badge */}
                 <div className="form-subsection">
                    <h5>Badge Promo</h5>
                     <div className="form-row">
                        <div className="form-group">
                             <label>Texte Badge:</label>
                             <input type="text" value={config.details?.badge?.text ?? ''} onChange={(e) => handleChange(['details', 'badge', 'text'], e.target.value)} placeholder="Ex: -20%"/>
                        </div>
                        {/* Ajouter config pour details.badge.style */}
                    </div>
                 </div>

                  {/* Quick Info (Liste répétable) */}
                 <div className="form-subsection repeatable-list quick-info-list">
                     <h5>Infos Rapides (`details.quick_info.items`)</h5>
                    {(config.details?.quick_info?.items || []).map((item, index) => (
                         <div key={index} className="repeatable-item quick-info-item">
                             <div className="form-row">
                                 <div className="form-group">
                                     <label>Icône {index + 1}:</label>
                                     <input type="text" value={item.icon ?? ''} onChange={(e) => handleQuickInfoItemChange(index, 'icon', e.target.value)} placeholder="Ex: 👍, 🕒, 🛵"/>
                                 </div>
                                  <div className="form-group">
                                     <label>Texte {index + 1}:</label>
                                     <input type="text" value={item.text ?? ''} onChange={(e) => handleQuickInfoItemChange(index, 'text', e.target.value)} placeholder="Ex: 87%, 30-45 min"/>
                                 </div>
                                 <div className="form-group button-group">
                                     <button type="button" className="button-remove remove-repeatable-item-btn" onClick={() => handleRemoveQuickInfoItem(index)}><i className="fas fa-times"></i></button>
                                 </div>
                             </div>
                         </div>
                     ))}
                     <button type="button" className="button-add add-repeatable-item-btn" onClick={handleAddQuickInfoItem}>
                         <i className="fas fa-plus"></i> Ajouter Info Rapide
                     </button>
                     {/* Ajouter config pour details.quick_info.style */}
                 </div>
             </div>

        </div>
    );
};

export default RestaurantInfoBannerConfigForm;