import {
  Activity,
  Baby,
  Bath,
  Bone,
  Brain,
  Droplet,
  Dumbbell,
  Feather,
  FileText,
  Flame,
  Flower2,
  Footprints,
  Hand,
  Heart,
  HeartPulse,
  HelpCircle,
  Laptop,
  Leaf,
  Lightbulb,
  Moon,
  ShieldCheck,
  Smile,
  Sparkles,
  Sun,
  Wind,
} from "lucide-react";

/**
 * Icons the admin can pick for an article. The key is what the database
 * stores (articles.icon), so keep existing keys when editing this list.
 */
export const ARTICLE_ICONS = {
  "file-text": FileText,
  "help-circle": HelpCircle,
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  hand: Hand,
  leaf: Leaf,
  "flower-2": Flower2,
  droplet: Droplet,
  heart: Heart,
  activity: Activity,
  brain: Brain,
  bone: Bone,
  footprints: Footprints,
  laptop: Laptop,
  dumbbell: Dumbbell,
  baby: Baby,
  bath: Bath,
  moon: Moon,
  sun: Sun,
  wind: Wind,
  feather: Feather,
  flame: Flame,
  smile: Smile,
  lightbulb: Lightbulb,
  "shield-check": ShieldCheck,
} as const;

export type ArticleIconKey = keyof typeof ARTICLE_ICONS;

export const DEFAULT_ARTICLE_ICON: ArticleIconKey = "file-text";

export const articleIcon = (key: string | null | undefined) =>
  ARTICLE_ICONS[key as ArticleIconKey] ?? FileText;
