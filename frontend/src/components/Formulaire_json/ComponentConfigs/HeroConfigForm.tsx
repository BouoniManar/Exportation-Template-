// src/components/ComponentConfigs/HeroConfigForm.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { HeroComponentConfig } from'../../../types'; // Assurez-vous que HeroComponentConfig inclut bien image: { src?: string, alt?: string, style?: StyleConfig, local_src?: string }
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css'; // Si vous avez des styles globaux ici

// URL de base de votre API backend (doit être cohérente avec SiteInfoForm)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001'; // MODIFIÉ POUR UTILISER LE PORT 8001

export interface LocalHeroConfigFormProps {
    config: HeroComponentConfig;
    onChange: (newConfig: HeroComponentConfig) => void;
}

// Helper pour mettre à jour l'état imbriqué de manière immuable
const updateNestedProp = (currentConfig: HeroComponentConfig, path: Array<string | number>, value: any): HeroComponentConfig => {
    const newConfig = JSON.parse(JSON.stringify(currentConfig)); // Clonage profond
    let currentLevel: any = newConfig;
    for(let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if(currentLevel[key] === undefined || currentLevel[key] === null || typeof currentLevel[key] !== 'object') {
             currentLevel[key] = (typeof path[i+1] === 'number') ? [] : {};
        }
        currentLevel = currentLevel[key];
    }
    const finalKey = path[path.length - 1];
     if (typeof currentLevel === 'object' && currentLevel !== null) {
        currentLevel[finalKey] = value;
    }
    return newConfig;
};

