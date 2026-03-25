/**
 * Árbol de decisiones del cuestionario SST.
 * Cada nodo define: tipo de input, etiqueta, opciones y función next()
 * que recibe la respuesta y devuelve el ID del siguiente nodo (o null = fin).
 */

export const FIRST_QUESTION_ID = 'empresa_nombre'

export const QUESTIONS = {
  // ── DATOS GENERALES ──────────────────────────────────────────────────────
  empresa_nombre: {
    id: 'empresa_nombre',
    group: 'Datos de la Empresa',
    type: 'text',
    label: '¿Cuál es el nombre o razón social de su empresa?',
    placeholder: 'Ej: Constructora Andina S.A.C.',
    required: true,
    next: () => 'empresa_ruc',
  },

  empresa_ruc: {
    id: 'empresa_ruc',
    group: 'Datos de la Empresa',
    type: 'text',
    label: '¿Cuál es el RUC de su empresa?',
    placeholder: 'Ej: 20123456789',
    required: true,
    next: () => 'empresa_ubicacion',
  },

  empresa_ubicacion: {
    id: 'empresa_ubicacion',
    group: 'Datos de la Empresa',
    type: 'text',
    label: '¿En qué departamento / región opera principalmente su empresa?',
    placeholder: 'Ej: Lima, Arequipa, Cusco...',
    required: true,
    next: () => 'empresa_trabajadores',
  },

  empresa_trabajadores: {
    id: 'empresa_trabajadores',
    group: 'Datos de la Empresa',
    type: 'radio',
    label: '¿Cuántos trabajadores tiene su empresa?',
    hint: 'Esto determina las obligaciones de Comité vs. Supervisor SST.',
    options: [
      { value: '1-10',   label: '1 a 10 trabajadores (microempresa)' },
      { value: '11-19',  label: '11 a 19 trabajadores (pequeña empresa)' },
      { value: '20-50',  label: '20 a 50 trabajadores' },
      { value: '51-100', label: '51 a 100 trabajadores' },
      { value: '101-500',label: '101 a 500 trabajadores' },
      { value: '500+',   label: 'Más de 500 trabajadores (gran empresa)' },
    ],
    next: () => 'sector',
  },

  // ── SECTOR / RUBRO ────────────────────────────────────────────────────────
  sector: {
    id: 'sector',
    group: 'Sector y Actividades',
    type: 'radio',
    label: '¿Cuál es el sector o rubro principal de su empresa?',
    options: [
      { value: 'mineria',       label: 'Minería' },
      { value: 'construccion',  label: 'Construcción' },
      { value: 'manufactura',   label: 'Manufactura / Industria' },
      { value: 'salud',         label: 'Servicios de Salud (clínica, hospital, laboratorio)' },
      { value: 'hidrocarburos', label: 'Hidrocarburos / Petróleo y Gas' },
      { value: 'agricultura',   label: 'Agricultura / Agroindustria' },
      { value: 'transporte',    label: 'Transporte y Logística' },
      { value: 'comercio',      label: 'Comercio / Retail' },
      { value: 'servicios',     label: 'Servicios Generales / Consultoría / Oficinas' },
      { value: 'otro',          label: 'Otro' },
    ],
    next: (answer) => {
      const map = {
        mineria:       'mineria_tipo',
        construccion:  'construccion_tipo',
        salud:         'salud_tipo',
        hidrocarburos: 'hidrocarburos_actividades',
      }
      return map[answer] ?? 'actividades_riesgo'
    },
  },

  // ── RAMAS SECTORIALES ─────────────────────────────────────────────────────
  mineria_tipo: {
    id: 'mineria_tipo',
    group: 'Sector y Actividades',
    type: 'checkbox',
    label: '¿Qué tipo de operaciones mineras realiza? (Puede marcar varias)',
    options: [
      { value: 'subterranea',   label: 'Minería subterránea' },
      { value: 'tajo_abierto',  label: 'Minería a tajo abierto' },
      { value: 'artesanal',     label: 'Minería artesanal / pequeña minería' },
      { value: 'procesamiento', label: 'Planta de beneficio / procesamiento' },
      { value: 'exploracion',   label: 'Exploración minera' },
    ],
    next: () => 'actividades_riesgo',
  },

  construccion_tipo: {
    id: 'construccion_tipo',
    group: 'Sector y Actividades',
    type: 'checkbox',
    label: '¿Qué tipo de obras ejecuta? (Puede marcar varias)',
    options: [
      { value: 'edificacion',    label: 'Edificaciones (viviendas, oficinas, multifamiliares)' },
      { value: 'infraestructura',label: 'Infraestructura vial / puentes / túneles' },
      { value: 'industrial',     label: 'Construcción industrial / plantas' },
      { value: 'demolicion',     label: 'Demolición' },
      { value: 'excavacion',     label: 'Excavación y movimiento de tierras' },
      { value: 'instalaciones',  label: 'Instalaciones sanitarias / eléctricas / mecánicas' },
    ],
    next: () => 'actividades_riesgo',
  },

  salud_tipo: {
    id: 'salud_tipo',
    group: 'Sector y Actividades',
    type: 'checkbox',
    label: '¿Qué servicios de salud presta? (Puede marcar varias)',
    options: [
      { value: 'hospitalizacion',label: 'Hospitalización' },
      { value: 'cirugia',        label: 'Cirugía / Centro quirúrgico' },
      { value: 'laboratorio',    label: 'Laboratorio clínico / anatomía patológica' },
      { value: 'radiologia',     label: 'Radiología / Imagenología' },
      { value: 'emergencias',    label: 'Emergencias / Urgencias' },
      { value: 'ambulatorio',    label: 'Atención ambulatoria / consultorios' },
      { value: 'odontologia',    label: 'Odontología' },
    ],
    next: () => 'actividades_riesgo',
  },

  hidrocarburos_actividades: {
    id: 'hidrocarburos_actividades',
    group: 'Sector y Actividades',
    type: 'checkbox',
    label: '¿Qué actividades de hidrocarburos realiza? (Puede marcar varias)',
    options: [
      { value: 'exploracion',      label: 'Exploración' },
      { value: 'extraccion',       label: 'Extracción / Producción' },
      { value: 'refinacion',       label: 'Refinación / Procesamiento' },
      { value: 'transporte_ductos',label: 'Transporte por ductos (oleoductos, gasoductos)' },
      { value: 'transporte_cisterna',label: 'Transporte en cisternas' },
      { value: 'estaciones',       label: 'Estaciones de servicio / Grifos' },
      { value: 'almacenamiento',   label: 'Almacenamiento de combustibles' },
    ],
    next: () => 'actividades_riesgo',
  },

  // ── ACTIVIDADES DE ALTO RIESGO ────────────────────────────────────────────
  actividades_riesgo: {
    id: 'actividades_riesgo',
    group: 'Riesgos Laborales',
    type: 'checkbox',
    label: '¿Cuáles de las siguientes actividades de alto riesgo se realizan en su empresa?',
    hint: 'Seleccione todas las que apliquen.',
    options: [
      { value: 'altura',          label: 'Trabajo en altura (más de 1.8 metros)' },
      { value: 'espacio_confinado',label: 'Ingreso a espacios confinados' },
      { value: 'caliente',        label: 'Trabajos en caliente (soldadura, corte con llama, esmeril)' },
      { value: 'izaje',           label: 'Izaje y levantamiento de cargas con grúas o tecles' },
      { value: 'electrico',       label: 'Trabajos eléctricos (alta o baja tensión)' },
      { value: 'explosivos',      label: 'Uso de explosivos / voladuras' },
      { value: 'maquinaria',      label: 'Operación de maquinaria pesada (excavadoras, grúas, etc.)' },
      { value: 'excavaciones',    label: 'Excavaciones y zanjas (profundidad > 1.5 m)' },
      { value: 'nocturno',        label: 'Trabajo nocturno' },
      { value: 'carretera',       label: 'Trabajo en vía pública / carretera' },
      { value: 'buceo',           label: 'Buceo / trabajos subacuáticos' },
      { value: 'ninguno',         label: 'Ninguna de las anteriores' },
    ],
    next: (answer) => {
      const arr = Array.isArray(answer) ? answer : []
      if (arr.includes('explosivos')) return 'explosivos_detalle'
      if (arr.includes('altura'))     return 'altura_detalle'
      return 'agentes_exposicion'
    },
  },

  explosivos_detalle: {
    id: 'explosivos_detalle',
    group: 'Riesgos Laborales',
    type: 'radio',
    label: '¿Cómo utiliza los explosivos?',
    options: [
      { value: 'propio',         label: 'Personal propio (empresa titular del uso)' },
      { value: 'contratista',    label: 'A través de contratista especializado' },
      { value: 'ambos',          label: 'Ambas modalidades' },
    ],
    next: () => 'agentes_exposicion',
  },

  altura_detalle: {
    id: 'altura_detalle',
    group: 'Riesgos Laborales',
    type: 'checkbox',
    label: '¿Qué equipos de protección contra caídas utiliza actualmente?',
    options: [
      { value: 'arnes',       label: 'Arnés de seguridad' },
      { value: 'linea_vida',  label: 'Línea de vida (horizontal o vertical)' },
      { value: 'andamios',    label: 'Andamios certificados' },
      { value: 'redes',       label: 'Redes de seguridad' },
      { value: 'ninguno',     label: 'No cuenta con equipos actualmente' },
    ],
    next: () => 'agentes_exposicion',
  },

  // ── AGENTES DE EXPOSICIÓN ─────────────────────────────────────────────────
  agentes_exposicion: {
    id: 'agentes_exposicion',
    group: 'Riesgos Laborales',
    type: 'checkbox',
    label: '¿A qué agentes de riesgo están expuestos sus trabajadores?',
    options: [
      { value: 'polvo',        label: 'Polvo (sílice, carbón, cemento, harina, etc.)' },
      { value: 'quimicos',     label: 'Sustancias químicas peligrosas (solventes, ácidos, pinturas)' },
      { value: 'ruido',        label: 'Ruido excesivo (> 85 dB)' },
      { value: 'vibraciones',  label: 'Vibraciones de herramientas o maquinaria' },
      { value: 'calor_frio',   label: 'Estrés térmico (calor extremo o frío extremo)' },
      { value: 'radiacion',    label: 'Radiaciones (ionizantes como rayos X, o no ionizantes como UV)' },
      { value: 'biologicos',   label: 'Agentes biológicos (bacterias, virus, parásitos)' },
      { value: 'ergonomicos',  label: 'Riesgos ergonómicos (posturas forzadas, movimientos repetitivos, MMC)' },
      { value: 'psicosocial',  label: 'Riesgos psicosociales (estrés, trabajo nocturno, carga mental)' },
      { value: 'ninguno',      label: 'No aplica / sin exposición significativa' },
    ],
    next: () => 'gestion_sst',
  },

  // ── GESTIÓN SST ACTUAL ────────────────────────────────────────────────────
  gestion_sst: {
    id: 'gestion_sst',
    group: 'Gestión SST Actual',
    type: 'checkbox',
    label: '¿Con qué documentos e instrumentos de gestión SST cuenta actualmente?',
    hint: 'Marque solo los que existen y están vigentes.',
    options: [
      { value: 'iperc',            label: 'IPERC (Identificación de Peligros, Evaluación y Control de Riesgos)' },
      { value: 'risst',            label: 'Reglamento Interno de SST (RISST)' },
      { value: 'comite',           label: 'Comité de SST constituido' },
      { value: 'supervisor',       label: 'Supervisor de SST designado' },
      { value: 'plan_emergencia',  label: 'Plan de Contingencia / Emergencias' },
      { value: 'programa_anual',   label: 'Programa Anual de SST' },
      { value: 'medico_ocup',      label: 'Médico Ocupacional o EAP contratado' },
      { value: 'examen_medico',    label: 'Exámenes médicos ocupacionales vigentes' },
      { value: 'registro_acc',     label: 'Registro de accidentes e incidentes' },
      { value: 'ninguno',          label: 'Ninguno de los anteriores' },
    ],
    next: () => 'medio_ambiente',
  },

  // ── ASPECTOS AMBIENTALES ──────────────────────────────────────────────────
  medio_ambiente: {
    id: 'medio_ambiente',
    group: 'Aspectos Ambientales',
    type: 'checkbox',
    label: '¿Su empresa genera alguno de los siguientes aspectos ambientales?',
    options: [
      { value: 'efluentes',          label: 'Efluentes líquidos (aguas residuales industriales o domésticas)' },
      { value: 'emisiones_aire',     label: 'Emisiones al aire (gases, humos, material particulado)' },
      { value: 'residuos_peligrosos',label: 'Residuos sólidos peligrosos (RESPEL)' },
      { value: 'residuos_no_pel',    label: 'Residuos sólidos no peligrosos (domésticos, reciclables)' },
      { value: 'suelos',             label: 'Riesgo de contaminación de suelos (derrames)' },
      { value: 'ruido_ambiental',    label: 'Ruido ambiental (potencial afectación a comunidades vecinas)' },
      { value: 'ninguno',            label: 'No genera aspectos ambientales significativos' },
    ],
    next: () => null, // Fin del cuestionario
  },
}
