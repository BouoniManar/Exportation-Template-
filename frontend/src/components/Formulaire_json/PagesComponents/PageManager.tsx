// src/components/PagesComponents/PageManager.tsx
import React, { useCallback } from 'react';
import { PageConfig, PageManagerProps, MainContentComponent } from '../../../types'// Adjust path if needed
import PageEditor from './PageEditor'; // Import the individual page editor component
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
const PageManager: React.FC<PageManagerProps> = ({
    pagesData = [], // Provide a default empty array to prevent errors if undefined
    onPagesUpdate,
    onAddComponent,
    onComponentChange,
    onComponentDelete
}) => {

    // --- Handlers for Page List Management ---

    /**
     * Adds a new blank page configuration to the list.
     */
    const handleAddPage = useCallback(() => {
        const newPageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newPage: PageConfig = {
            id: newPageId,
            page_name: `Nouvelle Page ${pagesData.length + 1}`, // Default name based on count
            page_slug: `nouvelle-page-${pagesData.length + 1}`, // Default slug
            components: [], // Start with no components
            options: {},    // Start with no specific options
        };
        // Call the parent's update function with the new array including the added page
        onPagesUpdate([...pagesData, newPage]);
    }, [pagesData, onPagesUpdate]); // Dependencies: pagesData (for length) and onPagesUpdate

    /**
     * Removes a page from the list based on its ID.
     * Note: Confirmation logic is typically handled within the PageEditor component before calling this.
     */
    const handleDeletePage = useCallback((pageIdToDelete: string) => {
        // Filter out the page with the matching ID
        const updatedPages = pagesData.filter((page: PageConfig) => page.id !== pageIdToDelete);
        // Call the parent's update function with the filtered array
        onPagesUpdate(updatedPages);
    }, [pagesData, onPagesUpdate]); // Dependencies: pagesData and onPagesUpdate

    /**
     * Updates the metadata (name, slug, options) of a specific page in the list.
     */
    const handlePageMetadataUpdate = useCallback((updatedPage: PageConfig) => {
        // Map through the existing pages, replacing the one with the matching ID
        const updatedPages = pagesData.map((page: PageConfig) =>
            page.id === updatedPage.id ? updatedPage : page
        );
        // Call the parent's update function with the updated array
        onPagesUpdate(updatedPages);
    }, [pagesData, onPagesUpdate]); // Dependencies: pagesData and onPagesUpdate


    // --- Props pass-through for component actions within a Page ---
    // These functions simply relay the call to the parent (App.tsx),
    // adding no extra logic here. The parent holds the state logic for components.

    const handleAddComponentToPage = useCallback((pageId: string, componentType: string) => {
        onAddComponent(pageId, componentType);
    }, [onAddComponent]);

    const handleComponentUpdate = useCallback((pageId: string, updatedComponent: MainContentComponent) => {
        onComponentChange(pageId, updatedComponent);
    }, [onComponentChange]);

    const handleComponentDeletion = useCallback((pageId: string, componentId: string) => {
        onComponentDelete(pageId, componentId);
    }, [onComponentDelete]);


    // --- Rendering ---
    return (
        // Use a fieldset for semantic grouping of the page management section
        <fieldset className="form-section page-manager-section">
            <legend><i className="fas fa-copy"></i> Pages & Contenu</legend>

            {/* Container for the list of PageEditor components */}
            <div id="pages-container">
                {pagesData.length > 0 ? (
                    // If there are pages, map over them and render a PageEditor for each
                    pagesData.map((page) => (
                        <PageEditor
                            key={page.id} // Essential React key prop
                            pageData={page} // Pass the data for this specific page
                            onChange={handlePageMetadataUpdate} // Function to update this page's metadata
                            onDelete={handleDeletePage}       // Function to delete this page
                            onAddComponent={handleAddComponentToPage} // Function to add a component *to* this page
                            onComponentChange={handleComponentUpdate} // Function when a component *within* this page changes
                            onComponentDelete={handleComponentDeletion} // Function to delete a component *from* this page
                            // Consider adding index prop if implementing Drag & Drop: index={index}
                        />
                    ))
                ) : (
                    // Display a message if no pages have been created yet
                    <p className="no-pages-message">
                        Aucune page créée pour le moment. Cliquez sur "Ajouter une Page" pour commencer.
                    </p>
                )}
            </div>

            {/* Section containing the button to add a new page */}
            <div className="add-page-section">
                <button
                    type="button"
                    id="addPageBtn"
                    className="button-add" // Use consistent button styling
                    onClick={handleAddPage} // Call the handler to add a new page
                >
                    <i className="fas fa-plus"></i> Ajouter une Page
                </button>
            </div>
        </fieldset>
    );
};

export default PageManager;