export type Post = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  readTime: string;
  featured: boolean;
  author: { name: string; initials: string };
  excerpt: string;
  body: string;
  tags: string[];
};

export const POSTS: Post[] = [
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

export const CATEGORIES = ["All", "Essay", "Practice", "Work", "Tools"];
