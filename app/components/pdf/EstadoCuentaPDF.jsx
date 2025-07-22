// components/pdf/EstadoCuentaPDF.js - PDF Estado de Cuenta IMSSE
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos profesionales para PDF IMSSE
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
    paddingBottom: 10
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  companyName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  companyNameRed: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  companyNameBlue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB'
  },
  companySubtitle: {
    fontSize: 8,
    color: '#666',
    textAlign: 'left',
    maxWidth: 250,
    lineHeight: 1.2
  },
  headerInfo: {
    fontSize: 8,
    textAlign: 'right',
    color: '#666',
    lineHeight: 1.3
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  estadoNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    padding: 6,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  statusDebe: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B'
  },
  statusAFavor: {
    backgroundColor: '#D1FAE5',
    color: '#065F46'
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBlock: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  blockTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 4
  },
  field: {
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 70,
    color: '#374151',
    marginRight: 8
  },
  value: {
    fontSize: 9,
    flex: 1,
    color: '#1f2937',
    lineHeight: 1.3
  },
  tableSection: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 10,
    textAlign: 'center'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e9ecef',
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 8,
    minHeight: 20
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  col1: {
    flex: 1,
    textAlign: 'center'
  },
  col2: {
    flex: 2,
  },
  col3: {
    flex: 3,
  },
  totalSection: {
    marginTop: 15,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  totalTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151'
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  totalValueRed: {
    color: '#DC2626'
  },
  totalValueGreen: {
    color: '#059669'
  },
  totalValueGray: {
    color: '#6B7280'
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 6,
    marginTop: 6
  },
  finalTotalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  observationsSection: {
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  observationsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 6
  },
  observationsText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    fontSize: 8,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 1.3
  },
  footerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 2
  },
  certifications: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 3
  }
});

