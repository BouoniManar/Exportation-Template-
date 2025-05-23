// src/pages/ManageUsersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
// Assurez-vous que ce chemin est correct
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal'; // Ajustez le chemin
import { FaEdit, FaTrashAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { User } from '../../types/UserTypes';
import AdminLayout from '../../components/layout/AdminLayout';

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Renommé pour clarté
  const [error, setError] = useState<string | null>(null);

  // Pour le modal de confirmation de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false); // État de chargement pour la suppression

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const fetchedUsers = await userService.getAllUsers({ limit: 100 });
      setUsers(fetchedUsers);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erreur lors de la récupération des utilisateurs.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (userId: number) => {
    console.log(`Modifier l'utilisateur avec l'ID : ${userId}`);
    toast.info(`Fonctionnalité de modification pour l'utilisateur ${userId} à implémenter.`);
    // TODO: Implémenter la logique de modification
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true); // Activer le chargement pour la suppression
    // const toastId = toast.loading("Suppression de l'utilisateur..."); // Plus besoin si le modal a son propre indicateur

    try {
      await userService.deleteUserByAdmin(userToDelete.id);
      toast.success("Utilisateur supprimé avec succès !");
      // toast.update(toastId, { render: "Utilisateur supprimé avec succès !", type: "success", isLoading: false, autoClose: 3000 });
      setUsers(users.filter(user => user.id !== userToDelete.id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de la suppression de l'utilisateur.";
      toast.error(errorMessage); // Utiliser toast.error directement
      // toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
      console.error("Delete user error:", err);
    } finally {
      setIsDeletingUser(false); // Désactiver le chargement
      closeDeleteModal();
    }
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    const actionText = currentStatus ? "Désactivation" : "Activation";
    const toastId = toast.loading(`${actionText} de l'utilisateur...`);
    try {
      const updatedUser = await userService.toggleUserStatusByAdmin(userId, !currentStatus);
      toast.update(toastId, { render: `Statut de l'utilisateur mis à jour !`, type: "success", isLoading: false, autoClose: 3000 });
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userId ? { ...user, is_active: updatedUser.is_active } : user))
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de la mise à jour du statut.";
      toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
      console.error("Toggle active error:", err);
    }
  };

  if (isLoadingUsers) { // Utiliser le nouvel état
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-slate-700">Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Gérer les Utilisateurs</h1>
        {/* Placeholder pour bouton "Ajouter Utilisateur" */}
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nom</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rôle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Créé le</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name || <span className="italic text-slate-400">N/A</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric'}) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                  <button onClick={() => handleEditUser(user.id)} className="text-indigo-600 hover:text-indigo-800 transition-colors p-1" title="Modifier">
                    <FaEdit size={16}/>
                  </button>
                  <button onClick={() => handleToggleActive(user.id, user.is_active)} className={`${user.is_active ? 'text-yellow-500 hover:text-yellow-700' : 'text-green-500 hover:text-green-700'} transition-colors p-1`} title={user.is_active ? 'Désactiver' : 'Activer'}>
                    {user.is_active ? <FaToggleOff size={18} /> : <FaToggleOn size={18} />}
                  </button>
                  <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-800 transition-colors p-1" title="Supprimer">
                    <FaTrashAlt size={15}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && !isLoadingUsers && (
        <p className="text-center text-slate-500 py-10 text-lg">Aucun utilisateur à afficher.</p>
      )}

      {/* Modal de confirmation de suppression */}
      {userToDelete && ( // S'assurer que userToDelete n'est pas null avant de rendre le modal
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteUser}
          // La prop s'appelle templateName dans le modal, on passe le nom/email de l'utilisateur
          templateName={userToDelete.name || userToDelete.email}
          isLoading={isDeletingUser} // Passer l'état de chargement de la suppression
        />
      )}
    </div>
    </AdminLayout>
  );
};

export default ManageUsersPage;