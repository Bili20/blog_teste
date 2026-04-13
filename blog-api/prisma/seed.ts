/// <reference types="node" />
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Roles ────────────────────────────────────────────────────────────────────

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const authorRole = await prisma.role.upsert({
    where: { name: "author" },
    update: {},
    create: { name: "author" },
  });

  console.log("✅ Roles created: admin, author");

  // ── Authors ──────────────────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash("admin123", 10);
  const authorPassword = await bcrypt.hash("author123", 10);

  const mara = await prisma.author.upsert({
    where: { email: "mara@themargin.com" },
    update: {},
    create: {
      id: "author-mara",
      name: "Mara Voss",
      initials: "MV",
      bio: "Writer and cultural critic exploring the edges of digital life.",
      email: "mara@themargin.com",
      passwordHash: adminPassword,
    },
  });

  const sam = await prisma.author.upsert({
    where: { email: "sam@themargin.com" },
    update: {},
    create: {
      id: "author-sam",
      name: "Sam Ortega",
      initials: "SO",
      bio: "Designer and essayist writing about craft, tools, and creative practice.",
      email: "sam@themargin.com",
      passwordHash: adminPassword,
    },
  });

  const lena = await prisma.author.upsert({
    where: { email: "lena@themargin.com" },
    update: {},
    create: {
      id: "author-lena",
      name: "Lena Park",
      initials: "LP",
      bio: "Researcher and writer interested in attention, memory, and slow media.",
      email: "lena@themargin.com",
      passwordHash: adminPassword,
    },
  });

  const alex = await prisma.author.upsert({
    where: { email: "alex@themargin.com" },
    update: {},
    create: {
      id: "author-alex",
      name: "Alex Kim",
      initials: "AK",
      bio: "Contributing writer with a focus on practice and technology.",
      email: "alex@themargin.com",
      passwordHash: authorPassword,
    },
  });

  console.log("✅ Authors created: mara, sam, lena (admin), alex (author)");

  // ── Author roles ─────────────────────────────────────────────────────────────

  for (const author of [mara, sam, lena]) {
    await prisma.authorRole.upsert({
      where: {
        authorId_roleId: {
          authorId: author.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        authorId: author.id,
        roleId: adminRole.id,
      },
    });
  }

  await prisma.authorRole.upsert({
    where: {
      authorId_roleId: {
        authorId: alex.id,
        roleId: authorRole.id,
      },
    },
    update: {},
    create: {
      authorId: alex.id,
      roleId: authorRole.id,
    },
  });

  console.log("✅ Author roles assigned");

  // ── Tags ─────────────────────────────────────────────────────────────────────

  const tagData = [
    { name: "Culture", slug: "culture" },
    { name: "Technology", slug: "technology" },
    { name: "Attention", slug: "attention" },
    { name: "Design", slug: "design" },
    { name: "Tools", slug: "tools" },
    { name: "Writing", slug: "writing" },
    { name: "Internet", slug: "internet" },
    { name: "Memory", slug: "memory" },
    { name: "Practice", slug: "practice" },
    { name: "Reading", slug: "reading" },
    { name: "Work", slug: "work" },
    { name: "Craft", slug: "craft" },
    { name: "Philosophy", slug: "philosophy" },
    { name: "Media", slug: "media" },
    { name: "Slowness", slug: "slowness" },
  ];

  for (const tag of tagData) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log(`✅ ${tagData.length} tags created`);

  // ── Posts ─────────────────────────────────────────────────────────────────────

  const posts = [
    {
      id: "post-1",
      slug: "the-quiet-internet",
      title: "The Quiet Internet",
      subtitle: "A meditation on what we lost when everything became loud",
      excerpt:
        "There was a time when logging on felt like entering a library. The silence was part of the experience.",
      body: `There was a time when logging on felt like entering a library. You typed commands, waited, and the response came in measured lines. The silence was part of the experience.

The modern internet has no silence. Every surface competes for your attention. Every scroll reveals another demand. The feed never ends. The notifications never stop.

What we lost is harder to name than what we gained. We gained connection, yes. We gained access to knowledge, convenience, speed. But something quieter disappeared: the experience of going online as a choice, a transition, a move from one mode of being to another.

Today there is no transition. The internet is ambient. It is the air. And like air, we no longer notice it unless it is taken away.

The question worth sitting with is not how to get back to a quieter internet — that door is probably closed — but how to cultivate quiet within ourselves while the noise continues outside.`,
      category: "Essay",
      readTime: "7 min",
      featured: true,
      published: true,
      authorId: mara.id,
      tagSlugs: ["culture", "internet", "attention"],
    },
    {
      id: "post-2",
      slug: "tools-that-think-with-you",
      title: "Tools That Think With You",
      subtitle:
        "On the difference between tools that serve and tools that replace",
      excerpt:
        "Not all tools are equal. Some extend your capabilities. Others quietly replace the thinking you were supposed to do.",
      body: `Not all tools are equal. Some extend your capabilities. Others quietly replace the thinking you were supposed to do.

The distinction matters more now than it did a decade ago. As AI becomes embedded in every tool, the question is no longer whether the tool is smart. The question is whether it leaves room for you to think at all.

A good tool respects the boundary between its work and yours. A hammer extends your arm. A calculator extends your arithmetic. These tools are dumb by design. They do exactly what you make them do, nothing more.

The tools emerging today are different. They make suggestions. They complete your sentences. They organise your thoughts before you have finished having them. This is remarkable — and worth being suspicious of.

The goal should not be to avoid smart tools. The goal should be to remain the one who decides what the tool is for. Keep the question for yourself. Delegate only the execution.`,
      category: "Tools",
      readTime: "5 min",
      featured: false,
      published: true,
      authorId: sam.id,
      tagSlugs: ["tools", "technology", "practice"],
    },
    {
      id: "post-3",
      slug: "notes-on-slow-reading",
      title: "Notes on Slow Reading",
      subtitle: "Why reading faster is not the same as reading better",
      excerpt:
        "Speed reading promises more books in less time. But books are not problems to be optimised. They are experiences to be inhabited.",
      body: `Speed reading promises more books in less time. But books are not problems to be optimised. They are experiences to be inhabited.

The metaphor of the reading stack — the pile of books you mean to read, the articles you have saved, the newsletters you have not opened — is a modern anxiety. The stack never shrinks. And so the proposed solution is to read faster, to consume more, to turn reading into processing.

But the best reading I have ever done was slow. It moved at the pace of thought, pausing on a sentence for minutes at a time, following a thread sideways into a footnote, losing the thread entirely and starting over.

Slow reading is not inefficient. It is the point. The goal is not to cover more ground. The goal is to be changed by what you read.

You cannot be changed by something you have only skimmed.`,
      category: "Practice",
      readTime: "4 min",
      featured: false,
      published: true,
      authorId: lena.id,
      tagSlugs: ["reading", "slowness", "attention"],
    },
    {
      id: "post-4",
      slug: "the-craft-of-constraints",
      title: "The Craft of Constraints",
      subtitle: "How limits sharpen creative work",
      excerpt:
        "Every creative practice has constraints. The most productive practitioners know which ones to accept and which ones to push against.",
      body: `Every creative practice has constraints. Deadlines. Word counts. Budgets. Technical limitations. The expectations of an audience.

The most productive practitioners I know have a specific relationship with constraints. They do not resent them. They do not accept them passively either. They know which ones to accept and which ones to push against.

The constraint worth accepting is the one that forces specificity. A short essay is better than a long one not because length is bad but because the discipline of compression clarifies thinking. You cannot be vague in two hundred words.

The constraint worth pushing against is the one that asks you to be safe. Safe writing bores everyone, including the writer. The best work comes from people who were not quite sure they were allowed to say what they said.

Learn to tell the difference.`,
      category: "Work",
      readTime: "6 min",
      featured: false,
      published: true,
      authorId: sam.id,
      tagSlugs: ["craft", "work", "writing"],
    },
    {
      id: "post-5",
      slug: "on-keeping-a-commonplace-book",
      title: "On Keeping a Commonplace Book",
      subtitle: "A low-tech practice for a high-noise world",
      excerpt:
        "Writers have kept commonplace books for centuries. The practice is simple, durable, and more relevant than ever.",
      body: `Writers have kept commonplace books for centuries. The practice is simple: write down the passages, ideas, and observations that stop you. Accumulate them in one place. Return to them later.

There is no algorithm in this practice. No recommended content. No feed. No notification. You decide what is worth keeping. You decide when to look again.

The discipline of choosing what to copy out is itself valuable. When you read with the intention of writing something down, you read differently. You become an editor of your own attention.

A commonplace book also has a memory that your own mind lacks. I have returned to passages I noted years ago and found them saying something I did not understand when I first encountered them. The book waits with patience that I do not have.

Start with whatever is at hand. A physical notebook is best. A plain text file works. The tool does not matter. The habit does.`,
      category: "Practice",
      readTime: "5 min",
      featured: false,
      published: true,
      authorId: lena.id,
      tagSlugs: ["writing", "practice", "memory"],
    },
  ];

  for (const { tagSlugs, ...postData } of posts) {
    await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        ...postData,
        tags: {
          create: tagSlugs.map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
      },
    });
  }

  console.log(`✅ ${posts.length} posts created`);

  console.log("\n🎉 Seed complete!\n");
  console.log("Dev credentials:");
  console.log("  Admin  → mara@themargin.com  / admin123");
  console.log("  Admin  → sam@themargin.com   / admin123");
  console.log("  Admin  → lena@themargin.com  / admin123");
  console.log("  Author → alex@themargin.com  / author123");
  console.log();
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
