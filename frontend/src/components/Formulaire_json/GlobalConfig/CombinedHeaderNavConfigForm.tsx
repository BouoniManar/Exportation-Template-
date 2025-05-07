// src/components/GlobalConfig/CombinedHeaderNavConfigForm.tsx
import React, { useCallback } from 'react';
import {
    HeaderData,
    NavigationConfig,
    // StyleConfig, // Probablement pas nécessaire d'importer si utilisé seulement dans HeaderData/NavData
    NavLink,
    CombinedHeaderNavConfigFormProps
} from '../../../types'; // Assurez-vous que CombinedHeaderNavConfigFormProps est bien définie et exportée
import LinkListEditor from './LinkListEditor';
import './Forms.css'; // Attention: Peut causer des conflits/overrides de style
import '../../../styles.css'; // Attention: Peut causer des conflits/overrides de style

const CombinedHeaderNavConfigForm: React.FC<CombinedHeaderNavConfigFormProps> = ({
    headerData,
    navData,
    onHeaderChange,
    onNavChange
}) => {

    // --- Helper pour mise à jour imbriquée ---
    // Met à jour une propriété dans un objet imbriqué en utilisant un chemin de points (ex: 'style.color')
    const updateNestedState = useCallback((prevState: HeaderData | NavigationConfig, path: string, value: any): any => {
        const keys = path.split('.');
        // Deep clone pour éviter de muter l'état original
        const newState = JSON.parse(JSON.stringify(prevState));
        let currentLevel: any = newState;

        try {
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                // Si le niveau intermédiaire n'existe pas ou n'est pas un objet, on le crée
                if (currentLevel[key] === undefined || currentLevel[key] === null || typeof currentLevel[key] !== 'object') {
                    // Devine si le prochain niveau devrait être un tableau ou un objet (simpliste, basé sur si la clé suivante est un nombre)
                    // NOTE: Cette détection est basique et pourrait échouer dans des cas complexes.
                    // Il est préférable que la structure initiale de l'état soit complète.
                    const nextKeyIsNumber = !isNaN(parseInt(keys[i + 1], 10));
                    currentLevel[key] = nextKeyIsNumber ? [] : {};
                }
                currentLevel = currentLevel[key];
            }

            const finalKey = keys[keys.length - 1];

            if (typeof currentLevel === 'object' && currentLevel !== null) {
                 if (finalKey === 'z_index') {
                    // Gère z_index: Convertit en nombre, ou undefined si vide
                    currentLevel[finalKey] = value === '' ? undefined : Number(value);
                } else {
                     // Assigne la valeur à la clé finale
                    currentLevel[finalKey] = value;
                }
            } else {
                console.error(`[updateNestedState] Impossible de définir la propriété sur une valeur non-objet. Path: ${path}, CurrentLevel:`, currentLevel, "Final Key:", finalKey);
            }
        } catch (error) {
             console.error(`[updateNestedState] Erreur lors de la mise à jour de l'état pour le chemin ${path}:`, error);
        }

        return newState;
    }, []); // Pas de dépendances externes à part les fonctions pures

    // --- Handlers pour Header ---
    const handleHeaderInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Utilise updateNestedState pour toutes les propriétés du header (y compris celles dans 'style')
        const newHeaderData = updateNestedState(headerData, name, value);
        // console.log("Updating Header Data:", newHeaderData); // Debug: Vérifier l'état mis à jour
        onHeaderChange(newHeaderData);
    }, [headerData, onHeaderChange, updateNestedState]);

    // Handler spécifique pour la bordure inférieure (plus robuste)
    const handleHeaderBorderBottomChange = useCallback((part: 'width' | 'style' | 'color', value: string) => {
        // Fournir des valeurs par défaut plus sûres si border_bottom est undefined ou mal formé
        const currentBorderString = headerData.style?.border_bottom ?? '1px solid #eeeeee';
        let parts = currentBorderString.split(' ');
        let width = parts[0] ?? '1px';
        let style = parts[1] ?? 'solid';
        let color = parts[2] ?? '#eeeeee';

        if (part === 'width') width = value.trim() || '0px'; // Utiliser 0px si vide
        if (part === 'style') style = value;
        if (part === 'color') color = value;

        // Reconstruire la valeur, ou la mettre à undefined si la bordure n'est pas visible
        const newBorderBottomValue = (width !== '0px' && style !== 'none')
            ? `${width} ${style} ${color}`
            : undefined; // Mettre à undefined si largeur 0 ou style none

        const newHeaderData = updateNestedState(headerData, 'style.border_bottom', newBorderBottomValue);
        onHeaderChange(newHeaderData);
    }, [headerData, onHeaderChange, updateNestedState]);


    // --- Handlers pour Navigation ---
    const handleNavInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Utilise updateNestedState pour les propriétés imbriquées (style, sub_navigation_style)
        const newNavData = updateNestedState(navData, name, value);
        // console.log("Updating Nav Data:", newNavData); // Debug
        onNavChange(newNavData);

    }, [navData, onNavChange, updateNestedState]);

    // Gère la mise à jour spécifique pour menu_button_text (devient null si vide)
    const handleMenuButtonTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
         const { value } = e.target;
         // Crée une copie pour éviter la mutation directe si updateNestedState n'est pas utilisé
         const updatedNavData = { ...navData, menu_button_text: value === '' ? null : value };
         onNavChange(updatedNavData);
     }, [navData, onNavChange]);


     const handleNavLinksChange = useCallback((newLinks: NavLink[]) => {
        onNavChange({ ...navData, links: newLinks });
    }, [navData, onNavChange]);

    const handleSubNavLinksChange = useCallback((newSubLinks: NavLink[]) => {
        onNavChange({ ...navData, sub_links: newSubLinks });
    }, [navData, onNavChange]);


    // --- Variables pour affichage (Bordure Header) ---
    // Décomposition plus sûre pour l'affichage dans le formulaire
    const getBorderParts = (borderString: string | undefined): [string, string, string] => {
        if (!borderString) return ['0px', 'none', '#000000']; // Défauts si undefined
        const parts = borderString.split(' ');
        return [
            parts[0] ?? '1px',   // Largeur par défaut si manquante
            parts[1] ?? 'solid', // Style par défaut si manquant
            parts[2] ?? '#eeeeee' // Couleur par défaut si manquante
        ];
    };
    const [borderWidth, borderStyle, borderColor] = getBorderParts(headerData.style?.border_bottom);

    // --- Valeurs par défaut pour l'affichage dans les inputs ---
    // IMPORTANT: L'état initial fourni via les props devrait contenir ces valeurs par défaut
    // pour que les styles soient appliqués correctement même si l'utilisateur ne modifie pas les champs.
    const headerBgColor = headerData.style?.background_color ?? '#FFFFFF';
    const headerTextColor = headerData.style?.color ?? '#333333';
    const headerHeight = headerData.style?.height ?? '60px';
    const headerPadding = headerData.style?.padding ?? '0 20px';
    const headerBoxShadow = headerData.style?.box_shadow ?? '0 2px 4px rgba(0,0,0,0.1)';
    const headerPosition = headerData.style?.position ?? 'fixed';
    const headerZIndex = headerData.style?.z_index ?? ''; // Garder vide pour le placeholder

    const navBgColor = navData.style?.background_color ?? '#FFFFFF';
    const navTextColor = navData.style?.color ?? '#333333';
    const navPadding = navData.style?.padding ?? '0 20px';
    const navBorderBottom = navData.style?.border_bottom ?? '1px solid #eee';

    const subNavPadding = navData.sub_navigation_style?.padding ?? '';
    const subNavBorderTop = navData.sub_navigation_style?.border_top ?? '';


    return (
        <fieldset className="form-section">
            <legend><i className="fas fa-window-maximize"></i> Configuration Header & Navigation</legend>

             {/* ========================== */}
             {/* == Configuration Header == */}
             {/* ========================== */}
             <div className="form-subsection">
                <h4><i className="fas fa-heading"></i> En-tête Principal (Header)</h4>
                 {/* Styles Communs Header */}
                 <div className="form-subsection nested">
                    <h5><i className="fas fa-palette"></i> Styles Communs (`header.style`)</h5>
                     {/* IMPORTANT: Pour que la couleur soit appliquée au header réel, 'headerData.style.background_color' doit avoir une valeur dans l'état.
                         Le '?? #FFFFFF' ici affecte seulement l'affichage du input color picker par défaut. */}
                    <div className="form-row">
                         <div className="form-group color-group">
                             <label>Fond:</label>
                             <div><input type="color" name="style.background_color" value={headerBgColor} onChange={handleHeaderInputChange} /></div>
                         </div>
                         <div className="form-group color-group">
                             <label>Texte:</label>
                             <div><input type="color" name="style.color" value={headerTextColor} onChange={handleHeaderInputChange} /></div>
                         </div>
                         <div className="form-group">
                             <label>Hauteur:</label>
                             <input type="text" name="style.height" value={headerHeight} onChange={handleHeaderInputChange} placeholder="ex: 60px"/>
                         </div>
                         <div className="form-group">
                             <label>Padding:</label>
                             <input type="text" name="style.padding" value={headerPadding} onChange={handleHeaderInputChange} placeholder="ex: 0 20px"/>
                         </div>
                    </div>
                    <div className="form-row">
                         <div className="form-group">
                             <label>Ombre portée:</label>
                             <input type="text" name="style.box_shadow" value={headerBoxShadow} onChange={handleHeaderInputChange} placeholder="ex: 0 2px 5px rgba(0,0,0,0.1)"/>
                         </div>
                         <div className="form-group">
                             <label>Position CSS:</label>
                             <select name="style.position" value={headerPosition} onChange={handleHeaderInputChange}>
                                <option value="static">Static</option>
                                <option value="relative">Relative</option>
                                <option value="absolute">Absolute</option>
                                <option value="fixed">Fixed</option>
                                <option value="sticky">Sticky</option>
                            </select>
                         </div>
                         <div className="form-group">
                             <label>Z-Index:</label>
                             {/* Utilise 'number' mais value est une string pour permettre la vidange */}
                             <input type="number" name="style.z_index" value={headerZIndex} onChange={handleHeaderInputChange} placeholder="ex: 1000"/>
                         </div>
                    </div>
                 </div>
                 {/* Bordure Header */}
                <div className="form-subsection nested">
                    <h5><i className="fas fa-ruler-horizontal"></i> Bordure Inférieure Header (`header.style.border_bottom`)</h5>
                    {/* Utilise les variables décomposées pour les valeurs des inputs */}
                    <div className="form-row border-config-row">
                        <div className="form-group">
                            <label>Épaisseur:</label>
                            <input type="text" value={borderWidth} onChange={(e) => handleHeaderBorderBottomChange('width', e.target.value)} placeholder="ex: 1px" />
                        </div>
                        <div className="form-group">
                            <label>Style:</label>
                            <select value={borderStyle} onChange={(e) => handleHeaderBorderBottomChange('style', e.target.value)}>
                                <option value="none">Aucun</option>
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="double">Double</option>
                            </select>
                        </div>
                        <div className="form-group color-group">
                            <label>Couleur:</label>
                            <div><input type="color" value={borderColor} onChange={(e) => handleHeaderBorderBottomChange('color', e.target.value)} /></div>
                        </div>
                    </div>
                </div>
                {/* Éléments Spécifiques Header */}
                 <div className="form-subsection nested optional-section">
                     <h5><i className="fas fa-puzzle-piece"></i> Éléments Spécifiques Header</h5>
                      <div className="form-group">
                         <label>Texte Barre d'Annonce:</label>
                         <input
                            type="text"
                            name="announcement_bar.text" // Chemin pour updateNestedState
                            value={headerData.announcement_bar?.text ?? ''}
                            onChange={handleHeaderInputChange}
                            placeholder="Livraison gratuite..."/>
                     </div>
                     <div className="form-group">
                            <label>Texte Bouton Droit (Login/Compte):</label>
                            {/* Attention: Ce champ met à jour 'login_button.text'. Si tu veux aussi gérer 'account_link.text', il faut une logique plus complexe */}
                            <input
                                type="text"
                                name="login_button.text" // Chemin pour updateNestedState
                                value={headerData.login_button?.text ?? ''} // Ne prend que login_button comme source pour la valeur initiale
                                onChange={handleHeaderInputChange}
                                placeholder="Ex: Connexion"/>
                     </div>
                     {/* Affichage info Icônes (non configurable ici) */}
                     <div className="form-group info-only">
                         <label>Icônes:</label>
                         <p><small>Les icônes (Panier, Recherche) sont généralement gérées automatiquement ou via une configuration séparée.</small></p>
                     </div>
                 </div>
            </div>

            <hr className="form-hr"/>

            {/* ============================= */}
            {/* == Configuration Navigation == */}
            {/* ============================= */}
            <div className="form-subsection">
                 <h4><i className="fas fa-bars"></i> Barre de Navigation Principale</h4>
                 {/* Style Nav */}
                 <div className="form-subsection nested">
                     <h5><i className="fas fa-palette"></i> Style Barre Nav (`navigation.style`)</h5>
                      <div className="form-row">
                          <div className="form-group color-group">
                              <label>Fond:</label>
                              <div><input type="color" name="style.background_color" value={navBgColor} onChange={handleNavInputChange} /></div>
                          </div>
                          <div className="form-group color-group">
                              <label>Texte:</label>
                              <div><input type="color" name="style.color" value={navTextColor} onChange={handleNavInputChange} /></div>
                          </div>
                          <div className="form-group">
                              <label>Padding:</label>
                              <input type="text" name="style.padding" value={navPadding} onChange={handleNavInputChange} placeholder="Ex: 0 20px"/>
                          </div>
                          <div className="form-group">
                              <label>Bordure Bas:</label>
                              <input type="text" name="style.border_bottom" value={navBorderBottom} onChange={handleNavInputChange} placeholder="Ex: 1px solid #eee"/>
                          </div>
                      </div>
                 </div>
                 {/* Liens Principaux */}
                 <div className="form-subsection nested">
                     <h5><i className="fas fa-link"></i> Liens Principaux (`navigation.links`)</h5>
                     <LinkListEditor
                        links={navData.links || []} // Fournir un tableau vide si undefined
                        onChange={handleNavLinksChange}
                        listKey="mainNav"
                        allowActiveState={true} />
                 </div>
                 {/* Bouton Mobile */}
                  <div className="form-group">
                    <label htmlFor="nav_menu_button_text">Texte Bouton Menu Mobile:</label>
                    {/* Utilise le handler spécifique pour gérer la valeur null si vide */}
                    <input
                        type="text"
                        id="nav_menu_button_text"
                        name="menu_button_text" // Le name n'est pas utilisé par le handler spécifique mais bon à garder pour info
                        value={navData.menu_button_text ?? ''} // Affiche vide si null/undefined
                        onChange={handleMenuButtonTextChange} // Handler spécifique
                        placeholder="Ex: ☰ Menu"/>
                 </div>
            </div>

             {/* Sous-Navigation */}
              <div className="form-subsection optional-section">
                 <h4><i className="fas fa-level-down-alt"></i> Sous-Navigation (Optionnel)</h4>
                 {/* Vérifier si les styles de sous-nav existent avant d'essayer d'y accéder */}
                 <div className="form-subsection nested">
                      <h5><i className="fas fa-palette"></i> Style Sous-Nav (`navigation.sub_navigation_style`)</h5>
                      <div className="form-row">
                          <div className="form-group">
                              <label>Padding:</label>
                              <input
                                type="text"
                                name="sub_navigation_style.padding" // Chemin pour updateNestedState
                                value={subNavPadding}
                                onChange={handleNavInputChange}
                                placeholder="Ex: 10px 0 ..."/>
                           </div>
                          <div className="form-group">
                              <label>Bordure Haut:</label>
                              <input
                                type="text"
                                name="sub_navigation_style.border_top" // Chemin pour updateNestedState
                                value={subNavBorderTop}
                                onChange={handleNavInputChange}
                                placeholder="Ex: 1px solid #eee"/>
                          </div>
                      </div>
                 </div>
                  <div className="form-subsection nested">
                     <h5><i className="fas fa-link"></i> Liens Sous-Nav (`navigation.sub_links`)</h5>
                     <LinkListEditor
                        links={navData.sub_links || []} // Fournir un tableau vide si undefined
                        onChange={handleSubNavLinksChange}
                        listKey="subNav"
                        allowActiveState={false} />
                 </div>
             </div>

        </fieldset>
    );
};

export default CombinedHeaderNavConfigForm;