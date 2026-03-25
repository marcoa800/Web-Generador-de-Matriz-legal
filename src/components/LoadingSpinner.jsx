export default function LoadingSpinner({ title, subtitle, steps = [] }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Spinner */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute w-20 h-20 rounded-full border-4 border-blue-100" />
          <div className="absolute w-20 h-20 rounded-full border-4 border-t-blue-700 animate-spin" />
          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
        {subtitle && <p className="text-slate-500 mb-8">{subtitle}</p>}

        {steps.length > 0 && (
          <div className="space-y-3 text-left">
            {steps.map((step, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${step.active ? 'bg-blue-50 border border-blue-200' : 'bg-slate-100 opacity-50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500' : step.active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  {step.done ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.active ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`text-sm font-medium ${step.active ? 'text-blue-800' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
