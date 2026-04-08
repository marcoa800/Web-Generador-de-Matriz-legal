import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  console.warn('[geminiService] VITE_GEMINI_API_KEY no está definida en .env')
}

const genAI = new GoogleGenerativeAI(API_KEY)

// ─────────────────────────────────────────────────────────────────────────────
//  PROMPT 1: Resumen de entendimiento de la empresa
// ─────────────────────────────────────────────────────────────────────────────
function buildSummaryPrompt(answers) {
  return `Eres un experto en Seguridad y Salud en el Trabajo (SST) en Perú.
Basándote en las siguientes respuestas de un cuestionario, genera un resumen profesional y claro sobre la empresa.

RESPUESTAS DEL CUESTIONARIO (en formato JSON):
${JSON.stringify(answers, null, 2)}

El resumen debe:
1. Presentar el nombre de la empresa y su sector/rubro.
2. Describir brevemente sus actividades principales y los principales riesgos identificados.
3. Mencionar los aspectos ambientales relevantes (si existen).
4. Indicar el estado actual de su gestión SST según las respuestas.
5. Ser conciso (3 a 5 párrafos cortos), en español formal y orientado a un profesional SST.
6. NO inventar información que no esté en las respuestas.

Responde ÚNICAMENTE con el texto del resumen, sin etiquetas, sin markdown y sin texto adicional.`
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROMPT 2: Generación de la Matriz Legal completa (versión robusta)
// ─────────────────────────────────────────────────────────────────────────────
function buildMatrixPrompt(answers) {
  return `Eres el mejor especialista en legislación peruana de SST/SSOMA (Seguridad, Salud Ocupacional y Medio Ambiente) con 20 años de experiencia asesorando empresas ante SUNAFIL, OEFA y MINSA. Conoces TODAS las normas vigentes.

Tu tarea: construir la Matriz Legal de Cumplimiento Normativo más COMPLETA y ROBUSTA posible para esta empresa, cubriendo cada obligación legal exigible.

═══════════════════════════════════════
PERFIL DE LA EMPRESA
═══════════════════════════════════════
${JSON.stringify(answers, null, 2)}

═══════════════════════════════════════
ESTRUCTURA — 15 CAMPOS EXACTOS
═══════════════════════════════════════
Cada objeto JSON debe tener EXACTAMENTE:
1. "item"                  → Número secuencial entero
2. "area"                  → SOLO: "SST" | "Salud Ocupacional" | "Higiene Industrial" | "Ambiental" | "Protección Social"
3. "tema"                  → SOLO uno de:
   "Comité / Supervisor SST" | "IPERC" | "Política y Objetivos SST" | "Reglamento Interno SST" |
   "Programa Anual SST" | "Capacitación y Entrenamiento" | "Accidentes e Incidentes" |
   "EMO (Exámenes Médico Ocupacionales)" | "EPP (Equipos de Protección Personal)" |
   "Señalización y Demarcación" | "Respuesta a Emergencias" | "Trabajo en Altura" |
   "Espacios Confinados" | "Trabajos en Caliente" | "Izaje de Cargas" | "Trabajos Eléctricos" |
   "Explosivos y Voladuras" | "Ergonomía" | "Estrés Térmico" | "Agentes Químicos" |
   "Ruido y Vibraciones" | "Radiaciones" | "Agentes Biológicos" | "Iluminación" |
   "Residuos Sólidos" | "Efluentes Líquidos" | "Emisiones al Aire" | "Suelos y Derrames" |
   "Ruido Ambiental" | "SCTR / Seguro de Riesgo" | "Documentación y Registros" |
   "Auditorías SST" | "Contratistas y Terceros" | "Fatiga y Somnolencia" |
   "Psicosocial y Hostigamiento" | "Gestión del Cambio" | "Investigación de Accidentes" |
   "Monitoreo Ocupacional" | "Estadísticas SST" | "Permisos de Trabajo" |
   "Inspecciones de Seguridad" | "Observación de Tareas" | "Simulacros"
4. "descripcion_requisito"  → Descripción específica del requisito (máx. 220 caracteres)
5. "titulo_norma"           → Título completo de la norma
6. "numero_norma"           → Código exacto (ej: "Ley N° 29783", "D.S. N° 005-2012-TR")
7. "articulo"               → Artículo(s) o numeral(es) específicos
8. "emisor"                 → "Congreso de la República" | "MTPE" | "MINEM" | "MINAM" | "MINSA" | "PCM" | "MTC" | "MVCS" | "INACAL" | "OSINERGMIN" | "MIDAGRI"
9. "fecha_emision"          → DD/MM/YYYY de publicación en El Peruano
10. "tipo_requisito"        → "Legal" | "Reglamentario" | "Técnico"
11. "como_cumplir"          → Acción concreta y sencilla para cumplir (máx. 260 caracteres). Inicia con verbo: Elaborar, Implementar, Realizar, Contratar, Registrar, Publicar, Capacitar, Monitorear, etc.
12. "responsable"           → Rol interno típico a cargo. Ej: "Responsable SST" | "Médico Ocupacional" | "RRHH / Administración" | "Gerencia General" | "Jefe de Operaciones" | "Supervisor de Área" | "Jefe de Mantenimiento"
13. "evidencia_requerida"   → Documento o registro que prueba el cumplimiento (máx. 180 caracteres). Ej: "Acta de constitución del Comité SST firmada", "Registro de monitoreo de ruido con firma del trabajador", "Contrato de SCTR vigente"
14. "plazo"                 → Frecuencia o periodicidad de cumplimiento. SOLO: "Permanente" | "Anual" | "Semestral" | "Trimestral" | "Mensual" | "Una sola vez" | "Según programa" | "Antes del inicio de actividades"
15. "sancion_sunafil"       → Gravedad y referencia según D.S. 015-2019-TR. SOLO: "Leve — hasta 5 UIT" | "Grave — hasta 20 UIT" | "Muy Grave — hasta 50 UIT"
16. "estado"                → Dejar siempre como cadena vacía "" (el usuario lo completará)

═══════════════════════════════════════════════════════════
BLOQUE A — NORMAS UNIVERSALES (TODAS LAS EMPRESAS — 100%)
═══════════════════════════════════════════════════════════
Genera UNA FILA POR CADA REQUISITO DISTINTO de estas normas:

▶ SISTEMA DE GESTIÓN SST:
• Ley N° 29783 — Ley SST — 20/08/2011 → requisitos: política, IPERC, comité, registros, programa, auditoría, investigación, participación
• Ley N° 30222 — Modifica Ley 29783 — 11/07/2014 → requisitos: EMO simplificado, SCTR, sistemas integrados
• D.S. N° 005-2012-TR — Reglamento Ley 29783 — 25/04/2012 → requisitos: RISST, comité/supervisor, IPERC continuo, mapa de riesgos, registros obligatorios, plan de emergencia, EPP, estadísticas
• D.S. N° 006-2014-TR — Modifica Reglamento — 09/08/2014 → cambios en EMO, SCTR
• RM N° 050-2013-TR — Formatos SST — 14/03/2013 → todos los formatos obligatorios
• RM N° 085-2013-TR — Sistema de Gestión SST — 04/05/2013

▶ INSPECCIÓN, INFRACCIONES Y SANCIONES:
• Ley N° 28806 — Ley Inspección del Trabajo — 22/07/2006
• D.S. N° 019-2006-TR — Reglamento Inspección — 29/10/2006
• D.S. N° 012-2013-TR — Tabla infracciones SST — MTPE
• D.S. N° 015-2019-TR — Nueva tabla infracciones laborales — MTPE

▶ SALUD OCUPACIONAL Y EMO:
• RM N° 312-2011/MINSA — Protocolos EMO — 25/04/2011 → examen pre-empleo, periódico, retiro; protocolos por riesgo
• RM N° 480-2008/MINSA — NTS N° 068 Salud Ocupacional — 14/07/2008
• D.S. N° 015-2005-SA — LMP agentes químicos en el ambiente laboral — 06/07/2005
• RM N° 375-2008-TR — Norma básica de ergonomía y evaluación disergonómica — 30/11/2008
• RM N° 258-2020-MINSA — Lineamientos vigilancia salud trabajadores — 08/05/2020

▶ PROTECCIÓN SOCIAL Y SCTR:
• Ley N° 26790 — Modernización Seguridad Social en Salud — 17/05/1997 → SCTR obligatorio
• D.S. N° 003-98-SA — Normas Técnicas SCTR salud — 14/04/1998
• D.S. N° 009-97-SA — Reglamento Ley 26790 SCTR pensiones — MINSA
• Ley N° 29783 Art. 73° — SCTR para actividades de riesgo

▶ EMERGENCIAS Y DEFENSA CIVIL:
• Ley N° 29664 — Ley SINAGERD — 19/02/2011 — Congreso
• D.S. N° 048-2011-PCM — Reglamento SINAGERD — 25/05/2011
• D.S. N° 005-2012-TR Art. 83° — Plan de emergencia obligatorio
• RM N° 472-2018-MINSA — NTS brigadas de emergencia en EE.SS.

▶ EPP Y SEÑALIZACIÓN:
• D.S. N° 005-2012-TR Art. 97°-100° — Provisión y uso obligatorio de EPP
• NTP 399.010-1:2004 — Señales de seguridad — INACAL
• NTP 399.010-2:2015 — Señales de seguridad parte 2 — INACAL
• NTP 399.018:1998 — Colores de identificación de tuberías — INACAL
• NTP 350.043-1:1998 — Extintores portátiles — INACAL

▶ HIGIENE INDUSTRIAL Y MONITOREO:
• D.S. N° 015-2005-SA — LMP para agentes físicos, químicos y biológicos
• RM N° 312-2011/MINSA — Monitoreo de agentes físicos y químicos
• D.S. N° 085-2003-PCM — ECA para ruido (ambiental y ocupacional)
• NTP 370.053:2008 — Riesgo eléctrico — INACAL
• NTP 851.001:2015 — Espacios confinados — INACAL

▶ DOCUMENTACIÓN Y REGISTROS OBLIGATORIOS:
• D.S. N° 005-2012-TR Arts. 33°-40° — 10 registros obligatorios del SG-SST
• RM N° 050-2013-TR — Formatos referenciales de registros
• Ley N° 29783 Art. 28° — Documentación mínima del SG-SST

═══════════════════════════════════════════════════════════
BLOQUE B — NORMAS SECTORIALES (según el perfil de la empresa)
═══════════════════════════════════════════════════════════

▶ MINERÍA (sector = mineria):
• D.S. N° 024-2016-EM — Reglamento SST Minería — 28/07/2016 → múltiples requisitos: IPERC continuo, permisos de trabajo, espacios confinados, izaje, electricidad, voladura, ventilación
• D.S. N° 023-2017-EM — Modifica Reglamento SST Minería — 18/08/2017
• RM N° 090-2019-MINEM/DM — Protocolo monitoreo ocupacional minería
• D.S. N° 055-2010-EM — Reglamento seguridad minería anterior (normas complementarias)
• Ley N° 27651 — Ley formalización minería artesanal (si aplica)

▶ CONSTRUCCIÓN (sector = construccion):
• G.050 — Seguridad durante la Construcción (RNE) — MVCS → trabajo en altura, andamios, excavaciones, electricidad provisional, EPP
• D.S. N° 011-2019-TR — Reglamento SST Construcción Civil — 23/07/2019
• D.S. N° 010-2009-VIVIENDA — RNE actualización
• NTE G.050 — Norma técnica seguridad en obras
• Convenio OIT N° 167 — Seguridad en construcción (ratificado por Perú)

▶ SALUD (sector = salud):
• RM N° 552-2012/MINSA — Manual bioseguridad hospitalaria — 05/07/2012
• NTS N° 096-MINSA/DIGESA — Gestión residuos sólidos EE.SS. — 22/07/2012
• RM N° 1472-2002-SA/DM — Manual aislamiento hospitalario
• D.S. N° 013-2006-SA — Reglamento EE.SS.
• RM N° 179-2020-MINSA — Protocolo COVID en EE.SS.
• NTS N° 029-MINSA/DGSP — Bioseguridad en odontología

▶ HIDROCARBUROS (sector = hidrocarburos):
• D.S. N° 043-2007-EM — Reglamento SST Hidrocarburos — 22/08/2007 → múltiples requisitos: zonas clasificadas, ATEX, permisos, transporte
• D.S. N° 052-1993-EM — Reglamento SST en Electricidad
• D.S. N° 030-98-EM — Comercialización combustibles
• D.S. N° 027-94-EM — Reglamento seguridad para instalaciones y transporte de GLP
• RM N° 571-2000-EM/VME — Normas para diseño y construcción de estaciones de servicio

▶ SECTOR ELÉCTRICO (sector = electrico):
• D.S. N° 029-94-EM — Reglamento de Seguridad para las Actividades Eléctricas — MINEM — 25/05/1994 → trabajos en tensión, bloqueo/etiquetado (LOTO), distancias de seguridad, zonas de peligro, permisos de trabajo eléctrico, EPP dieléctrico
• D.S. N° 020-2013-EM — Reglamento de Transmisión de Energía Eléctrica — MINEM — 03/08/2013 → requisitos SST en líneas de transmisión, fajas de servidumbre, trabajos en altura en torres
• Resolución Directoral N° 018-2002-EM/DGE — CNE (Código Nacional de Electricidad) Suministro — MINEM → distancias mínimas de seguridad, señalización, puesta a tierra
• Resolución Directoral N° 014-2011-EM/DGE — CNE Utilización — MINEM → instalaciones interiores, protecciones, puesta a tierra, interruptores diferenciales
• Ley N° 25844 — Ley de Concesiones Eléctricas — Congreso — 19/11/1992 → obligaciones de seguridad de concesionarios
• D.S. N° 009-93-EM — Reglamento SST en Instalaciones Eléctricas industriales — MINEM → bloqueo, tarjetas de seguridad, pruebas de aislamiento
• NTP 370.053:2008 — Riesgo Eléctrico. Instalaciones eléctricas en edificios — INACAL → medidas de protección contra contacto directo e indirecto
• NTP IEC 60900:2018 — Herramientas manuales para trabajos en tensión hasta 1000 V CA — INACAL → EPP dieléctrico certificado
• D.S. N° 052-1993-EM — Reglamento Seguridad centrales eléctricas y subestaciones — MINEM → subestaciones, operación de equipos de alta tensión
• RM N° 111-2013-MEM/DM — Procedimientos para supervisión seguridad eléctrica — MINEM → inspecciones OSINERGMIN, registros de mantenimiento preventivo

▶ MANUFACTURA (sector = manufactura):
• RM N° 375-2008-TR — Ergonomía en manufactura — requisitos posturas, MMC, movimientos repetitivos
• D.S. N° 015-2005-SA — LMP para industria manufacturera
• D.S. N° 003-2017-MINAM — ECA para Aire en zona industrial
• NTP 900.058:2005 — Código de colores para residuos — INACAL

▶ AGRICULTURA/AGROINDUSTRIA (sector = agricultura):
• D.S. N° 004-2011-AG — SST actividades agrarias — MIDAGRI
• D.S. N° 015-2005-SA — LMP plaguicidas y agroquímicos
• Ley N° 27360 — Ley de promoción del sector agrario
• RM N° 449-2001-SA/DM — Norma sanitaria manejo plaguicidas

▶ TRANSPORTE Y LOGÍSTICA (sector = transporte):
• D.S. N° 017-2009-MTC — Reglamento Nacional de Administración de Transporte
• D.S. N° 021-2008-MTC — Reglamento transporte de materiales peligrosos
• RM N° 239-2020-MINSA — Protocolo SST transporte
• D.S. N° 025-2008-MTC — Reglamento Nacional de Licencias de Conducir
• D.S. N° 058-2003-MTC — Reglamento Nacional de Vehículos

═══════════════════════════════════════════════════════════
BLOQUE C — NORMAS POR RIESGOS Y AGENTES (según perfil)
═══════════════════════════════════════════════════════════

▶ TRABAJO EN ALTURA (si altura en actividades_riesgo):
• G.050 Cap. 4 — Protección contra caídas, andamios, arneses
• D.S. N° 005-2012-TR Art. 68° — Procedimiento escrito trabajo en altura
• NTP 399.010-1 — Señalización de zonas de altura

▶ ESPACIOS CONFINADOS (si espacio_confinado):
• NTP 851.001:2015 — Gestión de espacios confinados — INACAL
• D.S. N° 005-2012-TR Art. 55° literal h — Control en espacios confinados
• D.S. N° 024-2016-EM Cap. XIV (si minería)

▶ TRABAJOS EN CALIENTE (si caliente):
• G.050 Sección 11 — Soldadura y corte
• NTP 350.043-1 — Extintores portatiles cerca de trabajos con llama
• D.S. N° 005-2012-TR — Permiso escrito trabajo en caliente

▶ IZAJE DE CARGAS (si izaje):
• D.S. N° 005-2012-TR Art. 68° — Permiso de trabajo para izaje
• G.050 Sección 6 — Equipos de izaje en construcción
• NTP 350.028 — Aparatos de izaje: requisitos seguridad — INACAL

▶ TRABAJOS ELÉCTRICOS (si electrico):
• D.S. N° 029-94-EM — Reglamento seguridad centrales eléctricas — MINEM
• D.S. N° 009-93-EM — Reglamento seguridad en instalaciones eléctricas
• NTP 370.053:2008 — Instalaciones eléctricas seguras — INACAL

▶ EXPLOSIVOS (si explosivos):
• Ley N° 25707 — Control de insumos químicos y explosivos — Congreso
• D.S. N° 019-97-DE/SG — Reglamento fabricación, uso explosivos
• D.S. N° 024-2016-EM Cap. XVI — Voladuras en minería

▶ MAQUINARIA PESADA (si maquinaria):
• G.050 Cap. 7 — Maquinaria y equipos en construcción
• D.S. N° 005-2012-TR Art. 68° — Operación segura de maquinaria

▶ AGENTES QUÍMICOS (si quimicos en agentes_exposicion):
• D.S. N° 015-2005-SA — LMP por tipo de sustancia química
• RM N° 312-2011/MINSA — Monitoreo de agentes químicos en puesto de trabajo
• Ley N° 28551 — Obligación de elaborar y presentar planes de contingencia (derrame)

▶ RUIDO OCUPACIONAL (si ruido en agentes_exposicion):
• D.S. N° 085-2003-PCM — ECA ruido (ambiental)
• RM N° 375-2008-TR Anexo — Niveles máximos de ruido en trabajo
• RM N° 312-2011/MINSA — Monitoreo de ruido en puesto de trabajo
• NTP ISO 9612:2010 — Determinación de la exposición al ruido — INACAL

▶ ERGONOMÍA (si ergonomicos en agentes_exposicion):
• RM N° 375-2008-TR — Norma básica de ergonomía — 30/11/2008 — requisitos: evaluación disergonómica, MMC, posturas, pantallas, trabajo repetitivo
• D.S. N° 005-2012-TR Art. 103° — Adaptación del puesto de trabajo

▶ ESTRÉS TÉRMICO (si calor_frio):
• RM N° 375-2008-TR — Estrés térmico por calor
• D.S. N° 015-2005-SA — LMP temperatura en ambientes de trabajo
• NTP ISO 7933 — Evaluación del estrés por calor — INACAL

▶ RADIACIONES (si radiacion):
• D.S. N° 009-97-SA — Reglamento de radiaciones ionizantes — MINSA
• RM N° 096-1999-SA/DM — Norma dosimetría radiaciones ionizantes
• D.S. N° 003-2017-MINAM — ECA radiación ultravioleta (no ionizante)

▶ AGENTES BIOLÓGICOS (si biologicos):
• RM N° 552-2012/MINSA — Bioseguridad y agentes biológicos
• RM N° 258-2020-MINSA — Vigilancia epidemiológica agentes biológicos
• NTS N° 096-MINSA — Manejo residuos biocontaminados

▶ RIESGO PSICOSOCIAL (si psicosocial):
• Ley N° 27942 — Ley de prevención y sanción del hostigamiento sexual — 27/02/2003
• D.S. N° 014-2019-MIMP — Reglamento Ley 27942
• Ley N° 29783 Art. 56° — Factores psicosociales obligación del empleador

═══════════════════════════════════════════════════════════
BLOQUE D — NORMAS AMBIENTALES / SSOMA
═══════════════════════════════════════════════════════════
Incluir si los aspectos ambientales son distintos de "ninguno":

▶ GESTIÓN AMBIENTAL GENERAL:
• Ley N° 28611 — Ley General del Ambiente — 15/10/2005
• Ley N° 27446 — Ley Sistema Nacional de Evaluación Impacto Ambiental — 23/04/2001
• D.S. N° 019-2009-MINAM — Reglamento SEIA — 25/09/2009
• Ley N° 29325 — Ley Sistema Nacional de Evaluación y Fiscalización Ambiental (SINEFA) — 05/03/2009
• D.L. N° 1013 — Creación MINAM — 14/05/2008

▶ RESIDUOS SÓLIDOS (si residuos):
• D.L. N° 1278 — Ley Gestión Integral Residuos Sólidos — 23/12/2016
• D.S. N° 014-2017-MINAM — Reglamento D.L. 1278 — 21/12/2017
• NTP 900.058:2019 — Código de colores residuos — INACAL
• D.S. N° 057-2004-PCM — Reglamento residuos sólidos (aún citado en procedimientos)

▶ EMISIONES AL AIRE (si emisiones_aire):
• D.S. N° 003-2017-MINAM — ECA para Aire — 07/06/2017
• D.S. N° 010-2019-MINAM — LMP emisiones de combustión — MINAM
• D.S. N° 047-2001-MTC — LMP emisiones vehículos automotores — MTC

▶ EFLUENTES LÍQUIDOS (si efluentes):
• D.S. N° 010-2019-MINAGRI — LMP para vertimientos (agro)
• D.S. N° 003-2010-MINAM — LMP para efluentes industriales
• Ley N° 29338 — Ley de Recursos Hídricos — 31/03/2009
• D.S. N° 001-2010-AG — Reglamento Ley Recursos Hídricos

▶ SUELOS Y DERRAMES (si suelos):
• Ley N° 28551 — Planes de contingencia para derrames — Congreso
• D.S. N° 039-2014-PCM — Reglamento planes de contingencia — PCM
• D.S. N° 011-2017-MINAM — ECA para suelos — 02/12/2017

▶ RUIDO AMBIENTAL (si ruido_ambiental):
• D.S. N° 085-2003-PCM — Reglamento ECA Ruido Ambiental — 30/10/2003

═══════════════════════════════════════════════════════════
INSTRUCCIONES DE GENERACIÓN
═══════════════════════════════════════════════════════════
1. CANTIDAD: Genera entre 70 y 100 requisitos. TODOS los objetos deben tener los 16 campos (incluido "estado": ""). Cada norma importante debe dar origen a MÚLTIPLES filas (una por cada requisito distinto que establece).
2. ENFOQUE: Cada fila debe ser un requisito ESPECÍFICO y ACCIONABLE, no una norma completa. Ej: en vez de "Cumplir la Ley 29783", escribe "Constituir Comité de SST con representantes de empleador y trabajadores, elegidos por votación".
3. "como_cumplir": Redacción práctica con verbos de acción. Ej: "Realizar monitoreo de ruido con sonómetro calibrado cada 6 meses. Comparar con LMP. Si supera 85 dB(A), implementar controles de ingeniería y EPP auditivo."
4. "tema": Usar siempre el más específico. Si hay duda entre "Accidentes e Incidentes" e "Investigación de Accidentes", usa "Investigación de Accidentes".
5. No repetir la misma obligación dos veces. Si ya está en el Bloque A, no duplicar en Bloque C.
6. Incluir normas de contratistas/terceros si el perfil lo sugiere.
7. RESPONDE ÚNICAMENTE con el array JSON válido, bien formado. Sin texto antes ni después. Sin markdown.`
}

// ─────────────────────────────────────────────────────────────────────────────
//  Función: obtener resumen de la empresa
// ─────────────────────────────────────────────────────────────────────────────
export async function generateCompanySummary(answers) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(buildSummaryPrompt(answers))
  return result.response.text().trim()
}

