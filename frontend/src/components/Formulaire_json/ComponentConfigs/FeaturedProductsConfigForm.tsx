// src/components/ComponentConfigs/FeaturedProductsConfigForm.tsx
import React, { useCallback } from 'react';
// Assurez-vous d'importer ProductItem
import { FeaturedProductsConfigFormProps, FeaturedProductsComponentConfig, ProductItem } from '../../../types';
import '../GlobalConfig/Forms.css';
import '../PagesComponents/PagesComponents.css';
import '../../../styles.css';
// Helper (peut être externalisé)
const updateNestedPropFP = ( config: FeaturedProductsComponentConfig, path: Array<string | number>, value: any ): FeaturedProductsComponentConfig => { /* ... (comme avant) ... */ const newConfig = JSON.parse(JSON.stringify(config)); let current = newConfig; for(let i = 0; i < path.length - 1; i++) { const key = path[i]; if(current[key] === undefined || current[key] === null) { current[key] = (typeof path[i+1] === 'number') ? [] : {}; } if (typeof current[key] !== 'object') { console.warn(`Reset path ${key}`); current[key] = {}; } current = current[key]; } if (typeof current === 'object' && current !== null) { current[path[path.length - 1]] = value; } else { console.error("Cannot set prop:", current, "at key:", path[path.length - 1]); } return newConfig; }

const FeaturedProductsConfigForm: React.FC<FeaturedProductsConfigFormProps> = ({ config, onChange }) => {

    const handleInputChange = useCallback((path: Array<string | number>, value: any) => {
        const newConfig = updateNestedPropFP(config, path, value);
        onChange(newConfig);
    }, [config, onChange]);

    const handleProductChange = useCallback((productId: string, field: keyof ProductItem, value: any) => {
        const productIndex = (config.products || []).findIndex(p => p.id === productId);
        if (productIndex === -1) return;
        // Utilise le helper pour cibler la propriété dans le bon produit du tableau
        const newConfig = updateNestedPropFP(config, ['products', productIndex, field], value);
        onChange(newConfig);
    }, [config, onChange]);

    const handleAddProduct = useCallback(() => { /* ... (inchangé) ... */
        const newProductId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newProduct: ProductItem = { id: newProductId, name: 'Nouveau Produit', price: '0.00 DT', description: '' }; // Ajout desc vide
        const newProducts = [...(config.products || []), newProduct];
        onChange({ ...config, products: newProducts });
    }, [config, onChange]);

     const handleRemoveProduct = useCallback((productIdToRemove: string) => { /* ... (inchangé) ... */
         const newProducts = (config.products || []).filter(p => p.id !== productIdToRemove);
         onChange({ ...config, products: newProducts });
     }, [config, onChange]);


    return (
        <div className="component-body">
            {/* Titre Section */}
            <div className="form-group">
                <label>Titre de la Section:</label>
                <input type="text" value={config.title ?? ''} onChange={(e) => handleInputChange(['title'], e.target.value)} />
            </div>

            <hr />
            {/* Liste des Produits */}
            <div className="repeatable-list products-list">
                 <h6>Produits:</h6>
                 {(config.products || []).map(product => (
                     <div key={product.id} className="repeatable-item product-item-config">
                         <div className="form-row">
                             <div className="form-group">
                                <label>Nom:</label>
                                <input type="text" value={product.name ?? ''} onChange={(e) => handleProductChange(product.id, 'name', e.target.value)} />
                             </div>
                              <div className="form-group">
                                <label>Prix:</label>
                                <input type="text" value={product.price ?? ''} onChange={(e) => handleProductChange(product.id, 'price', e.target.value)} placeholder="ex: 22.000 DT"/>
                             </div>
                         </div>
                         {/* --- AJOUT DES CHAMPS MANQUANTS --- */}
                          <div className="form-group">
                             <label>Description:</label>
                             <textarea value={product.description ?? ''} onChange={(e) => handleProductChange(product.id, 'description', e.target.value)} rows={2}/>
                          </div>
                           <div className="form-row">
                              <div className="form-group">
                                 <label>Prix Original (si promo):</label>
                                 <input type="text" value={product.original_price ?? ''} onChange={(e) => handleProductChange(product.id, 'original_price', e.target.value)} placeholder="ex: 30.000 DT"/>
                              </div>
                               <div className="form-group">
                                 <label>Texte Promo (ex: -20%):</label>
                                 <input type="text" value={product.discount ?? ''} onChange={(e) => handleProductChange(product.id, 'discount', e.target.value)} placeholder="ex: -15%"/>
                              </div>
                           </div>
                           {/* --- FIN AJOUT --- */}
                         <div className="form-row">
                             <div className="form-group">
                                  <label>Image (URL/Relatif):</label>
                                  <input type="text" value={product.image ?? ''} onChange={(e) => handleProductChange(product.id, 'image', e.target.value)} placeholder="https://... ou chemin/image.png"/>
                              </div>
                         </div>
                         <button type="button" className="button-remove remove-repeatable-item-btn" onClick={() => handleRemoveProduct(product.id)}><i className="fas fa-times"></i></button>
                     </div>
                 ))}
            </div>
            <button type="button" className="button-add add-repeatable-item-btn" onClick={handleAddProduct}><i className="fas fa-plus"></i> Ajouter Produit</button>
        </div>
    );
};

export default FeaturedProductsConfigForm;