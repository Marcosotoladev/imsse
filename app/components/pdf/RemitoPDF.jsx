// components/pdf/RemitoPDF.js - PDF Remito IMSSE (Formato mejorado como ReciboPDF)
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos profesionales para PDF IMSSE (basado en ReciboPDF)
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
  remitoNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontStyle: 'italic'
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
  statusBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    padding: 3,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2
  },
  statusEntregado: {
    backgroundColor: '#D1FAE5',
    color: '#065F46'
  },
  statusTransito: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF'
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8,
    minHeight: 25
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
  col4: {
    flex: 4,
  },
  totalRow: {
    backgroundColor: '#e5e7eb',
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#d1d5db'
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
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingTop: 20,
  },
  signatureBox: {
    width: '40%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 140,
    height: 60,
    marginBottom: 8,
    objectFit: 'contain'
  },
  signatureLine: {
    borderTopWidth: 1.5,
    borderTopColor: '#374151',
    width: '100%',
    paddingTop: 5,
  },
  signatureLabel: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 3,
    color: '#6b7280',
    fontWeight: 'bold'
  },
  aclaracionText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937'
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

const RemitoPDF = ({ remito }) => {
  // Función para formatear fechas
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

  // Función para obtener estilo del estado
  const getStatusStyle = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'entregado':
        return [styles.statusBadge, styles.statusEntregado];
      case 'en_transito':
        return [styles.statusBadge, styles.statusTransito];
      default:
        return styles.statusBadge;
    }
  };

  // Función para obtener texto del estado
  const getStatusText = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'entregado':
        return 'ENTREGADO';
      case 'en_transito':
        return 'EN TRÁNSITO';
      case 'pendiente':
      default:
        return 'PENDIENTE';
    }
  };

  // Datos seguros con validaciones
  const safeRemito = remito || {};

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
          <Text style={styles.title}>REMITO DE ENTREGA</Text>
          <Text style={styles.remitoNumber}>N° {safeRemito.numero || ''}</Text>
        </View>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>Equipos de Protección Contra Incendios</Text>

        {/* Información del remito y cliente */}
        <View style={styles.infoSection}>
          {/* Información del remito */}
          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>DATOS DEL REMITO</Text>
            
            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Fecha:</Text>
                <Text style={styles.value}>{formatDate(safeRemito.fecha)}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Estado:</Text>
                <View style={{ flex: 1 }}>
                  <Text style={getStatusStyle(safeRemito.estado)}>
                    {getStatusText(safeRemito.estado)}
                  </Text>
                </View>
              </View>
            </View>

            {safeRemito.destino && (
              <View style={styles.field}>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Destino:</Text>
                  <Text style={styles.value}>{safeRemito.destino}</Text>
                </View>
              </View>
            )}

            {safeRemito.transportista && (
              <View style={styles.field}>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Transport:</Text>
                  <Text style={styles.value}>{safeRemito.transportista}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Información del cliente */}
          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>DATOS DEL CLIENTE</Text>
            
            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{safeRemito.cliente?.nombre || 'No especificado'}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Empresa:</Text>
                <Text style={styles.value}>{safeRemito.cliente?.empresa || 'No especificado'}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{safeRemito.cliente?.email || 'No especificado'}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{safeRemito.cliente?.telefono || 'No especificado'}</Text>
              </View>
            </View>

            {safeRemito.cliente?.sedeNombre && (
              <View style={styles.field}>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Sede:</Text>
                  <Text style={styles.value}>{safeRemito.cliente.sedeNombre}</Text>
                </View>
              </View>
            )}

            {safeRemito.cliente?.direccion && (
              <View style={styles.field}>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Dirección:</Text>
                  <Text style={styles.value}>{safeRemito.cliente.direccion}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tabla de equipos */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>
            EQUIPOS DE PROTECCIÓN CONTRA INCENDIOS
          </Text>

          {/* Encabezado de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.col4, { fontWeight: 'bold' }]}>DESCRIPCIÓN DEL EQUIPO</Text>
            <Text style={[styles.col1, { fontWeight: 'bold', textAlign: 'center' }]}>CANT.</Text>
            <Text style={[styles.col1, { fontWeight: 'bold', textAlign: 'center' }]}>UNIDAD</Text>
          </View>

          {/* Filas de items */}
          {(safeRemito.items || []).map((item, index) => (
            <View key={item.id || index} style={[styles.tableRow, index % 2 === 1 ? styles.oddRow : {}]}>
              <Text style={styles.col4}>
                {item.descripcion || 'Sin descripción'}
              </Text>
              <Text style={[styles.col1, { textAlign: 'center', fontWeight: 'bold' }]}>
                {item.cantidad || '0'}
              </Text>
              <Text style={[styles.col1, { textAlign: 'center' }]}>
                {item.unidad || 'unidad'}
              </Text>
            </View>
          ))}

          {/* Fila de total */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.col4, { fontWeight: 'bold' }]}>
              TOTAL DE EQUIPOS
            </Text>
            <Text style={[styles.col1, { textAlign: 'center', fontWeight: 'bold' }]}>
              {safeRemito.items?.reduce((sum, item) => sum + Number(item.cantidad || 0), 0) || 0}
            </Text>
            <Text style={[styles.col1, { textAlign: 'center', fontWeight: 'bold' }]}>
              ITEMS
            </Text>
          </View>
        </View>

        {/* Observaciones */}
        {safeRemito.observaciones && (
          <View style={styles.observationsSection}>
            <Text style={styles.observationsTitle}>OBSERVACIONES</Text>
            <Text style={styles.observationsText}>{safeRemito.observaciones}</Text>
          </View>
        )}

        {/* Sección de firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            {safeRemito.firma && (
              <Image src={safeRemito.firma} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>RECIBÍ CONFORME</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={{ height: 60, justifyContent: 'flex-end' }}>
              {safeRemito.aclaracionFirma && (
                <Text style={styles.aclaracionText}>{safeRemito.aclaracionFirma}</Text>
              )}
            </View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>ACLARACIÓN</Text>
          </View>
        </View>

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

export default RemitoPDF;