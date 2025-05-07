// src/components/GlobalConfig/NavConfigForm.tsx
import React, { useCallback } from 'react';
import { NavigationConfig, NavConfigFormProps, StyleConfig, NavLink } from '../../../types' // Ajustez le chemin
import LinkListEditor from './LinkListEditor'; // Importe le composant réutilisable
import './Forms.css'; // Styles du formulaire
import '../../../styles.css';

const NavConfigForm: React.FC<NavConfigFormProps> = ({ navData, onChange }) => {

    // Handler générique pour les champs simples (menu_button_text)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange({
            ...navData,
            [name]: value === '' ? null : value, // Set to null if empty string
        });
    }, [navData, onChange]);

    // Handler pour les changements de style de la nav principale
    const handleStyleChange = useCallback((newStyle: StyleConfig) => {
        onChange({
            ...navData,
            style: newStyle,
        });
    }, [navData, onChange]);

     // Handler pour les changements de style de la sous-nav
     const handleSubNavStyleChange = useCallback((newStyle: StyleConfig) => {
        onChange({
            ...navData,
            sub_navigation_style: newStyle,
        });
    }, [navData, onChange]);

    // Handler pour les changements dans la liste des liens principaux
    const handleLinksChange = useCallback((newLinks: NavLink[]) => {
        onChange({
            ...navData,
            links: newLinks,
        });
    }, [navData, onChange]);

     // Handler pour les changements dans la liste des sous-liens
     const handleSubLinksChange = useCallback((newSubLinks: NavLink[]) => {
        onChange({
            ...navData,
            sub_links: newSubLinks,
        });
    }, [navData, onChange]);


    return (
        <fieldset className="form-section">
            <legend><i className="fas fa-bars"></i> Configuration de la Navigation</legend>

            {/* Options générales */}
            <div className="form-group">
                <label htmlFor="nav_menu_button_text">Texte Bouton Menu Mobile (Optionnel):</label>
                <input
                    type="text"
                    id="nav_menu_button_text"
                    name="menu_button_text"
                    value={navData.menu_button_text ?? ''}
                    onChange={handleInputChange}
                    placeholder="Ex: ☰ Toutes"
                />
                 <small>Laissez vide si non applicable.</small>
            </div>

            {/* Style de la Navigation Principale */}
             {/* TODO: Remplacer par un composant StyleEditor réutilisable si créé */}
             <div className="form-subsection">
                 <h4><i className="fas fa-palette"></i> Style Barre Principale (`navigation.style`)</h4>
                  <div className="form-row">
                      <div className="form-group color-group">
                            <label htmlFor="nav_style_background_color">Fond:</label>
                             <div>
                                <input
                                    type="color"
                                    id="nav_style_background_color"
                                    value={navData.style?.background_color ?? '#FFFFFF'}
                                    onChange={(e) => handleStyleChange({ ...navData.style, background_color: e.target.value })}
                                />
                            </div>
                      </div>
                      <div className="form-group color-group">
                            <label htmlFor="nav_style_color">Texte:</label>
                             <div>
                                 <input
                                     type="color"
                                     id="nav_style_color"
                                     value={navData.style?.color ?? '#333333'}
                                     onChange={(e) => handleStyleChange({ ...navData.style, color: e.target.value })}
                                 />
                             </div>
                      </div>
                      <div className="form-group">
                            <label htmlFor="nav_style_padding">Padding:</label>
                            <input
                                type="text"
                                id="nav_style_padding"
                                value={navData.style?.padding ?? ''}
                                onChange={(e) => handleStyleChange({ ...navData.style, padding: e.target.value })}
                                placeholder="Ex: 0 20px"
                            />
                      </div>
                  </div>
             </div>


            {/* Liens Principaux */}
            <div className="form-subsection">
                <h4><i className="fas fa-link"></i> Liens de Navigation Principaux (`navigation.links`)</h4>
                <LinkListEditor
                    links={navData.links || []}
                    onChange={handleLinksChange}
                    listKey="mainNav" // Clé unique pour cette instance
                />
            </div>

             {/* Sous-Navigation (Style Masmoudi) */}
             <div className="form-subsection optional-section">
                 <h4><i className="fas fa-level-down-alt"></i> Sous-Navigation (Style Masmoudi)</h4>
                 {/* Style de la Sous-Nav */}
                 <div className="form-row">
                     {/* Ajouter des champs pour sub_navigation_style si besoin */}
                      <div className="form-group">
                            <label htmlFor="subnav_style_padding">Padding Sous-Nav:</label>
                            <input
                                type="text"
                                id="subnav_style_padding"
                                value={navData.sub_navigation_style?.padding ?? ''}
                                onChange={(e) => handleSubNavStyleChange({ ...navData.sub_navigation_style, padding: e.target.value })}
                                placeholder="Ex: 10px 0 10px 100px"
                            />
                      </div>
                       <div className="form-group">
                            <label htmlFor="subnav_style_border_top">Bordure Haut Sous-Nav:</label>
                            <input
                                type="text"
                                id="subnav_style_border_top"
                                value={navData.sub_navigation_style?.border_top ?? ''}
                                onChange={(e) => handleSubNavStyleChange({ ...navData.sub_navigation_style, border_top: e.target.value })}
                                placeholder="Ex: 1px solid #eee"
                            />
                      </div>
                 </div>
                 {/* Liens de la Sous-Nav */}
                  <LinkListEditor
                    links={navData.sub_links || []}
                    onChange={handleSubLinksChange}
                    listKey="subNav" // Clé unique
                    allowActiveState={false} // Pas d'état actif pour la sous-nav dans l'exemple
                 />
             </div>

        </fieldset>
    );
};

export default NavConfigForm;