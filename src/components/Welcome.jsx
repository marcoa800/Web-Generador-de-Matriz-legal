export default function Welcome({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="hero-gradient text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Normativa peruana vigente — El Peruano
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Generador de<br />
            <span className="text-sky-300">Matriz Legal SST</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Responda un breve cuestionario sobre su empresa y nuestra IA generará
            automáticamente la <strong className="text-white">Matriz de Requisitos Legales</strong> de
            Seguridad y Salud en el Trabajo aplicable a su rubro, guardada directamente en su Google Drive.
          </p>
          <button onClick={onStart} className="btn-primary text-lg px-8 py-4 shadow-xl">
            Comenzar ahora
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="mt-4 text-blue-200 text-sm">Menos de 5 minutos · Sin registro requerido</p>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 bg-slate-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-slate-800 mb-10">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="card flex flex-col items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold ${step.color}`}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Normas cubiertas */}
          <div className="mt-12 card">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Normativas cubiertas por la herramienta
            </h3>
            <div className="flex flex-wrap gap-2">
              {NORMAS.map((n) => (
                <span key={n} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    title: 'Cuestionario inteligente',
    desc: 'Responda preguntas adaptadas al rubro de su empresa. El sistema profundiza automáticamente según sus actividades y riesgos específicos.',
    color: 'bg-blue-700',
  },
  {
    title: 'IA analiza y estructura',
    desc: 'Google Gemini identifica todas las normas legales peruanas aplicables y genera la matriz con los 9 campos requeridos por SUNAFIL.',
    color: 'bg-indigo-600',
  },
  {
    title: 'Guardado en Google Drive',
    desc: 'La matriz se crea automáticamente como Google Sheets en su Drive, lista para compartir con su equipo o para adjuntar en auditorías.',
    color: 'bg-emerald-600',
  },
]

const NORMAS = [
  'Ley N° 29783', 'D.S. N° 005-2012-TR', 'Ley N° 30222', 'D.S. N° 024-2016-EM',
  'D.S. N° 011-2019-TR', 'G.050 RNE', 'RM N° 312-2011/MINSA', 'RM N° 050-2013-TR',
  'Ley N° 28611', 'D.L. N° 1278', 'D.S. N° 014-2017-MINAM', 'D.S. N° 043-2007-EM',
  'D.S. N° 023-2017-EM', 'D.S. N° 015-2005-SA', 'Ley N° 26790', 'D.S. N° 085-2003-PCM',
]
