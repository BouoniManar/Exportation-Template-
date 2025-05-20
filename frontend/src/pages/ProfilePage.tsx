// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, User } from '../context/AuthContext'; // Importer User
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserEdit, FaLock, FaCamera, FaSave, FaSpinner } from 'react-icons/fa';
import api from '../services/api'; // Assurez-vous que votre instance api est configurée

// --- IMPORT LAYOUT COMPONENTS ---
import Sidebar from '../components/layout/Sidebar';
import { Link } from 'react-router-dom';
const API_BASE_URL = "http://127.0.0.1:8001"; 

interface ProfileFormData {
    name: string;
}
interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

const ProfilePage: React.FC = () => {
    // setUser est maintenant disponible depuis useAuth() grâce à la modification du contexte
    const { user, isLoading: authLoading, token, refreshUserData, setUser } = useAuth();

    console.log("PROFILE PAGE RENDER - User from context:", JSON.stringify(user));
    const [isSubmittingName, setIsSubmittingName] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    console.log("PROFILE PAGE RENDER - User from context:", JSON.stringify(user)); 
    const [profileForm, setProfileForm] = useState<ProfileFormData>({ name: '' });
    const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [lastUploadedAvatarLocalUrl, setLastUploadedAvatarLocalUrl] = useState<string | null>(null);
    const avatarFileRef = useRef<HTMLInputElement>(null);

  console.log("[useEffect ProfilePage] Triggered. User:", JSON.stringify(user), "isUploadingAvatar:", isUploadingAvatar);
  useEffect(() => {
 
  if (user) {
        setProfileForm({ name: user.name || '' });

        // Si nous sommes en train d'uploader, avatarPreview est déjà géré par
        // URL.createObjectURL() dans handleAvatarChange pour l'aperçu immédiat.
        // On ne touche pas à avatarPreview ici pour éviter d'écraser l'aperçu blob.
        if (isUploadingAvatar) {
            console.log("[useEffect ProfilePage] Currently uploading, avatarPreview not changed by useEffect.");
            return; 
        }

        // Si nous ne sommes PAS en train d'uploader (l'upload est terminé ou c'est le chargement initial)
        // Alors, la source de vérité pour l'avatar est user.avatarUrl (mis à jour par refreshUserData).
        console.log("[useEffect ProfilePage] Not uploading. Setting avatarPreview from user.avatarUrl:", user.avatarUrl);
        setAvatarPreview(user.avatarUrl || null); // user.avatarUrl est la valeur relative (ex: /static/...)

    } else if (!authLoading) {
        setProfileForm({ name: '' });
        setAvatarPreview(null);
    }
// Enlever lastUploadedAvatarLocalUrl des dépendances si on ne l'utilise plus ici.
}, [user, authLoading, isUploadingAvatar]);


    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    // Tes fonctions handleNameSubmit et handlePasswordSubmit restent telles quelles pour l'instant,
    // mais elles devraient aussi appeler api.put(...) au lieu de simulations.
    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            toast.error("Le nom ne peut pas être vide."); return;
        }
        if (user && profileForm.name === user.name) {
            toast.info("Aucun changement détecté pour le nom."); return;
        }
        setIsSubmittingName(true);
        try {
            // VRAI APPEL API POUR LE NOM
            // Assurez-vous que votre API /api/users/me (PUT) renvoie l'utilisateur mis à jour
            const response = await api.put<User>('/api/users/me', { name: profileForm.name });
            if (response.data) {
                // Pas besoin de setUser ici si refreshUserData met à jour depuis le serveur
            }
            await refreshUserData(); // Pour s'assurer que tout est synchronisé
            toast.success("Nom mis à jour avec succès !");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour du nom.");
        } finally {
            setIsSubmittingName(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas."); return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères."); return;
        }
        setIsSubmittingPassword(true);
        try {
            // VRAI APPEL API POUR LE MOT DE PASSE
            await api.put('/api/users/me/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            // Pas besoin de refreshUserData si le token ne change pas et que /me/password ne renvoie pas le user
            // Mais si votre backend invalide le token ou en renvoie un nouveau, vous devrez gérer cela.
            toast.success("Mot de passe mis à jour avec succès !");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour du mot de passe.");
        } finally {
            setIsSubmittingPassword(false);
        }
    };

      
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("L'image est trop grande (max 2MB).");
                if (avatarFileRef.current) avatarFileRef.current.value = '';
                return;
            }

            const localPreviewUrl = URL.createObjectURL(file);
            setAvatarPreview(localPreviewUrl); // Aperçu local immédiat
            setIsUploadingAvatar(true);
            setLastUploadedAvatarLocalUrl(null); // Réinitialiser pour le moment

            try {
                const formData = new FormData();
                formData.append('avatar', file);

                // --- VRAI APPEL API ---
                // Typage de la réponse : User. L'API doit renvoyer l'objet User mis à jour.
                const response = await api.post<User>('/api/users/me/avatar', formData);
                // --- FIN VRAI APPEL API ---

                // L'erreur "Property 'avatarUrl' does not exist on type '{}'" devrait disparaître
                // car response.data est maintenant de type User (ou undefined si l'appel échoue avant)
                if (response.data && response.data.avatarUrl) {
                    // Mise à jour optimiste de l'état utilisateur dans le contexte
                    if (setUser) { // setUser vient du AuthContext
                        setUser(prevUser => prevUser ? { ...prevUser, avatarUrl: response.data.avatarUrl } : null);
                    }
                    // Mettre à jour lastUploadedAvatarLocalUrl avec l'URL du serveur pour que l'useEffect
                    // utilise cette URL persistée (qui devrait être la même que dans response.data.avatarUrl)
                    setLastUploadedAvatarLocalUrl(response.data.avatarUrl);
                }
                
                // Rafraîchir les données depuis le serveur pour assurer la cohérence finale.
                // Ceci est important si d'autres informations utilisateur ont pu changer
                // ou pour confirmer que l'avatarUrl est bien celui que le serveur connaît maintenant.
                await refreshUserData(); 

                toast.success("Avatar mis à jour avec succès !");

            } catch (error: any) {
                console.error("Erreur upload avatar:", error);
                // En cas d'erreur, revenir à l'avatar précédent stocké dans user (ou au défaut)
                setAvatarPreview(user?.avatarUrl || '/images/default-avatar.png'); 
                setLastUploadedAvatarLocalUrl(null); // Effacer l'URL locale car l'upload a échoué
                toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour de l'avatar.");
            } finally {
                setIsUploadingAvatar(false);
                if (avatarFileRef.current) avatarFileRef.current.value = '';
                // Optionnel: si localPreviewUrl est différent de response.data.avatarUrl (improbable si succès),
                // on pourrait vouloir le révoquer, mais c'est complexe.
                // if (localPreviewUrl && (!response || !response.data || localPreviewUrl !== response.data.avatarUrl)) {
                //   URL.revokeObjectURL(localPreviewUrl);
                // }
            }
        }
    };

    // Le reste de votre JSX de retour
    if (authLoading) { /* ... */ }
    if (!user) { /* ... */ }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">Gérer le Profil</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 self-start">Photo de Profil</h2>
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4">
                              <img
                                     key={user?.avatarUrl || avatarPreview || Date.now()} // Une clé qui change force le re-montage
                                    src={
                                        avatarPreview && avatarPreview.startsWith('blob:') 
                                            ? avatarPreview // 1. Aperçu blob local (URL complète)
                                            : avatarPreview // 2. avatarPreview contient /static/... (après useEffect)
                                                ? `${API_BASE_URL}${avatarPreview}` 
                                                // 3. Fallback sur user.avatarUrl si avatarPreview est null (devrait être rare si useEffect fonctionne)
                                                : (user && user.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : '/images/default-avatar.png')
                                    }
                                    alt="Avatar de profil"
                                    className="w-full h-full rounded-full object-cover border-4 border-gray-200"
                                                                    onError={(e) => {
                                        const defaultImgPath = '/images/default-avatar.png';
                                        // S'assurer que l'image par défaut est relative au domaine du frontend
                                        const currentSrc = new URL(e.currentTarget.src);
                                        const defaultImgFullPath = new URL(defaultImgPath, window.location.origin);

                                        if (currentSrc.href !== defaultImgFullPath.href) {
                                            e.currentTarget.src = defaultImgPath;
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => avatarFileRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors"
                                    title="Changer l'avatar"
                                >
                                    {isUploadingAvatar ? <FaSpinner className="animate-spin h-5 w-5" /> : <FaCamera className="h-5 w-5" />}
                                </button>
                                <input
                                    type="file"
                                    ref={avatarFileRef}
                                    onChange={handleAvatarChange}
                                    accept="image/png, image/jpeg, image/gif"
                                    className="hidden"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Max 2MB. Formats: JPG, PNG, GIF.</p>
                        </div>

                        <div className="md:col-span-2 space-y-8">
                            {/* Formulaire Nom */}
                            <form onSubmit={handleNameSubmit} className="bg-white p-6 rounded-lg shadow-lg">
                                {/* ... Contenu du formulaire nom ... */}
                                <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                                    <FaUserEdit className="mr-3 text-blue-500" /> Informations Personnelles
                                </h2>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse Email (non modifiable)</label>
                                    <input type="email" id="email" value={user?.email || ''} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500"/>
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                    <input type="text" id="name" name="name" value={profileForm.name} onChange={handleProfileInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                </div>
                                <button type="submit" disabled={isSubmittingName || !!(user && profileForm.name === user.name)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm disabled:opacity-50 flex items-center justify-center">
                                    {isSubmittingName ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                                    Enregistrer le Nom
                                </button>
                            </form>
                            {/* Formulaire Mot de passe */}
                            <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-lg shadow-lg">
                                {/* ... Contenu du formulaire mot de passe ... */}
                                <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                                    <FaLock className="mr-3 text-blue-500" /> Changer le Mot de Passe
                                </h2>
                                <div className="mb-4">
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                    <input type="password" id="currentPassword" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                    <input type="password" id="newPassword" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                                    <input type="password" id="confirmNewPassword" name="confirmNewPassword" value={passwordForm.confirmNewPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                </div>
                                <button type="submit" disabled={isSubmittingPassword || !passwordForm.currentPassword || !passwordForm.newPassword} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm disabled:opacity-50 flex items-center justify-center">
                                    {isSubmittingPassword ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                                    Changer le Mot de Passe
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;