const EstadoCuentaPDF = ({ estadoCuenta }) => {
  const formatDate = (fecha) => {
    if (!fecha) return '';
    try {
      const dateObj = fecha.toDate ? fecha.toDate() : new Date(fecha);
      return dateObj.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return fecha?.toString() || '';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Funciones para obtener estilos del saldo
  const getSaldoStyle = (saldo) => {
    if (saldo > 0) return styles.statusDebe;
    if (saldo < 0) return styles.statusAFavor;
    return styles.statusBadge;
  };

  const getSaldoText = (saldo) => {
    if (saldo > 0) return 'DEBE';
    if (saldo < 0) return 'A FAVOR';
    return 'AL DÍA';
  };

  const getTotalValueStyle = (amount) => {
    if (amount > 0) return styles.totalValueRed;
    if (amount < 0) return styles.totalValueGreen;
    return styles.totalValueGray;
  };

  // Calcular totales
  const calcularTotales = () => {
    if (!estadoCuenta?.movimientos) return { totalDebe: 0, totalHaber: 0 };
    
    const totalDebe = estadoCuenta.movimientos.reduce((sum, mov) => sum + (mov.debe || 0), 0);
    const totalHaber = estadoCuenta.movimientos.reduce((sum, mov) => sum + (mov.haber || 0), 0);
    
    return { totalDebe, totalHaber };
  };

  // Datos seguros con validaciones
  const safeEstado = estadoCuenta || {};
  const { totalDebe, totalHaber } = calcularTotales();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado IMSSE */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src="/logo/imsse-logo.png" style={styles.logo} />
            <View>
              <View style={styles.companyName}>
                <Text style={styles.companyNameRed}>IMSSE </Text>
                <Text style={styles.companyNameBlue}>INGENIERÍA </Text>
                <Text style={styles.companyNameRed}>S.A.S</Text>
              </View>
              <Text style={styles.companySubtitle}>
                Instalación y Mantenimiento de{'\n'}Sistemas de Seguridad Electrónicos
              </Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text>Córdoba, Argentina</Text>
            <Text>📧 info@imsseingenieria.com</Text>
            <Text>🌐 www.imsseingenieria.com</Text>
            <Text>Especialistas desde 1994</Text>
          </View>
        </View>

        {/* Título y número */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>ESTADO DE CUENTA</Text>
          <Text style={styles.estadoNumber}>N° {safeEstado.numero || ''}</Text>
        </View>

        {/* Estado destacado */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusBadge, getSaldoStyle(safeEstado.saldoActual)]}>
            {getSaldoText(safeEstado.saldoActual)} - {formatCurrency(Math.abs(safeEstado.saldoActual || 0))}
          </Text>
        </View>

        {/* Información del estado y cliente */}
        <View style={styles.infoSection}>
          {/* Datos del período */}
          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>DATOS DEL PERÍODO</Text>
            
            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Desde:</Text>
                <Text style={styles.value}>{formatDate(safeEstado.periodo?.desde)}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Hasta:</Text>
                <Text style={styles.value}>{formatDate(safeEstado.periodo?.hasta)}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Saldo Ant:</Text>
                <Text style={styles.value}>{formatCurrency(safeEstado.saldoAnterior)}</Text>
              </View>
            </View>
          </View>

          {/* Datos del cliente */}
          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>DATOS DEL CLIENTE</Text>
            
            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Empresa:</Text>
                <Text style={styles.value}>{safeEstado.cliente?.empresa || 'No especificado'}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Contacto:</Text>
                <Text style={styles.value}>{safeEstado.cliente?.nombre || 'No especificado'}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{safeEstado.cliente?.email || 'No especificado'}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{safeEstado.cliente?.telefono || 'No especificado'}</Text>
              </View>
            </View>

            {safeEstado.cliente?.cuit && (
              <View style={styles.field}>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>CUIT:</Text>
                  <Text style={styles.value}>{safeEstado.cliente.cuit}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tabla de movimientos */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>
            DETALLE DE MOVIMIENTOS ({safeEstado.movimientos?.length || 0} movimientos)
          </Text>

          {/* Encabezado de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, { fontWeight: 'bold' }]}>FECHA</Text>
            <Text style={[styles.col1, { fontWeight: 'bold', textAlign: 'center' }]}>TIPO</Text>
            <Text style={[styles.col1, { fontWeight: 'bold', textAlign: 'center' }]}>NÚM.</Text>
            <Text style={[styles.col3, { fontWeight: 'bold' }]}>CONCEPTO</Text>
            <Text style={[styles.col1, { fontWeight: 'bold', textAlign: 'right' }]}>DEBE</Text>
            <Text style={[styles.col1, { fontWeight: 'bold', textAlign: 'right' }]}>HABER</Text>
          </View>

          {/* Filas de movimientos */}
          {(safeEstado.movimientos || []).map((movimiento, index) => (
            <View key={movimiento.id || index} style={[styles.tableRow, index % 2 === 1 ? styles.oddRow : {}]}>
              <Text style={styles.col1}>
                {formatDate(movimiento.fecha)}
              </Text>
              <Text style={[styles.col1, { textAlign: 'center', textTransform: 'capitalize' }]}>
                {movimiento.tipo?.replace('_', ' ') || '-'}
              </Text>
              <Text style={[styles.col1, { textAlign: 'center' }]}>
                {movimiento.numero || '-'}
              </Text>
              <Text style={styles.col3}>
                {movimiento.concepto || 'Sin concepto'}
              </Text>
              <Text style={[styles.col1, { textAlign: 'right', fontWeight: 'bold', color: '#DC2626' }]}>
                {movimiento.debe > 0 ? formatCurrency(movimiento.debe) : '-'}
              </Text>
              <Text style={[styles.col1, { textAlign: 'right', fontWeight: 'bold', color: '#059669' }]}>
                {movimiento.haber > 0 ? formatCurrency(movimiento.haber) : '-'}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalSection}>
          <Text style={styles.totalTitle}>RESUMEN FINANCIERO</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SALDO ANTERIOR:</Text>
            <Text style={[styles.totalValue, styles.totalValueGray]}>
              {formatCurrency(safeEstado.saldoAnterior)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL DEBE:</Text>
            <Text style={[styles.totalValue, styles.totalValueRed]}>
              {formatCurrency(totalDebe)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL HABER:</Text>
            <Text style={[styles.totalValue, styles.totalValueGreen]}>
              {formatCurrency(totalHaber)}
            </Text>
          </View>

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalText}>SALDO ACTUAL:</Text>
            <Text style={[styles.finalTotalText, getTotalValueStyle(safeEstado.saldoActual)]}>
              {formatCurrency(Math.abs(safeEstado.saldoActual || 0))} ({getSaldoText(safeEstado.saldoActual)})
            </Text>
          </View>
        </View>

        {/* Observaciones */}
        {safeEstado.observaciones && (
          <View style={styles.observationsSection}>
            <Text style={styles.observationsTitle}>OBSERVACIONES</Text>
            <Text style={styles.observationsText}>{safeEstado.observaciones}</Text>
          </View>
        )}

        {/* Pie de página IMSSE */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>IMSSE INGENIERÍA S.A.S</Text>
          <Text>Especialistas en sistemas de protección contra incendios desde 1994</Text>
          <Text style={styles.certifications}>
            Certificaciones internacionales: Notifier | Mircom | Inim | Secutron | Bosch
          </Text>
          <Text>📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina</Text>
        </View>
      </Page>
    </Document>
  );
};

export default EstadoCuentaPDF;