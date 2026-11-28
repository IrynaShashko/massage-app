import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";

export interface Article {
  id: string;
  slug: string;
  title_ua: string;
  title_en: string;
  content_ua: string;
  content_en: string;
  published: boolean;
  /** key from src/config/articleIcons.ts */
  icon: string;
  created_at: string;
  updated_at: string;
}

export type ArticleInput = Pick<
  Article,
  | "slug"
  | "title_ua"
  | "title_en"
  | "content_ua"
  | "content_en"
  | "published"
  | "icon"
>;

const ARTICLES_KEY = ["articles"];

/** Title/content in the current language, falling back to Ukrainian */
export const localized = (article: Article, language: string) => {
  const en = language === "en";
  return {
    title: (en && article.title_en.trim()) || article.title_ua,
    content: (en && article.content_en.trim()) || article.content_ua,
  };
};

/**
 * RLS returns only published articles to visitors and every article to
 * admins, so the same query serves the site and the admin panel.
 */
export const useArticles = () =>
  useQuery<Article[], Error>({
    queryKey: ARTICLES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Article[];
    },
  });

export const useArticle = (slug: string | undefined) =>
  useQuery<Article | null, Error>({
    queryKey: [...ARTICLES_KEY, "slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Article | null;
    },
  });

export const useArticleById = (id: string | undefined) =>
  useQuery<Article | null, Error>({
    queryKey: [...ARTICLES_KEY, "id", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Article | null;
    },
  });

/** Creates when `id` is missing, updates otherwise */
export const useSaveArticle = () => {
  const queryClient = useQueryClient();
  return useMutation<Article, Error, { id?: string; input: ArticleInput }>({
    mutationFn: async ({ id, input }) => {
      const query = id
        ? supabase.from("articles").update(input).eq("id", id)
        : supabase.from("articles").insert(input);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Article;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ARTICLES_KEY }),
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ARTICLES_KEY }),
  });
};
