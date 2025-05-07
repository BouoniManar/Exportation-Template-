// src/components/GlobalConfig/FooterConfigForm.tsx
import React, { useCallback } from 'react';
import { FooterData, FooterConfigFormProps, StyleConfig, NavLink } from '../../../types';
import LinkListEditor from './LinkListEditor';
import './Forms.css';
import '../../../styles.css';

const FooterConfigForm: React.FC<FooterConfigFormProps> = ({ footerData, onChange }) => {

    // Helper (inchangé)
     const updateNestedState = (prevState: FooterData, path: string, value: any): FooterData => {
        const keys = path.split('.'); const newState = JSON.parse(JSON.stringify(prevState));
        let currentLevel: any = newState;
        for (let i = 0; i < keys.length - 1; i++) { const key = keys[i]; if (currentLevel[key] === undefined || currentLevel[key] === null) { currentLevel[key] = {}; } if (typeof currentLevel[key] !== 'object') { console.warn(`Reset path ${key}`); currentLevel[key] = {}; } currentLevel = currentLevel[key]; }
        const finalKey = keys[keys.length - 1]; if (typeof currentLevel === 'object' && currentLevel !== null) { currentLevel[finalKey] = value; } else { console.error("Cannot set prop:", currentLevel, "at key:", finalKey); }
        return newState;
    };

    // Handler générique (inchangé)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFooterData = updateNestedState(footerData, name, value);
        onChange(newFooterData);
    }, [footerData, onChange]);

    // Handler liste de liens (inchangé)
    const handleLinksChange = useCallback((newLinks: NavLink[]) => {
        onChange({ ...footerData, links: newLinks, });
    }, [footerData, onChange]);

    // **NOUVEAU : Handler spécifique pour la bordure supérieure**
    const handleBorderTopChange = useCallback((part: 'width' | 'style' | 'color', value: string) => {
        const currentBorder = footerData.style?.border_top?.split(' ') || ['1px', 'solid', '#eeeeee'];
        let [width, style, color] = currentBorder;

        if (part === 'width') width = value || '0px';
        if (part === 'style') style = value;
        if (part === 'color') color = value;

        const newBorderTopValue = (width && width !== '0px' && style && style !== 'none') ? `${width} ${style} ${color}` : undefined;

        const newFooterData = updateNestedState(footerData, 'style.border_top', newBorderTopValue);
        onChange(newFooterData);

    }, [footerData, onChange]);

    // Extrait les parties de la bordure actuelle
    const [borderTopWidth = '1px', borderTopStyle = 'solid', borderTopColor = '#eeeeee'] = footerData.style?.border_top?.split(' ') || [];

    return (
        <fieldset className="form-section">
            <legend><i className="fas fa-shoe-prints"></i> Configuration du Footer</legend>

            {/* Texte Copyright (inchangé) */}
            <div className="form-group">
                 <label htmlFor="footer_copyright_text">Texte Copyright:</label>
                 <input type="text" id="footer_copyright_text" name="copyright_text" value={footerData.copyright_text ?? ''} onChange={handleInputChange} placeholder="Ex: © 2024 Mon Site"/>
            </div>

             {/* Style global du Footer */}
             <div className="form-subsection">
                 <h4><i className="fas fa-palette"></i> Style Global du Footer (`footer.style`)</h4>
                  <div className="form-row">
                      {/* Inputs pour background_color, color, padding, text_align (inchangés) */}
                       <div className="form-group color-group"> <label htmlFor="footer_style.background_color">Fond:</label> <div> <input type="color" id="footer_style.background_color" name="style.background_color" value={footerData.style?.background_color ?? '#f8f9fa'} onChange={handleInputChange}/> </div> </div>
                       <div className="form-group color-group"> <label htmlFor="footer_style.color">Texte Principal:</label> <div> <input type="color" id="footer_style.color" name="style.color" value={footerData.style?.color ?? '#6c757d'} onChange={handleInputChange}/> </div> </div>
                       <div className="form-group"> <label htmlFor="footer_style.padding">Padding:</label> <input type="text" id="footer_style.padding" name="style.padding" value={footerData.style?.padding ?? '40px 20px'} onChange={handleInputChange} placeholder="Ex: 40px 20px"/> </div>
                       <div className="form-group"> <label htmlFor="footer_style.text_align">Alignement Texte:</label> <select id="footer_style.text_align" name="style.text_align" value={footerData.style?.text_align ?? 'center'} onChange={handleInputChange}> <option value="left">Gauche</option> <option value="center">Centre</option> <option value="right">Droite</option> </select> </div>
                  </div>
                  {/* --- CORRECTION: Input pour Border Top --- */}
                   <div className="form-subsection">
                        <h5><i className="fas fa-ruler-horizontal"></i> Bordure Supérieure (`footer.style.border_top`)</h5>
                        <div className="form-row border-config-row">
                            <div className="form-group">
                                <label htmlFor="footer_border_top_width">Épaisseur:</label>
                                <input
                                    type="text"
                                    id="footer_border_top_width"
                                    value={borderTopWidth}
                                    onChange={(e) => handleBorderTopChange('width', e.target.value)}
                                    placeholder="ex: 1px, 0px"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="footer_border_top_style">Style:</label>
                                <select
                                    id="footer_border_top_style"
                                    value={borderTopStyle}
                                    onChange={(e) => handleBorderTopChange('style', e.target.value)}
                                >
                                     <option value="none">Aucun</option>
                                     <option value="solid">Solid</option>
                                     <option value="dashed">Dashed</option>
                                     <option value="dotted">Dotted</option>
                                     <option value="double">Double</option>
                                </select>
                            </div>
                            <div className="form-group color-group">
                                <label htmlFor="footer_border_top_color">Couleur:</label>
                                <div>
                                    <input
                                        type="color"
                                        id="footer_border_top_color"
                                        value={borderTopColor}
                                        onChange={(e) => handleBorderTopChange('color', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
             </div>

             {/* Style spécifique du texte copyright (inchangé) */}
              <div className="form-subsection"> </div>

            {/* Liens du Footer (inchangé) */}
            <div className="form-subsection optional-section">  </div>

        </fieldset>
    );
};

export default FooterConfigForm;