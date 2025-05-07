// src/components/GlobalConfig/SiteInfoForm.tsx
import React, { useCallback } from 'react';
import { SiteInfo, SiteInfoFormProps } from '../../../types'
import './Forms.css';

const SiteInfoForm: React.FC<SiteInfoFormProps> = ({
    siteData,
    siteKey,
    onChange,
    onSiteKeyChange
}) => {

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // CORRECTION: Remplacer les backslashes par des forward slashes
        const processedValue = value.replace(/\\/g, '/');
        const newData: SiteInfo = {
            ...siteData,
            [name]: processedValue,
        };
        onChange(newData);
    }, [siteData, onChange]);

    const handleKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // CORRECTION: Nettoyer la clé pour éviter caractères invalides/espaces
        // et remplacer les backslashes juste au cas où.
        const cleanedKey = e.target.value.trim().replace(/\\/g, '-').replace(/\s+/g, '_');
        onSiteKeyChange(cleanedKey);
    }, [onSiteKeyChange]);

    // CORRECTION: Ajout d'un pattern pour la validation simple des extensions d'images
    const imagePathPattern = ".*\.(png|jpg|jpeg|gif|svg|webp)$"; // Simple pattern

    return (
        <fieldset className="form-section">
            <legend><i className="fas fa-sitemap"></i> Informations du Site</legend>

            <div className="form-group">
                <label htmlFor="site_key">Clé Principale / Nom Projet:</label>
                <input
                    type="text"
                    id="site_key"
                    name="site_key_input"
                    value={siteKey}
                    onChange={handleKeyChange}
                    placeholder="Identifiant unique "
                    required
                    pattern="^[a-zA-Z0-9_\-]+$" // Valide caractères alphanumériques, underscores, tirets
                    title="Utilisez seulement lettres, chiffres, underscores (_) ou tirets (-)."
                />
                <small>Identifiant unique (sans espaces ni caractères spéciaux).</small>
            </div>

            <div className="form-group">
                <label htmlFor="site_title">Titre du Site (Affiché):</label>
                <input
                    type="text"
                    id="site_title"
                    name="title"
                    value={siteData?.title ?? ''}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="site_logo_url">URL/Chemin du Logo Fichier:</label>
                <input
                    type="text"
                    id="site_logo_url"
                    name="logo_url"
                    value={siteData?.logo_url ?? ''}
                    onChange={handleInputChange}
                    placeholder="https://... ou backend/assets/img/logo.png"
                    // CORRECTION: Ajout pattern et titre pour validation
                    pattern={imagePathPattern + "|^(https?://).*"} // Autorise URL ou chemin avec extension image
                    title="Entrez une URL valide ou un chemin relatif/absolu vers un fichier image (.png, .jpg, .svg, etc.)"
                />
                 <small>Chemin vers le fichier image du logo principal.</small>
            </div>

             <div className="form-group">
                <label htmlFor="site_logo_text">Texte du Logo (Fallback):</label>
                <input
                    type="text"
                    id="site_logo_text"
                    name="logo_text"
                    value={siteData?.logo_text ?? ''}
                    onChange={handleInputChange}
                    placeholder="Texte si pas d'image logo"
                />
            </div>

             {/* Ce champ est redondant si logo_url est le logo principal. Gardé pour rétrocompatibilité si besoin. */}
             {/* Sinon, le supprimer pour éviter la confusion. */}
             <div className="form-group">
                <label htmlFor="site_logo_url">URL/Chemin Logo Spécifique (Optionnel):</label>
                <input
                    type="text"
                    id="site__logo_url"
                    name="site_logo_url"
                    value={siteData?.restaurant_logo_url ?? ''}
                    onChange={handleInputChange}
                     placeholder="Ex: backend/assets/img/..."
                     pattern={imagePathPattern + "|^(https?://).*"} // Autorise URL ou chemin avec extension image
                     title="Entrez une URL valide ou un chemin relatif/absolu vers un fichier image (.png, .jpg, .svg, etc.) si différent du logo principal."
                />
                 <small>Uniquement si un logo secondaire est nécessaire</small>
            </div>

            <div className="form-group">
                <label htmlFor="site_image_source_base">Chemin Base Images Locales:</label>
                <input
                    type="text"
                    id="site_image_source_base"
                    name="image_source_base"
                    value={siteData?.image_source_base ?? 'backend/assets/img/default'}
                    onChange={handleInputChange}
                    placeholder="Ex: backend/assets/img/projet_x"
                    required
                />
                <small>Dossier racine (depuis la racine du projet) pour les images locales référencées par nom de fichier seul.</small>
            </div>
        </fieldset>
    );
};

export default SiteInfoForm;