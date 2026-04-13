import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        to="/"
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10 inline-flex items-center gap-2"
      >
        ← Back
      </Link>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-6">
        About The Margin
      </h1>

      <Separator className="mb-8 bg-stone-200" />

      <div className="space-y-5 font-serif text-lg text-stone-700 leading-relaxed">
        <p>
          <em>The Margin</em> is an independent publication for long-form
          writing about how we live and work in the present tense. No trending
          topics. No hot takes. Just thinking that takes its time.
        </p>

        <p>
          We publish essays, reported pieces, and practical writing from a small
          group of contributors who care more about getting things right than
          getting things first.
        </p>

        <p>
          The name comes from the margins of books — where the real conversation
          happens, where readers argue back, where meaning accumulates over
          multiple readings.
        </p>

        <p>
          We publish when we have something worth saying. Usually that's a few
          times a month.
        </p>
      </div>

      <div className="mt-12 p-6 sm:p-8 bg-stone-900 border border-stone-200">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <Avatar className="w-12 h-12 hidden sm:flex">
            <AvatarFallback className="bg-stone-200 text-stone-700 text-sm">
              TM
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white mb-1">
              Stay in the loop
            </h2>
            <p className="text-stone-400 text-sm mb-4">
              New essays delivered to your inbox, no more than twice a month.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-md w-full">
              <input
                aria-label="Email address"
                type="email"
                placeholder="your@email.com"
                className="flex-1 w-full px-4 py-2 text-sm bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
              <Button className="bg-amber-700 hover:bg-amber-600 rounded-none px-6 py-2 sm:py-0 h-auto sm:h-10 text-white text-xs tracking-widest uppercase font-semibold w-full sm:w-auto">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
