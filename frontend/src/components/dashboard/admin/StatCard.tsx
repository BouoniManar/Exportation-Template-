// frontend/src/components/dashboard/admin/StatCard.tsx
import React from 'react';
import { IconType } from 'react-icons';

// Définition des types pour les props du StatCard
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconColor?: string; // Classes pour la couleur de l'icône ET son fond. Ex: "text-blue-500 bg-blue-100"
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  cardClassName?: string; // Classes supplémentaires pour le conteneur de la carte
  description?: string; // Optionnel: une petite description ou un contexte
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon, // Renommer la prop 'icon' en 'Icon' pour l'utiliser comme composant
  iconColor = 'text-blue-500 bg-blue-100 dark:text-blue-400 dark:bg-blue-900', // Couleur par défaut avec support dark mode
  trend,
  trendValue,
  cardClassName = 'bg-white dark:bg-boxdark shadow-default', // Classes par défaut pour le style TailAdmin
  description,
}) => {
  // Classes de base pour le conteneur de la carte, inspirées de TailAdmin
  // Vous pouvez ajuster 'border-stroke' et 'dark:border-strokedark' selon votre config Tailwind
  const baseCardStyles = "rounded-lg border border-stroke px-4 py-6 dark:border-strokedark";

  const finalCardClasses = `${baseCardStyles} ${cardClassName}`.trim();

  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg className="fill-meta-3 dark:fill-green-400" width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0845L4.35716 10.0845L4.35716 2.47737Z" fill=""/>
        </svg>
      );
    }
    if (trend === 'down') {
      return (
        <svg className="fill-meta-5 dark:fill-red-400" width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.64284 7.58453L9.09102 4.23203L10 5.11578L5 10.0619L0 5.11578L0.908973 4.23203L4.35716 7.58453L4.35716 0L5.64284 0L5.64284 7.58453Z" fill=""/>
        </svg>
      );
    }
    return null;
  };

  const getTrendTextColor = () => {
    if (trend === 'up') return 'text-meta-3 dark:text-green-400'; // text-green-500
    if (trend === 'down') return 'text-meta-5 dark:text-red-400'; // text-red-500
    return 'text-gray-500 dark:text-gray-400'; // text-neutral-500
  };

  return (
    <div className={finalCardClasses}>
      <div className={`flex h-11.5 w-11.5 items-center justify-center rounded-full ${iconColor} mb-4`}>
        {/* L'icône est rendue ici. Assurez-vous que la classe iconColor contient bien une couleur pour l'icône (ex: text-blue-500)
            et une couleur de fond (ex: bg-blue-100) */}
        <Icon className="fill-current" size={22} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</span>
        </div>

        {trend && trendValue && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${getTrendTextColor()}`}
          >
            {trendValue}
            {getTrendIcon()}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 truncate">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCard;