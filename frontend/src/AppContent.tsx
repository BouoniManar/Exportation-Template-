// src/AppContent.tsx (ou src/pages/FormulaireJsonPage.tsx si vous renommez le fichier)
import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Types
import {
    RootConfig, SingleSiteConfig, SiteInfo, ThemeConfig, HeaderData, NavigationConfig, FooterData,
    PageConfig, BaseComponentConfig, MainContentComponent,
    HeroComponentConfig, FeaturedProductsComponentConfig, TextBlockComponentConfig
    // Assurez-vous que tous vos types sont bien listés et importés
} from './types'; // Ajustez ce chemin si './types.ts' est ailleurs

// Import Components pour le formulaire
import GlobalConfigTabs from './components/Formulaire_json/GlobalConfig/GlobalConfigTabs';
import SiteInfoForm from './components/Formulaire_json/GlobalConfig/SiteInfoForm';
import ThemeConfigForm from './components/Formulaire_json/GlobalConfig/ThemeConfigForm';
import CombinedHeaderNavConfigForm from './components/Formulaire_json/GlobalConfig/CombinedHeaderNavConfigForm';
import FooterConfigForm from './components/Formulaire_json/GlobalConfig/FooterConfigForm';
import PageManager from './components/Formulaire_json/PagesComponents/PageManager';

// Import CSS (gardez Forms.css pour l'instant, App.css peut souvent être supprimé si on passe à un layout global)
// import './App.css'; // Potentiellement à supprimer si tous les styles sont gérés par Tailwind ou layout
import './components/Formulaire_json/GlobalConfig/Forms.css'; // Styles spécifiques aux formulaires

// --- IMPORT LAYOUT COMPONENTS & ICONS ---
import Sidebar from './components/layout/Sidebar'; // Chemin vers votre Sidebar
import Header from './components/layout/Header';   // Chemin vers votre Header (si vous en avez un distinct pour le contenu)
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaSyncAlt, FaCopy, FaDownload, FaFileArchive, FaCogs as FaCogsIcon, FaInfoCircle, FaPalette, FaPaperPlane, FaColumns, FaSitemap, FaCode } from 'react-icons/fa'; // Ajout d'icônes

// --- Helper Function (Outside Component) ---
function getFriendlyNameForComponentType(type: string): string {
    if (!type) return 'Composant';
    const formatted = type
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\[.*?\]/g, '')
        .trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// --- Default Initial State (avec couleurs ajustées pour le thème dashboard) ---
const createDefaultSiteConfig = (): SingleSiteConfig => ({
    site: { title: 'Nouveau Site', image_source_base: 'backend/assets/img/default' },
    theme: {
        primary_color: '#3B82F6', // Bleu principal (Tailwind: blue-500/600)
        secondary_color: '#10B981', // Vert (Tailwind: green-500)
        accent_color: '#F59E0B', // Ambre/Jaune (Tailwind: amber-500)
        background_light: '#F3F4F6', // Gris très clair (Tailwind: gray-100)
        background_white: '#FFFFFF', // Blanc
        text_dark: '#1F2937', // Texte sombre (Tailwind: gray-800)
        text_light: '#FFFFFF', // Texte sur fonds sombres
        text_medium: '#6B7280', // Texte moyen (Tailwind: gray-500)
        border_color: '#D1D5DB', // Bordure grise (Tailwind: gray-300)
        font: 'Inter, Roboto, sans-serif', // Police principale
        secondary_font: 'Open Sans, sans-serif',
        heading_font: 'Inter, Roboto Slab, serif', // Police pour titres
        base_size: '16px',
        border_radius: '0.375rem' // Correspond à rounded-md de Tailwind
    },
    header: { style: { position: 'fixed', height: '60px', z_index: 1000, background_color: '#FFFFFF', box_shadow: '0 2px 4px rgba(0,0,0,0.1)' } },
    navigation: { links: [{ id: `link_${Date.now()}`, text: 'Accueil', url: '#' }] },
    pages: [],
    footer: { style: { padding: '20px', text_align: 'center', background_color: '#F9FAFB' }, copyright_text: `© ${new Date().getFullYear()} Mon Site` },
});

