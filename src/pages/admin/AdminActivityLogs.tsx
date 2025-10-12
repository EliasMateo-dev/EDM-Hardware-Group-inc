import React, { useEffect, useState } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotificationStore();

  const [userMap, setUserMap] = useState<Record<string, { email: string; full_name?: string }>>({});
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // Traer logs
        const { data: logsData, error: logsError } = await supabase.rpc('get_admin_activity_logs');
        if (logsError) {
          showNotification("Error al cargar logs", "error");
          return;
        }
        setLogs(logsData || []);
        // Traer emails/nombres de usuarios únicos
        const userIds = Array.from(new Set((logsData || []).map((l: any) => l.user_id)));
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .in("id", userIds);
          const map: Record<string, { email: string; full_name?: string }> = {};
          (usersData || []).forEach((u: any) => {
            map[u.id] = { email: u.email, full_name: u.full_name };
          });
          setUserMap(map);
        }
      } catch (err) {
        console.error('fetchLogs error', err);
        showNotification('Error al cargar logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [showNotification]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registros de Actividad</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Acción</th>
              <th className="px-4 py-2 text-left">Entidad</th>
              <th className="px-4 py-2 text-left">ID Entidad</th>
              <th className="px-4 py-2 text-left">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">Cargando...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6">No hay registros</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-2 text-left whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-left">
                    {userMap[log.user_id]?.email || log.user_id}
                    {userMap[log.user_id]?.full_name ? (
                      <span className="block text-xs text-gray-500">{userMap[log.user_id].full_name}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-left">{log.action}</td>
                  <td className="px-4 py-2 text-left">{log.entity_type}</td>
                  <td className="px-4 py-2 text-left">{log.entity_id || "-"}</td>
                  <td className="px-4 py-2 text-left text-xs max-w-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.details, null, 2)}</pre>
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

export default AdminActivityLogs;
