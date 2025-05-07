// src/components/dashboard/ActionCardMinimal.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Pour rendre la carte cliquable
import { IconType } from 'react-icons';

interface ActionCardMinimalProps {
  title: string;
  linkTo: string;
  icon: IconType;
  iconColor?: string;
}

const ActionCardMinimal: React.FC<ActionCardMinimalProps> = ({
  title,
  linkTo,
  icon,
  iconColor = 'text-gray-600',
}) => {
  const navigate = useNavigate();
  const IconComponent = icon as React.ElementType;

  if (!IconComponent) return null;

  return (
    // Carte cliquable avec hover effect
    <div
      onClick={() => navigate(linkTo)} // Navigation au clic
      className="bg-white p-4 rounded-lg shadow border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      {/* Icône en haut */}
      <div className="mb-3"> {/* Espace sous l'icône */}
        <IconComponent className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
      </div>
      {/* Titre */}
      <h2 className="text-base font-semibold text-gray-700 truncate">{title}</h2>
      {/* Optionnel: Barre décorative en bas */}
      <div className="mt-4 h-1 bg-indigo-500 rounded-full"></div> {/* Barre de couleur */}
    </div>
  );
};

export default ActionCardMinimal;