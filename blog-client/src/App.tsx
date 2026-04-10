import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const POSTS = [
  {
    id: 1,
    slug: "the-quiet-internet",
    title: "The Quiet Internet",
    subtitle: "A meditation on what we lost when everything became loud",
    category: "Essay",
    date: "April 8, 2026",
    readTime: "7 min",
    featured: true,
    author: { name: "Mara Voss", initials: "MV" },
    excerpt:
      "There was a time when logging on felt like entering a library after hours — hushed, expectant, full of potential. Before the infinite scroll, before the engagement metrics, before the outrage machine learned your triggers better than you did.",
    body: `There was a time when logging on felt like entering a library after hours — hushed, expectant, full of potential. Before the infinite scroll, before the engagement metrics, before the outrage machine learned your triggers better than you did.

I think about this often. Not with pure nostalgia — the early internet had its own cruelties — but with a kind of archaeological curiosity. What were we actually doing in those chat rooms and forum threads? What need were we meeting that now goes unmet?

The answer, I've come to believe, is *patience*. We were practicing patience without knowing it. Pages loaded slowly, which meant you had to decide, really decide, that you wanted to read something before you committed to it. There was friction, and friction creates intention.

Now everything is frictionless and nothing means anything.

**The Attention Economy's Original Sin**

The shift happened gradually, then suddenly — the Hemingway quote that has become a cliché precisely because it's true. Somewhere between 2007 and 2012, the calculus changed. The metric stopped being "did the user find what they were looking for?" and became "how long can we keep them here?"

This reorientation had consequences that compounded over years. If your revenue depends on time-on-site, you optimize for compulsion, not satisfaction. You learn that anxiety performs better than contentment. That outrage keeps eyes open longer than joy.

We are living in the aftermath of that optimization.

**What Quiet Felt Like**

My first real website was a Geocities page I built in 1999. It had a MIDI file that played automatically (inexcusable, in retrospect), a guestbook where three people left notes over two years, and a page of "cool links" that I updated maybe monthly.

Nobody knew it existed except the people I told about it. There were no analytics, no follower counts, no hearts or retweets. I made it because making things felt good. I shared it with friends because sharing things felt good.

The feedback loop was slow and human-sized.

Today's internet is fast and inhuman-sized. Every post enters a torrent. You know, almost immediately, whether you've succeeded or failed — and "success" is measured in the currency of attention, which is the currency of our age.

**Finding the Quiet Again**

I'm not going to tell you to delete your apps. I've read those essays, and I've found them useful in the way that someone telling you to exercise is useful: technically correct, practically insufficient.

What I will say is that I've started maintaining a separate, slower relationship with the internet alongside the fast one. A folder of RSS feeds I check on Saturdays. A few forums where posts stay up for days before anyone responds. A personal wiki I update when I feel like it, for no one.

The quiet internet still exists. It's just harder to find, because it's not trying to find you.

That's almost the point.`,
    tags: ["culture", "technology", "attention"],
  },
  {
    id: 2,
    slug: "learning-in-public",
    title: "Learning in Public",
    subtitle: "Why showing your work changes everything",
    category: "Practice",
    date: "April 3, 2026",
    readTime: "5 min",
    featured: false,
    author: { name: "Sam Okafor", initials: "SO" },
    excerpt:
      "The most valuable thing I've done for my career isn't a project, a certification, or a degree. It's the habit of writing down what I'm figuring out, in real time, before I've figured it out.",
    body: `The most valuable thing I've done for my career isn't a project, a certification, or a degree. It's the habit of writing down what I'm figuring out, in real time, before I've figured it out.

This sounds uncomfortable because it is. You're exposing your confusion to the world. You're publishing half-formed thoughts alongside half-formed conclusions. You're inviting strangers to see you not knowing things.

And yet.

**The Compression Problem**

Most knowledge we share is compressed. We wait until we understand something well enough to explain it cleanly — which means we filter out all the false starts, the wrong turns, the moments of embarrassing confusion that were, actually, where the real learning happened.

When you learn in public, you document the messy middle. This is valuable to you (you can see your own reasoning evolve) and unexpectedly valuable to others (they're often in the messy middle too, and your company helps).

**Unexpected Consequences**

I started writing weekly notes about things I was learning at work. I expected nothing. What happened instead:

Three people reached out to collaborate on projects directly related to what I'd written about. A hiring manager told me in an interview that she'd read my notes for six months before reaching out. Two people told me my confused early write-ups on a topic helped them more than the polished tutorials, because they could follow my confusion.

The confused version of you is useful. We just rarely let people see it.

**The Actual Practice**

You don't need an audience to start. You need a place to write and a commitment to honesty about where you are.

Write while you're learning, not after. Include what you don't understand. Update posts when you figure out you were wrong. The updates are often the most valuable part.

The only rule is: don't perform expertise you don't have. The whole point is showing up as you actually are.`,
    tags: ["writing", "learning", "career"],
  },
  {
    id: 3,
    slug: "the-shape-of-a-good-meeting",
    title: "The Shape of a Good Meeting",
    subtitle: "Most meetings fail for structural reasons, not cultural ones",
    category: "Work",
    date: "March 28, 2026",
    readTime: "4 min",
    featured: false,
    author: { name: "Lena Park", initials: "LP" },
    excerpt:
      "We have a lot of opinions about meeting culture — too many meetings, cameras on or off, hybrid etiquette. But I've found that the quality of meetings is rarely about norms. It's about structure.",
    body: `We have a lot of opinions about meeting culture — too many meetings, cameras on or off, hybrid etiquette. But I've found that the quality of meetings is rarely about norms. It's about structure.

Specifically: does the meeting know what it is?

**The Four Types**

Most meetings are one of four things, and most bad meetings are bad because they're trying to be more than one of them at once:

**Information transfer**: Someone has information; others need it. Should usually be async. When sync is justified, it's because questions are expected or the information is emotionally sensitive.

**Decision making**: A group needs to reach a conclusion. Requires that the decision be clearly named at the start, that the decision-makers are in the room, and that the meeting ends with a documented outcome.

**Problem solving**: The group doesn't know the answer and needs to think together. This is the rarest legitimate use of synchronous time. It requires psychological safety and a skilled facilitator.

**Relationship building**: Sometimes people just need to be in a room together. This is valid! But it should be named as such rather than dressed up as productivity.

**The Single Question**

Before every meeting I run or attend, I try to answer one question: *What would make this meeting a success?*

If I can't answer it in one sentence, the meeting isn't ready.

If the answer is "we'll have shared the updates," schedule an email.
If the answer is "we'll have made the call on X," make sure the decision-maker is present.
If the answer is "we'll have figured out how to solve Y," block two hours and clear the deck.

The shape follows from the purpose. We just rarely stop to name the purpose.`,
    tags: ["work", "meetings", "management"],
  },
  {
    id: 4,
    slug: "on-finishing-things",
    title: "On Finishing Things",
    subtitle: "The last 10% is where most of the value lives",
    category: "Essay",
    date: "March 20, 2026",
    readTime: "6 min",
    featured: false,
    author: { name: "Mara Voss", initials: "MV" },
    excerpt:
      "I have a folder called 'almost done' on my desktop. It has 23 items in it. They've been 'almost done' for an average of 14 months.",
    body: `I have a folder called "almost done" on my desktop. It has 23 items in it. They've been "almost done" for an average of 14 months.

This is not a productivity essay. I'm not going to give you a system for finishing things. What I want to do instead is think about why finishing is hard — specifically why the last 10% of a project is disproportionately difficult compared to the first 90%.

**The Asymmetry of Completion**

Starting a project is pure possibility. You haven't made the trade-offs yet, haven't discovered the constraints, haven't encountered the ways reality differs from your mental model. Starting feels like freedom.

The last 10% is reckoning. You've made all your major decisions; now you're living with them. The compromises are visible. The gap between what you imagined and what you made is fully apparent.

Finishing means accepting that gap.

**Why That Gap Feels Unbearable**

There's something particular about being *almost done* that makes continuation harder than starting fresh. The unfinished thing sits in your peripheral vision, silently cataloging its own shortcomings. Every day you don't finish it, you're reminded that you haven't finished it.

Psychologists call this the Zeigarnik effect: we remember incomplete tasks more vividly than completed ones. This is useful when you need to remember to buy milk; it's brutal when you're trying to ship something.

The unfinished project accumulates weight. The longer it sits, the heavier it gets.

**The Case for Shipping Ugly**

The cure, I think, is to deeply internalize something that sounds obvious but isn't: a finished imperfect thing is worth infinitely more than an unfinished thing that could have been perfect.

Not a little more. Infinitely more.

The unfinished project, no matter how good it might have been, contributes nothing to the world. It can't be used, learned from, criticized, improved, built upon, or shared. It exists only as a source of guilt.

The finished imperfect thing does all of those things.

Close the folder. Ship the draft. Finish the song.

The last 10% is where most of the value lives — not because it's better work, but because it's the work that lets everything else matter.`,
    tags: ["creativity", "process", "shipping"],
  },
  {
    id: 5,
    slug: "small-data",
    title: "Small Data",
    subtitle: "The numbers you actually need to understand your own life",
    category: "Tools",
    date: "March 14, 2026",
    readTime: "5 min",
    featured: false,
    author: { name: "Sam Okafor", initials: "SO" },
    excerpt:
      "We talk a lot about big data — the vast corpora that train models and inform policy. I want to talk about small data: the handful of personal metrics that, tracked carefully over time, can tell you more about your life than any algorithm.",
    body: `We talk a lot about big data — the vast corpora that train models and inform policy. I want to talk about small data: the handful of personal metrics that, tracked carefully over time, can tell you more about your life than any algorithm.

I've been doing this informally for about four years. I track a small number of things — never more than six at a time — and review them weekly. Here's what I've learned.

**Less Is More, Genuinely**

Every time I've added a metric, the whole system became less useful. There's a sweet spot between two and five variables where patterns become visible. Below two, there's nothing to correlate. Above five, the noise overwhelms the signal.

The variables that have mattered most to me: sleep duration, a daily energy rating (1–5), whether I exercised, whether I did "deep work" for more than two hours, and whether I had a meaningful conversation with someone I care about.

These are deeply personal choices. The point isn't to copy them — it's to find the five things that, when they go well, make your days feel like your days.

**What You Discover**

Within about six weeks of honest tracking, patterns emerge that are obvious in retrospect and invisible beforehand. For me: exercise doesn't improve my next-day energy (widely believed to be true) but dramatically improves my next-day mood. Sleep below 6.5 hours tanks my deep work capacity completely. Meaningful conversations are the strongest predictor of weekly satisfaction, stronger than any productivity metric.

None of these are universal truths. They're my truths, discoverable only through my data.

**The Practice**

Track in the simplest possible way. I use a spreadsheet with one row per day and six columns. The barrier to entry must be near zero or you'll stop.

Review weekly, not daily. Daily variation is noise. Weekly patterns are signal.

Don't optimize obsessively. The goal is insight, not control. If you find that you sleep better when you don't look at your phone after 9pm, try that — but gently, as an experiment.

Your life isn't a system to be optimized. Small data helps you understand it. That's enough.`,
    tags: ["data", "habits", "self-knowledge"],
  },
];

