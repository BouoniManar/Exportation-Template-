// src/components/dashboard/ActionCardMinimal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IconType } from 'react-icons';
import { FaArrowRight } from 'react-icons/fa'; // Gardons cette icône pour l'appel à l'action

interface ActionCardMinimalProps {
    title: string;
    description: string;
    linkTo: string;
    icon: IconType;
    iconColor?: string;
    className?: string; // Pour des styles additionnels
    bgColorClass?: string; // Pour un fond d'icône personnalisé ex: 'bg-indigo-100'
    textColorClass?: string; // Pour une couleur de texte d'icône ex: 'text-indigo-600'
}

const ActionCardMinimal: React.FC<ActionCardMinimalProps> = ({
    title,
    description,
    linkTo,
    icon: Icon,
    iconColor, // La couleur sera maintenant déterminée par textColorClass ou par défaut
    className = '',
    bgColorClass, // ex: 'bg-indigo-100'
    textColorClass  // ex: 'text-indigo-600'
}) => {
    // Définir les couleurs par défaut si non fournies
    const finalBgColorClass = bgColorClass || 'bg-slate-100';
    const finalTextColorClass = textColorClass || 'text-slate-600';

    return (
        <Link
            to={linkTo}
            className={`group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-slate-200 flex flex-col h-full ${className}`}
        >
            <div className="flex items-start mb-4"> {/* items-start pour un meilleur alignement vertical si le titre est sur plusieurs lignes */}
                <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${finalBgColorClass} mr-4 group-hover:bg-opacity-80 transition-colors`}>
                    <Icon className={`h-6 w-6 ${finalTextColorClass} transition-colors`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors mt-1"> {/* mt-1 pour un léger ajustement vertical */}
                    {title}
                </h3>
            </div>
            <p className="text-sm text-slate-500 mb-5 flex-grow line-clamp-3" title={description}> {/* line-clamp pour la description */}
                {description}
            </p>
            <div className="mt-auto text-sm font-medium text-indigo-500 group-hover:text-indigo-700 group-hover:underline flex items-center transition-colors">
                Explorer
                <FaArrowRight className="ml-1.5 h-3 w-3 transform transition-transform duration-200 group-hover:translate-x-1" />
            </div>
        </Link>
    );
};

export default ActionCardMinimal;