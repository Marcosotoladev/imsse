// components/pdf/PresupuestoPDF.js
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos corporativos para PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 80,
    backgroundColor: '#ffffff'
  },
  
  // Header con logo
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#1E40AF',
    paddingBottom: 15
  },
  headerLeft: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 2
  },
  companySubtitle: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 1
  },
  companyTagline: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 8
  },
  companyContact: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.3
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end'
  },
  
  // Título del documento
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  
  // Información del presupuesto
  infoSection: {
    flexDirection: 'row',
    marginBottom: 25,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 5
  },
  infoLeft: {
    flex: 1,
    marginRight: 20
  },
  infoRight: {
    flex: 1
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 4
  },
  infoLabel: {
    fontSize: 9,
    color: '#6B7280',
    width: 80,
    fontWeight: 'bold'
  },
  infoValue: {
    fontSize: 9,
    color: '#374151',
    flex: 1
  },
  
  // Tabla de items
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    padding: 8,
    color: 'white'
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
    minHeight: 35
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB'
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'left',
    paddingVertical: 4
  },
  tableCellCenter: {
    textAlign: 'center'
  },
  tableCellRight: {
    textAlign: 'right'
  },
  
  // Columnas de la tabla
  colItem: { width: '45%' },
  colCantidad: { width: '10%' },
  colUnidad: { width: '12%' },
  colPrecio: { width: '16%' },
  colSubtotal: { width: '17%' },
  
  // Totales
  totalsContainer: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalsBox: {
    width: 250,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 5,
    border: 1,
    borderColor: '#E5E7EB'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  totalLabel: {
    fontSize: 10,
    color: '#374151'
  },
  totalValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold'
  },
  totalFinal: {
    borderTop: 2,
    borderTopColor: '#1E40AF',
    paddingTop: 8,
    marginTop: 8
  },
  totalFinalLabel: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: 'bold'
  },
  totalFinalValue: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: 'bold'
  },
  
  // Observaciones y condiciones
  observationsSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#FEF7F0',
    borderRadius: 5,
    border: 1,
    borderColor: '#FED7AA'
  },
  observationsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9A3412',
    marginBottom: 8
  },
  observationsText: {
    fontSize: 9,
    color: '#7C2D12',
    lineHeight: 1.4
  },
  
  conditionsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0F9FF',
    borderRadius: 5,
    border: 1,
    borderColor: '#BAE6FD'
  },
  conditionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 8
  },
  conditionItem: {
    fontSize: 9,
    color: '#0C4A6E',
    marginBottom: 4,
    lineHeight: 1.3
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280'
  },
  footerBold: {
    fontWeight: 'bold',
    color: '#374151'
  },
  
  // Estados
  estadoBadge: {
    padding: 6,
    borderRadius: 15,
    textAlign: 'center',
    marginBottom: 10
  },
  estadoEnviado: {
    backgroundColor: '#FEF3C7',
    color: '#92400E'
  },
  estadoAprobado: {
    backgroundColor: '#D1FAE5',
    color: '#065F46'
  },
  estadoBorrador: {
    backgroundColor: '#F3F4F6',
    color: '#374151'
  },
  estadoText: {
    fontSize: 10,
    fontWeight: 'bold'
  }
});

