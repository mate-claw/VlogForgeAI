import type { FontToken } from '@ai-vlog/shared';

export type FontTokenSpec = {
  family: string;
  weight: number;
  letterSpacing: number;
};

export const fontTokens: Record<FontToken, FontTokenSpec> = {
  rounded_cute: {
    family: '"Nunito", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    weight: 900,
    letterSpacing: 0,
  },
  clean_sans: {
    family: 'Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    weight: 780,
    letterSpacing: 0,
  },
  cinematic_serif: {
    family: 'Georgia, "Times New Roman", "Noto Serif SC", serif',
    weight: 760,
    letterSpacing: 1.4,
  },
  handwritten: {
    family: '"Comic Sans MS", "Microsoft YaHei", cursive',
    weight: 760,
    letterSpacing: 0,
  },
  mono_rec: {
    family: '"Roboto Mono", "Consolas", "Courier New", monospace',
    weight: 720,
    letterSpacing: 1.2,
  },
  editorial: {
    family: '"Playfair Display", Georgia, "Noto Serif SC", serif',
    weight: 820,
    letterSpacing: 0.8,
  },
  food_label: {
    family: '"Arial Rounded MT Bold", "Microsoft YaHei", Arial, sans-serif',
    weight: 880,
    letterSpacing: 0.4,
  },
  travel_stamp: {
    family: '"Trebuchet MS", "PingFang SC", "Microsoft YaHei", sans-serif',
    weight: 850,
    letterSpacing: 1.6,
  },
};

export function getFontTokenSpec(token?: FontToken): FontTokenSpec | undefined {
  return token ? fontTokens[token] : undefined;
}
