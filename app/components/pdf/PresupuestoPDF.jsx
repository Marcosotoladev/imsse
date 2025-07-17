// components/pdf/PresupuestoPDF.js - Versión corregida para IMSSE
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos limpios y profesionales
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  
  // Header limpio
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  
  logoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  
  companyInfo: {
    flex: 1,
  },
  
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    flexDirection: 'row',
  },
  
  companyNameRed: {
    color: '#DC2626',
  },
  
  companyNameBlue: {
    color: '#2563EB',
  },
  
  companySubtitle: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: 'bold',
    marginBottom: 3,
    lineHeight: 1.2,
  },
  
  companyDetails: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.2,
  },
  
  documentSection: {
    alignItems: 'flex-end',
  },
  
  documentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },

  // Secciones principales
  mainContent: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 30,
  },
  
  leftColumn: {
    flex: 1,
  },
  
  rightColumn: {
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 60,
  },
  
  value: {
    fontSize: 9,
    color: '#1F2937',
    flex: 1,
  },

  // Tabla simple y clara
  itemsSection: {
    marginBottom: 25,
  },
  
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    minHeight: 25,
  },
  
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  
  tableCell: {
    fontSize: 9,
    color: '#1F2937',
    paddingRight: 5,
    alignSelf: 'center',
  },
  
  // Columnas de la tabla
  col50: { width: '50%' },
  col15: { width: '15%' },
  col20: { width: '20%' },
  col15: { width: '15%' },
  
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },

  // Totales simplificados
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 30,
    marginTop: 15,
  },
  
  totalRow: {
    flexDirection: 'row',
    marginBottom: 3,
    minWidth: 200,
  },
  
  totalLabel: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
    paddingRight: 10,
  },
  
  totalValue: {
    width: 80,
    fontSize: 10,
    color: '#1F2937',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  
  finalTotal: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
    minWidth: 200,
  },
  
  finalTotalLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
    paddingRight: 10,
  },
  
  finalTotalValue: {
    width: 80,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },

  // Observaciones minimalistas
  observaciones: {
    marginBottom: 20,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderLeftStyle: 'solid',
  },
  
  observacionesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 5,
  },
  
  observacionesText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.3,
  },

  // Condiciones básicas
  condiciones: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 4,
    marginBottom: 30,
  },
  
  condicionesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  condicionesText: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.2,
  },

  // Footer simple
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#9CA3AF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

export default function PresupuestoPDF({ presupuesto }) {
  // Funciones helper seguras
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '$0,00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);
    } catch (e) {
      return '';
    }
  };

  // Datos seguros con validaciones robustas
  const safePresupuesto = presupuesto || {};
  const cliente = safePresupuesto.cliente || {};
  const items = safePresupuesto.items || [];
  const observaciones = safePresupuesto.observaciones?.trim() || null;
  
  // Asegurar valores numéricos
  const subtotal = parseFloat(safePresupuesto.subtotal) || 0;
  const iva = parseFloat(safePresupuesto.iva) || 0;
  const total = parseFloat(safePresupuesto.total) || 0;
  const mostrarIva = Boolean(safePresupuesto.mostrarIva);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header limpio */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image
              style={styles.logo}
              src="/logo/imsse-logo.png"
            />
            <View style={styles.companyInfo}>
              <View style={styles.companyName}>
                <Text style={styles.companyNameRed}>IMSSE </Text>
                <Text style={styles.companyNameBlue}>INGENIERÍA </Text>
                <Text style={styles.companyNameRed}>S.A.S</Text>
              </View>
              <Text style={styles.companySubtitle}>
                Instalación y Mantenimiento de{'\n'}Sistemas de Seguridad Electrónicos
              </Text>
              <Text style={styles.companyDetails}>
                Especialistas en sistemas de protección contra incendios{'\n'}
                Certificados: Notifier | Mircom | Inim | Secutron | Bosch{'\n'}
                info@imsseingenieria.com | www.imsseingenieria.com{'\n'}
                Córdoba, Argentina
              </Text>
            </View>
          </View>
          
          <View style={styles.documentSection}>
            <Text style={styles.documentTitle}>PRESUPUESTO</Text>
          </View>
        </View>

        {/* Información principal en dos columnas */}
        <View style={styles.mainContent}>
          {/* Información del presupuesto */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>Detalles del Presupuesto</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Número:</Text>
              <Text style={styles.value}>{safePresupuesto.numero || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{formatDate(safePresupuesto.fecha)}</Text>
            </View>
          </View>

          {/* Información del cliente */}
          <View style={styles.rightColumn}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{cliente.empresa || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contacto:</Text>
              <Text style={styles.value}>{cliente.nombre || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{cliente.email || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{cliente.telefono || ''}</Text>
            </View>
            {cliente.cuit && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>CUIT:</Text>
                <Text style={styles.value}>{cliente.cuit}</Text>
              </View>
            )}
            {cliente.direccion && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{cliente.direccion}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabla de items */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Detalle de Servicios y Productos</Text>
          
          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col50]}>Descripción</Text>
            <Text style={[styles.tableHeaderText, styles.col15, styles.textCenter]}>Cant.</Text>
            <Text style={[styles.tableHeaderText, styles.col20, styles.textRight]}>Precio Unit.</Text>
            <Text style={[styles.tableHeaderText, styles.col15, styles.textRight]}>Subtotal</Text>
          </View>
          
          {/* Filas de items */}
          {items.length > 0 ? items.map((item, index) => (
            <View 
              key={item.id || index} 
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={[styles.tableCell, styles.col50]}>
                {item.descripcion || 'Sin descripción'}
              </Text>
              <Text style={[styles.tableCell, styles.col15, styles.textCenter]}>
                {parseFloat(item.cantidad) || 0} {item.unidad || 'ud.'}
              </Text>
              <Text style={[styles.tableCell, styles.col20, styles.textRight]}>
                {formatCurrency(parseFloat(item.precioUnitario) || 0)}
              </Text>
              <Text style={[styles.tableCell, styles.col15, styles.textRight]}>
                {formatCurrency(parseFloat(item.subtotal) || 0)}
              </Text>
            </View>
          )) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col50]}>No hay items</Text>
              <Text style={[styles.tableCell, styles.col15, styles.textCenter]}>-</Text>
              <Text style={[styles.tableCell, styles.col20, styles.textRight]}>-</Text>
              <Text style={[styles.tableCell, styles.col15, styles.textRight]}>-</Text>
            </View>
          )}
        </View>

        {/* Totales simplificados */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {mostrarIva && iva > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (21%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(iva)}</Text>
            </View>
          )}
          <View style={styles.finalTotal}>
            <Text style={styles.finalTotalLabel}>TOTAL:</Text>
            <Text style={styles.finalTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Observaciones solo si existen y tienen contenido */}
        {observaciones && (
          <View style={styles.observaciones}>
            <Text style={styles.observacionesTitle}>Observaciones:</Text>
            <Text style={styles.observacionesText}>{observaciones}</Text>
          </View>
        )}

        {/* Footer minimalista */}
        <Text style={styles.footer}>
          IMSSE INGENIERÍA S.A.S - info@imsseingenieria.com | www.imsseingenieria.com | Córdoba, Argentina
        </Text>
      </Page>
    </Document>
  );
}