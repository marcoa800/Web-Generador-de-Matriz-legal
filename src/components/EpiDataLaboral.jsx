import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud, CheckCircle, AlertCircle, BarChart2,
  Activity, FileText, Settings, Users, ArrowRight
} from 'lucide-react';

// --- CONFIGURACIÓN Y DICCIONARIOS ---
const COL_ALIASES = {
  edad:        ['edad', 'age', 'años', 'anos', 'edades'],
  sexo:        ['sexo', 'genero', 'sex', 'género'],
  aptitud:     ['aptitud', 'condicion', 'resultado', 'apto', 'estado', 'conclusión', 'conclusion'],
  tipo_examen: ['tipo', 'examen', 'motivo', 'evaluacion', 'tipo de evaluacion', 'tipo examen'],
  diagnosticos:['diagnostico', 'diagnóstico', 'cie', 'patologia', 'enfermedad', 'dx', 'morbilidad', 'impresion', 'hallazgo'],
};

const MODULO2_CATEGORIAS = [
  { id: 1,  name: 'Enfermedades infecciosas y parasitarias',                     keywords: /infeccios|parasitari|vih|tuberculos|hepatitis|sifilis|covid|dengue|malaria|gastroenteritis/i },
  { id: 2,  name: 'Neoplasias',                                                   keywords: /neoplasia|cancer|tumor|carcinoma|malign|leucemia|linfoma/i },
  { id: 3,  name: 'Enfermedades de la sangre y de los órganos hematopoyéticos',  keywords: /sangre|anemia|coagulacion|inmunidad|hematopoyetico/i },
  { id: 4,  name: 'Enfermedades endocrinas, nutricionales y metabólicas',        keywords: /endocrin|nutricional|metabolic|diabetes|tiroides|obesidad|sobrepeso|dislipidemia|colesterol/i },
  { id: 5,  name: 'Trastornos mentales y del comportamiento',                    keywords: /mental|comportamiento|ansiedad|depresion|estres|psicologico|insomnio/i },
  { id: 6,  name: 'Enfermedades del sistema nervioso',                           keywords: /nervios|neurolog|migraña|cefalea|epilepsia|parkinson|alzheimer/i },
  { id: 7,  name: 'Enfermedades del ojo y sus anexos',                           keywords: /miopia|astigmatismo|catarata|glaucoma|conjuntivitis|ametropia|presbicia|pterigion/i },
  { id: 8,  name: 'Enfermedades del oído y de la apófisis mastoides',            keywords: /sordera|hipoacusia|otitis|tinnitus|acufeno|cerumen|tapon|presbiacusia/i },
  { id: 9,  name: 'Enfermedades del sistema circulatorio',                       keywords: /circulatorio|cardiac|corazon|hipertension|presion alta|varices|venosa|arritmia|infarto/i },
  { id: 10, name: 'Enfermedades del sistema respiratorio',                       keywords: /respiratorio|pulmon|asma|bronquitis|faringitis|rinitis|amigdalitis|neumonia/i },
  { id: 11, name: 'Enfermedades del sistema digestivo',                          keywords: /digestivo|gastro|estomago|gastritis|ulcera|hepat|higado graso|colon|reflujo|caries/i },
  { id: 12, name: 'Enfermedades de la piel y del tejido subcutáneo',             keywords: /piel|subcutaneo|dermatitis|acne|hongos|micosis|psoriasis|urticaria/i },
  { id: 13, name: 'Enfermedades del sistema osteomuscular y del tejido conjuntivo', keywords: /osteomuscular|conjuntivo|hueso|musculo|articulacion|lumbago|lumbalgia|artrosis|artritis|tendinitis|cervicalgia|dorsalgia/i },
  { id: 14, name: 'Enfermedades del sistema genitourinario',                     keywords: /genitourinario|urinari|renal|riñon|prostata|infeccion urinaria|itu/i },
  { id: 15, name: 'Traumatismos y consecuencias de causas externas',             keywords: /traumatismo|causa externa|golpe|fractura|esguince|quemadura|herida|luxacion/i },
  { id: 16, name: 'Otras',                                                        keywords: /.*/ },
];

