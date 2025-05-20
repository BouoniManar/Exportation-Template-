// src/types.ts

// =========================================
// Reusable Basic Types & Interfaces
// =========================================

/**
 * Interface réutilisable pour les objets de style CSS.
 */
export interface StyleConfig {
    // Layout & Box Model
    display?: string;
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    top?: string | number; right?: string | number; bottom?: string | number; left?: string | number;
    width?: string | number; height?: string | number; min_width?: string | number; min_height?: string | number;
    max_width?: string | number; max_height?: string | number; padding?: string | number; margin?: string | number;
    margin_top?: string | number; margin_bottom?: string | number; margin_left?: string | number; margin_right?: string | number;
    overflow?: string; overflow_y?: string; z_index?: number; flex_basis?: string | number; flex_grow?: number;
    flex_shrink?: number; align_items?: string; justify_content?: string; gap?: string | number;
    flex_direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'; flex_wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    text_align?: 'left' | 'right' | 'center' | 'justify'; object_fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    grid_template_columns?: string; // For grid layouts
  
    // Appearance
    background?: string; background_color?: string; background_image?: string; background_size?: string; background_position?: string;
    color?: string; border?: string; border_top?: string; border_right?: string; border_bottom?: string; border_left?: string;
    border_radius?: string | number; box_shadow?: string; opacity?: number;
  
    // Typography
    font_family?: string; font_size?: string | number; font_weight?: string | number; line_height?: string | number;
    letter_spacing?: string | number; text_decoration?: string; text_transform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  
    // Other
    cursor?: string; transition?: string;
  
    [key: string]: any; // Allow flexibility, but try to define specific keys
  }
  
  /** Configuration pour un bouton ou un lien stylé en bouton */
  export interface ButtonConfig {
      text?: string;
      url?: string;
      style?: StyleConfig;
  }
  export interface  CombinedHeaderNavConfigFormProps {
    headerData: HeaderData;
    navData: NavigationConfig;
    // On a besoin de siteData si on veut afficher le logo dans un aperçu futur
    // ou pour le helper image_src si le logo vient du headerData
    // siteData: SiteInfo;
    onHeaderChange: (newHeaderData: HeaderData) => void;
    onNavChange: (newNavData: NavigationConfig) => void;
  }
  /** Configuration pour un lien de navigation simple */
  export interface NavLink {
      id: string; // Unique ID for React list keys
      text?: string;
      url?: string;
      active?: boolean;
  }
  
  /** Configuration pour une image */
  export interface ImageConfig {
      src?: string; // URL or relative path (should contain '/' not '\')
      local_src?: string; // Original filename if uploaded locally (for ZIP tracking)
      alt?: string;
      style?: StyleConfig;
  }
  
  // =========================================
  // Configuration Sections (Site, Theme, Header, Nav, Footer)
  // =========================================
  export interface GeneratedTemplateResponse {
  id: number;
  user_id: number; // Si vous le retournez du backend (utile pour l'admin, mais pas forcément pour l'utilisateur)
  template_name: string;
  json_data: string; // Le JSON source original
  // file_path n'est généralement pas exposé directement au client pour la sécurité
  // L'URL de téléchargement sera gérée par un endpoint dédié.
  description?: string | null; // Peut être null ou non présent
  created_at: string; // ou Date si vous le transformez côté client
}

// Optionnel: Si votre backend renvoie le contenu JSON parsé dans la liste des templates
export interface GeneratedTemplateWithParsedJson extends Omit<GeneratedTemplateResponse, 'json_data'> {
  json_data: Record<string, any>; // ou un type plus spécifique pour votre JSON
}
export interface TemplateGenerationResult { // Assurez-vous que 'export' est là
    blob: Blob;
    filename: string;
    server_file_path?: string;
}

export interface SavedProjectResponse { 
    id: number;
    user_id: number;        // Si retourné par le backend
    name: string;             // Le nom du projet/template sauvegardé
    description?: string | null;
    created_at: string;       // ou Date
    source_json_file_id?: number | null;
}

