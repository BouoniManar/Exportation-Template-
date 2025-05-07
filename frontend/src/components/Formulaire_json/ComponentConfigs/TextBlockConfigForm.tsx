// src/components/ComponentConfigs/TextBlockConfigForm.tsx
import React, { useCallback } from 'react';
import { TextBlockConfigFormProps, TextBlockComponentConfig } from '../../../types' // Adjust path
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';

const TextBlockConfigForm: React.FC<TextBlockConfigFormProps> = ({ config, onChange }) => {

    // Handler générique pour les changements d'input/textarea
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Met à jour la propriété correspondante dans la config
        onChange({
            ...config, // Garde les autres propriétés (id, type, style...)
            [name]: value, // Met à jour la clé modifiée (title ou content)
        });
    }, [config, onChange]);

    return (
        <div className="component-body">
            {/* Champ pour le Titre Optionnel */}
            <div className="form-group">
                <label htmlFor={`textblock_title_${config.id}`}>Titre de la section (Optionnel):</label>
                <input
                    type="text"
                    id={`textblock_title_${config.id}`}
                    name="title" // Correspond à la clé 'title' dans TextBlockComponentConfig
                    value={config.title ?? ''} // Valeur actuelle ou vide
                    onChange={handleChange}
                    placeholder="Ex: À Propos de Nous"
                />
            </div>

            {/* Champ pour le Contenu Principal */}
            <div className="form-group">
                <label htmlFor={`textblock_content_${config.id}`}>Contenu Principal:</label>
                <textarea
                    id={`textblock_content_${config.id}`}
                    name="content" // Correspond à la clé 'content'
                    value={config.content ?? ''} // Valeur actuelle ou vide
                    onChange={handleChange}
                    rows={6} // Hauteur initiale
                    placeholder="Écrivez votre texte ici... Vous pouvez utiliser des sauts de ligne."
                />
                 <small>Les sauts de ligne seront généralement préservés par le CSS (white-space: pre-line). Évitez le HTML complexe ici.</small>
            </div>

             {/* Optionnel: Ajouter des champs pour configurer le 'style' du conteneur si nécessaire */}
             {/*
             <div className="form-subsection">
                <h4>Style du Conteneur (`style`)</h4>
                 <div className="form-group">
                    <label>Alignement Texte:</label>
                    <select
                         name="style.text_align" // Exemple d'accès imbriqué (nécessiterait un handler plus complexe)
                         value={config.style?.text_align ?? 'left'}
                         // onChange={handleStyleChange} // Utiliser un handler qui gère l'imbrication style.*
                    >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                        <option value="justify">Justifié</option>
                    </select>
                </div>
                 // ... autres options de style ...
             </div>
             */}

        </div>
    );
};

export default TextBlockConfigForm;