const MODULO3_CATEGORIAS = [
  { id: 1,  name: 'Asma profesional',                                    keywords: /asma profesional|asma ocupacional/i },
  { id: 2,  name: 'Enf. por agentes químicos, tóxicos',                 keywords: /intoxicacion quimic|toxico|envenenamiento por plomo/i },
  { id: 3,  name: 'Silicosis',                                           keywords: /silicosis/i },
  { id: 4,  name: 'Asbestosis',                                          keywords: /asbestosis/i },
  { id: 5,  name: 'Neumoconiosis por polvo de carbón',                   keywords: /neumoconiosis.*carbon/i },
  { id: 6,  name: 'Talcosis, silicoalinosis',                            keywords: /talcosis|silicoalinosis/i },
  { id: 7,  name: 'Neoplasia por exposición a asbesto',                  keywords: /neoplasia.*asbesto|mesotelioma/i },
  { id: 8,  name: 'Neoplasia por cloruro de vinilo',                     keywords: /neoplasia.*vinilo/i },
  { id: 9,  name: 'Hipoacusia o sordera provocada por el ruido',         keywords: /hipoacusia.*ruido|trauma acustico|hipoacusia.*ocupacional/i },
  { id: 10, name: 'Enf. osteoarticulares por vibraciones mecánicas',     keywords: /vibraciones mecanicas/i },
  { id: 11, name: 'Enf. por vibraciones de trasmisión vertical',         keywords: /vibraciones.*vertical/i },
  { id: 12, name: 'Enf. por posturas forzadas y movimientos repetidos',  keywords: /posturas forzadas|movimientos repetidos|sindrome tunel carpiano/i },
  { id: 13, name: 'Enf. por presión de aire y agua',                     keywords: /presion.*aire.*agua|barotrauma/i },
  { id: 14, name: 'Enf. por radiaciones ionizadas',                      keywords: /radiaciones ioniza/i },
  { id: 15, name: 'Hepatitis B, C, VIH y otras víricas',                 keywords: /hepatitis b|hepatitis c|vih/i },
  { id: 16, name: 'Mycbacterium Tuberculosis',                           keywords: /tuberculosis/i },
  { id: 17, name: 'Leishmania Donovani Trópica',                         keywords: /leishmania/i },
  { id: 18, name: 'Estado de estrés',                                    keywords: /estres/i },
  { id: 19, name: 'Trastorno cognitivo leve',                            keywords: /cognitivo leve/i },
  { id: 20, name: 'Alcoholismo crónico relacionado al trabajo',          keywords: /alcoholismo/i },
  { id: 21, name: 'Depresión',                                           keywords: /depresion/i },
  { id: 22, name: 'Disturbios mentales subjetivos',                      keywords: /disturbios mentales/i },
  { id: 23, name: 'Hipertensión arterial',                               keywords: /hipertension|hta/i },
  { id: 24, name: 'Angina de pecho',                                     keywords: /angina/i },
  { id: 25, name: 'Arritmias cardiacas',                                 keywords: /arritmia/i },
  { id: 26, name: 'Síndrome de Raynauld',                                keywords: /raynauld/i },
  { id: 27, name: 'Dorsalgia',                                           keywords: /dorsalgia/i },
  { id: 28, name: 'Cervicalgia',                                         keywords: /cervicalgia/i },
  { id: 29, name: 'Ciática',                                             keywords: /ciatica|ciatalgia/i },
  { id: 30, name: 'Lumbago',                                             keywords: /lumbago|lumbalgia/i },
  { id: 31, name: 'Trastornos del plexo braquial',                       keywords: /plexo braquial/i },
  { id: 32, name: 'Gingivitis crónica',                                  keywords: /gingivitis/i },
  { id: 33, name: 'Estomatitis ulcerativa crónica',                      keywords: /estomatitis/i },
  { id: 34, name: 'Síndrome dispéptico',                                 keywords: /dispep/i },
  { id: 35, name: 'Gastritis',                                           keywords: /gastritis/i },
  { id: 36, name: 'Varices en miembros inferiores',                      keywords: /varices/i },
  { id: 37, name: 'Dermatitis alérgicas de contacto',                    keywords: /dermatitis.*contacto/i },
  { id: 38, name: 'Otras formas',                                        keywords: /.*/ },
];

