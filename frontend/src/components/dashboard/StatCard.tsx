// src/components/dashboard/StatCard.tsx
import React from 'react';
import { IconType } from 'react-icons';
import { FaSpinner } from 'react-icons/fa'; // Pour un spinner plus simple

interface StatCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    iconColor?: string;
    description?: string;
    isLoading?: boolean;
    trend?: 'up' | 'down' | 'neutral'; // Optionnel: pour afficher une petite flèche de tendance
    trendValue?: string; // Optionnel: la valeur de la tendance (ex: "+5%")
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    iconColor = 'text-slate-500',
    description,
    isLoading,
    trend,
    trendValue
}) => {
    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-500';
        if (trend === 'down') return 'text-red-500';
        return 'text-slate-400';
    };

    return (
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 ease-in-out border border-slate-200 flex flex-col min-h-[150px] md:min-h-[160px]"> {/* Hauteur minimale pour uniformité */}
            <div className="flex items-start justify-between mb-2"> {/* items-start pour que l'icône soit en haut */}
                <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
                <div className={`p-2.5 rounded-lg ${ // Légèrement plus grand pour l'icône
                    iconColor.includes('green') ? 'bg-green-50 text-green-600' :
                    iconColor.includes('red') ? 'bg-red-50 text-red-600' :
                    iconColor.includes('yellow') || iconColor.includes('amber') ? 'bg-amber-50 text-amber-600' :
                    iconColor.includes('blue') ? 'bg-blue-50 text-blue-600' :
                    iconColor.includes('teal') ? 'bg-teal-50 text-teal-600' :
                    iconColor.includes('purple') ? 'bg-purple-50 text-purple-600' :
                    'bg-slate-100 text-slate-600' // Cas par défaut
                }`}>
                    <Icon className="h-5 w-5" /> {/* Taille d'icône cohérente */}
                </div>
            </div>

            {isLoading ? (
                <div className="mt-1 flex-grow flex flex-col justify-center">
                    <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col justify-center"> {/* Pour centrer verticalement si pas de description */}
                    <p className="text-3xl md:text-4xl font-bold text-slate-700 mb-1 truncate" title={String(value)}>
                        {value}
                    </p>
                    {description && (
                        <p className="text-xs text-slate-400 line-clamp-2" title={description}> {/* Line-clamp pour 2 lignes */}
                            {description}
                        </p>
                    )}
                </div>
            )}

            {trend && trendValue && !isLoading && (
                <div className={`mt-auto pt-2 text-xs flex items-center ${getTrendColor()}`}>
                    {trend === 'up' && <span className="mr-1">▲</span>}
                    {trend === 'down' && <span className="mr-1">▼</span>}
                    <span>{trendValue}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;