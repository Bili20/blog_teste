import { PrismaClient } from "@prisma/client";
import { Post, PostSummary } from "@/domain/entities/Post";
import {
  IPostRepository,
  FindAllPostsOptions,
  PaginatedResult,
  CreatePostData,
  UpdatePostData,
} from "@/domain/interfaces/repositories/IPostRepository";

// Reusable Prisma include shape for post with relations
const POST_INCLUDE = {
  author: {
    select: { id: true, name: true, initials: true, bio: true },
  },
  tags: {
    select: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

function mapPost(raw: any): Post {
  return {
    ...raw,
    tags: raw.tags.map((pt: any) => pt.tag),
  };
}

function mapPostSummary(raw: any): PostSummary {
  const { body: _body, ...rest } = mapPost(raw);
  return rest;
}

export class PrismaPostRepository implements IPostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(
    options: FindAllPostsOptions = {},
  ): Promise<PaginatedResult<PostSummary>> {
    const {
      category,
      tagSlug,
      search,
      published = true,
      page = 1,
      limit = 10,
    } = options;

    const where: any = { published };

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (tagSlug) {
      where.tags = { some: { tag: { slug: tagSlug } } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { subtitle: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        include: POST_INCLUDE,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows.map(mapPostSummary),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });
    return post ? mapPost(post) : null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: POST_INCLUDE,
    });
    return post ? mapPost(post) : null;
  }

  async findFeatured(): Promise<PostSummary | null> {
    const post = await this.prisma.post.findFirst({
      where: { featured: true, published: true },
      include: POST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return post ? mapPostSummary(post) : null;
  }

  async create(data: CreatePostData): Promise<Post> {
    const { tagSlugs = [], slug, ...rest } = data;

    const post = await this.prisma.post.create({
      data: {
        ...rest,
        slug: slug as string,
        tags: {
          create: tagSlugs.map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
      },
      include: POST_INCLUDE,
    });

    return mapPost(post);
  }

  async update(id: string, data: UpdatePostData): Promise<Post> {
    const { tagSlugs, ...rest } = data;

    // If tags are being updated, replace them all
    const tagsUpdate =
      tagSlugs !== undefined
        ? {
            deleteMany: {},
            create: tagSlugs.map((slug) => ({
              tag: { connect: { slug } },
            })),
          }
        : undefined;

    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...rest,
        ...(tagsUpdate ? { tags: tagsUpdate } : {}),
      },
      include: POST_INCLUDE,
    });

    return mapPost(post);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const post = await this.prisma.post.findFirst({
      where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
      select: { id: true },
    });
    return post !== null;
  }
}
