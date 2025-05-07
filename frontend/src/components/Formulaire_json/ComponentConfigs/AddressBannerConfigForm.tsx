// src/components/ComponentConfigs/AddressBannerConfigForm.tsx
import React, { useCallback } from 'react';
import {
    AddressBannerConfigFormProps, 
    AddressBannerComponentConfig,
    StyleConfig
} from '../../../types';


import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
const updateNestedPropAB = (
    config: AddressBannerComponentConfig,
    path: Array<string | number>,
    value: any
): AddressBannerComponentConfig => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;
    for(let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if(current[key] === undefined || current[key] === null) {
            current[key] = {}; // Crée l'objet parent si besoin
        }
        if (typeof current[key] !== 'object' && current[key] !== null) {
             console.warn(`Resetting path at ${key}`); current[key] = {};
        }
        current = current[key];
    }
     if (typeof current === 'object' && current !== null) {
        
         if (path[path.length - 1] === 'z_index') {
              current[path[path.length - 1]] = value === '' ? undefined : Number(value);
         } else {
             current[path[path.length - 1]] = value;
         }
     } else { console.error("Cannot set prop:", current, "at key:", path[path.length - 1]); }
    return newConfig;
}

const AddressBannerConfigForm: React.FC<AddressBannerConfigFormProps> = ({ config, onChange }) => {

    const handleChange = useCallback((path: Array<string | number>, value: any) => {
        const newConfig = updateNestedPropAB(config, path, value);
        onChange(newConfig);
    }, [config, onChange]);

     const handleDirectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange({ ...config, [name]: value });
    }, [config, onChange]);


    return (
        <div className="component-body">

            <div className="form-group">
                <label htmlFor={`addrBanner_text_${config.id}`}>Texte Principal:</label>
                <input
                    type="text"
                    id={`addrBanner_text_${config.id}`}
                    name="text" // Clé directe
                    value={config.text ?? ''}
                    onChange={handleDirectChange} // Utilise le handler simple
                    placeholder="Ex: Découvrez si cet établissement livre chez vous"
                />
            </div>
            

            <hr />
             
             <div className="form-subsection">
                 <h4><i className="fas fa-map-marked-alt"></i> Input Adresse</h4>
                 <div className="form-group">
                    <label>Texte Placeholder Input:</label>
                    <input
                        type="text"
                        value={config.address_input?.prompt ?? ''}
                        onChange={(e) => handleChange(['address_input', 'prompt'], e.target.value)}
                        placeholder="Quelle est votre adresse ?"
                    />
                </div>
                 <div className="form-group">
                    <label>Texte Bouton Position:</label>
                    <input
                        type="text"
                        value={config.address_input?.button_text ?? ''}
                        onChange={(e) => handleChange(['address_input', 'button_text'], e.target.value)}
                        placeholder="Utiliser ma position"
                    />
                </div>
                
             </div>


             <hr />
             {/* Style Global de la Bannière */}
             <div className="form-subsection">
                 <h4><i className="fas fa-palette"></i> Style de la Bannière (`style`)</h4>
                 <div className="form-row">
                    <div className="form-group color-group">
                        <label>Couleur de Fond:</label>
                         <div>
                             <input
                                type="color"
                                value={config.style?.background_color ?? '#FFFCEC'}
                                onChange={(e) => handleChange(['style', 'background_color'], e.target.value)}
                             />
                        </div>
                    </div>
                     <div className="form-group">
                         <label>Padding:</label>
                         <input
                            type="text"
                            value={config.style?.padding ?? '12px 30px'}
                            onChange={(e) => handleChange(['style', 'padding'], e.target.value)}
                            placeholder="ex: 12px 30px"
                         />
                     </div>
                     <div className="form-group">
                         <label>Bordure Bas:</label>
                         <input
                            type="text"
                            value={config.style?.border_bottom ?? '1px solid #F0E68C'}
                            onChange={(e) => handleChange(['style', 'border_bottom'], e.target.value)}
                            placeholder="ex: 1px solid #ccc"
                         />
                     </div>
                     <div className="form-group">
                         <label>Z-Index (Position `fixed` est gérée par CSS):</label>
                         <input
                            type="number"
                            value={config.style?.z_index ?? ''} // Vide si non défini
                            onChange={(e) => handleChange(['style', 'z_index'], e.target.value)}
                            placeholder="ex: 999"
                         />
                          <small>Utile si la bannière est fixée sous le header principal.</small>
                     </div>
                 </div>
             </div>

        </div>
    );
};

export default AddressBannerConfigForm;