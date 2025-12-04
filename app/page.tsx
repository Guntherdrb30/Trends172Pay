export default function HomePage() {
  return (
    <section className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          trends172 Pay – Pasarela de pagos multi-negocio
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
          trends172 Pay es una pasarela de pagos centralizada pensada para
          administrar cobros de múltiples negocios desde un solo lugar. Aquí
          podrás orquestar pagos, comisiones y liquidaciones sin que tus
          clientes tengan que preocuparse por la complejidad bancaria.
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 sm:p-6">
        <p className="font-medium text-slate-100">
          Estado del proyecto · Setup inicial
        </p>
        <p className="mt-2 text-slate-300">
          Esta es la base técnica del proyecto trends172 Pay. A partir de aquí
          iremos añadiendo el dashboard administrativo, la API pública v1, la
          integración con el banco y el asistente de conexión inteligente para
          tus clientes.
        </p>
      </div>
    </section>
  );
}

