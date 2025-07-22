// components/pdf/ReciboPDF.js - PDF Recibo IMSSE
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
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  reciboNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  content: {
    marginBottom: 25,
  },
  field: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 110,
    color: '#374151',
    marginRight: 10
  },
  value: {
    fontSize: 10,
    flex: 1,
    color: '#1f2937',
    lineHeight: 1.4
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
    paddingTop: 30,
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

const ReciboPDF = ({ recibo }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
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

  // Datos seguros con validaciones
  const safeRecibo = recibo || {};

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
          <Text style={styles.title}>RECIBO</Text>
          <Text style={styles.reciboNumber}>N° {safeRecibo.numero || ''}</Text>
        </View>

        {/* Monto destacado */}
        <View style={styles.amount}>
          <Text>{formatCurrency(safeRecibo.monto)}</Text>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>RECIBÍ DE:</Text>
              <Text style={styles.value}>{safeRecibo.recibiDe || ''}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>LA SUMA DE:</Text>
              <Text style={styles.value}>{safeRecibo.cantidadLetras || ''}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>CONCEPTO:</Text>
              <Text style={styles.value}>{safeRecibo.concepto || ''}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>FECHA:</Text>
              <Text style={styles.value}>{formatDate(safeRecibo.fecha)}</Text>
            </View>
          </View>
        </View>

        {/* Sección de firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            {safeRecibo.firma && (
              <Image src={safeRecibo.firma} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>FIRMA</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={{ height: 60, justifyContent: 'flex-end' }}>
              {safeRecibo.aclaracion && (
                <Text style={styles.aclaracionText}>{safeRecibo.aclaracion}</Text>
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

export default ReciboPDF;