const HeroConfigForm: React.FC<LocalHeroConfigFormProps> = ({ config, onChange }) => {
    const [heroImagePreviewUrl, setHeroImagePreviewUrl] = useState<string | null>(null);
    const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
    const [uploadHeroImageError, setUploadHeroImageError] = useState<string | null>(null);

    // Mettre à jour l'aperçu de l'image du hero si config.image.src change
    useEffect(() => {
        const imageSrc = config.image?.src;
        if (imageSrc) {
            if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('data:image')) {
                setHeroImagePreviewUrl(imageSrc);
            } else if (imageSrc.trim() !== '') {
                // Chemin relatif au serveur
                setHeroImagePreviewUrl(`${API_BASE_URL}/${imageSrc.startsWith('/') ? imageSrc.substring(1) : imageSrc}`);
            } else {
                setHeroImagePreviewUrl(null);
            }
        } else {
            setHeroImagePreviewUrl(null);
        }
    }, [config.image?.src]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const path = name.split('.');
        let processedValue: string | undefined = value;

        if (name === 'image.src') { // Si l'utilisateur tape/colle une URL directement
            processedValue = value.replace(/\\/g, '/');
        }
        
        const newConfig = updateNestedProp(config, path, processedValue);
        onChange(newConfig);
    }, [config, onChange]);

    const handleHeroImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingHeroImage(true);
        setUploadHeroImageError(null);

        const formData = new FormData();
        formData.append('imageFile', file);

        try {
            // Utiliser une catégorie différente pour les images de composants
            const response = await fetch(`${API_BASE_URL}/api/v1/upload_image/hero_images`, { 
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `Erreur de téléversement: ${response.statusText}` }));
                throw new Error(errorData.detail || `Erreur de téléversement: ${response.statusText}`);
            }

            const result = await response.json(); // Ex: { filePath: "Backend/user_uploads/hero_images/nom_unique.png" }
            
            if (result.filePath) {
                // Mettre à jour config.image.src avec le chemin retourné
                const newConfig = updateNestedProp(config, ['image', 'src'], result.filePath);
                onChange(newConfig);
            } else {
                throw new Error("Le chemin du fichier n'a pas été retourné par le serveur.");
            }

        } catch (error: any) {
            console.error("Erreur lors du téléversement de l'image Hero:", error);
            setUploadHeroImageError(error.message || "Une erreur est survenue lors du téléversement.");
        } finally {
            setIsUploadingHeroImage(false);
            e.target.value = ''; 
        }
    }, [config, onChange]);


    return (
        <div className="component-body">
            {/* --- TEXT CONTENT --- */}
            <div className="form-subsection">
                <h4><i className="fas fa-align-left"></i> Contenu Texte</h4>
                {/* ... (vos champs de texte titre, sous-titre, alignement restent les mêmes) ... */}
                 <div className="form-group">
                    <label htmlFor={`hero_title_${config.id}`}>Titre Principal:</label>
                    <input type="text" id={`hero_title_${config.id}`} name="text_content.title.text" value={config.text_content?.title?.text ?? ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label htmlFor={`hero_subtitle_${config.id}`}>Sous-titre (Optionnel):</label>
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

            <hr className="form-hr"/>

            {/* --- IMAGE CONTENT (MODIFIÉ) --- */}
             <div className="form-subsection">
                 <h4><i className="far fa-image"></i> Image du Hero</h4>
                 {heroImagePreviewUrl && (
                    <div className="image-preview mb-2"> {/* Ajout de la classe image-preview et marge */}
                        <img 
                            src={heroImagePreviewUrl} 
                            alt={config.image?.alt || 'Aperçu Hero'} 
                            style={{ maxWidth: '100%', maxHeight: '200px', border:'1px solid #ccc', objectFit: 'contain' }} 
                            onError={(e) => { 
                                (e.target as HTMLImageElement).style.display = 'none'; 
                                console.warn("Erreur chargement aperçu image Hero:", heroImagePreviewUrl);
                             }}
                        />
                    </div>
                 )}
                 <div className="form-group">
                    <label htmlFor={`hero_image_upload_${config.id}`}>Téléverser Image Hero:</label>
                    <input
                        type="file"
                        id={`hero_image_upload_${config.id}`}
                        className="image-upload" // Vous pouvez styliser cette classe
                        onChange={handleHeroImageUpload}
                        accept="image/png, image/jpeg, image/gif, image/svg+xml, image/webp"
                        disabled={isUploadingHeroImage}
                    />
                    {isUploadingHeroImage && <small>Téléversement en cours...</small>}
                    {uploadHeroImageError && <small style={{ color: 'red' }}>{uploadHeroImageError}</small>}
                 </div>

                 <div className="form-group">
                    <label htmlFor={`hero_image_src_fallback_${config.id}`}>Source Image (URL Externe Fallback):</label>
                    <input
                        type="text" // Ou type="url"
                        id={`hero_image_src_fallback_${config.id}`}
                        name="image.src" // Met à jour config.image.src
                        value={config.image?.src ?? ''} // Affiche la valeur actuelle (téléversée ou saisie)
                        onChange={handleInputChange} 
                        placeholder="https://... (si pas de téléversement)"
                        title="Entrez une URL directe si vous ne téléversez pas d'image."
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
                        placeholder="Description de l'image"
                    />
                 </div>
                 
                 {/* Styles de l'image */}
                 <h5>Style de l'Image (`image.style`)</h5>
                  {/* ... (vos champs de style d'image restent les mêmes) ... */}
                  <div className="form-row">
                      <div className="form-group">
                          <label htmlFor={`hero_image_style_max_width_${config.id}`}>Largeur Max Image:</label>
                          <input type="text" id={`hero_image_style_max_width_${config.id}`} name="image.style.max_width" value={config.image?.style?.max_width ?? '100%'} onChange={handleInputChange} placeholder="ex: 50%, 400px" />
                           <small>Limite la largeur de l'image.</small>
                      </div>
                      <div className="form-group">
                           <label htmlFor={`hero_image_style_max_height_${config.id}`}>Hauteur Max Image:</label>
                           <input type="text" id={`hero_image_style_max_height_${config.id}`} name="image.style.max_height" value={config.image?.style?.max_height ?? '450px'} onChange={handleInputChange} placeholder="ex: 450px" />
                           <small>Limite la hauteur de l'image.</small>
                       </div>
                       <div className="form-group">
                            <label htmlFor={`hero_image_style_object_fit_${config.id}`}>Ajustement (Object Fit):</label>
                            <select id={`hero_image_style_object_fit_${config.id}`} name="image.style.object_fit" value={config.image?.style?.object_fit ?? 'cover'} onChange={handleInputChange} >
                                <option value="contain">Contain</option>
                                <option value="cover">Cover</option>
                                <option value="fill">Fill</option>
                                <option value="scale-down">Scale Down</option>
                                <option value="none">None</option>
                            </select>
                            <small>Comment l'image s'adapte.</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor={`hero_image_style_border_radius_${config.id}`}>Arrondi Image:</label>
                            <input type="text" id={`hero_image_style_border_radius_${config.id}`} name="image.style.border_radius" value={config.image?.style?.border_radius ?? '8px'} onChange={handleInputChange} placeholder="ex: 8px, 50%" />
                        </div>
                  </div>
             </div>

            <hr className="form-hr"/>

            {/* --- BUTTON CONTENT --- */}
            {/* ... (vos champs de bouton restent les mêmes) ... */}
            <div className="form-subsection">
                  <h4><i className="fas fa-mouse-pointer"></i> Bouton d'Action</h4>
                 <div className="form-group">
                    <label htmlFor={`hero_button_text_${config.id}`}>Texte du Bouton:</label>
                    <input type="text" id={`hero_button_text_${config.id}`} name="text_content.button.text" value={config.text_content?.button?.text ?? ''} onChange={handleInputChange} />
                </div>
                 <div className="form-group">
                    <label htmlFor={`hero_button_url_${config.id}`}>URL du Bouton:</label>
                    <input type="text" id={`hero_button_url_${config.id}`} name="text_content.button.url" value={config.text_content?.button?.url ?? '#'} onChange={handleInputChange} />
                </div>
            </div>
        </div>
    );
};

export default HeroConfigForm;