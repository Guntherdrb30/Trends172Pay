import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          trends172 Pay ƒ?" Pasarela de pagos multi-negocio
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
          trends172 Pay es una pasarela de pagos centralizada pensada para
          administrar cobros de mÇ§ltiples negocios desde un solo lugar. AquÇð
          podrÇ?s orquestar pagos, comisiones y liquidaciones sin que tus
          clientes tengan que preocuparse por la complejidad bancaria.
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 sm:p-6">
        <p className="font-medium text-slate-100">
          Estado del proyecto ¶ú Setup inicial
        </p>
        <p className="mt-2 text-slate-300">
          Esta es la base tÇ¸cnica del proyecto trends172 Pay. A partir de aquÇð
          iremos aÇñadiendo el dashboard administrativo, la API pÇ§blica v1, la
          integraciÇün con el banco y el asistente de conexiÇün inteligente para
          tus clientes.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="text-slate-400">
            ¿Eres administrador root?
          </span>
          <Link
            href="/admin/login"
            className="inline-flex h-8 items-center rounded-md border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            Entrar al dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

