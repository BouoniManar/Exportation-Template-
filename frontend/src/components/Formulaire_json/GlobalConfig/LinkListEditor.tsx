// src/components/GlobalConfig/LinkListEditor.tsx
import React, { useCallback } from 'react';
import { NavLink } from'../../../types' // Ajustez le chemin
import './Forms.css';

interface LinkListEditorProps {
    links: NavLink[];
    onChange: (newLinks: NavLink[]) => void;
    listKey: string; // Pour générer des IDs uniques
    allowActiveState?: boolean; // Option pour afficher la case "actif"
}

const LinkListEditor: React.FC<LinkListEditorProps> = ({ links, onChange, listKey, allowActiveState = true }) => {

    const handleLinkChange = useCallback((id: string, field: keyof NavLink, value: string | boolean) => {
        const newLinks = links.map(link => {
            if (link.id === id) {
                return { ...link, [field]: value };
            }
            return link;
        });
        onChange(newLinks);
    }, [links, onChange]);

    const handleAddLink = useCallback(() => {
        const newId = `${listKey}_link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newLink: NavLink = { id: newId, text: '', url: '#', active: false };
        onChange([...links, newLink]);
    }, [links, onChange, listKey]);

    const handleRemoveLink = useCallback((id: string) => {
        const newLinks = links.filter(link => link.id !== id);
        onChange(newLinks);
    }, [links, onChange]);

    return (
        <div className="repeatable-list link-list">
            {links.map((link, index) => (
                <div key={link.id} className="repeatable-item link-item">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor={`${link.id}_text`}>Texte du Lien {index + 1}:</label>
                            <input
                                type="text"
                                id={`${link.id}_text`}
                                value={link.text ?? ''}
                                onChange={(e) => handleLinkChange(link.id, 'text', e.target.value)}
                                placeholder="Texte affiché"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`${link.id}_url`}>URL:</label>
                            <input
                                type="text"
                                id={`${link.id}_url`}
                                value={link.url ?? '#'}
                                onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                                placeholder="#"
                            />
                        </div>
                        {allowActiveState && (
                             <div className="form-group checkbox-group">
                                 <label htmlFor={`${link.id}_active`}>Actif?</label>
                                 <input
                                     type="checkbox"
                                     id={`${link.id}_active`}
                                     checked={link.active ?? false}
                                     onChange={(e) => handleLinkChange(link.id, 'active', e.target.checked)}
                                 />
                            </div>
                        )}
                        <div className="form-group button-group">
                             <button
                                type="button"
                                className="button-remove remove-repeatable-item-btn"
                                title="Supprimer ce lien"
                                onClick={() => handleRemoveLink(link.id)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                className="button-add add-repeatable-item-btn"
                onClick={handleAddLink}
            >
                <i className="fas fa-plus"></i> Ajouter un Lien
            </button>
        </div>
    );
};

export default LinkListEditor;