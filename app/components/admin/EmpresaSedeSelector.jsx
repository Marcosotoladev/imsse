// app/components/admin/EmpresaSedeSelector.jsx
'use client';

import Link from 'next/link';

// Datos para completar el bloque "cliente" del documento a partir de la Empresa y Sede elegidas.
// La "Persona de contacto" no sale de acá: se escribe a mano en el formulario.
export function datosClienteDesdeSeleccion(empresa, sede) {
  return {
    empresa: empresa?.razonSocial || '',
    cuit: empresa?.cuit || '',
    direccion: sede ? (sede.direccion || '') : (empresa?.direccionPrincipal || ''),
    sedeNombre: sede?.nombreObra || '',
    email: empresa?.emailPrincipal || '',
    telefono: empresa?.telefono || ''
  };
}

// Vincula un documento a una Empresa + Sede. Qué contactos lo ven lo deciden sus accesos.
// onChange recibe { empresaId, sedeId, empresa, sede, datosCliente }.
export default function EmpresaSedeSelector({ empresas = [], empresaId = '', sedeId = '', cargando = false, onChange }) {
  const empresa = empresas.find((e) => e.id === empresaId) || null;
  const sedes = empresa?.sedes || [];

  const emitir = (nuevaEmpresaId, nuevaSedeId) => {
    const e = empresas.find((x) => x.id === nuevaEmpresaId) || null;
    const s = e?.sedes?.find((x) => x.id === nuevaSedeId) || null;
    onChange({
      empresaId: e?.id || '',
      sedeId: s?.id || null,
      empresa: e,
      sede: s,
      datosCliente: datosClienteDesdeSeleccion(e, s)
    });
  };

  const select = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Empresa *</label>
          <select value={empresaId || ''} onChange={(e) => emitir(e.target.value, null)} className={select} disabled={cargando}>
            <option value="">{cargando ? 'Cargando empresas...' : 'Seleccionar empresa...'}</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.razonSocial}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Sede</label>
          <select
            value={sedeId || ''}
            onChange={(e) => emitir(empresaId, e.target.value || null)}
            className={select}
            disabled={!empresa}
          >
            <option value="">Dirección principal{empresa?.direccionPrincipal ? ` — ${empresa.direccionPrincipal}` : ''}</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.nombreObra || 'Sede sin nombre'}{s.direccion ? ` — ${s.direccion}` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {!cargando && empresas.length === 0 && (
        <p className="mt-2 text-sm text-yellow-600">
          No hay empresas cargadas.{' '}
          <Link href="/admin/empresas" className="underline hover:text-yellow-800">Crear empresa aquí</Link>
        </p>
      )}
    </div>
  );
}
