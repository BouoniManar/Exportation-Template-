// src/AppContent.tsx
import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Types
import {
    RootConfig, SingleSiteConfig, SiteInfo, ThemeConfig, HeaderData, NavigationConfig, FooterData,
    PageConfig, BaseComponentConfig, MainContentComponent,
    HeroComponentConfig, FeaturedProductsComponentConfig, // Ajoutez d'autres types spécifiques si utilisés dans les defaults
    // Assurez-vous que CombinedHeaderNavConfigFormProps est exporté depuis types.ts
    CombinedHeaderNavConfigFormProps,
    SiteInfoFormProps, ThemeConfigFormProps, FooterConfigFormProps, PageManagerProps, NavLink, // NavLink reste nécessaire
    TextBlockComponentConfig
} from './types'; // Verify this path

// Import Components
import GlobalConfigTabs from './components/Formulaire_json/GlobalConfig/GlobalConfigTabs';
import SiteInfoForm from './components/Formulaire_json/GlobalConfig/SiteInfoForm';
import ThemeConfigForm from './components/Formulaire_json/GlobalConfig/ThemeConfigForm';
// --- SUPPRIMER/COMMENTER LES ANCIENS ---
// import HeaderConfigForm from './components/GlobalConfig/HeaderConfigForm';
// import NavConfigForm from './components/GlobalConfig/NavConfigForm';
// --- AJOUTER LE NOUVEAU ---
import CombinedHeaderNavConfigForm from './components/Formulaire_json/GlobalConfig/CombinedHeaderNavConfigForm';
import FooterConfigForm from './components/Formulaire_json/GlobalConfig/FooterConfigForm';
import PageManager from './components/Formulaire_json/PagesComponents/PageManager';

// Import CSS
import './App.css';
import './components/Formulaire_json/GlobalConfig/Forms.css';
import { Link } from 'react-router-dom';

// --- Helper Function (Outside Component) ---
function getFriendlyNameForComponentType(type: string): string {
    if (!type) return 'Composant';
    // Basic formatting: replace underscores/hyphens, remove bracketed parts, capitalize
    const formatted = type
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\[.*?\]/g, '') // Remove anything in brackets like [Resto]
        .trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// --- Default Initial State ---
const createDefaultSiteConfig = (): SingleSiteConfig => ({
    site: { title: 'Nouveau Site', image_source_base: 'backend/assets/img/default' },
    theme: {
        primary_color: '#4E087D', secondary_color: '#E74C3C', accent_color: '#F1C40F',
        background_light: '#F9F6F1', background_white: '#FFFFFF', text_dark: '#333333',
        text_light: '#FFFFFF', text_medium: '#6c757d', border_color: '#dee2e6',
        font: 'Roboto, sans-serif', secondary_font: 'Open Sans, sans-serif', heading_font: 'Roboto Slab, serif',
        base_size: '16px', border_radius: '4px'
    },
    header: { style: { position: 'fixed', height: '60px', z_index: 1000, background_color: '#FFFFFF', box_shadow: '0 2px 4px rgba(0,0,0,0.1)' } },
    navigation: { links: [{ id: `link_${Date.now()}`, text: 'Accueil', url: '#' }] },
    pages: [], // Initialize pages as an empty array
    footer: { style: { padding: '20px', text_align: 'center', background_color: '#f8f9fa' }, copyright_text: `© ${new Date().getFullYear()} Mon Site` },
});

