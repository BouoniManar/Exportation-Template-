// src/components/PagesComponents/ComponentSelector.tsx
import React, { useState, useCallback, ChangeEvent } from 'react';
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
// CORRECTION : Retirer les types globaux de cette liste
const availableComponents = [

    { value: 'hero', label: 'Hero Banner', group: 'Structure/Général' },
    { value: 'text_block', label: 'Bloc Texte', group: 'Contenu' },
    { value: 'gallery', label: 'Galerie Images', group: 'Contenu' },
    { value: 'card_grid', label: 'Grille de Cartes', group: 'Contenu' },
    { value: 'featured_products', label: 'Produits Vedettes', group: 'E-commerce/Patisserie' },
    // --- Restaurant Specific ---
    { value: 'address_banner', label: '[Resto] Bannière Adresse', group: 'Restaurant Specific' },
    { value: 'restaurant_info_banner', label: '[Resto] Info Bannière', group: 'Restaurant Specific' },
    { value: 'menu_layout', label: '[Resto] Menu Layout (Sidebar+)', group: 'Restaurant Specific' },
    { value: 'page_header', label: '[Resto] En-tête Page', group: 'Restaurant Specific' },
    { value: 'breadcrumb', label: '[Resto] Fil d\'Ariane', group: 'Restaurant Specific' },
    { value: 'info_details', label: '[Resto] Détails Info', group: 'Restaurant Specific' },
    { value: 'address_details', label: '[Resto] Détails Adresse', group: 'Restaurant Specific' },
    { value: 'cta_add_photo', label: '[Resto] CTA Ajout Photo', group: 'Restaurant Specific' },
    // --- Ajoutez d'autres types de composants de *contenu* ici ---
];

// Créer des groupes pour l'élément <select> (cette partie ne change pas)
const componentGroups: { [key: string]: { value: string; label: string }[] } = {};
availableComponents.forEach(comp => {
    if (!componentGroups[comp.group]) {
        componentGroups[comp.group] = [];
    }
    componentGroups[comp.group].push({ value: comp.value, label: comp.label });
});

interface ComponentSelectorProps {
    onAddComponent: (componentType: string) => void;
}

const ComponentSelector: React.FC<ComponentSelectorProps> = ({ onAddComponent }) => {
    const [selectedComponentType, setSelectedComponentType] = useState<string>('');

    const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedComponentType(event.target.value);
    }, []);

    const handleAddClick = useCallback(() => {
        if (selectedComponentType) {
            onAddComponent(selectedComponentType);
            setSelectedComponentType(''); // Réinitialise
        }
    }, [selectedComponentType, onAddComponent]);

    return (
        <div className="add-component-controls">
            <select
                className="component-type-select"
                value={selectedComponentType}
                onChange={handleSelectChange}
                aria-label="Choisir un type de composant à ajouter"
            >
                <option value="" disabled>-- Choisir un Composant --</option>
                {Object.entries(componentGroups).map(([groupName, components]) => (
                     <optgroup label={groupName} key={groupName}>
                         {components.map(comp => (
                             <option key={comp.value} value={comp.value}>
                                 {comp.label}
                             </option>
                         ))}
                     </optgroup>
                ))}
            </select>
            <button
                type="button"
                className="button-add add-component-btn"
                onClick={handleAddClick}
                disabled={!selectedComponentType}
            >
                <i className="fas fa-plus"></i> Ajouter
            </button>
        </div>
    );
};

export default ComponentSelector;