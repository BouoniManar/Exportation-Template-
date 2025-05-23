// src/services/userService.ts
import { User } from '../types/UserTypes';
import api from './api'; // Votre instance axios configurée
// Ou le chemin vers vos types

const ADMIN_USERS_ENDPOINT = '/admin/users';

const getAllUsers = async (params?: { skip?: number; limit?: number; isActive?: boolean; role?: string; search?: string }): Promise<User[]> => {
  const response = await api.get<User[]>(ADMIN_USERS_ENDPOINT, { params });
  return response.data;
};

const getUserById = async (userId: number): Promise<User> => {
  const response = await api.get<User>(`${ADMIN_USERS_ENDPOINT}/${userId}`);
  return response.data;
};

// AdminUserCreateData devrait correspondre à AdminUserCreatePayload du backend
interface AdminUserCreateData {
    name: string;
    email: string;
    password_new: string; // Nom différent pour éviter conflit avec champ password du login
    role?: string;
    is_active?: boolean;
}
const createUserByAdmin = async (userData: AdminUserCreateData): Promise<User> => {
  const response = await api.post<User>(ADMIN_USERS_ENDPOINT, userData);
  return response.data;
};

// AdminUserUpdateData devrait correspondre à AdminUserUpdatePayload
interface AdminUserUpdateData {
    name?: string;
    email?: string;
    role?: string;
    is_active?: boolean;
}
const updateUserByAdmin = async (userId: number, updateData: AdminUserUpdateData): Promise<User> => {
  const response = await api.put<User>(`${ADMIN_USERS_ENDPOINT}/${userId}`, updateData);
  return response.data;
};

const deleteUserByAdmin = async (userId: number): Promise<void> => {
  await api.delete(`${ADMIN_USERS_ENDPOINT}/${userId}`);
};

const toggleUserStatusByAdmin = async (userId: number, isActive: boolean): Promise<User> => {
    const response = await api.patch<User>(`${ADMIN_USERS_ENDPOINT}/${userId}/status`, { is_active: isActive });
    return response.data;
}

export default {
  getAllUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  toggleUserStatusByAdmin
};