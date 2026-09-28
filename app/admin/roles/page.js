// app/admin/roles/page.js - Roles y permisos: qué documentos gestiona cada rol del personal
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, RotateCcw, Info } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import { obtenerMisPermisos } from '../../../lib/hooks/useMisPermisos';
import {
  ROLES_CONFIGURABLES, TIPOS_GESTION, ALCANCES, PERMISOS_POR_DEFECTO, SIN_PERMISO, limpiarConfig
} from '../../../lib/permisosRoles';

const RANGO = { no: 0, propios: 1, todos: 2 };
const ACCIONES_ALCANCE = [
  { key: 'ver', label: 'Ver' },
  { key: 'editar', label: 'Editar' },
  { key: 'eliminar', label: 'Eliminar' }
];

const NOTAS_TIPO = {
  plantillas: 'Hace falta "Ver" para adjuntar planillas en una Visita Técnica.'
};

const CLASE_ALCANCE = {
  todos: 'border-green-300 bg-green-50 text-green-800',
  propios: 'border-amber-300 bg-amber-50 text-amber-800',
  no: 'border-gray-300 bg-white text-gray-500'
};

const iguales = (a, b) => JSON.stringify(limpiarConfig(a)) === JSON.stringify(limpiarConfig(b));

export default function RolesYPermisos() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [rolActivo, setRolActivo] = useState('tecnico');
  const [guardados, setGuardados] = useState(null);
  const [roles, setRoles] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/admin');
        return;
      }
      try {
        const perfil = await apiService.obtenerPerfilUsuario(currentUser.uid);
        if (perfil.rol !== 'admin') {
          router.push('/admin/panel-control');
          return;
        }
        const data = await apiService.obtenerPermisosRoles();
        setGuardados(data.roles);
        setRoles(data.roles);
      } catch (error) {
        console.error('Error al cargar los permisos por rol:', error);
        alert('No se pudieron cargar los permisos. Inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !roles) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando permisos...</p>
        </div>
      </div>
    );
  }

  const matriz = roles[rolActivo] || {};
  const hayCambios = !iguales(roles, guardados);

  const setPermiso = (tipo, cambios) => {
    const actual = { ...SIN_PERMISO, ...matriz[tipo], ...cambios };
    // Editar/eliminar nunca abarcan más que ver; sin ver no se puede crear
    const tope = (valor) => (RANGO[valor] > RANGO[actual.ver] ? actual.ver : valor);
    const normalizado = {
      ...actual,
      crear: actual.ver !== 'no' && actual.crear,
      editar: tope(actual.editar),
      eliminar: tope(actual.eliminar)
    };
    setRoles({ ...roles, [rolActivo]: { ...matriz, [tipo]: normalizado } });
  };

  const restaurarDefecto = () => {
    if (!confirm(`¿Volver a los permisos por defecto de ${ROLES_CONFIGURABLES[rolActivo]}? (Se aplica al guardar.)`)) return;
    const porDefecto = Object.fromEntries(Object.keys(TIPOS_GESTION).map((tipo) => [
      tipo, { ...SIN_PERMISO, ...(PERMISOS_POR_DEFECTO[rolActivo]?.[tipo] || {}) }
    ]));
    setRoles({ ...roles, [rolActivo]: porDefecto });
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const { roles: guardadosNuevos } = await apiService.guardarPermisosRoles(roles);
      setGuardados(guardadosNuevos);
      setRoles(guardadosNuevos);
      obtenerMisPermisos({ forzar: true });
      alert('✅ Permisos guardados. Los usuarios los ven al volver a cargar la app.');
    } catch (error) {
      console.error('Error al guardar los permisos:', error);
      alert('❌ No se pudieron guardar los permisos. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl px-4 py-6 mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold font-montserrat text-primary">
              <ShieldCheck size={24} /> Roles y permisos
            </h2>
            <p className="text-gray-600">
              Qué documentos puede ver y gestionar cada rol del personal. El administrador siempre puede todo.
            </p>
          </div>
          {hayCambios && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRoles(guardados)}
                disabled={guardando}
                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={guardar}
                disabled={guardando}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary-800 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 mb-4 text-sm text-blue-800 border border-blue-200 rounded-lg bg-blue-50">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            <strong>Solo propios</strong> = los documentos que creó ese mismo usuario.
            Editar y Eliminar no pueden abarcar más que Ver.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {Object.entries(ROLES_CONFIGURABLES).map(([rol, nombre]) => (
              <button
                key={rol}
                type="button"
                onClick={() => setRolActivo(rol)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  rolActivo === rol ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {nombre}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={restaurarDefecto}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw size={13} /> Valores por defecto
          </button>
        </div>

        <div className="overflow-x-auto bg-white border border-gray-100 shadow-sm rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Documento</th>
                <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ver</th>
                <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Crear</th>
                <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Editar</th>
                <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(TIPOS_GESTION).map(([tipo, nombre]) => {
                const permiso = { ...SIN_PERMISO, ...matriz[tipo] };
                return (
                  <tr key={tipo} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{nombre}</div>
                      {NOTAS_TIPO[tipo] && <div className="text-xs text-gray-400">{NOTAS_TIPO[tipo]}</div>}
                    </td>
                    {ACCIONES_ALCANCE.slice(0, 1).map(({ key }) => (
                      <td key={key} className="px-3 py-3">
                        <SelectorAlcance valor={permiso[key]} onChange={(v) => setPermiso(tipo, { [key]: v })} />
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer accent-primary disabled:cursor-default disabled:opacity-40"
                        checked={permiso.crear}
                        disabled={permiso.ver === 'no'}
                        onChange={(e) => setPermiso(tipo, { crear: e.target.checked })}
                      />
                    </td>
                    {ACCIONES_ALCANCE.slice(1).map(({ key }) => (
                      <td key={key} className="px-3 py-3">
                        <SelectorAlcance
                          valor={permiso[key]}
                          maximo={permiso.ver}
                          onChange={(v) => setPermiso(tipo, { [key]: v })}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Empresas y sus sedes las gestionan el administrador y la secretaria; el técnico solo las consulta para
          cargar documentos. Usuarios, Roles y permisos y Suscripción son solo del administrador.
        </p>
      </div>
    </div>
  );
}

function SelectorAlcance({ valor, maximo = 'todos', onChange }) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full min-w-[8.5rem] px-2 py-1.5 text-sm border rounded-lg ${CLASE_ALCANCE[valor] || CLASE_ALCANCE.no}`}
    >
      {Object.entries(ALCANCES).map(([key, label]) => (
        <option key={key} value={key} disabled={RANGO[key] > RANGO[maximo]}>{label}</option>
      ))}
    </select>
  );
}
