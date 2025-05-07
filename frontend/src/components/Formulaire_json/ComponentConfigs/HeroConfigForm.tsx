// src/components/ComponentConfigs/HeroConfigForm.tsx
import React, { useCallback } from 'react';
// Assurez-vous que les types nécessaires sont importés et exportés depuis types.ts
import { HeroComponentConfig, StyleConfig } from'../../../types' // Vérifiez ce chemin
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
// Définition des Props pour ce composant spécifique
// Doit correspondre à ce qui est utilisé dans ComponentEditor
export interface LocalHeroConfigFormProps {
    config: HeroComponentConfig;
    onChange: (newConfig: HeroComponentConfig) => void;
}

// Helper pour mettre à jour l'état imbriqué de manière immuable
// Prend la config actuelle, le chemin sous forme de tableau de clés, et la nouvelle valeur
const updateNestedProp = (config: HeroComponentConfig, path: Array<string | number>, value: any): HeroComponentConfig => {
    // Clonage profond pour éviter la mutation directe de l'objet config
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;

    // Navigue jusqu'à l'avant-dernier niveau de l'objet
    for(let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        // Crée l'objet/tableau imbriqué s'il n'existe pas ou n'est pas du bon type
        if(current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
             // Détermine s'il faut créer un objet ou un tableau (basique)
             // Une logique plus avancée pourrait être nécessaire si vous avez des tableaux à d'autres niveaux
             current[key] = (typeof path[i+1] === 'number') ? [] : {};
        }
        current = current[key];
    }

    // Définit la valeur à la dernière clé du chemin
    const finalKey = path[path.length - 1];
     if (typeof current === 'object' && current !== null) {
        current[finalKey] = value;
    } else {
         console.error("Impossible de définir la propriété sur une valeur non-objet:", current, "à la clé:", finalKey, "dans le chemin:", path);
    }
    return newConfig;
}