export interface SaveGeneratedProjectPayload { // Assurez-vous que 'export' est là
    name: string;
    server_file_path: string; // Doit correspondre à ce que le backend attend pour les métadonnées
    json_config_snapshot: string;
    description?: string | null;
    source_json_file_id?: number;
}
// Pour la création/sauvegarde, si vous envoyez des données spécifiques
// (note: le fichier ZIP est envoyé via FormData, pas dans le corps JSON de cette requête)
export interface SaveTemplatePayload {
  template_name: string;
  json_config: string; // Le JSON en tant que chaîne de caractères
  description?: string;
}
  export interface SiteInfo {
      title?: string;
      logo_url?: string;
      logo_text?: string;
      restaurant_logo_url?: string; // Specific logo (e.g., Chaneb's own logo)
      image_source_base?: string; // Base path for resolving local images (needs '/' separators)
  }
  
  export interface ThemeConfig {
      primary_color?: string; secondary_color?: string; accent_color?: string;
      background_light?: string; background_white?: string;
      text_dark?: string; text_light?: string; text_medium?: string; border_color?: string;
      font?: string; secondary_font?: string; heading_font?: string;
      base_size?: string; border_radius?: string;
      theme_mode?: 'light' | 'dark' | 'auto';
  }
  
  export interface HeaderIconConfig {
      id: string; // Unique ID for list management
      name: string; // Identifier (e.g., 'search', 'cart')
      icon?: string; // Icon representation (emoji, class name, etc.)
      url?: string;
  }
  
  export interface AnnouncementBarConfig {
      text?: string;
      style?: StyleConfig;
  }
  
  export interface HeaderData {
      style?: StyleConfig;
      // --- Elements from different examples ---
      announcement_bar?: AnnouncementBarConfig; // Masmoudi
      main_header_style?: StyleConfig; // Masmoudi row
      logo_style?: StyleConfig;
      icons_style?: StyleConfig; // Masmoudi icons container
      icons?: HeaderIconConfig[]; // Masmoudi icons list
      account_link?: ButtonConfig; // Masmoudi account
      login_button?: ButtonConfig; // Chaneb login
      hamburger_icon_style?: StyleConfig; // Cristallum
      user_icon_style?: StyleConfig; // Cristallum
      logo_position?: 'center' | 'center-left'; // Cristallum layout option
  }
  
  export interface NavigationConfig {
      style?: StyleConfig;
      menu_button_text?: string | null;
      links?: NavLink[]; // Main nav links
      // Sub-navigation (Masmoudi)
      sub_navigation_style?: StyleConfig;
      sub_links?: NavLink[];
  }
  
  export interface FooterData {
      style?: StyleConfig;
      copyright_text?: string;
      text_style?: StyleConfig; // Style for copyright text
      links?: NavLink[]; // Optional footer links
  }
  
  // =========================================
  // Main Content Components Configuration
  // =========================================
  
  /** Base interface for all page components */
  export interface BaseComponentConfig {
      readonly id: string; // Unique ID generated client-side, read-only after creation
      readonly type: string; // Component type identifier, read-only after creation
      style?: StyleConfig; // Optional common styling for the component's wrapper
  }
  
  // --- Specific Component Config Interfaces ---
  
  export interface HeroComponentConfig extends BaseComponentConfig {
      type: 'hero';
      text_content?: {
          style?: StyleConfig;
          title?: { text?: string; style?: StyleConfig };
          subtitle?: string;
          button?: ButtonConfig;
      };
      image?: ImageConfig;
  }
  
  export interface ProductItem {
       id: string; // Unique ID for list management
       name?: string;
       description?: string;
       price?: string;
       original_price?: string;
       discount?: string;
       image?: string; // URL or relative path from JSON (needs '/')
       local_image?: string; // Filename for local upload tracking
       // Chaneb-specific card styles
       style?: StyleConfig;
       image_style?: StyleConfig;
       text_container_style?: StyleConfig;
       name_style?: StyleConfig;
       desc_style?: StyleConfig;
       price_container_style?: StyleConfig;
       price_style?: StyleConfig;
       original_price_style?: StyleConfig;
       discount_badge_style?: StyleConfig;
       add_button_style?: StyleConfig;
  }
  
  export interface FeaturedProductsComponentConfig extends BaseComponentConfig {
      type: 'featured_products';
      title?: string;
      title_style?: StyleConfig;
      product_grid_style?: StyleConfig; // Grid container style
      products?: ProductItem[];
      // Masmoudi-specific global styles for cards
      product_card_style?: StyleConfig;
      product_image_style?: StyleConfig;
      product_name_style?: StyleConfig;
      product_price_style?: StyleConfig;
  }
  
  export interface TextBlockComponentConfig extends BaseComponentConfig {
      type: 'text_block';
      title?: string;
      content?: string; // Can contain simple text or markdown/html
  }
  
  export interface GalleryImageItem {
       id: string; // Unique ID
       src?: string; // URL or relative path
       local_src?: string; // Filename for local upload
       alt?: string;
       style?: StyleConfig;
  }
  export interface GalleryComponentConfig extends BaseComponentConfig {
      type: 'gallery';
      title?: string;
      title_style?: StyleConfig;
      gallery_style?: StyleConfig; // Style for the grid container
      images?: GalleryImageItem[];
  }
  
  export interface CardItem {
       id: string; // Unique ID
       image?: ImageConfig;
       title?: string;
       title_style?: StyleConfig; // Specific title style for this card
       text?: string;
       text_style?: StyleConfig; // Specific text style for this card
       button?: ButtonConfig;
       link_url?: string; // Alternative to button if the whole card links
       style?: StyleConfig; // Style for the card item itself
  }
  export interface CardGridComponentConfig extends BaseComponentConfig {
      type: 'card_grid';
      title?: string; // Optional title for the whole section
      title_style?: StyleConfig;
      grid_container_style?: StyleConfig; // Style for the grid (columns, gap)
      card_style?: StyleConfig; // Default style applied to all cards (can be overridden by card.style)
      cards?: CardItem[];
  }
  
  // -- Restaurant Specific Components --
  export interface AddressBannerComponentConfig extends BaseComponentConfig {
      type: 'address_banner'; // Chaneb
      text?: string;
      text_style?: StyleConfig;
      address_input?: { prompt?: string; button_text?: string; style?: StyleConfig; input_style?: StyleConfig; button_style?: StyleConfig; }
  }
  export interface RestaurantInfoBannerComponentConfig extends BaseComponentConfig {
      type: 'restaurant_info_banner'; // Chaneb
      logo_style?: StyleConfig;
      details?: { title?: string; title_style?: StyleConfig; badge?: { text?: string; style?: StyleConfig }; quick_info?: { style?: StyleConfig; items?: { icon?: string; text?: string }[]; } }
  }
  // Sub-types for MenuLayout
  export interface MenuLayoutSidebarLinkItem extends NavLink {} // Reuse NavLink, maybe add specific props later
  export interface MenuLayoutProductSection { id: string; title?: string; icon?: string; style?: StyleConfig; title_style?: StyleConfig; title_icon_style?: StyleConfig; item_container_style?: StyleConfig; products?: ProductItem[]; }
  export interface MenuLayoutComponentConfig extends BaseComponentConfig {
      type: 'menu_layout'; // Chaneb
      sidebar?: { style?: StyleConfig; title?: string; title_style?: StyleConfig; links?: MenuLayoutSidebarLinkItem[]; link_style?: StyleConfig; active_link_style?: StyleConfig; link_hover_style?: StyleConfig; };
      main_area?: { style?: StyleConfig; search_bar?: { placeholder?: string; style?: StyleConfig; input_style?: StyleConfig; button_style?: StyleConfig; }; product_sections?: MenuLayoutProductSection[]; };
      cart_summary?: { style?: StyleConfig; title?: string; title_style?: StyleConfig; empty_cart?: { icon_url?: string; icon_style?: StyleConfig; message?: string; message_style?: StyleConfig; }; cost_summary_note?: { icon?: string; text?: string; style?: StyleConfig; } }
  }
  export interface PageHeaderComponentConfig extends BaseComponentConfig {
      type: 'page_header'; // Cristallum
      title?: string; title_style?: StyleConfig; rating_info?: { style?: StyleConfig; rating?: { value?: number; count?: string; style?: StyleConfig; }; ranking?: { text?: string; style?: StyleConfig; }; }
  }
  export interface BreadcrumbLinkItem { text?: string; url?: string; active?: boolean; }
  export interface BreadcrumbComponentConfig extends BaseComponentConfig {
      type: 'breadcrumb'; // Cristallum
      links?: BreadcrumbLinkItem[];
  }
  export interface InfoDetailItem { id: string; icon?: string; text?: string; }
  export interface InfoDetailsComponentConfig extends BaseComponentConfig {
      type: 'info_details'; // Cristallum
      title?: string; title_style?: StyleConfig; items?: InfoDetailItem[]; item_style?: StyleConfig;
  }
  export interface AddressDetailsComponentConfig extends BaseComponentConfig {
      type: 'address_details'; // Cristallum
      title?: string; title_style?: StyleConfig; address?: { icon?: string; text?: string; style?: StyleConfig; };
  }
  export interface CtaAddPhotoComponentConfig extends BaseComponentConfig {
      type: 'cta_add_photo'; // Cristallum
      button?: ButtonConfig;
  }
  
  // --- Union Type for ALL possible components ---
  export type MainContentComponent = BaseComponentConfig & (
      HeroComponentConfig |
      FeaturedProductsComponentConfig |
      TextBlockComponentConfig |
      GalleryComponentConfig |
      CardGridComponentConfig | // Added CardGrid
      // Restaurant Specific
      AddressBannerComponentConfig |
      RestaurantInfoBannerComponentConfig |
      MenuLayoutComponentConfig |
      PageHeaderComponentConfig |
      BreadcrumbComponentConfig |
      InfoDetailsComponentConfig |
      AddressDetailsComponentConfig |
      CtaAddPhotoComponentConfig
      // Add other component config types here
  );
  
  
  // =========================================
  // Page & Root Configuration Structure
  // =========================================
  
  /** Configuration pour une seule page */
  export interface PageConfig {
      id: string;
      page_name: string;
      page_slug?: string;
      options?: { is_homepage?: boolean; has_breadcrumb?: boolean; has_sidebar?: boolean; };
      components: MainContentComponent[]; // Liste des composants pour cette page
  }
  
  /** Structure complète pour UN site/template dans le JSON final */
  export interface SingleSiteConfig {
      site: SiteInfo;
      theme: ThemeConfig;
      header: HeaderData;
      navigation: NavigationConfig;
      pages: PageConfig[]; // Contient maintenant toutes les pages et leurs composants
      footer: FooterData;
  }
  
  /** Structure racine du fichier JSON */
  export interface RootConfig {
      [siteKey: string]: SingleSiteConfig;
  }
  
  // =========================================
  // Props Interfaces for React Form Components
  // =========================================
  
  // --- Global Config Forms ---
  export interface SiteInfoFormProps { siteData: SiteInfo; onChange: (newData: SiteInfo) => void; siteKey: string; onSiteKeyChange: (newKey: string) => void; }
  export interface ThemeConfigFormProps { themeData: ThemeConfig; onChange: (newData: ThemeConfig) => void; }
  export interface HeaderConfigFormProps { headerData: HeaderData; onChange: (newHeaderData: HeaderData) => void; }
  export interface NavConfigFormProps { navData: NavigationConfig; onChange: (newNavData: NavigationConfig) => void; }
  export interface FooterConfigFormProps { footerData: FooterData; onChange: (newFooterData: FooterData) => void; }
  export interface LinkListEditorProps { links: NavLink[]; onChange: (newLinks: NavLink[]) => void; listKey: string; allowActiveState?: boolean; }
  
  // --- Pages & Components Management ---
  export interface PageEditorProps { pageData: PageConfig; onChange: (updatedPageData: PageConfig) => void; onDelete: (pageId: string) => void; onAddComponent: (pageId: string, componentType: string) => void; onComponentChange: (pageId: string, updatedComponentData: MainContentComponent) => void; onComponentDelete: (pageId: string, componentId: string) => void; }
  export interface PageManagerProps { pagesData: PageConfig[]; onPagesUpdate: (updatedPagesData: PageConfig[]) => void; onAddComponent: (pageId: string, componentType: string) => void; onComponentChange: (pageId: string, updatedComponentData: MainContentComponent) => void; onComponentDelete: (pageId: string, componentId: string) => void; }
  export interface ComponentEditorProps { componentData: MainContentComponent; onChange: (updatedComponentData: MainContentComponent) => void; onDelete: (componentId: string) => void; }
  // ComponentSelector n'a pas besoin de type de props complexes ici, mais pourrait si besoin
  
  // --- Specific Component Config Forms ---
  export interface HeroConfigFormProps { config: HeroComponentConfig; onChange: (newConfig: HeroComponentConfig) => void; }
  export interface FeaturedProductsConfigFormProps { config: FeaturedProductsComponentConfig; onChange: (newConfig: FeaturedProductsComponentConfig) => void; }
  export interface TextBlockConfigFormProps { config: TextBlockComponentConfig; onChange: (newConfig: TextBlockComponentConfig) => void; }
  export interface GalleryConfigFormProps { config: GalleryComponentConfig; onChange: (newConfig: GalleryComponentConfig) => void; }
  export interface CardGridConfigFormProps { config: CardGridComponentConfig; onChange: (newConfig: CardGridComponentConfig) => void; }
  export interface AddressBannerConfigFormProps { config: AddressBannerComponentConfig; onChange: (newConfig: AddressBannerComponentConfig) => void; }
  export interface RestaurantInfoBannerConfigFormProps { config: RestaurantInfoBannerComponentConfig; onChange: (newConfig: RestaurantInfoBannerComponentConfig) => void; }
  export interface MenuLayoutConfigFormProps { config: MenuLayoutComponentConfig; onChange: (newConfig: MenuLayoutComponentConfig) => void; }
  export interface PageHeaderConfigFormProps { config: PageHeaderComponentConfig; onChange: (newConfig: PageHeaderComponentConfig) => void; }
  export interface BreadcrumbConfigFormProps { config: BreadcrumbComponentConfig; onChange: (newConfig: BreadcrumbComponentConfig) => void; }
  export interface InfoDetailsConfigFormProps { config: InfoDetailsComponentConfig; onChange: (newConfig: InfoDetailsComponentConfig) => void; }
  export interface AddressDetailsConfigFormProps { config: AddressDetailsComponentConfig; onChange: (newConfig: AddressDetailsComponentConfig) => void; }
  export interface CtaAddPhotoConfigFormProps { config: CtaAddPhotoComponentConfig; onChange: (newConfig: CtaAddPhotoComponentConfig) => void; }