// --- Main App Component ---
function App() {
    const [rootConfig, setRootConfig] = useState<RootConfig>({
        'mon_site': createDefaultSiteConfig()
    });
    const [currentSiteKey, setCurrentSiteKey] = useState<string>(Object.keys(rootConfig)[0] || 'mon_site');
    const [activeTab, setActiveTab] = useState<string>('site-info'); // Default tab
    const [generatedJsonString, setGeneratedJsonString] = useState<string | null>(null);

    // --- Callback Handlers ---

    const handleSiteKeyChange = useCallback((newKey: string) => {
        const trimmedKey = newKey.trim(); // Trim whitespace
        if (!trimmedKey) {
             toast.warn("La clé de site ne peut pas être vide.");
             return;
        }
        if (trimmedKey === currentSiteKey) return; // No change
        if (rootConfig[trimmedKey]) {
            toast.error(`La clé de site "${trimmedKey}" existe déjà.`);
            return;
        }

        setRootConfig(prevRootConfig => {
            const currentData = prevRootConfig[currentSiteKey];
            // Create a new object excluding the old key
            const { [currentSiteKey]: _, ...rest } = prevRootConfig;
            return {
                ...rest,
                [trimmedKey]: currentData ?? createDefaultSiteConfig() // Add data under new key
            };
        });
        setCurrentSiteKey(trimmedKey);
        setGeneratedJsonString(null); // Reset preview as structure changed
    }, [currentSiteKey, rootConfig]);

    // Generic handler to update a specific top-level section (site, theme, header, etc.)
    const handleGlobalConfigChange = useCallback(<K extends keyof SingleSiteConfig>(
        section: K,
        updatedData: SingleSiteConfig[K]
    ) => {
        setRootConfig(prevRootConfig => {
            const currentSiteData = prevRootConfig[currentSiteKey] ?? createDefaultSiteConfig();
            return {
                ...prevRootConfig,
                [currentSiteKey]: {
                    ...currentSiteData,
                    [section]: updatedData,
                }
            };
        });
        setGeneratedJsonString(null); // Reset preview on change
    }, [currentSiteKey]);


    // Specific handler for updating the entire pages array (passed to PageManager)
    const handlePagesUpdate = useCallback((updatedPages: PageConfig[]) => {
        handleGlobalConfigChange('pages', updatedPages);
    }, [handleGlobalConfigChange]); // Dependency array is correct

    // Specific handler for adding a component to a specific page (passed to PageManager)
     const handleAddComponentToPage = useCallback((pageId: string, componentType: string) => {
        const newComponentId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const baseData: BaseComponentConfig = { id: newComponentId, type: componentType };
        let newComponent: MainContentComponent;

        // Create default structure based on component type
        switch (componentType) {
            case 'hero':
                newComponent = { ...baseData, type: 'hero', style: { padding: '60px 20px', background_color: '#F9F6F1' }, text_content: { title: { text: 'Titre Hero par défaut' }, button: { text: 'Bouton Action' } }, image: { alt: 'Image Hero', style: { border_radius: '8px'} } } as HeroComponentConfig;
                break;
            case 'featured_products':
                newComponent = { ...baseData, type: 'featured_products', title: 'Produits Vedettes', products: [], style: { padding: '60px 20px', text_align: 'center' }, title_style: { font_size: '28px', margin_bottom: '40px' }, product_grid_style: { display: 'grid', grid_template_columns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px'}, product_card_style: { background_color: '#FFFFFF', border_radius: '8px', padding: '15px' }, product_image_style: { height: '200px', object_fit: 'contain', margin_bottom: '15px' }, product_name_style: { font_weight: '500', margin_bottom: '8px' }, product_price_style: { font_weight: 'bold'} } as FeaturedProductsComponentConfig;
                break;
            case 'text_block':
                newComponent = { ...baseData, type: 'text_block', title: 'Titre Bloc Texte', content: 'Contenu par défaut...' } as TextBlockComponentConfig;
                break;
            // Add cases for other component types with their defaults
            // case 'gallery': newComponent = { ...baseData, type: 'gallery', title: 'Galerie', images: [] } as GalleryComponentConfig; break;
            // case 'card_grid': newComponent = { ...baseData, type: 'card_grid', title: 'Grille de Cartes', cards: [] } as CardGridComponentConfig; break; // Assuming CardGridComponentConfig type exists
            default:
                console.warn(`Ajout type ${componentType} sans valeurs par défaut spécifiques.`);
                newComponent = { ...baseData } as MainContentComponent; // Basic component
                break;
        }

        setRootConfig(prevRootConfig => {
            const site = prevRootConfig[currentSiteKey];
            // Ensure site and site.pages exist and are arrays
            if (!site || !Array.isArray(site.pages)) {
                 console.error("Cannot add component: site or site.pages is not valid.");
                 return prevRootConfig;
            }
            const updatedPages = site.pages.map(page => {
                if (page.id === pageId) {
                    // Ensure components array exists before pushing
                    const components = [...(page.components || []), newComponent];
                    return { ...page, components };
                }
                return page;
            });
            return { ...prevRootConfig, [currentSiteKey]: { ...site, pages: updatedPages } };
        });
        setGeneratedJsonString(null); // Reset preview
        toast.info(`Composant '${getFriendlyNameForComponentType(componentType)}' ajouté.`);
    }, [currentSiteKey]);

    // Specific handler for changing a component within a page (passed to PageManager)
    const handleComponentChange = useCallback((pageId: string, updatedComponentData: MainContentComponent) => {
         setRootConfig(prevRootConfig => {
            const site = prevRootConfig[currentSiteKey];
            if (!site || !Array.isArray(site.pages)) return prevRootConfig;
            const updatedPages = site.pages.map(page => {
                if (page.id === pageId) {
                    // Ensure components array exists before mapping
                    const updatedComponents = (page.components || []).map(comp =>
                        comp.id === updatedComponentData.id ? updatedComponentData : comp
                    );
                    return { ...page, components: updatedComponents };
                }
                return page;
            });
             return { ...prevRootConfig, [currentSiteKey]: { ...site, pages: updatedPages } };
        });
         setGeneratedJsonString(null); // Reset preview
    }, [currentSiteKey]);

    // Specific handler for deleting a component from a page (passed to PageManager)
    const handleComponentDelete = useCallback((pageId: string, componentId: string) => {
         setRootConfig(prevRootConfig => {
            const site = prevRootConfig[currentSiteKey];
             if (!site || !Array.isArray(site.pages)) return prevRootConfig;
             const updatedPages = site.pages.map(page => {
                if (page.id === pageId) {
                     // Ensure components array exists before filtering
                    const filteredComponents = (page.components || []).filter(comp => comp.id !== componentId);
                    return { ...page, components: filteredComponents };
                }
                return page;
            });
             return { ...prevRootConfig, [currentSiteKey]: { ...site, pages: updatedPages } };
        });
        setGeneratedJsonString(null); // Reset preview
         toast.success("Composant supprimé.");
    }, [currentSiteKey]);

    // Tab change handler
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
    }, []); // No dependencies needed

    // --- JSON and ZIP Generation ---
    const generateFullJson = useCallback(() => {
        try {
            if (!rootConfig[currentSiteKey]) {
                throw new Error(`Configuration pour la clé "${currentSiteKey}" non trouvée.`);
            }
            const finalOutput = { [currentSiteKey]: rootConfig[currentSiteKey] };
            const jsonString = JSON.stringify(finalOutput, null, 2);
            setGeneratedJsonString(jsonString);
            toast.success("JSON généré/actualisé !");
        } catch (error) {
            console.error("Error generating JSON:", error);
            const errorMessage = `Erreur: ${error instanceof Error ? error.message : String(error)}`;
            setGeneratedJsonString(errorMessage);
            toast.error("Erreur lors de la génération du JSON.");
        }
    }, [rootConfig, currentSiteKey]);

    const handleDownloadJson = useCallback(() => {
        if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) {
            toast.warn("Générez un JSON valide d'abord.");
            return;
        }
        const blob = new Blob([generatedJsonString], { type: "application/json;charset=utf-8" });
        saveAs(blob, `${currentSiteKey}_config.json`);
        toast.info("Téléchargement JSON lancé.");
    }, [generatedJsonString, currentSiteKey]);

    // Basic copy to clipboard functionality
    const handleCopyJson = useCallback(() => {
        if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) {
             toast.warn("Générez un JSON valide d'abord.");
             return;
        }
         if (navigator.clipboard && window.isSecureContext) {
             navigator.clipboard.writeText(generatedJsonString)
                 .then(() => toast.success("JSON copié dans le presse-papiers !"))
                 .catch(err => {
                     toast.error("La copie automatique a échoué.");
                     console.error('Erreur de copie:', err);
                 });
         } else {
             // Fallback for non-secure contexts or older browsers
             try {
                 const textArea = document.createElement("textarea");
                 textArea.value = generatedJsonString;
                 textArea.style.position = "fixed"; // Prevent scrolling to bottom
                 document.body.appendChild(textArea);
                 textArea.focus();
                 textArea.select();
                 document.execCommand('copy');
                 document.body.removeChild(textArea);
                 toast.success("JSON copié ! (fallback)");
             } catch (err) {
                  toast.error("La copie a échoué.");
                  console.error('Erreur de copie (fallback):', err);
             }
         }
    }, [generatedJsonString]);


     const handleDownloadZip = useCallback(() => {
        if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) {
             toast.warn("Générez un JSON valide d'abord.");
            return;
        }
         if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
            toast.error("Erreur: Librairies JSZip/FileSaver absentes.");
            return;
        }
        const zip = new JSZip();
        zip.file(`${currentSiteKey}_config.json`, generatedJsonString);
        toast.warn("Fonctionnalité ZIP basique : Inclut seulement le JSON.");
        zip.generateAsync({ type: "blob" })
            .then((content: Blob) => {
                saveAs(content, `${currentSiteKey}_template.zip`);
                 toast.info("Téléchargement du ZIP lancé.");
            })
            .catch((err) => {
                toast.error("Erreur lors de la création du fichier ZIP.");
                console.error("Error generating ZIP:", err);
            });


    

    }, [generatedJsonString, currentSiteKey]);

    // Get current site data safely
    const currentSiteData = rootConfig[currentSiteKey] || createDefaultSiteConfig();

    // --- Helper function to render active tab content ---
    const renderActiveTabContent = () => {
        const props = { // Prepare props to avoid repetition
             siteData: currentSiteData.site,
             themeData: currentSiteData.theme,
             headerData: currentSiteData.header,
             navData: currentSiteData.navigation,
             footerData: currentSiteData.footer,
             pagesData: Array.isArray(currentSiteData.pages) ? currentSiteData.pages : []
        };

        switch (activeTab) {
            case 'site-info':
                 // Utilise la décomposition de props ici aussi pour la cohérence
                return <SiteInfoForm
                            siteData={props.siteData}
                            siteKey={currentSiteKey}
                            onChange={(data: SiteInfo) => handleGlobalConfigChange('site', data)}
                            onSiteKeyChange={handleSiteKeyChange}
                        />;
            case 'theme':
                return <ThemeConfigForm
                            themeData={props.themeData}
                            onChange={(data: ThemeConfig) => handleGlobalConfigChange('theme', data)}
                        />;

            // --- MODIFICATION ICI : Remplace les anciens 'case' par le nouveau ---
            // case 'header': return <HeaderConfigForm headerData={props.headerData} onChange={(data) => handleGlobalConfigChange('header', data)} />;
            // case 'navigation': return <NavConfigForm navData={props.navData} onChange={(data) => handleGlobalConfigChange('navigation', data)} />;
            case 'header-nav': // <<< Utilise le nouvel ID
                return <CombinedHeaderNavConfigForm
                            headerData={props.headerData}
                            navData={props.navData}
                            onHeaderChange={(data: HeaderData) => handleGlobalConfigChange('header', data)}
                            onNavChange={(data: NavigationConfig) => handleGlobalConfigChange('navigation', data)}
                       />;
            // --- FIN DE LA MODIFICATION ---

            case 'footer':
                 return <FooterConfigForm
                                footerData={props.footerData}
                                onChange={(data: FooterData) => handleGlobalConfigChange('footer', data)}
                            />;
            case 'pages-components':
                return <PageManager
                            pagesData={props.pagesData}
                            onPagesUpdate={handlePagesUpdate}
                            onAddComponent={handleAddComponentToPage}
                            onComponentChange={handleComponentChange}
                            onComponentDelete={handleComponentDelete}
                        />;
            case 'output': return (
                 <fieldset className="form-section output-section">
                    <legend><i className="fas fa-code"></i> Sortie JSON & Export</legend>
                    <p>Cliquez sur "Générer/Actualiser JSON" pour voir le résultat.</p>
                    <div className="form-actions output-actions">
                        <button type="submit" className="button-primary"><i className="fas fa-sync-alt"></i> Générer/Actualiser JSON</button>
                        <button type="button" className="button-secondary button-copy" onClick={handleCopyJson} disabled={!generatedJsonString || generatedJsonString.startsWith("Erreur:")} title="Copier JSON"><i className="fas fa-copy"></i> Copier JSON</button>
                        <button type="button" className="button-secondary" onClick={handleDownloadJson} disabled={!generatedJsonString || generatedJsonString.startsWith("Erreur:")}><i className="fas fa-download"></i> Télécharger JSON</button>
                        <button type="button" className="button-secondary" onClick={handleDownloadZip} disabled={!generatedJsonString || generatedJsonString.startsWith("Erreur:")}><i className="fas fa-file-archive"></i> Télécharger ZIP (JSON)</button>

                        <Link
                            to="/generate-template"
                            className={`button-primary button-next-step ${
                                !generatedJsonString || generatedJsonString.startsWith("Erreur:") ? 'disabled-link' : ''
                            }`}
                            title="Passer à la génération du template web (nécessite un JSON valide)"
                            onClick={(e) => {
                                if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) {
                                    e.preventDefault();
                                    toast.warn("Veuillez d'abord générer un JSON valide.");
                                }
                            }}
                        >
                            <i className="fas fa-cogs"></i> Générer le Template Web
                        </Link>
                    </div>
                     <div className="json-output-wrapper"><div className="json-preview-container"><pre id="outputJson">{generatedJsonString ?? "Cliquez sur 'Générer/Actualiser JSON'."}</pre></div></div>
                </fieldset>
              );
            default: return <div>Onglet non reconnu (ID: {activeTab})</div>;
        }
    };


    // --- Main Render ---
    return (
        <>
            <ToastContainer position="bottom-right" autoClose={4000} theme="light" hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="container">
                <header className="app-header">
                     <h1><i className="fas fa-cogs"></i> Générateur JSON de Template Web</h1>
                     <p className="subtitle">Configurez votre site étape par étape.</p>
                </header>

                 {/* Pass the defined handler for tab changes */}
                <GlobalConfigTabs activeTab={activeTab} onTabChange={handleTabChange} />

                <form id="webTemplateForm" onSubmit={(e) => { e.preventDefault(); generateFullJson(); }}>
                    <div className="tab-content-container">
                        {renderActiveTabContent()}
                    </div>
                </form>

                <footer className="app-footer">
                     <p>Générateur JSON Avancé © 2024</p>
                 </footer>
            </div>
        </>
    );
}

export default App;