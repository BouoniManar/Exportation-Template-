// src/components/dashboard/StatCard.tsx
import React from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconColor?: string; // Couleur de l'icône elle-même (ex: text-green-500)
  // On n'a plus besoin de bgColor si l'icône n'est plus dans un cercle
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'text-gray-600', // Couleur par défaut un peu plus foncée
}) => {
  const IconComponent = icon as React.ElementType;

  if (!IconComponent) return null; // Ne rien rendre si pas d'icône

  return (
    // Carte principale: padding réduit, ombre légère, coins arrondis
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      {/* Titre: petit, gris, majuscules, espacement dessous */}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      {/* Conteneur pour l'icône et la valeur: alignés horizontalement */}
      <div className="flex items-center space-x-3"> {/* Espace entre icône et valeur */}
         {/* Icône: couleur et taille ajustées */}
        <IconComponent className={`h-6 w-6 ${iconColor} flex-shrink-0`} aria-hidden="true"/>
         {/* Valeur: grande, grasse */}
        <p className="text-2xl font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;