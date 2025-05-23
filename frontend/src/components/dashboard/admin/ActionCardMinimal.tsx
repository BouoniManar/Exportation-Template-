// frontend/src/components/dashboard/ActionCardMinimal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IconType } from 'react-icons';
import clsx from 'clsx'; // Optionnel, pour mieux gérer les classes

export interface ActionCardMinimalProps {
  title: string;
  description: string;
  linkTo: string;
  icon: IconType;
  bgColorClass?: string;
  textColorClass?: string;
  borderColorClass?: string; // MODIFICATION: Ajouter borderColorClass comme prop optionnelle
  className?: string;
}

const ActionCardMinimal: React.FC<ActionCardMinimalProps> = ({
  title,
  description,
  linkTo,
  icon: Icon,
  bgColorClass = 'bg-slate-50 dark:bg-slate-800', // Ajout support dark mode
  textColorClass = 'text-slate-700 dark:text-slate-200', // Ajout support dark mode
  borderColorClass = 'border-slate-200 dark:border-slate-700', // Valeur par défaut pour borderColorClass
  className = '',
}) => {
  const iconContainerClasses = `flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${bgColorClass} mb-4`;
  const titleClasses = `font-semibold ${textColorClass} group-hover:text-opacity-80 transition-colors`;
  const descriptionClasses = `text-sm text-slate-500 dark:text-slate-400 mt-1`;

  // Utiliser clsx pour une meilleure gestion des classes (optionnel mais recommandé)
  const cardClasses = clsx(
    'group block p-6 rounded-lg border shadow-sm transition-all duration-200 ease-in-out hover:shadow-md dark:hover:shadow-slate-700/50',
    bgColorClass, // Fond principal de la carte
    borderColorClass, // Couleur de la bordure
    className       // Classes supplémentaires passées en prop
  );

  return (
    <Link to={linkTo} className={cardClasses}>
      <div className={iconContainerClasses}>
        <Icon className={`w-6 h-6 ${textColorClass}`} />
      </div>
      <h3 className={`text-lg ${titleClasses} mb-1`}>{title}</h3>
      <p className={descriptionClasses}>{description}</p>
    </Link>
  );
};

export default ActionCardMinimal;