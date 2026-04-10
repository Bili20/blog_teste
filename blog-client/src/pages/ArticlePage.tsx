import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function ArticlePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <Link
        to="/"
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10 inline-flex items-center gap-2"
      >
        ← Back to archive
      </Link>

      <div className="border border-stone-200 bg-stone-50 p-10 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Integration pending
        </p>

        <h1 className="font-serif text-4xl font-bold text-stone-900 mb-4">
          Article content will be connected next
        </h1>

        <p className="text-stone-500 leading-relaxed max-w-2xl mx-auto">
          The mock-based article reader was removed so the frontend can move to
          the real backend integration flow. In this phase, only authentication
          is being connected. Post loading by slug will be implemented in the
          next module.
        </p>

        <Separator className="my-8 bg-stone-200" />

        <div className="space-y-3 text-sm text-stone-500">
          <p>This page is intentionally temporary.</p>
          <p>
            Next planned step: integrate{" "}
            <span className="font-medium text-stone-700">
              GET /api/posts/slug/:slug
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