// --- COMPONENTE PRINCIPAL ---
export default function EpiDataLaboral() {
  const [step, setStep] = useState('upload'); // upload | mapping | dashboard
  const [fileData, setFileData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [colMapping, setColMapping] = useState({
    edad: '', sexo: '', aptitud: '', tipo_examen: '', diagnosticos: [],
  });
  const [processedData, setProcessedData] = useState(null);
  const [activeTab, setActiveTab] = useState('mod1');

  // ── Manejar subida de archivo ──────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(new Uint8Array(evt.target.result), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (data.length > 0) {
        const fileHeaders = Object.keys(data[0]);
        setHeaders(fileHeaders);
        setFileData(data);
        autoGuessColumns(fileHeaders);
        setStep('mapping');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Algoritmo para adivinar las columnas ──────────────────────────────────
  const autoGuessColumns = (fileHeaders) => {
    const guess = { edad: '', sexo: '', aptitud: '', tipo_examen: '', diagnosticos: [] };

    fileHeaders.forEach(header => {
      const h = header.toLowerCase().trim();
      if (!guess.edad        && COL_ALIASES.edad.some(a => h.includes(a)))        guess.edad        = header;
      if (!guess.sexo        && COL_ALIASES.sexo.some(a => h.includes(a)))        guess.sexo        = header;
      if (!guess.aptitud     && COL_ALIASES.aptitud.some(a => h === a || h.includes(a)))     guess.aptitud     = header;
      if (!guess.tipo_examen && COL_ALIASES.tipo_examen.some(a => h.includes(a))) guess.tipo_examen = header;
      if (COL_ALIASES.diagnosticos.some(a => h.includes(a))) guess.diagnosticos.push(header);
    });

    setColMapping(guess);
  };

  // ── Procesamiento final de los datos ──────────────────────────────────────
  const processData = () => {
    const mod1 = {
      total: 0, m: 0, f: 0,
      apto:      { m: 0, f: 0, total: 0 },
      apto_restr:{ m: 0, f: 0, total: 0 },
      no_apto:   { m: 0, f: 0, total: 0 },
      ingreso:   { m: 0, f: 0, total: 0 },
      periodico: { m: 0, f: 0, total: 0 },
      retiro:    { m: 0, f: 0, total: 0 },
    };

    const emptyDemographics = () => ({
      '14-17': { m: 0, f: 0 },
      '18-29': { m: 0, f: 0 },
      '30-59': { m: 0, f: 0 },
      '60+':   { m: 0, f: 0 },
      total:   { m: 0, f: 0, general: 0 },
    });

    const mod2 = MODULO2_CATEGORIAS.map(cat => ({ ...cat, stats: emptyDemographics() }));
    const mod3 = MODULO3_CATEGORIAS.map(cat => ({ ...cat, stats: emptyDemographics() }));

    const getAgeGroup = (ageStr) => {
      const age = parseInt(ageStr, 10);
      if (isNaN(age))          return null;
      if (age >= 14 && age <= 17) return '14-17';
      if (age >= 18 && age <= 29) return '18-29';
      if (age >= 30 && age <= 59) return '30-59';
      if (age >= 60)           return '60+';
      return null;
    };

    const getSex = (sexStr) => {
      if (!sexStr) return null;
      const s = String(sexStr).toLowerCase();
      if (s.startsWith('m') || s === 'masculino') return 'm';
      if (s.startsWith('f') || s === 'femenino')  return 'f';
      return null;
    };

    const normalize = (str) =>
      String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const countDisease = (modArray, diagnosticos, ageGroup, sex) => {
      if (!diagnosticos || diagnosticos.length === 0) return;

      // Evitar contar la misma categoría más de una vez por trabajador
      const counted = new Set();

      diagnosticos.forEach(dx => {
        if (!dx) return;
        const dxStr = normalize(dx);
        if (!dxStr) return;

        // Ignorar resultados "sanos" que no impliquen patología
        if (
          /(normal|sano|conservado|sin alteracion|negativo|ningun|apto)/.test(dxStr) &&
          !/(leve|moderado|severo|hipoacusia|otitis|alteracion|enfermedad)/.test(dxStr)
        ) return;

        let matched = false;
        for (let i = 0; i < modArray.length - 1; i++) {
          if (modArray[i].keywords.test(dxStr)) {
            if (!counted.has(i)) {
              modArray[i].stats[ageGroup][sex]++;
              modArray[i].stats.total[sex]++;
              modArray[i].stats.total.general++;
              counted.add(i);
            }
            matched = true;
            break;
          }
        }
        if (!matched) {
          const last = modArray.length - 1;
          if (!counted.has(last)) {
            modArray[last].stats[ageGroup][sex]++;
            modArray[last].stats.total[sex]++;
            modArray[last].stats.total.general++;
            counted.add(last);
          }
        }
      });
    };

    fileData.forEach(row => {
      const ageGroup = getAgeGroup(row[colMapping.edad]);
      const sex = getSex(row[colMapping.sexo]);
      if (!sex) return;

      mod1.total++;
      mod1[sex]++;

      // Aptitud
      if (colMapping.aptitud && row[colMapping.aptitud]) {
        const apt = normalize(row[colMapping.aptitud]);
        if (apt.includes('restricci'))                          { mod1.apto_restr[sex]++; mod1.apto_restr.total++; }
        else if (apt.includes('no apto') || apt.includes('inapto')) { mod1.no_apto[sex]++;    mod1.no_apto.total++; }
        else if (apt.includes('apto'))                          { mod1.apto[sex]++;       mod1.apto.total++; }
      }

      // Tipo de examen
      if (colMapping.tipo_examen && row[colMapping.tipo_examen]) {
        const tipo = normalize(row[colMapping.tipo_examen]);
        if (tipo.includes('ingreso') || tipo.includes('pre'))          { mod1.ingreso[sex]++;   mod1.ingreso.total++; }
        else if (tipo.includes('periodico') || tipo.includes('anual')) { mod1.periodico[sex]++; mod1.periodico.total++; }
        else if (tipo.includes('retiro') || tipo.includes('egreso'))   { mod1.retiro[sex]++;    mod1.retiro.total++; }
      }

      // Diagnósticos (solo si tenemos grupo etario)
      if (ageGroup) {
        const diagsRow = colMapping.diagnosticos.map(col => row[col]).filter(Boolean);
        countDisease(mod2, diagsRow, ageGroup, sex);
        countDisease(mod3, diagsRow, ageGroup, sex);
      }
    });

    // Módulo 4: Conclusiones y Recomendaciones autogeneradas
    const topMod2 = [...mod2].sort((a, b) => b.stats.total.general - a.stats.total.general)[0];
    const topMod3 = [...mod3].sort((a, b) => b.stats.total.general - a.stats.total.general)[0];

    const conclusiones = [
      `Se evaluaron a ${mod1.total} trabajadores, siendo ${mod1.m} hombres y ${mod1.f} mujeres.`,
      `El ${((mod1.apto.total / (mod1.total || 1)) * 100).toFixed(1)}% de la población evaluada se encuentra con aptitud "APTO".`,
      `En cuanto a enfermedades generales, el grupo predominante fue "${topMod2.name}" con ${topMod2.stats.total.general} casos detectados.`,
      topMod3.stats.total.general > 0
        ? `Dentro de las enfermedades relacionadas al trabajo, destaca "${topMod3.name}" con ${topMod3.stats.total.general} hallazgos.`
        : 'No se registraron casos significativos de enfermedades profesionales o relacionadas al trabajo tipificadas.',
      `El mayor volumen de atenciones correspondió a exámenes de tipo ${mod1.ingreso.total > mod1.periodico.total ? 'Ingreso' : 'Periódico'}.`,
    ];

    const recomendaciones = [
      `Fortalecer los programas de vigilancia médica orientados a la prevención de ${topMod2.name}.`,
      topMod3.stats.total.general > 0
        ? `Realizar inspecciones de ergonomía o higiene industrial debido a los casos de ${topMod3.name}.`
        : 'Mantener los monitoreos ocupacionales periódicos para asegurar la ausencia de enfermedades profesionales.',
      `Realizar seguimiento a los ${mod1.apto_restr.total} trabajadores clasificados como "Apto con Restricción" para asegurar el cumplimiento de sus limitaciones.`,
      'Promover campañas de salud preventiva (nutrición, pausas activas) de acuerdo a las patologías más prevalentes.',
      'Asegurar que el 100% del personal cuente con sus exámenes médicos ocupacionales vigentes.',
    ];

    setProcessedData({ mod1, mod2, mod3, mod4: { conclusiones, recomendaciones } });
    setStep('dashboard');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">

      {/* HEADER */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600 w-8 h-8" />
          <h1 className="text-xl font-bold text-slate-700">EpiData Laboral</h1>
        </div>
        <div className="text-sm text-slate-500">
          Procesador Automático de Sábanas de Vigilancia Médica
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="mt-10 flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <UploadCloud size={40} />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Sube tu sábana de datos</h2>
            <p className="text-slate-500 mb-8 text-center max-w-md">
              Aceptamos archivos Excel (.xlsx, .xls) con formatos dinámicos. Nuestro sistema detectará automáticamente las columnas.
            </p>
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
              Seleccionar archivo Excel
              <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {/* STEP 2: MAPPING */}
        {step === 'mapping' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="text-blue-600 w-6 h-6" />
              <h2 className="text-xl font-bold">Confirma las columnas (Abanico de búsqueda)</h2>
            </div>
            <p className="text-slate-600 mb-6">
              Hemos analizado tu archivo y emparejado los títulos dinámicamente. Verifica que las columnas sean correctas. Si algo falló, corrígelo seleccionando de la lista.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { key: 'edad',        label: 'Columna de Edad' },
                { key: 'sexo',        label: 'Columna de Sexo' },
                { key: 'aptitud',     label: 'Columna de Aptitud' },
                { key: 'tipo_examen', label: 'Columna Tipo de Examen' },
              ].map(field => (
                <div key={field.key} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                  <select
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={colMapping[field.key]}
                    onChange={(e) => setColMapping({ ...colMapping, [field.key]: e.target.value })}
                  >
                    <option value="">-- Seleccionar columna --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Columnas de Diagnósticos (Puedes seleccionar varias)
              </label>
              <div className="flex flex-wrap gap-2">
                {headers.map(h => (
                  <button
                    key={h}
                    onClick={() => {
                      const list = colMapping.diagnosticos;
                      setColMapping({
                        ...colMapping,
                        diagnosticos: list.includes(h) ? list.filter(d => d !== h) : [...list, h],
                      });
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      colMapping.diagnosticos.includes(h)
                        ? 'bg-blue-100 border-blue-300 text-blue-700 font-medium'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t pt-6">
              <button
                onClick={processData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm flex items-center gap-2"
              >
                Generar Informe <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DASHBOARD */}
        {step === 'dashboard' && processedData && (
          <div className="flex flex-col md:flex-row gap-6">

            {/* Sidebar / Tabs */}
            <div className="w-full md:w-64 flex-shrink-0">
              <nav className="flex flex-col gap-2">
                {[
                  { id: 'mod1', icon: <Users size={18} />,     label: 'Modulo 1: Epidemiología' },
                  { id: 'mod2', icon: <Activity size={18} />,  label: 'Modulo 2: Enf. Generales' },
                  { id: 'mod3', icon: <BarChart2 size={18} />, label: 'Modulo 3: Enf. Ocupacionales' },
                  { id: 'mod4', icon: <FileText size={18} />,  label: 'Modulo 4: Conclusiones' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-200'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen</h3>
                <div className="text-3xl font-bold text-slate-800">{processedData.mod1.total}</div>
                <div className="text-sm text-slate-500">Trabajadores Evaluados</div>
              </div>

              <button
                onClick={() => { setStep('upload'); setProcessedData(null); setFileData(null); }}
                className="mt-4 w-full text-center px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm"
              >
                Cargar nueva sábana
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-x-auto">

              {/* MÓDULO 1 */}
              {activeTab === 'mod1' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">
                    Módulo 1: Epidemiología Laboral
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th colSpan="3" className="px-4 py-3 border-r border-slate-200 text-center">N° TOTAL EVALUADOS</th>
                          <th colSpan="4" className="px-4 py-3 border-r border-slate-200 text-center bg-blue-50">APTITUD MEDICA OCUPACIONAL</th>
                          <th colSpan="4" className="px-4 py-3 text-center bg-green-50">TIPO DE EXAMEN MÉDICO</th>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-100/50">
                          <th className="px-4 py-2 text-center border-r border-slate-200">M</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200">F</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200">TOTAL</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200 bg-blue-50/50">APTO</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200 bg-blue-50/50">APTO CON RESTR.</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200 bg-blue-50/50">NO APTO</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200 bg-blue-100">TOTAL</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200 bg-green-50/50">I (Ingreso)</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200 bg-green-50/50">P (Periódico)</th>
                          <th className="px-4 py-2 text-center border-r border-slate-200 bg-green-50/50">R (Retiro)</th>
                          <th className="px-4 py-2 text-center bg-green-100">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-center border-r border-slate-200 font-medium">{processedData.mod1.m}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200 font-medium">{processedData.mod1.f}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200 font-bold">{processedData.mod1.total}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200">{processedData.mod1.apto.total}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200">{processedData.mod1.apto_restr.total}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200">{processedData.mod1.no_apto.total}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200 font-bold bg-blue-50/30">
                            {processedData.mod1.apto.total + processedData.mod1.apto_restr.total + processedData.mod1.no_apto.total}
                          </td>
                          <td className="px-4 py-3 text-center border-r border-slate-200">{processedData.mod1.ingreso.total}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200">{processedData.mod1.periodico.total}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200">{processedData.mod1.retiro.total}</td>
                          <td className="px-4 py-3 text-center font-bold bg-green-50/30">
                            {processedData.mod1.ingreso.total + processedData.mod1.periodico.total + processedData.mod1.retiro.total}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MÓDULOS 2 y 3 */}
              {(activeTab === 'mod2' || activeTab === 'mod3') && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">
                    {activeTab === 'mod2'
                      ? 'Módulo 2: Enfermedades Relacionadas a la Salud'
                      : 'Módulo 3: Enfermedades Relacionadas al Trabajo'}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600 border border-slate-200 whitespace-nowrap">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th rowSpan="3" className="px-3 py-2 border border-slate-200 w-10 text-center">N°</th>
                          <th rowSpan="3" className="px-4 py-2 border border-slate-200 max-w-xs truncate">ENFERMEDADES Y PROBLEMAS RELACIONADOS</th>
                          <th colSpan="8" className="px-4 py-2 border border-slate-200 text-center bg-blue-50">N° DE CASOS DETECTADOS (EDAD Y SEXO)</th>
                          <th colSpan="2" className="px-4 py-2 border border-slate-200 text-center bg-slate-200">TOTALES</th>
                        </tr>
                        <tr className="bg-slate-50">
                          <th colSpan="2" className="px-2 py-1 text-center border border-slate-200">14-17 AÑOS</th>
                          <th colSpan="2" className="px-2 py-1 text-center border border-slate-200">18-29 AÑOS</th>
                          <th colSpan="2" className="px-2 py-1 text-center border border-slate-200">30-59 AÑOS</th>
                          <th colSpan="2" className="px-2 py-1 text-center border border-slate-200">60 AÑOS A MÁS</th>
                          <th className="px-2 py-1 text-center border border-slate-200 bg-slate-100 text-blue-700">M</th>
                          <th className="px-2 py-1 text-center border border-slate-200 bg-slate-100 text-pink-700">F</th>
                        </tr>
                        <tr className="bg-slate-100">
                          <th className="px-2 text-center border border-slate-200 text-blue-700">M</th>
                          <th className="px-2 text-center border border-slate-200 text-pink-700">F</th>
                          <th className="px-2 text-center border border-slate-200 text-blue-700">M</th>
                          <th className="px-2 text-center border border-slate-200 text-pink-700">F</th>
                          <th className="px-2 text-center border border-slate-200 text-blue-700">M</th>
                          <th className="px-2 text-center border border-slate-200 text-pink-700">F</th>
                          <th className="px-2 text-center border border-slate-200 text-blue-700">M</th>
                          <th className="px-2 text-center border border-slate-200 text-pink-700">F</th>
                          <th colSpan="2" className="border border-slate-200 bg-slate-200"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activeTab === 'mod2' ? processedData.mod2 : processedData.mod3).map((item, index) => (
                          <tr key={item.id} className="bg-white hover:bg-blue-50/50 border-b border-slate-200 transition-colors">
                            <td className="px-3 py-2 text-center font-medium border-r border-slate-200">{index + 1}</td>
                            <td className="px-4 py-2 border-r border-slate-200 whitespace-normal min-w-[250px]">{item.name}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['14-17'].m}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['14-17'].f}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['18-29'].m}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['18-29'].f}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['30-59'].m}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['30-59'].f}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['60+'].m}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200">{item.stats['60+'].f}</td>
                            <td className="px-2 py-2 text-center border-r border-slate-200 font-bold bg-slate-50 text-blue-800">{item.stats.total.m}</td>
                            <td className="px-2 py-2 text-center font-bold bg-slate-50 text-pink-800">{item.stats.total.f}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MÓDULO 4 */}
              {activeTab === 'mod4' && (
                <div className="max-w-4xl">
                  <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">
                    Módulo 4: Conclusiones y Recomendaciones
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="text-blue-600" />
                        <h3 className="text-lg font-bold text-blue-900">Conclusiones (Autogeneradas)</h3>
                      </div>
                      <ul className="space-y-4">
                        {processedData.mod4.conclusiones.map((text, i) => (
                          <li key={i} className="flex gap-3 text-slate-700">
                            <span className="font-bold text-blue-600 shrink-0">{i + 1}.</span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50/50 p-6 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="text-green-600" />
                        <h3 className="text-lg font-bold text-green-900">Recomendaciones</h3>
                      </div>
                      <ul className="space-y-4">
                        {processedData.mod4.recomendaciones.map((text, i) => (
                          <li key={i} className="flex gap-3 text-slate-700">
                            <span className="font-bold text-green-600 shrink-0">{i + 1}.</span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
