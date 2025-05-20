// src/components/GlobalConfig/SiteInfoForm.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { SiteInfo, SiteInfoFormProps } from '../../../types';
import './Forms.css';

// Supposons que vous ayez une URL de base pour votre API backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001'; // Ajustez selon votre config

const SiteInfoForm: React.FC<SiteInfoFormProps> = ({
    siteData,
    siteKey,
    onChange,
    onSiteKeyChange
}) => {
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Mettre à jour l'aperçu du logo si siteData.logo_url change
    useEffect(() => {
        if (siteData?.logo_url) {
            // Si c'est une URL complète, utilisez-la directement
            if (siteData.logo_url.startsWith('http://') || siteData.logo_url.startsWith('https://')) {
                setLogoPreviewUrl(siteData.logo_url);
            } else if (siteData.logo_url.trim() !== '') {
                // Sinon, c'est un chemin relatif au serveur, construisez l'URL complète pour l'aperçu
                // Supposons que les fichiers téléversés sont servis statiquement par le backend
                // ou que vous avez un moyen de les récupérer via l'API.
                // Pour l'instant, on va supposer que les images téléversées sont accessibles via API_BASE_URL + chemin
                // Exemple: si logo_url est "user_uploads/logos/image.png", l'aperçu serait "http://localhost:8000/user_uploads/logos/image.png"
                // CELA NECESSITE QUE VOTRE BACKEND SERVE CES FICHIERS STATIQUEMENT OU VIA UN ENDPOINT
                setLogoPreviewUrl(`${API_BASE_URL}/${siteData.logo_url.startsWith('/') ? siteData.logo_url.substring(1) : siteData.logo_url}`);
            } else {
                setLogoPreviewUrl(null);
            }
        } else {
            setLogoPreviewUrl(null);
        }
    }, [siteData?.logo_url]);


    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const processedValue = value.replace(/\\/g, '/');
        const newData: SiteInfo = {
            ...siteData,
            [name]: processedValue,
        };
        onChange(newData);
    }, [siteData, onChange]);

    const handleKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const cleanedKey = e.target.value.trim().replace(/\\/g, '-').replace(/\s+/g, '_');
        onSiteKeyChange(cleanedKey);
    }, [onSiteKeyChange]);

    const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('imageFile', file); // 'imageFile' doit correspondre au nom attendu par le backend

        try {
            // TODO: Remplacez par votre endpoint réel de téléversement d'image
            const response = await fetch(`${API_BASE_URL}/api/v1/upload_image/logo`, { // Exemple d'endpoint
                method: 'POST',
                body: formData,
                // headers: { 'Authorization': 'Bearer VOTRE_TOKEN_SI_NECESSAIRE' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Erreur de téléversement: ${response.statusText}`);
            }

            const result = await response.json(); // Ex: { filePath: "user_uploads/logos/nom_unique.png" }
            
            if (result.filePath) {
                const newData: SiteInfo = {
                    ...siteData,
                    logo_url: result.filePath, // Mettre à jour avec le chemin retourné par le backend
                };
                onChange(newData);
                // L'aperçu sera mis à jour par le useEffect
            } else {
                throw new Error("Le chemin du fichier n'a pas été retourné par le serveur.");
            }

        } catch (error: any) {
            console.error("Erreur lors du téléversement du logo:", error);
            setUploadError(error.message || "Une erreur est survenue lors du téléversement.");
        } finally {
            setIsUploading(false);
            // Réinitialiser la valeur du champ de fichier pour permettre de retéléverser le même fichier si besoin
            e.target.value = ''; 
        }
    }, [siteData, onChange]);


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
                    placeholder="Identifiant unique"
                    required
                    pattern="^[a-zA-Z0-9_\-]+$"
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
                <label htmlFor="site_logo_upload">Logo du Site:</label>
                {logoPreviewUrl && (
                    <div className="logo-preview">
                        <img src={logoPreviewUrl} alt="Aperçu du logo" style={{ maxWidth: '150px', maxHeight: '70px', marginBottom: '10px', border:'1px solid #ccc' }} 
                             onError={(e) => { 
                                // En cas d'erreur de chargement de l'aperçu (ex: chemin local non servi)
                                (e.target as HTMLImageElement).style.display = 'none'; 
                                console.warn("Erreur de chargement de l'aperçu du logo:", logoPreviewUrl);
                             }}
                        />
                    </div>
                )}
                <input
                    type="file"
                    id="site_logo_upload"
                    name="logo_upload_input" // Nom différent pour éviter conflit avec 'logo_url'
                    onChange={handleLogoUpload}
                    accept="image/png, image/jpeg, image/gif, image/svg+xml, image/webp" // Types MIME acceptés
                    disabled={isUploading}
                />
                {isUploading && <small>Téléversement en cours...</small>}
                {uploadError && <small style={{ color: 'red' }}>{uploadError}</small>}
                <small>
                    Téléversez une image pour le logo. Si vous préférez utiliser une URL externe directe,
                    vous pouvez la saisir dans le champ "URL du Logo (Fallback)" ci-dessous, ou utiliser l'éditeur JSON avancé.
                </small>
            </div>
            
            <div className="form-group">
                <label htmlFor="site_logo_url_fallback">URL du Logo (Fallback/Externe):</label>
                <input
                    type="text" // Ou type="url"
                    id="site_logo_url_fallback"
                    name="logo_url" // Ce champ mettra à jour siteData.logo_url
                    value={siteData?.logo_url ?? ''} // Affiche la valeur actuelle (qui peut venir du téléversement ou d'une saisie)
                    onChange={handleInputChange} // Permet de coller une URL directe
                    placeholder="https://example.com/logo.png (si pas de téléversement)"
                    title="Si vous ne téléversez pas d'image, entrez une URL directe vers un logo hébergé ailleurs."
                />
                 <small>Utilisez ce champ si vous avez une URL directe pour le logo au lieu de le téléverser.</small>
            </div>


             <div className="form-group">
                <label htmlFor="site_logo_text">Texte du Logo (si pas d'image):</label>
                <input
                    type="text"
                    id="site_logo_text"
                    name="logo_text"
                    value={siteData?.logo_text ?? ''}
                    onChange={handleInputChange}
                    placeholder="Texte si pas d'image logo"
                />
            </div>

            {/* Le champ "URL/Chemin Logo Spécifique (Optionnel)" et "Chemin Base Images Locales"
                deviennent moins pertinents si on adopte une stratégie de téléversement centralisée.
                Le "Chemin Base Images Locales" pourrait être géré implicitement par le backend
                lorsqu'il sauvegarde les images téléversées.
                Je les laisse commentés pour l'instant, à vous de voir si vous en avez toujours besoin.
            */}

            {/*
            <div className="form-group">
                <label htmlFor="site_image_source_base">Chemin Base Images Locales (Info):</label>
                <input
                    type="text"
                    id="site_image_source_base"
                    name="image_source_base"
                    value={siteData?.image_source_base ?? 'user_uploads/default_site_assets'} // Exemple
                    onChange={handleInputChange}
                    placeholder="Ex: user_uploads/mon_projet_assets"
                    readOnly // Ce champ pourrait devenir informatif ou configuré côté serveur
                />
                <small>Dossier de base sur le serveur pour les images de ce site (géré automatiquement).</small>
            </div>
            */}
        </fieldset>
    );
};

export default SiteInfoForm;