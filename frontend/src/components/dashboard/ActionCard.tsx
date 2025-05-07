// src/components/dashboard/ActionCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IconType } from 'react-icons';

interface ActionCardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: IconType;
  iconColor?: string; // ex: 'text-blue-500'
  buttonText: string;
  buttonColor?: string; // ex: 'bg-blue-500 hover:bg-blue-600'
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  linkTo,
  icon,
  iconColor = 'text-gray-600',
  buttonText,
  buttonColor = 'bg-indigo-600 hover:bg-indigo-700'
}) => {
  const IconComponent = icon as React.ElementType;

  if (!IconComponent) return null;

  return (
    // Carte principale: flex-col pour empiler, h-full pour essayer d'avoir la même hauteur (dans un grid)
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* En-tête de la carte: icône + titre */}
      <div className="flex items-center mb-3"> {/* items-center pour aligner verticalement icone et titre */}
        <IconComponent className={`h-7 w-7 mr-3 flex-shrink-0 ${iconColor}`} aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      </div>
      {/* Description: prend l'espace restant */}
      <p className="text-gray-600 mb-5 flex-grow text-sm"> {/* Taille de texte ajustée */}
         {description}
      </p>
      {/* Bouton: mt-auto le pousse en bas */}
      <Link
        to={linkTo}
        className={`block w-full text-center ${buttonColor} text-white font-semibold py-2 px-4 rounded transition-colors duration-300 mt-auto`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default ActionCard;