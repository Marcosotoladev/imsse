// components/pdf/InspeccionTecnicaPDF.jsx - PDF Visita Técnica IMSSE
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos profesionales para PDF IMSSE (mismo criterio visual que OrdenTrabajoPDF)
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  ordenNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626'
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  field: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 100,
    color: '#374151',
    marginRight: 10
  },
  value: {
    fontSize: 9,
    flex: 1,
    color: '#1f2937',
    lineHeight: 1.3
  },
  tecnicos: {
    marginTop: 5
  },
  tecnico: {
    fontSize: 9,
    color: '#1f2937',
    marginBottom: 3,
    paddingLeft: 10
  },
  observacionesSection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB'
  },
  observacionesTexto: {
    fontSize: 9,
    color: '#1f2937',
    lineHeight: 1.4,
    textAlign: 'justify'
  },
  // Checklist (planillas adjuntas)
  checklistSection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fff7ed',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706'
  },
  checklistGrupo: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  checklistTitulo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8
  },
  itemSubtitulo: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 4
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb'
  },
  itemDescripcionWrap: {
    flex: 1,
    paddingRight: 8
  },
  itemDescripcion: {
    fontSize: 9,
    color: '#1f2937'
  },
  itemObservacion: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
    marginLeft: 10
  },
  estadoBadge: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    minWidth: 32,
    textAlign: 'center'
  },
  unidadBox: {
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#e5e7eb'
  },
  unidadTitulo: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 3
  },
  unidadCampo: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2
  },
  unidadColumnaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  unidadColumnaNombre: {
    fontSize: 8,
    color: '#1f2937'
  },
  fotosSection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
  },
  fotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foto: {
    width: '48%',
    height: 100,
    marginBottom: 8,
    objectFit: 'cover',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  fotoPlaceholder: {
    width: '48%',
    height: 100,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  fotoText: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center'
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center'
  },
  signatureImage: {
    width: 120,
    height: 50,
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
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
    color: '#6b7280',
    fontWeight: 'bold'
  },
  aclaracionText: {
    fontSize: 9,
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

const COLOR_ESTADO = {
  OK: '#059669',
  NOK: '#DC2626',
  NA: '#6b7280'
};

const LABEL_ESTADO = {
  OK: 'OK',
  NOK: 'N OK',
  NA: 'N/A'
};

const InspeccionTecnicaPDF = ({ inspeccion }) => {
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

  // Datos seguros con validaciones
  const safeInspeccion = inspeccion || {};
  const safeCliente = safeInspeccion.cliente || {};
  const safeTecnicos = safeInspeccion.tecnicos || [];
  const safeFotos = safeInspeccion.fotos || [];
  const safeFirmas = safeInspeccion.firmas || {};
  const safePlanillas = safeInspeccion.planillasAdjuntas || [];

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
          <Text style={styles.title}>VISITA TÉCNICA</Text>
          <Text style={styles.ordenNumber}>N° {safeInspeccion.numero || ''}</Text>
        </View>

        {/* Información básica y cliente en fila horizontal */}
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{formatDate(safeInspeccion.fechaTrabajo)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Horario:</Text>
              <Text style={styles.value}>
                {safeInspeccion.horarioInicio || ''} - {safeInspeccion.horarioFin || ''}
              </Text>
            </View>
          </View>

          <View style={[styles.section, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.sectionTitle}>Datos del Cliente</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{safeCliente.empresa || ''}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Contacto:</Text>
              <Text style={styles.value}>{safeCliente.nombre || ''}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{safeCliente.telefono || ''}</Text>
            </View>
            {safeCliente.sedeNombre && (
              <View style={styles.field}>
                <Text style={styles.label}>Sede:</Text>
                <Text style={styles.value}>{safeCliente.sedeNombre}</Text>
              </View>
            )}
            <View style={styles.field}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{safeCliente.direccion || ''}</Text>
            </View>
          </View>
        </View>

        {/* Técnicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Técnicos Asignados</Text>
          <View style={styles.tecnicos}>
            {safeTecnicos.map((tecnico, index) => (
              <Text key={index} style={styles.tecnico}>
                • {tecnico.nombre || ''}
              </Text>
            ))}
          </View>
        </View>

        {/* Observaciones generales */}
        {safeInspeccion.observaciones && (
          <View style={styles.observacionesSection}>
            <Text style={styles.sectionTitle}>Observaciones Generales</Text>
            <Text style={styles.observacionesTexto}>{safeInspeccion.observaciones}</Text>
          </View>
        )}

        {/* Firmas */}
        {(safeFirmas.tecnico?.firma || safeFirmas.cliente?.firma) && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>TÉCNICO RESPONSABLE</Text>
              {safeFirmas.tecnico?.firma && (
                <Image src={safeFirmas.tecnico.firma} style={styles.signatureImage} />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>FIRMA</Text>
              {safeFirmas.tecnico?.aclaracion && (
                <Text style={styles.aclaracionText}>{safeFirmas.tecnico.aclaracion}</Text>
              )}
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>CONFORME CLIENTE</Text>
              {safeFirmas.cliente?.firma && (
                <Image src={safeFirmas.cliente.firma} style={styles.signatureImage} />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>FIRMA Y ACLARACIÓN</Text>
              {safeFirmas.cliente?.aclaracion && (
                <Text style={styles.aclaracionText}>{safeFirmas.cliente.aclaracion}</Text>
              )}
            </View>
          </View>
        )}

        {/* Anexo: fotografías (todas, sin límite) */}
        {safeFotos.length > 0 && (
          <View style={styles.fotosSection} break>
            <Text style={styles.sectionTitle}>Anexo — Fotografías</Text>
            <View style={styles.fotosGrid}>
              {safeFotos.map((foto, index) => (
                <Image key={index} src={foto.url} style={styles.foto} />
              ))}
            </View>
          </View>
        )}

        {/* Checklist: una sección por cada planilla adjunta, al final del documento */}
        {safePlanillas.map((planilla, planillaIndex) => (
          <View key={planillaIndex} style={styles.checklistSection} wrap={false}>
            <Text style={styles.checklistGrupo}>{planilla.grupo}</Text>
            <Text style={styles.checklistTitulo}>{planilla.titulo}</Text>

            {planilla.tipo === 'tabular' ? (
              (planilla.unidades || []).map((unidad, unidadIndex) => (
                <View key={unidadIndex} style={styles.unidadBox}>
                  <Text style={styles.unidadTitulo}>{planilla.nombreUnidad} {unidad.numero}</Text>
                  {(planilla.camposTexto || []).map((campo) => (
                    unidad.campos?.[campo] ? (
                      <Text key={campo} style={styles.unidadCampo}>{campo}: {unidad.campos[campo]}</Text>
                    ) : null
                  ))}
                  {(planilla.columnas || []).map((columna) => (
                    <View key={columna} style={styles.unidadColumnaRow}>
                      <Text style={styles.unidadColumnaNombre}>{columna}</Text>
                      {unidad.valores?.[columna] && (
                        <Text style={[styles.estadoBadge, { backgroundColor: COLOR_ESTADO[unidad.valores[columna]] || '#6b7280' }]}>
                          {LABEL_ESTADO[unidad.valores[columna]] || unidad.valores[columna]}
                        </Text>
                      )}
                    </View>
                  ))}
                  {unidad.observacion && (
                    <Text style={styles.itemObservacion}>{unidad.observacion}</Text>
                  )}
                </View>
              ))
            ) : (
              (planilla.items || []).map((item, itemIndex) => (
                <View key={itemIndex} wrap={false}>
                  {item.subtitulo && (
                    <Text style={styles.itemSubtitulo}>{item.subtitulo}</Text>
                  )}
                  <View style={styles.itemRow}>
                    <View style={styles.itemDescripcionWrap}>
                      <Text style={styles.itemDescripcion}>{itemIndex + 1}. {item.descripcion}</Text>
                      {item.observacion && (
                        <Text style={styles.itemObservacion}>{item.observacion}</Text>
                      )}
                    </View>
                    {item.estado && (
                      <Text style={[styles.estadoBadge, { backgroundColor: COLOR_ESTADO[item.estado] || '#6b7280' }]}>
                        {LABEL_ESTADO[item.estado] || item.estado}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        ))}

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

export default InspeccionTecnicaPDF;
