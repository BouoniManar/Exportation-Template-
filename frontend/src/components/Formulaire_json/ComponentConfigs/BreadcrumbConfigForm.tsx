// src/components/ComponentConfigs/BreadcrumbConfigForm.tsx


import { useCallback } from "react";
import { BreadcrumbConfigFormProps, BreadcrumbLinkItem } from '../../../types';
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
const BreadcrumbConfigForm: React.FC<BreadcrumbConfigFormProps> = ({ config, onChange }) => {
    // ... helper updateNestedPropBC ...

    const handleLinkChange = useCallback((index: number, field: keyof BreadcrumbLinkItem, value: string | boolean) => {
        const currentLinks = config.links || [];
        if (index < 0 || index >= currentLinks.length) return;

        const newLinks = currentLinks.map((link, i) => {
            if (i === index) {
                 return { ...link, [field]: value };

           

            }
            return link;
        });

   
        if (field === 'active' && value === true) {
            // Si on a activé un lien, on désactive tous les autres
             newLinks.forEach((link, i) => {
                 if (i !== index) {
                     link.active = false;
                 }
             });
         }
     


        onChange({ ...config, links: newLinks });
    }, [config, onChange]);

     const handleAddLink = useCallback(() => { const newLink: BreadcrumbLinkItem = { text: 'Nouveau Lien', url: '#', active: false }; const newLinks = [...(config.links || []), newLink]; onChange({ ...config, links: newLinks }); }, [config, onChange]);
     const handleRemoveLink = useCallback((indexToRemove: number) => { let newLinks = (config.links || []).filter((_, index) => index !== indexToRemove); onChange({ ...config, links: newLinks }); }, [config, onChange]);
     const handleStyleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; const newStyle = { ...(config.style || {}), [name]: value }; onChange({ ...config, style: newStyle }); }, [config, onChange]);


    return (
        <div className="component-body">
            {/* Styles Globaux (inchangé) */}
             <div className="form-subsection"> /* ... */ </div>

             {/* Liste des Liens (inchangé dans le JSX) */}
            <div className="form-subsection repeatable-list breadcrumb-link-list">
                <h4><i className="fas fa-link"></i> Liens du Fil d'Ariane (`links`)</h4>
                {(config.links || []).map((link, index) => (
                    <div key={index} className="repeatable-item breadcrumb-link-item">
                         <div className="form-row">
                            <div className="form-group">
                                <label htmlFor={`bc_text_${config.id}_${index}`}>Texte {index + 1}:</label>
                                <input type="text" id={`bc_text_${config.id}_${index}`} value={link.text ?? ''} onChange={(e) => handleLinkChange(index, 'text', e.target.value)} placeholder="Texte du lien"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor={`bc_url_${config.id}_${index}`}>URL (Optionnel):</label>
                                <input type="text" id={`bc_url_${config.id}_${index}`} value={link.url ?? ''} onChange={(e) => handleLinkChange(index, 'url', e.target.value)} placeholder="#"/>
                            </div>
                             <div className="form-group checkbox-group">
                                 <label htmlFor={`bc_active_${config.id}_${index}`}>Actif?</label>
                                 <input type="checkbox" id={`bc_active_${config.id}_${index}`} checked={link.active ?? false} onChange={(e) => handleLinkChange(index, 'active', e.target.checked)}/>
                                 <small>(Dernier lien)</small>
                            </div>
                            <div className="form-group button-group">
                                 <button type="button" className="button-remove remove-repeatable-item-btn" title="Supprimer ce lien" onClick={() => handleRemoveLink(index)}><i className="fas fa-times"></i></button>
                            </div>
                        </div>
                    </div>
                ))}
                 <button type="button" className="button-add add-repeatable-item-btn" onClick={handleAddLink}><i className="fas fa-plus"></i> Ajouter un Lien</button>
            </div>
        </div>
    );
};

export default BreadcrumbConfigForm;