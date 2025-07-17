This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





# 🔄 GUÍA DE MIGRACIÓN: SINCORP → IMSSE

## 📋 **CONTEXTO DEL PROYECTO**

**Situación actual**: Tengo una aplicación completa funcionando para **Sincorp** (sistema de presupuestos) con todas las funcionalidades: crear, editar, ver, eliminar, PDF, Firebase, etc.

**Objetivo**: Adaptar todo el código de Sincorp para **IMSSE** (empresa de sistemas contra incendios) manteniendo la misma funcionalidad pero cambiando branding, datos y estructura específica.

**Enfoque**: NO recrear desde cero, sino **adaptar archivo por archivo** el código existente de Sincorp.

---

## 🏢 **DATOS DE LAS EMPRESAS**

### **SINCORP (Original)**
- **Nombre**: Sincorp Servicios Integrales
- **Email**: sincorpserviciosintegrales@gmail.com
- **Teléfono**: (351) 681 0777
- **Web**: www.sincorp.vercel.app
- **CUIT**: 20-24471842-7
- **Dirección**: Av. Luciano Torrent 4800, 5000 - Córdoba
- **Colores**: Azul (#0891B2) y variantes
- **Logo**: Base64 (muy largo)

### **IMSSE (Destino)**
- **Nombre**: IMSSE INGENIERÍA S.A.S
- **Nombre completo**: Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos
- **Email**: info@imsseingenieria.com
- **Web**: www.imsseingenieria.com
- **Ubicación**: Córdoba, Argentina
- **Especialidad**: Sistemas de protección contra incendios desde 1994
- **Certificaciones**: Notifier | Mircom | Inim | Secutron | Bosch
- **Colores**: Rojo (#DC2626) y Celeste (#2563EB)
- **Logo**: `/logo/imsse-logo.png` (archivo real)

---

## 🎨 **CAMBIOS DE BRANDING**

### **Colores a cambiar**
```css
/* SINCORP → IMSSE */
#0891B2 (azul Sincorp) → #DC2626 (rojo IMSSE)
#06B6D4 (azul claro) → #EF4444 (rojo claro)
bg-primary → bg-primary (pero primary ahora es rojo)
text-blue-800 → text-primary
bg-blue-600 → bg-primary
hover:bg-blue-700 → hover:bg-red-700
```

### **Textos del Header**
```javascript
// SINCORP
<h1>Panel de Administración</h1>

// IMSSE  
<h1>IMSSE - Panel de Administración</h1>
```

### **Logo y Empresa en PDFs**
```javascript
// SINCORP (base64 largo)
<div className="flex items-center justify-center w-8 h-10 font-bold text-white bg-blue-800 rounded">S</div>
<div className="text-2xl font-bold">
  <span className="text-blue-800">Sin</span>
  <span className="text-blue-500">corp</span>
</div>

// IMSSE (archivo real + colores específicos)
<img src="/logo/imsse-logo.png" alt="IMSSE Logo" className="w-8 h-8 mr-3" />
<div className="text-2xl font-bold">
  <span className="text-red-600">IMSSE </span>
  <span className="text-blue-500">INGENIERÍA </span>
  <span className="text-red-600">S.A.S</span>
</div>
```

---

## 📊 **ESTRUCTURA DE DATOS - CAMBIOS IMPORTANTES**

### **Presupuestos - Evolución de Sincorp a IMSSE**
```javascript
// SINCORP (Original)
{
  numero: 'P-2025-0144',
  validez: '15 días',
  notas: 'Texto libre...',
  cliente: {
    nombre: '',
    empresa: '',
    email: '',
    telefono: ''
  },
  subtotal: 100,
  total: 100,  // Sin IVA separado
  estado: 'Pendiente'
}

// IMSSE (Versión final adaptada)
{
  numero: 'PRES-2024-001',
  fecha: Date,
  // ❌ SIN validez, SIN fechaVencimiento - REMOVIDOS
  observaciones: 'Texto libre...', // Cambió 'notas' por 'observaciones'
  cliente: {
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    cuit: '',        // Campo nuevo
    direccion: ''    // Campo nuevo
  },
  items: [{
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0,
    categoria: 'deteccion'  // Campo nuevo
  }],
  subtotal: 100,
  iva: 21,          // Campo nuevo - OPCIONAL
  total: 121,       // subtotal + iva (si está habilitado)
  mostrarIva: false, // Campo para controlar si incluir IVA
  estado: 'pendiente' // Solo 3 estados
}
```

### **Estados específicos IMSSE (SIMPLIFICADOS)**
```javascript
// SOLO 3 estados válidos para IMSSE
['pendiente', 'aprobado', 'rechazado']

// Colores de estados
pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200'
aprobado: 'bg-green-100 text-green-800 border-green-200'
rechazado: 'bg-red-100 text-red-800 border-red-200'
```

### **Campos del formulario IMSSE**
```javascript
// Información del presupuesto - SOLO 2 CAMPOS
{
  numero: 'Generado automáticamente',
  fecha: 'Campo editable'
  // ❌ NO más: validez, fechaVencimiento
}

// IVA OPCIONAL con checkbox
mostrarIva: false // Por defecto SIN IVA
// Si se activa: iva = subtotal * 0.21

// Observaciones VACÍAS por defecto
observaciones: '' // El usuario puede cargar o dejar vacío
```

---

## 🔥 **ARCHIVOS YA MIGRADOS - ESTADO ACTUAL**

### ✅ **COMPLETADOS Y FUNCIONANDO PERFECTAMENTE**
1. **`lib/firebase.js`** - Configuración Firebase para IMSSE ✅
2. **`lib/firestore.js`** - Funciones CRUD adaptadas para IMSSE ✅
3. **`components/pdf/PresupuestoPDF.js`** - PDF con membrete IMSSE, sin validez/vencimiento, IVA opcional ✅
4. **`app/admin/presupuestos/page.js`** - Lista con dropdown estados, 3 estados, estadísticas ✅
5. **`app/admin/presupuestos/nuevo/page.js`** - Crear con IVA opcional, observaciones vacías, 2 campos ✅
6. **`app/admin/presupuestos/[id]/page.js`** - Ver responsive, sin botones de estado, solo lectura ✅
7. **`app/admin/presupuestos/editar/[id]/page.js`** - Editar con IVA opcional, 2 campos ✅
8. **`app/admin/dashboard/page.js`** - Dashboard con cards compactas, todos los módulos listos ✅
9. **`.env.local.example`** - Variables de entorno ✅

### ❌ **PENDIENTES DE MIGRAR (PRÓXIMOS MÓDULOS)**
1. **`app/admin/recibos/`** - Sistema de recibos/facturación
2. **`app/admin/remitos/`** - Sistema de entregas
3. **`app/admin/mantenimiento/`** - Órdenes de mantenimiento
4. **`app/admin/obras/`** - Órdenes de obra  
5. **`app/admin/recordatorios/`** - Sistema de vencimientos
6. **Sistema de autenticación** - `/admin/login`

---

## 🛠️ **PROCESO DE MIGRACIÓN POR ARCHIVO**

### **Para cada archivo de Sincorp:**

#### 1. **Cambios automáticos (buscar y reemplazar)**
```javascript
// Textos
'Sincorp' → 'IMSSE'
'sincorpserviciosintegrales@gmail.com' → 'info@imsseingenieria.com'
'(351) 681 0777' → '+54 9 351 123-4567'
'www.sincorp.vercel.app' → 'www.imsseingenieria.com'

// CSS/Colores
'bg-blue-600' → 'bg-primary'
'text-blue-800' → 'text-primary'
'hover:bg-blue-700' → 'hover:bg-red-700'

// Logo
Base64 largo → <img src="/logo/imsse-logo.png" />
```

#### 2. **Cambios estructurales específicos IMSSE**
```javascript
// Campos de datos
'notas' → 'observaciones'
// ❌ REMOVER: validez, fechaVencimiento
// ✅ AGREGAR: cuit, direccion, mostrarIva

// Estados simplificados
'Borrador' → 'pendiente'
'Enviado' → 'pendiente'  
'Aprobado' → 'aprobado'
'Rechazado' → 'rechazado'

// IVA opcional
iva: mostrarIva ? Math.round(subtotal * 0.21) : 0

// Numeración
'P-2025-0144' → 'PRES-2024-001'
```

#### 3. **Header estándar IMSSE**
```javascript
<header className="text-white shadow bg-primary">
  <div className="container flex items-center justify-between px-4 py-4 mx-auto">
    <div className="flex items-center">
      <img src="/logo/imsse-logo.png" alt="IMSSE Logo" className="w-8 h-8 mr-3" />
      <h1 className="text-xl font-bold font-montserrat">IMSSE - Panel de Administración</h1>
    </div>
    <div className="flex items-center space-x-4">
      <span className="hidden md:inline">{user?.email}</span>
      <button onClick={handleLogout} className="flex items-center p-2 text-white rounded-md hover:bg-red-700">
        <LogOut size={18} className="mr-2" /> Salir
      </button>
    </div>
  </div>
</header>
```

---

## 📱 **COMPONENTES ESPECÍFICOS IMSSE**

### **PDF Membrete IMSSE (FUNCIONANDO)**
```javascript
// Sin campos de validez/vencimiento, IVA opcional
<View style={styles.header}>
  <Image src="/logo/imsse-logo.png" style={styles.logo} />
  <View style={styles.companyName}>
    <Text style={styles.companyNameRed}>IMSSE </Text>
    <Text style={styles.companyNameBlue}>INGENIERÍA </Text>
    <Text style={styles.companyNameRed}>S.A.S</Text>
  </View>
  <Text style={styles.companySubtitle}>
    Instalación y Mantenimiento de{'\n'}Sistemas de Seguridad Electrónicos
  </Text>
</View>

// Totales con IVA opcional
{mostrarIva && iva > 0 && (
  <View style={styles.totalRow}>
    <Text>IVA (21%): {formatCurrency(iva)}</Text>
  </View>
)}
```

### **Checkbox IVA funcional**
```javascript
// Implementación que NO rompe el PDF
const [mostrarPDF, setMostrarPDF] = useState(false);

// Botón que genera PDF bajo demanda
<button onClick={() => setMostrarPDF(true)}>Ver PDF</button>

// PDF se renderiza solo cuando se necesita
{mostrarPDF && (
  <PDFDownloadLink
    document={<PresupuestoPDF presupuesto={datosLimpios} />}
    onRender={() => setMostrarPDF(false)}
  />
)}
```

---

## 🔧 **PROBLEMAS SOLUCIONADOS**

### **Error del PDF con IVA**
- **Problema**: Checkbox IVA rompía el PDF (reconciler error)
- **Solución**: PDF bajo demanda en lugar de renderizado continuo
- **Estado**: ✅ SOLUCIONADO

### **Estados simplificados**
- **Problema**: Muchos estados confusos
- **Solución**: Solo 3 estados (pendiente, aprobado, rechazado)  
- **Estado**: ✅ IMPLEMENTADO

### **Campos innecesarios**
- **Problema**: validez y fechaVencimiento eran confusos
- **Solución**: Solo número y fecha en el formulario
- **Estado**: ✅ REMOVIDOS

### **Dashboard mobile**
- **Problema**: Cards grandes difíciles en móvil
- **Solución**: Cards compactas 2x3x6 responsive
- **Estado**: ✅ MEJORADO

---

## 🎯 **METODOLOGÍA PARA NUEVOS CHATS**

### **Al empezar nuevo chat, decir:**
> "Estoy migrando una aplicación de Sincorp a IMSSE (sistemas contra incendios). Ya tengo el sistema base de presupuestos funcionando perfectamente. Necesito adaptar el siguiente módulo de Sincorp para IMSSE. Te paso la documentación de migración y el archivo que necesito adaptar."

### **Siempre proporcionar:**
1. **Esta documentación completa**
2. **El archivo específico de Sincorp** a adaptar
3. **Qué módulo es** (recibos, remitos, mantenimiento, etc.)

### **El asistente debe:**
1. **Leer la documentación** para entender el contexto
2. **Aplicar todos los cambios** de branding automáticamente
3. **Mantener la funcionalidad** igual que Sincorp
4. **Usar el estilo directo** de Firebase (sin hooks)
5. **Seguir los patrones** ya establecidos en presupuestos
6. **NO recrear desde cero** - adaptar el código existente

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Firebase ya configurado**
- `lib/firebase.js` ✅
- `lib/firestore.js` ✅  
- Variables en `.env.local` ✅

### **Estructura actual**
```
app/
├── admin/
│   ├── presupuestos/ ✅ COMPLETO
│   │   ├── page.js ✅
│   │   ├── nuevo/page.js ✅
│   │   ├── [id]/page.js ✅
│   │   └── editar/[id]/page.js ✅
│   ├── dashboard/page.js ✅
│   ├── recibos/ ❌ PENDIENTE
│   ├── remitos/ ❌ PENDIENTE
│   ├── mantenimiento/ ❌ PENDIENTE
│   ├── obras/ ❌ PENDIENTE
│   └── recordatorios/ ❌ PENDIENTE
├── components/
│   └── pdf/PresupuestoPDF.js ✅
└── lib/
    ├── firebase.js ✅
    └── firestore.js ✅
```

### **Dependencias funcionando**
```json
{
  "@react-pdf/renderer": "^4.3.0",
  "lucide-react": "^0.525.0", 
  "firebase": "^10.x.x"
}
```

---

## 📋 **CHECKLIST POR ARCHIVO**

Para cada nuevo archivo migrado, verificar:

- [ ] **Logo**: Cambiado a `/logo/imsse-logo.png`
- [ ] **Colores**: Azul Sincorp → Rojo IMSSE  
- [ ] **Textos**: Empresa, email, teléfono, web
- [ ] **Header**: Branding IMSSE completo
- [ ] **Estados**: Solo los 3 estados IMSSE si aplica
- [ ] **IVA**: Opcional si el módulo maneja montos
- [ ] **Firebase**: Funciones directas (sin hooks)
- [ ] **Responsive**: Mobile-friendly
- [ ] **Funcionalidad**: Mantiene todo igual que Sincorp

---

## 🚀 **ESTADO ACTUAL**

**Módulo completado**: ✅ **Presupuestos** (100% funcional)
- ✅ Lista con dropdown estados
- ✅ Crear con IVA opcional  
- ✅ Ver responsive
- ✅ Editar completo
- ✅ PDF profesional
- ✅ Dashboard mejorado

**Próximo módulo**: 🔶 **Recibos** (0% completado)

**Progreso general**: ~60% completado (sistema base listo)

**Archivos funcionando**: 9/14 archivos principales

---

## 🎨 **EJEMPLOS DE CÓDIGO IMSSE**

### **Formateo de moneda**
```javascript
const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return '$0,00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts.join(',');
};
```

### **Estados dropdown**
```javascript
<select
  value={item.estado || 'pendiente'}
  onChange={(e) => handleCambiarEstado(item.id, e.target.value)}
  className="px-3 py-1 pr-8 text-xs font-semibold rounded-full border cursor-pointer focus:ring-2 focus:ring-primary"
>
  <option value="pendiente">Pendiente</option>
  <option value="aprobado">Aprobado</option>
  <option value="rechazado">Rechazado</option>
</select>
```

### **IVA opcional**
```javascript
// Checkbox
<input
  type="checkbox"
  checked={presupuesto.mostrarIva || false}
  onChange={(e) => {
    const mostrarIva = e.target.checked;
    const subtotal = presupuesto.subtotal || 0;
    const iva = mostrarIva ? Math.round(subtotal * 0.21) : 0;
    const total = subtotal + iva;
    
    setPresupuesto({
      ...presupuesto,
      mostrarIva,
      iva,
      total
    });
  }}
/>
<span>Incluir IVA (21%)</span>
```

---

*Documentación actualizada: Enero 2025*  
*Proyecto: Migración Sincorp → IMSSE*  
*Estado: Sistema de presupuestos 100% completado - Listo para próximos módulos*
*Última sesión: Dashboard mejorado y sistema base funcionando perfectamente*