// --- RENOMMEZ LA FONCTION PRINCIPALE ---
function AppContentPage() {
    const [rootConfig, setRootConfig] = useState<RootConfig>({
        'mon_site': createDefaultSiteConfig()
    });
    const [currentSiteKey, setCurrentSiteKey] = useState<string>(Object.keys(rootConfig)[0] || 'mon_site');
    const [activeTab, setActiveTab] = useState<string>('site-info');
    const [generatedJsonString, setGeneratedJsonString] = useState<string | null>(null);

    // --- Callback Handlers (INTÉGRALEMENT COPIÉS DE VOTRE VERSION ORIGINALE) ---
    const handleSiteKeyChange = useCallback((newKey: string) => {
        const trimmedKey = newKey.trim();
        if (!trimmedKey) {
             toast.warn("La clé de site ne peut pas être vide.");
             return;
        }
        if (trimmedKey === currentSiteKey) return;
        if (rootConfig[trimmedKey]) {
            toast.error(`La clé de site "${trimmedKey}" existe déjà.`);
            return;
        }
        setRootConfig(prevRootConfig => {
            const currentData = prevRootConfig[currentSiteKey];
            const { [currentSiteKey]: _, ...rest } = prevRootConfig;
            return { ...rest, [trimmedKey]: currentData ?? createDefaultSiteConfig() };
        });
        setCurrentSiteKey(trimmedKey);
        setGeneratedJsonString(null);
    }, [currentSiteKey, rootConfig]);

    const handleGlobalConfigChange = useCallback(<K extends keyof SingleSiteConfig>(
        section: K,
        updatedData: SingleSiteConfig[K]
    ) => {
        setRootConfig(prevRootConfig => {
            const currentSiteData = prevRootConfig[currentSiteKey] ?? createDefaultSiteConfig();
            return {
                ...prevRootConfig,
                [currentSiteKey]: { ...currentSiteData, [section]: updatedData }
            };
        });
        setGeneratedJsonString(null);
    }, [currentSiteKey]);

    const handlePagesUpdate = useCallback((updatedPages: PageConfig[]) => {
        handleGlobalConfigChange('pages', updatedPages);
    }, [handleGlobalConfigChange]);

    const handleAddComponentToPage = useCallback((pageId: string, componentType: string) => {
        const newComponentId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const baseData: BaseComponentConfig = { id: newComponentId, type: componentType };
        let newComponent: MainContentComponent;
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
            default:
                newComponent = { ...baseData } as MainContentComponent;
                break;
        }
        setRootConfig(prevRootConfig => {
            const site = prevRootConfig[currentSiteKey];
            if (!site || !Array.isArray(site.pages)) return prevRootConfig;
            const updatedPages = site.pages.map(page =>
                page.id === pageId ? { ...page, components: [...(page.components || []), newComponent] } : page
            );
            return { ...prevRootConfig, [currentSiteKey]: { ...site, pages: updatedPages } };
        });
        setGeneratedJsonString(null);
        toast.info(`Composant '${getFriendlyNameForComponentType(componentType)}' ajouté.`);
    }, [currentSiteKey]);

    const handleComponentChange = useCallback((pageId: string, updatedComponentData: MainContentComponent) => {
         setRootConfig(prevRootConfig => {
            const site = prevRootConfig[currentSiteKey];
            if (!site || !Array.isArray(site.pages)) return prevRootConfig;
            const updatedPages = site.pages.map(page =>
                page.id === pageId ? { ...page, components: (page.components || []).map(comp => comp.id === updatedComponentData.id ? updatedComponentData : comp) } : page
            );
             return { ...prevRootConfig, [currentSiteKey]: { ...site, pages: updatedPages } };
        });
         setGeneratedJsonString(null);
    }, [currentSiteKey]);

    const handleComponentDelete = useCallback((pageId: string, componentId: string) => {
         setRootConfig(prevRootConfig => {
            const site = prevRootConfig[currentSiteKey];
             if (!site || !Array.isArray(site.pages)) return prevRootConfig;
             const updatedPages = site.pages.map(page =>
                page.id === pageId ? { ...page, components: (page.components || []).filter(comp => comp.id !== componentId) } : page
            );
             return { ...prevRootConfig, [currentSiteKey]: { ...site, pages: updatedPages } };
        });
        setGeneratedJsonString(null);
        toast.success("Composant supprimé.");
    }, [currentSiteKey]);

    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
    }, []);

    const generateFullJson = useCallback(() => {
        try {
            if (!rootConfig[currentSiteKey]) throw new Error(`Configuration pour "${currentSiteKey}" non trouvée.`);
            const jsonString = JSON.stringify({ [currentSiteKey]: rootConfig[currentSiteKey] }, null, 2);
            setGeneratedJsonString(jsonString);
            toast.success("JSON généré");
        } catch (error) {
            const errorMessage = `Erreur: ${error instanceof Error ? error.message : String(error)}`;
            setGeneratedJsonString(errorMessage);
            toast.error("Erreur lors de la génération du JSON.");
        }
    }, [rootConfig, currentSiteKey]);

    const handleDownloadJson = useCallback(() => {
        if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) {
            toast.warn("Générez un JSON valide d'abord."); return;
        }
        saveAs(new Blob([generatedJsonString], { type: "application/json;charset=utf-8" }), `${currentSiteKey}_config.json`);
        toast.info("Téléchargement JSON lancé.");
    }, [generatedJsonString, currentSiteKey]);

    const handleCopyJson = useCallback(() => {
        if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) {
            toast.warn("Générez un JSON valide d'abord."); return;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(generatedJsonString)
                .then(() => toast.success("JSON copié dans le presse-papiers !"))
                .catch(() => toast.error("La copie automatique a échoué."));
        } else {
            try {
                const ta = document.createElement("textarea"); ta.value = generatedJsonString; ta.style.position = "fixed";
                document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy');
                document.body.removeChild(ta); toast.success("JSON copié ! (fallback)");
            } catch { toast.error("La copie a échoué."); }
        }
    }, [generatedJsonString]);

    const handleDownloadZip = useCallback(() => {
        if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) {
            toast.warn("Générez un JSON valide d'abord."); return;
        }
        if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
            toast.error("Erreur: Librairies JSZip/FileSaver absentes."); return;
        }
        const zip = new JSZip();
        zip.file(`${currentSiteKey}_config.json`, generatedJsonString);
        zip.generateAsync({ type: "blob" })
            .then((content: Blob) => {
                saveAs(content, `${currentSiteKey}_template.zip`);
                toast.info("Téléchargement du ZIP lancé.");
            })
            .catch(() => toast.error("Erreur lors de la création du fichier ZIP."));
    }, [generatedJsonString, currentSiteKey]);

    const currentSiteData = rootConfig[currentSiteKey] || createDefaultSiteConfig();

    // --- RENDER ACTIVE TAB CONTENT (DOIT ÊTRE DANS LE COMPOSANT) ---
    const renderActiveTabContent = () => {
        const commonProps = {
             siteData: currentSiteData.site,
             themeData: currentSiteData.theme,
             headerData: currentSiteData.header,
             navData: currentSiteData.navigation,
             footerData: currentSiteData.footer,
             pagesData: Array.isArray(currentSiteData.pages) ? currentSiteData.pages : []
        };
        switch (activeTab) {
            case 'site-info':
                return <SiteInfoForm siteData={commonProps.siteData} siteKey={currentSiteKey} onChange={(data) => handleGlobalConfigChange('site', data)} onSiteKeyChange={handleSiteKeyChange} />;
            case 'theme':
                return <ThemeConfigForm themeData={commonProps.themeData} onChange={(data) => handleGlobalConfigChange('theme', data)} />;
            case 'header-nav':
                return <CombinedHeaderNavConfigForm headerData={commonProps.headerData} navData={commonProps.navData} onHeaderChange={(data) => handleGlobalConfigChange('header', data)} onNavChange={(data) => handleGlobalConfigChange('navigation', data)} />;
            case 'footer':
                return <FooterConfigForm footerData={commonProps.footerData} onChange={(data) => handleGlobalConfigChange('footer', data)} />;
            case 'pages-components':
                return <PageManager pagesData={commonProps.pagesData} onPagesUpdate={handlePagesUpdate} onAddComponent={handleAddComponentToPage} onComponentChange={handleComponentChange} onComponentDelete={handleComponentDelete} />;
            case 'output':
                return (
                    <fieldset className="form-section output-section p-4 border border-gray-200 rounded-lg shadow-sm">
                        <legend className="text-lg font-semibold text-gray-700 px-2 mb-3 flex items-center">
                            <FaCode className="mr-2 text-blue-500" /> Sortie JSON & Export
                        </legend>
                        <p className="text-sm text-gray-600 mb-4">Cliquez sur "Générer JSON" pour voir le résultat ci-dessous.</p>
                        <div className="form-actions output-actions space-y-3 sm:space-y-0 sm:space-x-3 flex flex-wrap items-center">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm inline-flex items-center transition duration-150 ease-in-out">
                                <FaSyncAlt className="mr-2 h-4 w-4" /> Générer JSON
                            </button>
                            <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md shadow-sm inline-flex items-center transition duration-150 ease-in-out disabled:opacity-50" onClick={handleCopyJson} disabled={!generatedJsonString || generatedJsonString.startsWith("Erreur:")}>
                                <FaCopy className="mr-2 h-4 w-4" /> Copier JSON
                            </button>
                            <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md shadow-sm inline-flex items-center transition duration-150 ease-in-out disabled:opacity-50" onClick={handleDownloadJson} disabled={!generatedJsonString || generatedJsonString.startsWith("Erreur:")}>
                                <FaDownload className="mr-2 h-4 w-4" /> Télécharger JSON
                            </button>
                            <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md shadow-sm inline-flex items-center transition duration-150 ease-in-out disabled:opacity-50" onClick={handleDownloadZip} disabled={!generatedJsonString || generatedJsonString.startsWith("Erreur:")}>
                                <FaFileArchive className="mr-2 h-4 w-4" /> Télécharger ZIP
                            </button>
                            <Link
                                to="/generate-template" // Assurez-vous que cette route existe et est gérée par votre Layout global
                                className={`bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-sm inline-flex items-center transition duration-150 ease-in-out ${!generatedJsonString || generatedJsonString.startsWith("Erreur:") ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                onClick={(e) => { if (!generatedJsonString || generatedJsonString.startsWith("Erreur:")) { e.preventDefault(); toast.warn("Veuillez d'abord générer un JSON valide."); }}}
                            >
                                <FaCogsIcon className="mr-2 h-4 w-4" /> Générer Template Web
                            </Link>
                        </div>
                        <div className="json-output-wrapper mt-6">
                            <div className="json-preview-container bg-gray-900 text-gray-50 p-4 rounded-md border border-gray-700 max-h-96 overflow-auto shadow-inner">
                                <pre id="outputJson" className="text-xs whitespace-pre-wrap break-all">{generatedJsonString ?? "Cliquez sur 'Générer/Actualiser JSON' pour afficher."}</pre>
                            </div>
                        </div>
                    </fieldset>
                );
            default: return <div className="p-4 bg-red-100 text-red-700 rounded-md shadow">Onglet non reconnu (ID: {activeTab})</div>;
        }
    };

    // --- Main Render ---
    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            <Sidebar /> {/* Votre Sidebar ici */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* <Header /> */} {/* Décommentez si vous avez un Header/Topbar distinct */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    <ToastContainer position="bottom-right" autoClose={3000} theme="colored" hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

                    <div className="max-w-7xl mx-auto"> {/* Conteneur pour limiter la largeur si besoin */}
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                Générateur JSON de Template Web
                            </h1>
                            <Link
                                to="/dashboard"
                                className="hidden sm:inline-flex items-center text-sm text-blue-600 hover:text-blue-800 group font-medium"
                            >
                                <FaArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Retour au Dashboard
                            </Link>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 -mt-4">Configurez votre site étape par étape pour générer le fichier JSON de configuration.</p>


                        <div className="bg-white shadow-xl rounded-lg">
                            <GlobalConfigTabs activeTab={activeTab} onTabChange={handleTabChange} />
                            <form id="webTemplateForm" onSubmit={(e) => { e.preventDefault(); generateFullJson(); }} className="p-4 sm:p-6">
                                <div className="tab-content-container">
                                    {renderActiveTabContent()}
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AppContentPage; // Exportez avec le nom de fonction que vous avez choisi