// Componente principal del PDF
const PresupuestoPDF = ({ presupuesto }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'enviado':
        return styles.estadoEnviado;
      case 'aprobado':
        return styles.estadoAprobado;
      case 'borrador':
        return styles.estadoBorrador;
      default:
        return styles.estadoBorrador;
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'enviado':
        return 'ENVIADO';
      case 'aprobado':
        return 'APROBADO';
      case 'borrador':
        return 'BORRADOR';
      case 'rechazado':
        return 'RECHAZADO';
      case 'vencido':
        return 'VENCIDO';
      default:
        return estado.toUpperCase();
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header con logo e información de la empresa */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Logo placeholder - reemplazar con logo real */}
            <View style={[styles.logo, { backgroundColor: '#1E40AF', borderRadius: 30 }]}>
              <Text style={{ color: 'white', fontSize: 24, textAlign: 'center', paddingTop: 15 }}>
                IMSSE
              </Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>IMSSE INGENIERÍA SAS</Text>
              <Text style={styles.companySubtitle}>Sistemas de Seguridad Contra Incendios</Text>
              <Text style={styles.companyTagline}>Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos</Text>
              <Text style={styles.companyContact}>
                Córdoba, Argentina{'\n'}
                Tel: +54 9 351 681-0777{'\n'}
                Email: info@imsseingenieria.com{'\n'}
                www.imsseingenieria.com
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.estadoBadge, getEstadoStyle(presupuesto.estado)]}>
              <Text style={styles.estadoText}>{getEstadoText(presupuesto.estado)}</Text>
            </View>
          </View>
        </View>

        {/* Título del documento */}
        <Text style={styles.documentTitle}>Presupuesto</Text>

        {/* Información del presupuesto y cliente */}
        <View style={styles.infoSection}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoTitle}>Información del Presupuesto</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Número:</Text>
              <Text style={styles.infoValue}>{presupuesto.numero}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha:</Text>
              <Text style={styles.infoValue}>{formatDate(presupuesto.fecha)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vencimiento:</Text>
              <Text style={styles.infoValue}>{formatDate(presupuesto.fechaVencimiento)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Validez:</Text>
              <Text style={styles.infoValue}>{presupuesto.validez}</Text>
            </View>
          </View>

          <View style={styles.infoRight}>
            <Text style={styles.infoTitle}>Datos del Cliente</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Empresa:</Text>
              <Text style={styles.infoValue}>{presupuesto.cliente.nombre}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contacto:</Text>
              <Text style={styles.infoValue}>{presupuesto.cliente.contacto}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{presupuesto.cliente.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{presupuesto.cliente.telefono}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{presupuesto.cliente.direccion}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CUIT:</Text>
              <Text style={styles.infoValue}>{presupuesto.cliente.cuit}</Text>
            </View>
          </View>
        </View>

        {/* Tabla de items */}
        <View style={styles.table}>
          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colItem]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, styles.colCantidad]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnidad]}>Unidad</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrecio]}>Precio Unit.</Text>
            <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
          </View>

          {/* Filas de items */}
          {presupuesto.items.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.tableRow, 
                index % 2 === 1 ? styles.tableRowAlt : null
              ]}
            >
              <View style={styles.colItem}>
                <Text style={styles.tableCell}>{item.descripcion}</Text>
                <Text style={[styles.tableCell, { fontSize: 8, color: '#6B7280', marginTop: 2 }]}>
                  Categoría: {item.categoria}
                </Text>
              </View>
              <Text style={[styles.tableCell, styles.tableCellCenter, styles.colCantidad]}>
                {item.cantidad}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellCenter, styles.colUnidad]}>
                {item.unidad}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight, styles.colPrecio]}>
                {formatCurrency(item.precioUnitario)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight, styles.colSubtotal]}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(presupuesto.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (21%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(presupuesto.iva)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalFinalLabel}>TOTAL:</Text>
              <Text style={styles.totalFinalValue}>{formatCurrency(presupuesto.total)}</Text>
            </View>
          </View>
        </View>

        {/* Observaciones */}
        {presupuesto.observaciones && (
          <View style={styles.observationsSection}>
            <Text style={styles.observationsTitle}>Observaciones</Text>
            <Text style={styles.observationsText}>{presupuesto.observaciones}</Text>
          </View>
        )}

        {/* Condiciones generales */}
        <View style={styles.conditionsSection}>
          <Text style={styles.conditionsTitle}>Condiciones Generales</Text>
          <Text style={styles.conditionItem}>
            • Este presupuesto tiene una validez de {presupuesto.validez} desde la fecha de emisión.
          </Text>
          <Text style={styles.conditionItem}>
            • Los precios incluyen IVA y están expresados en pesos argentinos.
          </Text>
          <Text style={styles.conditionItem}>
            • La instalación se realizará según normativas NFPA y estándares internacionales.
          </Text>
          <Text style={styles.conditionItem}>
            • Incluye certificación técnica y documentación de funcionamiento.
          </Text>
          <Text style={styles.conditionItem}>
            • Garantía de 12 meses sobre materiales y mano de obra.
          </Text>
          <Text style={styles.conditionItem}>
            • Forma de pago: 50% al confirmar el pedido, 50% contra entrega.
          </Text>
          <Text style={styles.conditionItem}>
            • Tiempo de entrega: 15-20 días hábiles desde la confirmación del pedido.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerBold}>IMSSE Ingeniería SAS</Text>
            <Text style={styles.footerText}>Protegiendo vidas y patrimonio desde 1994</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.footerText}>Página 1 de 1</Text>
            <Text style={styles.footerText}>
              Generado el {formatDate(new Date())}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PresupuestoPDF;