// src/components/GlobalConfig/ThemeConfigForm.tsx
import React, { useCallback } from 'react';
// Assurez-vous que ThemeConfig est importé et contient toutes les clés de couleur
import { ThemeConfig, ThemeConfigFormProps } from '../../../types'
import './Forms.css'; // Importez votre fichier CSS
import '../../../styles.css';

// Définir les propriétés de couleur à afficher dans le formulaire
// Cela rend le code plus facile à maintenir
const colorProperties: Array<{ key: keyof ThemeConfig; label: string; defaultColor: string }> = [
    { key: 'primary_color', label: 'Primaire', defaultColor: '#4E087D' },
    { key: 'secondary_color', label: 'Secondaire', defaultColor: '#E74C3C' },
    { key: 'accent_color', label: 'Accent', defaultColor: '#F1C40F' },
    { key: 'background_light', label: 'Fond Clair', defaultColor: '#F9F6F1' },
    { key: 'background_white', label: 'Fond Blanc', defaultColor: '#FFFFFF' },
    { key: 'text_dark', label: 'Texte Foncé', defaultColor: '#333333' },
    { key: 'text_light', label: 'Texte Clair', defaultColor: '#FFFFFF' },
    { key: 'text_medium', label: 'Texte Moyen', defaultColor: '#6c757d' },
    { key: 'border_color', label: 'Bordure', defaultColor: '#dee2e6' }
];


const ThemeConfigForm: React.FC<ThemeConfigFormProps> = ({ themeData, onChange }) => {

    // Handler générique pour les inputs texte/select (polices, taille, etc.)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({
            ...themeData,
            [name]: value,
        });
    }, [themeData, onChange]);

    // Handler spécifique pour les inputs de couleur
    const handleColorChange = useCallback((key: keyof ThemeConfig, value: string) => {
        onChange({
            ...themeData,
            [key]: value, // Met à jour la clé de couleur spécifique
        });
    }, [themeData, onChange]);

    return (
        <fieldset className="form-section">
            <legend><i className="fas fa-palette"></i> Thème & Styles Globaux</legend>

            {/* Color Configuration Section - Nouvelle Structure */}
            <div className="form-subsection">
                <h4><i className="fas fa-paint-brush"></i> Couleurs</h4>
                <div className="color-list-container"> {/* Nouveau conteneur */}
                    {colorProperties.map(({ key, label, defaultColor }) => (
                        <div key={key} className="color-item"> {/* Conteneur pour chaque ligne */}
                           {/* Le label englobe l'input et le texte pour l'accessibilité et le style */}
                           <label htmlFor={`theme_${key}`}>
                                <input
                                    type="color"
                                    id={`theme_${key}`}
                                    name={key} // Le nom est la clé de couleur
                                    value={themeData[key] ?? defaultColor} // Utilise la valeur ou la valeur par défaut
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="color-input-swatch" // Classe pour styler l'input couleur
                                />
                                <span className="color-label-text">{label}</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Font Configuration Section */}
            <div className="form-subsection">
                 <h4><i className="fas fa-font"></i> Polices</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="theme_font">Police Principale:</label>
                        <input type="text" id="theme_font" name="font" value={themeData.font ?? 'Roboto, sans-serif'} onChange={handleInputChange} placeholder="Ex: 'Open Sans', sans-serif"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="theme_secondary_font">Police Secondaire:</label>
                        <input type="text" id="theme_secondary_font" name="secondary_font" value={themeData.secondary_font ?? 'Open Sans, sans-serif'} onChange={handleInputChange}/>
                    </div>
                     <div className="form-group">
                        <label htmlFor="theme_heading_font">Police des Titres:</label>
                        <input type="text" id="theme_heading_font" name="heading_font" value={themeData.heading_font ?? 'Roboto Slab, serif'} onChange={handleInputChange}/>
                    </div>
                </div>
            </div>

             {/* Other Theme Settings */}
            <div className="form-subsection">
                 <h4><i className="fas fa-ruler-combined"></i> Autres Styles</h4>
                 <div className="form-row">
                    <div className="form-group">
                         <label htmlFor="theme_base_size">Taille de base:</label>
                         <input type="text" id="theme_base_size" name="base_size" value={themeData.base_size ?? '16px'} onChange={handleInputChange}/>
                     </div>
                     <div className="form-group">
                         <label htmlFor="theme_border_radius">Rayon Bordure (Défaut):</label>
                         <input type="text" id="theme_border_radius" name="border_radius" value={themeData.border_radius ?? '4px'} onChange={handleInputChange}/>
                     </div>
                     {/* Ajoutez ici d'autres champs si nécessaire (ex: theme_mode) */}
                </div>
            </div>

        </fieldset>
    );
};

export default ThemeConfigForm;