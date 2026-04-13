export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface TagOption {
  id: string;
  name: string;
  slug: string;
}

export interface TagSelectionState {
  selectedTagSlugs: string[];
}

export interface CreateTagFormValues {
  name: string;
  slug: string;
}

export interface CreateTagRequest {
  name: string;
  slug?: string;
}
