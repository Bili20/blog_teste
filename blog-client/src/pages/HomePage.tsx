import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4 text-xs text-stone-400 overflow-x-auto">
          <span className="text-amber-700 font-semibold tracking-widest uppercase whitespace-nowrap">
            Long reads
          </span>
          <span className="whitespace-nowrap px-4 py-2">
            Content integration pending
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="border border-stone-200 bg-white p-10 text-center">
          <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
            Integration in progress
          </p>

          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-4">
            Home content is being connected to the API
          </h1>

          <p className="text-stone-500 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            The mock posts were removed so the frontend can move forward with
            the authentication-first integration. The posts module will be
            connected in the next step, after login is fully finished and
            validated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-stone-900 text-white rounded-none uppercase text-xs tracking-widest font-semibold hover:bg-amber-700 transition-colors"
            >
              Go to login
            </Link>

            <Link
              to="/about"
              className="inline-block px-6 py-3 border border-stone-200 text-stone-700 rounded-none uppercase text-xs tracking-widest font-semibold hover:bg-stone-50 transition-colors"
            >
              About the project
            </Link>
          </div>
        </div>

        <div className="mt-10 border border-stone-200 bg-stone-50 p-6">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
            What is already done
          </h2>

          <ul className="space-y-2 text-sm text-stone-600 leading-relaxed">
            <li>• Login page and authentication flow are being integrated.</li>
            <li>
              • Axios will be the shared HTTP client for backend requests.
            </li>
            <li>• JWT session handling is the current priority.</li>
            <li>
              • Posts, featured content, and article pages will come next.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
