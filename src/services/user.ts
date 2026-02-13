import api from "@/lib/axios";
import type { UserDb } from "@/types";

/**
 * ==============================
 * GET ALL USERS
 * ==============================
 */
export async function getAllUsers(): Promise<UserDb[]> {
  try {
    const res = await api.get("/users");
    return res.data.data as UserDb[];
  } catch (error: any) {
    console.error("Error fetching all users:", error);
    throw new Error(
      error.response?.data?.message || "Gagal mengambil data user."
    );
  }
}

/**
 * ==============================
 * UPDATE DATA USER
 * ==============================
 */
export async function updateUser(user: Partial<UserDb>): Promise<boolean> {
  if (!user.id) throw new Error("User ID is required for update.");

  try {
    await api.put(`/users/${user.id}`, {
      nama: user.nama,
      role: user.role,
      lokasi: user.lokasi,
    });
    return true;
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw new Error(
      error.response?.data?.message || "Gagal memperbarui user."
    );
  }
}

/**
 * ==============================
 * DELETE USER (OPTIONAL)
 * ==============================
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await api.delete(`/users/${id}`);
    return true;
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error(
      error.response?.data?.message || "Gagal menghapus user."
    );
  }
}

/**
 * ==============================
 * APPROVE USER
 * ==============================
 */
export async function approveUser(id: string): Promise<boolean> {
  try {
    await api.put(`/users/${id}/approve`);
    return true;
  } catch (error: any) {
    console.error("Error approving user:", error);
    throw new Error(
      error.response?.data?.message || "Gagal approve user."
    );
  }
}

/**
 * ==============================
 * REJECT USER
 * ==============================
 */
export async function rejectUser(id: string): Promise<boolean> {
  try {
    await api.put(`/users/${id}/reject`);
    return true;
  } catch (error: any) {
    console.error("Error rejecting user:", error);
    throw new Error(
      error.response?.data?.message || "Gagal reject user."
    );
  }
}

/**
 * ==============================
 * ACTIVATE USER (SETELAH APPROVED)
 * ==============================
 */
export async function activateUser(id: string): Promise<boolean> {
  try {
    await api.put(`/users/${id}/activate`);
    return true;
  } catch (error: any) {
    console.error("Error activating user:", error);
    throw new Error(
      error.response?.data?.message || "Gagal mengaktifkan user."
    );
  }
}

/**
 * ==============================
 * DEACTIVATE USER
 * ==============================
 */
export async function deactivateUser(id: string): Promise<boolean> {
  try {
    await api.put(`/users/${id}/deactivate`);
    return true;
  } catch (error: any) {
    console.error("Error deactivating user:", error);
    throw new Error(
      error.response?.data?.message || "Gagal menonaktifkan user."
    );
  }
}