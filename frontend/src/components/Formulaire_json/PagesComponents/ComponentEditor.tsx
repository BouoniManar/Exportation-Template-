// src/components/PagesComponents/ComponentEditor.tsx
import React from 'react';
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';

// Importez tous les types nécessaires
import {
    ComponentEditorProps,
    MainContentComponent,

    
    HeroComponentConfig,
    FeaturedProductsComponentConfig,
    TextBlockComponentConfig,
    GalleryComponentConfig,
    AddressBannerComponentConfig,
    RestaurantInfoBannerComponentConfig,
    // MenuLayoutComponentConfig, // Assurez-vous que le type existe
    PageHeaderComponentConfig, // Assurez-vous que le type existe
    BreadcrumbComponentConfig,
    InfoDetailsComponentConfig,
    AddressDetailsComponentConfig,
    // CtaAddPhotoComponentConfig, // Assurez-vous que le type existe
    CardGridComponentConfig // Assurez-vous que le type existe
    // Ajoutez d'autres types si nécessaire
} from '../../../types'

// Importez TOUS les formulaires de configuration spécifiques que vous avez créés
import HeroConfigForm from '../ComponentConfigs/HeroConfigForm';
import FeaturedProductsConfigForm from '../ComponentConfigs/FeaturedProductsConfigForm';
import TextBlockConfigForm from '../ComponentConfigs/TextBlockConfigForm';
import GalleryConfigForm from '../ComponentConfigs/GalleryConfigForm';
import AddressBannerConfigForm from '../ComponentConfigs/AddressBannerConfigForm';
import RestaurantInfoBannerConfigForm from '../ComponentConfigs/RestaurantInfoBannerConfigForm';
// import MenuLayoutConfigForm from '../ComponentConfigs/MenuLayoutConfigForm'; // Décommentez si créé
// import PageHeaderConfigForm from '../ComponentConfigs/PageHeaderConfigForm'; // Décommentez si créé
import BreadcrumbConfigForm from '../ComponentConfigs/BreadcrumbConfigForm';
import InfoDetailsConfigForm from '../ComponentConfigs/InfoDetailsConfigForm';
// import CtaAddPhotoConfigForm from '../ComponentConfigs/CtaAddPhotoConfigForm'; // Décommentez si créé
import CardGridConfigForm from '../ComponentConfigs/CardGridConfigForm';

// Importez les styles partagés
import '../GlobalConfig/Forms.css';

// --- Fonctions Helper (inchangées) ---
function getFriendlyNameForComponentType(type: string): string {
    const formatted = type.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\[.*?\]/g, '').trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
function getIconForComponentType(type: string): string {
    const iconMap: { [key: string]: string } = {
        'hero': 'image', 'featured_products': 'star', 'text_block': 'paragraph',
        'gallery': 'images', 'card_grid': 'th-large', 'address_banner': 'map-marker-alt',
        'restaurant_info_banner': 'info-circle', 'menu_layout': 'columns',
        'page_header': 'heading', 'breadcrumb': 'angle-double-right',
        'info_details': 'list-ul', 'address_details': 'map-pin', 'cta_add_photo': 'camera',
    };
    return iconMap[type] || 'cube';
}
// --- Fin Fonctions Helper ---

const ComponentEditor: React.FC<ComponentEditorProps> = ({
    componentData,
    onChange,
    onDelete
}) => {

    if (!componentData?.id || !componentData?.type) {
        console.error("ComponentEditor received invalid componentData:", componentData);
        return <div className="component-config error-message">...Données invalides...</div>;
    }

    // Fonction pour rendre le bon formulaire basé sur componentData.type
    const renderSpecificConfigForm = () => {
        const specificOnChange = onChange as (updatedData: any) => void;

        switch (componentData.type) {
            // --- Composants de Contenu ---
            case 'hero':
                return <HeroConfigForm config={componentData as HeroComponentConfig} onChange={specificOnChange} />;
            case 'featured_products':
                return <FeaturedProductsConfigForm config={componentData as FeaturedProductsComponentConfig} onChange={specificOnChange} />;
            case 'text_block':
                 return <TextBlockConfigForm config={componentData as TextBlockComponentConfig} onChange={specificOnChange} />;
            case 'gallery':
                 return <GalleryConfigForm config={componentData as GalleryComponentConfig} onChange={specificOnChange} />;
             case 'card_grid':
                 return <CardGridConfigForm config={componentData as CardGridComponentConfig} onChange={specificOnChange} />;
            case 'address_banner':
                return <AddressBannerConfigForm config={componentData as AddressBannerComponentConfig} onChange={specificOnChange} />;
            case 'breadcrumb':
                return <BreadcrumbConfigForm config={componentData as BreadcrumbComponentConfig} onChange={specificOnChange} />;
            case 'info_details':
                 return <InfoDetailsConfigForm config={componentData as InfoDetailsComponentConfig} onChange={specificOnChange} />;
            case 'restaurant_info_banner':
                 return <RestaurantInfoBannerConfigForm config={componentData as RestaurantInfoBannerComponentConfig} onChange={specificOnChange} />;
         
             // --- AJOUTEZ ICI les 'case' pour les formulaires que vous avez MAIS qui manquent ---
             // Exemple : (Assurez-vous d'importer MenuLayoutConfigForm et MenuLayoutComponentConfig)
             /*
             case 'menu_layout':
                 return <MenuLayoutConfigForm config={componentData as MenuLayoutComponentConfig} onChange={specificOnChange} />;
             case 'page_header':
                  return <PageHeaderConfigForm config={componentData as PageHeaderComponentConfig} onChange={specificOnChange} />;
             case 'cta_add_photo':
                  return <CtaAddPhotoConfigForm config={componentData as CtaAddPhotoComponentConfig} onChange={specificOnChange} />;
             */

             // --- Cas par Défaut (pour les types non gérés) ---
            default:
                // const unknownComponentData = componentData; // Peut aider pour le typage si BaseComponentConfig n'est pas assez précis
                return (
                    <div className="component-body unknown-component-warning">
                        <p><i className="fas fa-question-circle"></i> Éditeur non défini pour le type : <strong>{componentData.type}</strong></p>
                        <p><small>Ajoutez un 'case' pour ce type dans <code>ComponentEditor.tsx</code> et importez le formulaire correspondant.</small></p>
                         <details style={{marginTop: '10px'}}>
                            <summary style={{cursor: 'pointer', fontSize: '0.8em'}}>Voir JSON brut</summary>
                            <pre className="raw-json-preview">
                                {JSON.stringify(componentData, null, 2)}
                            </pre>
                         </details>
                    </div>
                );
        }
    };

    // Rendu principal du ComponentEditor (inchangé)
    return (
        <div className="component-config" data-component-type={componentData.type}>
            <div className="component-header">
                <h5>
                    <span className="drag-handle" title="Réorganiser"><i className="fas fa-grip-vertical"></i></span>
                    <i className={`fas fa-${getIconForComponentType(componentData.type)} component-icon`}></i>
                    {getFriendlyNameForComponentType(componentData.type)}
                </h5>
                <button type="button" className="button-remove component-remove-btn" title={`Supprimer ${getFriendlyNameForComponentType(componentData.type)}`} onClick={() => onDelete(componentData.id)}>
                    <i className="fas fa-trash"></i>
                </button>
            </div>
            <div className="component-body-wrapper">
                {renderSpecificConfigForm()}
            </div>
        </div>
    );
};

export default ComponentEditor;