const HeroConfigForm: React.FC<LocalHeroConfigFormProps> = ({ config, onChange }) => {

    // Handler unique pour TOUS les changements d'input dans ce formulaire Hero
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const path = name.split('.'); // Sépare les clés imbriquées : 'image.src' -> ['image', 'src']
        let processedValue: string | undefined = value;

        // *** CORRECTION POUR LES SLASHES DANS LES CHEMINS D'IMAGE ***
        // Applique la correction spécifiquement pour le champ 'image.src'
        if (name === 'image.src') {
            processedValue = value.replace(/\\/g, '/'); // Remplace tous les \ par /
        }
        // *** FIN DE LA CORRECTION ***

        // Met à jour l'état en utilisant l'helper pour l'imbrication
        const newConfig = updateNestedProp(config, path, processedValue);
        onChange(newConfig); // Remonte l'objet Hero COMPLET mis à jour

    }, [config, onChange]);


    return (
        <div className="component-body">
            {/* --- TEXT CONTENT --- */}
            <div className="form-subsection">
                <h4><i className="fas fa-align-left"></i> Contenu Texte</h4>
                <div className="form-group">
                    <label htmlFor={`hero_title_${config.id}`}>Titre Principal:</label>
                    {/* Utilise la notation par point dans 'name' pour l'imbrication */}
                    <input type="text" id={`hero_title_${config.id}`} name="text_content.title.text" value={config.text_content?.title?.text ?? ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label htmlFor={`hero_subtitle_${config.id}`}>Sous-titre (Optionnel):</label>
                     {/* Utilisation de textarea pour un texte potentiellement plus long */}
                    <textarea id={`hero_subtitle_${config.id}`} name="text_content.subtitle" value={config.text_content?.subtitle ?? ''} onChange={handleInputChange} rows={2}></textarea>
                </div>
                 <div className="form-group">
                     <label htmlFor={`hero_text_align_${config.id}`}>Alignement Texte Conteneur:</label>
                     <select id={`hero_text_align_${config.id}`} name="text_content.style.text_align" value={config.text_content?.style?.text_align ?? 'left'} onChange={handleInputChange}>
                         <option value="left">Gauche</option>
                         <option value="center">Centre</option>
                         <option value="right">Droite</option>
                     </select>
                 </div>
            </div>

            <hr className="form-hr"/> {/* Séparateur visuel */}

            {/* --- IMAGE CONTENT --- */}
             <div className="form-subsection">
                 <h4><i className="far fa-image"></i> Image</h4>
                 <div className="form-group">
                    <label htmlFor={`hero_image_src_${config.id}`}>Source Image (URL ou Chemin Relatif):</label>
                    <input
                        type="text"
                        id={`hero_image_src_${config.id}`}
                        name="image.src" // <<< Le handler va corriger les slashes ici
                        value={config.image?.src ?? ''}
                        onChange={handleInputChange} // Utilise le handler unique
                        placeholder="https://... ou backend/assets/..."
                    />
                 </div>
                 <div className="form-group">
                    <label htmlFor={`hero_image_alt_${config.id}`}>Texte Alternatif Image:</label>
                    <input
                        type="text"
                        id={`hero_image_alt_${config.id}`}
                        name="image.alt"
                        value={config.image?.alt ?? ''}
                        onChange={handleInputChange}
                    />
                 </div>
                 {/* Champ pour image locale (non fonctionnel pour ZIP sans logique JS avancée) */}
                 <div className="form-group">
                     <label htmlFor={`hero_image_local_${config.id}`}>Image Locale (Optionnel - pour ZIP):</label>
                     <input
                        type="file"
                        id={`hero_image_local_${config.id}`}
                        className="image-upload"
                        // Le stockage du nom est géré par un handler global dans App.tsx
                        // data-target={`components[${config.id}][image][local_src]`} // Ajuster si besoin
                      />
                      {/* Champ caché optionnel si nécessaire pour le nom */}
                      {/* <input type="hidden" name="image.local_src" value={config.image?.local_src ?? ''} /> */}
                 </div>

                 {/* Styles de l'image */}
                 <h5>Style de l'Image (`image.style`)</h5>
                  <div className="form-row">
                      <div className="form-group">
                          <label htmlFor={`hero_image_style_max_width_${config.id}`}>Largeur Max Image:</label>
                          <input
                              type="text"
                              id={`hero_image_style_max_width_${config.id}`}
                              name="image.style.max_width" // Notation par point
                              value={config.image?.style?.max_width ?? '100%'}
                              onChange={handleInputChange}
                              placeholder="ex: 50%, 400px"
                          />
                           <small>Limite la largeur de l'image.</small>
                      </div>
                      <div className="form-group">
                           <label htmlFor={`hero_image_style_max_height_${config.id}`}>Hauteur Max Image:</label>
                           <input
                               type="text"
                               id={`hero_image_style_max_height_${config.id}`}
                               name="image.style.max_height"
                               value={config.image?.style?.max_height ?? '450px'}
                               onChange={handleInputChange}
                               placeholder="ex: 450px"
                           />
                           <small>Limite la hauteur de l'image.</small>
                       </div>
                       <div className="form-group">
                            <label htmlFor={`hero_image_style_object_fit_${config.id}`}>Ajustement (Object Fit):</label>
                            <select
                                id={`hero_image_style_object_fit_${config.id}`}
                                name="image.style.object_fit"
                                value={config.image?.style?.object_fit ?? 'contain'}
                                onChange={handleInputChange}
                            >
                                <option value="contain">Contain (Tout visible)</option>
                                <option value="cover">Cover (Remplir)</option>
                                <option value="fill">Fill (Étirer)</option>
                                <option value="scale-down">Scale Down</option>
                                <option value="none">None</option>
                            </select>
                            <small>Comment l'image s'adapte.</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor={`hero_image_style_border_radius_${config.id}`}>Arrondi Image:</label>
                            <input
                                type="text"
                                id={`hero_image_style_border_radius_${config.id}`}
                                name="image.style.border_radius"
                                value={config.image?.style?.border_radius ?? '8px'}
                                onChange={handleInputChange}
                                placeholder="ex: 8px, 50%"
                            />
                        </div>
                  </div>
             </div>

            <hr className="form-hr"/>

            {/* --- BUTTON CONTENT --- */}
             <div className="form-subsection">
                  <h4><i className="fas fa-mouse-pointer"></i> Bouton d'Action</h4>
                 <div className="form-group">
                    <label htmlFor={`hero_button_text_${config.id}`}>Texte du Bouton:</label>
                    <input
                        type="text"
                        id={`hero_button_text_${config.id}`}
                        name="text_content.button.text"
                        value={config.text_content?.button?.text ?? ''}
                        onChange={handleInputChange}
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor={`hero_button_url_${config.id}`}>URL du Bouton:</label>
                    <input
                        type="text"
                        id={`hero_button_url_${config.id}`}
                        name="text_content.button.url"
                        value={config.text_content?.button?.url ?? '#'}
                        onChange={handleInputChange}
                    />
                </div>
                 {/* Ajouter champs pour styles bouton si besoin (ex: text_content.button.style.background_color) */}
            </div>
        </div>
    );
};

export default HeroConfigForm;