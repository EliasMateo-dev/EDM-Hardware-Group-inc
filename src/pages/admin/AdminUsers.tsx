import React, { useEffect, useState } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
          let timer: any; const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), ms); });
          try { return await Promise.race([p, timeout]); } finally { clearTimeout(timer); }
        };
  const res: any = await withTimeout(Promise.resolve(supabase.rpc('get_all_profiles').then((r:any)=>r)));
        const { data, error } = res || {};
        if (error) { showNotification("Error al cargar usuarios", "error"); }
        else { setUsers(Array.isArray(data) ? data : []); }
      } catch (err) {
        console.error('AdminUsers fetchUsers error', err);
        try { showNotification('Error al cargar usuarios', 'error'); } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showNotification]);

  const handleToggleAdmin = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("profiles").update({ is_admin: !current }).eq("id", id);
      if (error) {
        showNotification("Error al actualizar usuario", "error");
      } else {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_admin: !current } : u));
        showNotification("Permisos actualizados", "success");
      }
    } catch (err) {
      console.error('AdminUsers handleToggleAdmin error', err);
      try { showNotification('Error al actualizar usuario', 'error'); } catch {}
    }
  };

  const adminUsers = Array.isArray(users) ? users.filter(u => u.is_admin) : [];
  const normalUsers = Array.isArray(users) ? users.filter(u => !u.is_admin) : [];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      {/* Sección de administradores */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Administradores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-6">Cargando...</td>
                </tr>
              ) : adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-6">No hay administradores</td>
                </tr>
              ) : (
                adminUsers.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-2 text-left">{u.email}</td>
                    <td className="px-4 py-2 text-left">{u.full_name || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Tabla de usuarios normales (no admins) */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6">Cargando...</td>
              </tr>
            ) : normalUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6">No hay usuarios</td>
              </tr>
            ) : (
              normalUsers.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2 text-left">{u.email}</td>
                  <td className="px-4 py-2 text-left">{u.full_name || "-"}</td>
                  <td className="px-4 py-2 text-left">
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                      className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Hacer admin
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