// ─────────────────────────────────────────────────────────────────────────────
//  Función: generar la matriz legal completa
// ─────────────────────────────────────────────────────────────────────────────
export async function generateLegalMatrix(answers) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 65536,
    },
  })

  const result = await model.generateContent(buildMatrixPrompt(answers))
  let raw = result.response.text().trim()

  // Limpiar posible markdown fence
  raw = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let matrix
  try {
    matrix = JSON.parse(raw)
  } catch {
    // Si el JSON está truncado, recuperar los objetos completos que sí llegaron
    const lastBrace = raw.lastIndexOf('}')
    if (lastBrace !== -1) {
      const recovered = raw.slice(0, lastBrace + 1) + ']'
      try {
        matrix = JSON.parse(recovered)
        console.warn('[geminiService] JSON truncado — recuperados', matrix.length, 'ítems')
      } catch (err2) {
        console.error('[geminiService] No se pudo recuperar el JSON:', err2)
        throw new Error('La IA devolvió una respuesta en formato inesperado. Intente nuevamente.')
      }
    } else {
      throw new Error('La IA devolvió una respuesta en formato inesperado. Intente nuevamente.')
    }
  }

  if (!Array.isArray(matrix)) {
    throw new Error('La respuesta de la IA no es un array válido.')
  }

  return matrix.map((row, idx) => ({ ...row, item: idx + 1 }))
}
