import type { VisualStyle, TypographyDecision, VisualStylePack } from '@ai-vlog/shared';
import { getFontTokenSpec } from '../styles/fontTokens';
import { getVisualStylePackSpec } from '../styles/visualStylePacks';

export const baseFont = 'Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif';

type StyleTokens = {
  bg: string;
  panel: string;
  panelStrong: string;
  shadow: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  glass: string;
  fontFamily: string;
  radius: number;
};

const defaults: Record<VisualStyle, Omit<StyleTokens, 'accent' | 'text' | 'fontFamily'>> = {
  warm: {
    bg: 'radial-gradient(circle at 20% 12%, rgba(255,198,132,.34), transparent 30%), linear-gradient(135deg,#25150f,#5c3424 48%,#9c6840)',
    panel: 'rgba(255,235,210,.18)',
    panelStrong: 'rgba(255,235,210,.30)',
    shadow: 'rgba(255,170,105,.35)',
    muted: 'rgba(255,245,232,.78)',
    accent2: '#ffbd7f',
    glass: 'rgba(40,21,14,.42)',
    radius: 38,
  },
  rec: {
    bg: 'radial-gradient(circle at 80% 10%, rgba(255,62,48,.18), transparent 28%), linear-gradient(135deg,#080808,#222 52%,#383838)',
    panel: 'rgba(255,255,255,.12)',
    panelStrong: 'rgba(255,255,255,.20)',
    shadow: 'rgba(255,60,48,.28)',
    muted: 'rgba(255,255,255,.72)',
    accent2: '#ff3b30',
    glass: 'rgba(0,0,0,.45)',
    radius: 28,
  },
  cute: {
    bg: 'radial-gradient(circle at 18% 20%, rgba(255,255,255,.52), transparent 22%), linear-gradient(135deg,#ffc1dc,#a4ddff 48%,#ffe7a9)',
    panel: 'rgba(255,255,255,.30)',
    panelStrong: 'rgba(255,255,255,.46)',
    shadow: 'rgba(255,118,182,.28)',
    muted: 'rgba(58,42,70,.72)',
    accent2: '#88d7ff',
    glass: 'rgba(255,255,255,.36)',
    radius: 44,
  },
  cinematic: {
    bg: 'radial-gradient(circle at 80% 18%, rgba(255,203,124,.20), transparent 34%), linear-gradient(135deg,#050505,#15120f 58%,#3c2f22)',
    panel: 'rgba(255,255,255,.08)',
    panelStrong: 'rgba(255,239,216,.16)',
    shadow: 'rgba(255,225,180,.24)',
    muted: 'rgba(255,245,230,.70)',
    accent2: '#a77945',
    glass: 'rgba(0,0,0,.52)',
    radius: 18,
  },
  beat: {
    bg: 'radial-gradient(circle at 30% 10%, rgba(93,95,239,.45), transparent 28%), radial-gradient(circle at 85% 80%, rgba(255,64,129,.34), transparent 30%), linear-gradient(135deg,#050505,#161616)',
    panel: 'rgba(255,255,255,.13)',
    panelStrong: 'rgba(255,255,255,.22)',
    shadow: 'rgba(255,255,255,.32)',
    muted: 'rgba(255,255,255,.74)',
    accent2: '#5d5fef',
    glass: 'rgba(0,0,0,.35)',
    radius: 26,
  },
  social: {
    bg: 'linear-gradient(135deg,#1d272e,#51606a 48%,#89939b)',
    panel: 'rgba(255,255,255,.15)',
    panelStrong: 'rgba(255,255,255,.24)',
    shadow: 'rgba(255,255,255,.18)',
    muted: 'rgba(255,255,255,.76)',
    accent2: '#d9e8ff',
    glass: 'rgba(20,30,38,.42)',
    radius: 34,
  },
  food: {
    bg: 'radial-gradient(circle at 72% 18%, rgba(255,196,121,.28), transparent 31%), linear-gradient(135deg,#2c1209,#744229 55%,#b7774c)',
    panel: 'rgba(255,223,178,.16)',
    panelStrong: 'rgba(255,223,178,.26)',
    shadow: 'rgba(255,158,76,.28)',
    muted: 'rgba(255,239,216,.72)',
    accent2: '#ff9b56',
    glass: 'rgba(48,23,12,.44)',
    radius: 36,
  },
  night: {
    bg: 'radial-gradient(circle at 25% 12%, rgba(100,139,255,.30), transparent 32%), linear-gradient(135deg,#030514,#141a35 58%,#28305d)',
    panel: 'rgba(175,195,255,.12)',
    panelStrong: 'rgba(175,195,255,.20)',
    shadow: 'rgba(116,149,255,.28)',
    muted: 'rgba(220,228,255,.72)',
    accent2: '#7994ff',
    glass: 'rgba(5,8,28,.50)',
    radius: 30,
  },
  travel: {
    bg: 'radial-gradient(circle at 80% 16%, rgba(255,225,146,.24), transparent 35%), linear-gradient(135deg,#183748,#5e795d 48%,#c4aa72)',
    panel: 'rgba(255,255,255,.15)',
    panelStrong: 'rgba(255,255,255,.24)',
    shadow: 'rgba(255,210,120,.25)',
    muted: 'rgba(255,255,255,.76)',
    accent2: '#91d7ff',
    glass: 'rgba(20,42,55,.42)',
    radius: 32,
  },
  city: {
    bg: 'linear-gradient(135deg,#10151b,#323b46 48%,#626f7d)',
    panel: 'rgba(255,255,255,.12)',
    panelStrong: 'rgba(255,255,255,.20)',
    shadow: 'rgba(180,210,255,.20)',
    muted: 'rgba(238,246,255,.73)',
    accent2: '#9ecbff',
    glass: 'rgba(8,16,24,.42)',
    radius: 24,
  },
  minimal: {
    bg: 'linear-gradient(135deg,#0c0c0c,#2a2a2a)',
    panel: 'rgba(255,255,255,.10)',
    panelStrong: 'rgba(255,255,255,.18)',
    shadow: 'rgba(255,255,255,.14)',
    muted: 'rgba(255,255,255,.68)',
    accent2: '#dadada',
    glass: 'rgba(0,0,0,.42)',
    radius: 22,
  },
};

export function getStyleTokens(style: VisualStyle, typography: TypographyDecision, pack?: VisualStylePack): StyleTokens {
  const base = defaults[style] || defaults.warm;
  const packSpec = getVisualStylePackSpec(pack);
  const fontSpec = getFontTokenSpec(typography.fontToken || packSpec?.fontToken);
  const accent = typography.accentColor || packSpec?.accent || (style === 'cute' ? '#ff5da8' : style === 'beat' ? '#ff3d8b' : '#ffe1bd');
  const text = typography.textColor || packSpec?.text || '#fff';
  return {
    ...base,
    bg: packSpec?.background || base.bg,
    panel: packSpec?.captionBg || base.panel,
    panelStrong: packSpec?.captionBg || base.panelStrong,
    accent,
    text,
    muted: packSpec?.muted || base.muted,
    fontFamily: fontSpec?.family || typography.fontFamily || baseFont,
  };
}