const CATEGORIES = ["All", "Essay", "Practice", "Work", "Tools"];

function Header({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="font-serif text-2xl font-bold tracking-tight text-stone-900 hover:text-amber-700 transition-colors"
        >
          The Margin
        </button>
        <nav className="flex items-center gap-6 text-sm font-medium text-stone-500">
          <button
            onClick={() => onNavigate("home")}
            className="hover:text-stone-900 transition-colors"
          >
            Archive
          </button>
          <button
            onClick={() => onNavigate("about")}
            className="hover:text-stone-900 transition-colors"
          >
            About
          </button>
          <Button
            size="sm"
            className="bg-stone-900 text-white hover:bg-amber-700 rounded-none text-xs tracking-widest uppercase font-semibold px-4"
          >
            Subscribe
          </Button>
        </nav>
      </div>
    </header>
  );
}

function FeaturedPost({
  post,
  onRead,
}: {
  post: (typeof POSTS)[0];
  onRead: (slug: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border border-stone-200 mb-12">
      <div className="md:col-span-3 bg-stone-900 p-10 flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs tracking-widest uppercase text-amber-400 font-semibold">
              Featured
            </span>
            <span className="text-stone-500 text-xs">·</span>
            <span className="text-xs tracking-widest uppercase text-stone-400">
              {post.category}
            </span>
          </div>
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed font-serif italic">
            {post.subtitle}
          </p>
        </div>
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 bg-amber-700">
              <AvatarFallback className="text-white text-xs bg-amber-700">
                {post.author.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{post.author.name}</p>
              <p className="text-stone-500 text-xs">
                {post.date} · {post.readTime} read
              </p>
            </div>
          </div>
          <Button
            onClick={() => onRead(post.slug)}
            variant="outline"
            className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white rounded-none text-xs tracking-widest uppercase"
          >
            Read →
          </Button>
        </div>
      </div>
      <div className="md:col-span-2 bg-amber-50 p-10 flex flex-col justify-center border-l border-stone-200">
        <p className="font-serif text-stone-700 text-lg leading-relaxed italic">
          "{post.excerpt}"
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          {post.tags.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="text-xs border-stone-300 text-stone-500 rounded-none"
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  onRead,
}: {
  post: (typeof POSTS)[0];
  onRead: (slug: string) => void;
}) {
  return (
    <article
      className="group cursor-pointer border-b border-stone-200 pb-8 last:border-0"
      onClick={() => onRead(post.slug)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs tracking-widest uppercase text-stone-400 font-semibold">
          {post.category}
        </span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.date}</span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.readTime} read</span>
      </div>
      <h3 className="font-serif text-2xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors mb-2 leading-tight">
        {post.title}
      </h3>
      <p className="text-stone-500 text-sm font-serif italic mb-3">
        {post.subtitle}
      </p>
      <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mb-4">
        {post.excerpt}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-stone-200 text-stone-600">
              {post.author.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-stone-500">{post.author.name}</span>
        </div>
        <div className="flex gap-2">
          {post.tags.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="text-xs border-stone-200 text-stone-400 rounded-none"
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}

function ArticlePage({
  post,
  onBack,
}: {
  post: (typeof POSTS)[0];
  onBack: () => void;
}) {
  const paragraphs = post.body.split("\n\n");

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <button
        onClick={onBack}
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10 flex items-center gap-2"
      >
        ← Back to archive
      </button>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs tracking-widest uppercase text-amber-700 font-semibold">
          {post.category}
        </span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.date}</span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.readTime} read</span>
      </div>

      <h1 className="font-serif text-5xl font-bold text-stone-900 leading-tight mb-4">
        {post.title}
      </h1>
      <p className="font-serif text-xl text-stone-500 italic mb-8">
        {post.subtitle}
      </p>

      <div className="flex items-center gap-3 mb-10">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-stone-200 text-stone-600 text-sm">
            {post.author.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-stone-800">{post.author.name}</p>
          <p className="text-xs text-stone-400">Contributing editor</p>
        </div>
      </div>

      <Separator className="mb-10 bg-stone-200" />

      <div className="prose-stone max-w-none">
        {paragraphs.map((p, i) => {
          if (p.startsWith("**") && p.endsWith("**")) {
            return (
              <h3
                key={i}
                className="font-serif text-xl font-bold text-stone-900 mt-10 mb-4"
              >
                {p.replace(/\*\*/g, "")}
              </h3>
            );
          }
          if (p.includes("*") && !p.startsWith("**")) {
            const parts = p.split(/\*(.*?)\*/g);
            return (
              <p key={i} className="text-stone-700 leading-relaxed mb-5 text-lg font-serif">
                {parts.map((part, j) =>
                  j % 2 === 1 ? <em key={j}>{part}</em> : part
                )}
              </p>
            );
          }
          return (
            <p key={i} className="text-stone-700 leading-relaxed mb-5 text-lg font-serif">
              {p}
            </p>
          );
        })}
      </div>

      <Separator className="my-10 bg-stone-200" />

      <div className="flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <Badge
            key={t}
            variant="outline"
            className="text-xs border-stone-300 text-stone-500 rounded-none"
          >
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <button
        onClick={onBack}
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10 flex items-center gap-2"
      >
        ← Back
      </button>
      <h1 className="font-serif text-5xl font-bold text-stone-900 mb-6">
        About The Margin
      </h1>
      <Separator className="mb-8 bg-stone-200" />
      <div className="space-y-5 font-serif text-lg text-stone-700 leading-relaxed">
        <p>
          <em>The Margin</em> is an independent publication for long-form writing
          about how we live and work in the present tense. No trending topics. No
          hot takes. Just thinking that takes its time.
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
      <div className="mt-12 p-8 bg-stone-900 border border-stone-200">
        <h2 className="font-serif text-2xl font-bold text-white mb-3">
          Stay in the loop
        </h2>
        <p className="text-stone-400 text-sm mb-5">
          New essays delivered to your inbox, no more than twice a month.
        </p>
        <div className="flex gap-0">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 text-sm bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
          />
          <Button className="bg-amber-700 hover:bg-amber-600 rounded-none px-6 text-white text-xs tracking-widest uppercase font-semibold">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<string>("home");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = (p: string) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  const featured = POSTS.find((p) => p.featured)!;
  const rest = POSTS.filter((p) => !p.featured);

  const filtered = rest.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q));
    return matchCat && matchSearch;
  });

  if (page === "about") {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Header onNavigate={navigate} />
        <AboutPage onBack={() => navigate("home")} />
      </div>
    );
  }

  const articlePost = POSTS.find((p) => p.slug === page);
  if (articlePost) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Header onNavigate={navigate} />
        <ArticlePage post={articlePost} onBack={() => navigate("home")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header onNavigate={navigate} />

      {/* Hero strip */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4 text-xs text-stone-400 overflow-x-auto">
          <span className="text-amber-700 font-semibold tracking-widest uppercase whitespace-nowrap">
            Long reads
          </span>
          {POSTS.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(p.slug)}
              className="hover:text-stone-700 transition-colors whitespace-nowrap"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <FeaturedPost post={featured} onRead={navigate} />

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-0 border border-stone-200">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 text-xs tracking-widest uppercase font-semibold transition-colors border-r border-stone-200 last:border-0 ${
                  activeCategory === c
                    ? "bg-stone-900 text-white"
                    : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 text-sm border border-stone-200 focus:outline-none focus:border-stone-400 bg-white w-full sm:w-48"
          />
        </div>

        {/* Post list */}
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <p className="text-stone-400 font-serif italic text-lg py-12 text-center">
              No posts found.
            </p>
          ) : (
            filtered.map((p) => (
              <PostCard key={p.id} post={p} onRead={navigate} />
            ))
          )}
        </div>
      </main>

      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-serif text-stone-900 font-bold text-lg">
            The Margin
          </p>
          <p className="text-xs text-stone-400">
            Independent since 2021 · Made with care
          </p>
        </div>
      </footer>
    </div>
  );
}
