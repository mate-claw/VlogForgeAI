import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { VlogPlan } from '@ai-vlog/shared';
import { getStyleTokens } from '../utils/styleTokens';
import { getVisualStylePackSpec } from '../styles/visualStylePacks';
import { getFontTokenSpec } from '../styles/fontTokens';
import { StyleLayer } from '../overlays/StyleLayer';
import { StickerLayer } from '../stickers/StickerLayer';
import { getStabilityMode } from '../utils/stability';

export const EndingCard: React.FC<{ plan: VlogPlan }> = ({ plan }) => {
  const f = useCurrentFrame();
  const mode = getStabilityMode(plan);
  const t = getStyleTokens(plan.visualStyle, plan.typography, plan.visualStylePack);
  const pack = getVisualStylePackSpec(plan.visualStylePack);
  const variant = pack?.endingVariant || 'warm';
  const font = getFontTokenSpec(plan.typography.titleFontToken || plan.typography.fontToken);
  const opacity = interpolate(f, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(f, [0, 18], [26, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textStyle: React.CSSProperties = {
    fontFamily: font?.family || plan.typography.fontFamily,
    fontWeight: font?.weight || plan.typography.fontWeight,
    letterSpacing: plan.typography.letterSpacing ?? font?.letterSpacing ?? 0,
    color: plan.typography.titleColor || t.text,
  };

  if (variant === 'rec') {
    return <AbsoluteFill style={{ background: '#060b10', color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <StyleLayer overlays={['clean_modern', 'noise_texture', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', inset: 52, border: `2px solid ${t.panelStrong}`, borderRadius: 32 }} />
      <div style={{ position: 'absolute', left: 78, top: 78, fontFamily: 'Consolas, monospace', fontSize: 28 }}><span style={{ color: '#ff3b30' }}>●</span> REC DONE</div>
      <div style={{ position: 'absolute', left: 78, right: 78, bottom: 245, opacity, transform: `translateY(${y}px)` }}>
        <div style={{ fontFamily: 'Consolas, monospace', color: t.accent, fontSize: 22, letterSpacing: 5, marginBottom: 24 }}>LOG SAVED</div>
        <div style={{ ...textStyle, fontFamily: 'Consolas, monospace', fontSize: 58, lineHeight: 1.18 }}>{plan.ending.text}</div>
        <div style={{ marginTop: 24, fontSize: 24, color: t.muted }}>{plan.hashtags.map((h) => `#${h}`).join('  ')}</div>
      </div>
    </AbsoluteFill>;
  }

  if (variant === 'cinematic' || variant === 'travel') {
    return <AbsoluteFill style={{ background: '#050505', color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <StyleLayer overlays={variant === 'travel' ? ['film_grain', 'light_leak', 'soft_vignette'] : ['cinematic_letterbox', 'film_grain', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 82, right: 82, top: variant === 'travel' ? 240 : 320, bottom: variant === 'travel' ? 260 : 320, border: variant === 'travel' ? '10px solid rgba(255,255,255,.86)' : '1px solid rgba(255,255,255,.20)', borderRadius: variant === 'travel' ? 16 : 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 58px', opacity, transform: `translateY(${y}px)` }}>
        <div style={{ fontSize: 22, letterSpacing: 8, color: t.accent, fontWeight: 900, marginBottom: 24 }}>{variant === 'travel' ? 'MEMORY POSTCARD' : 'THE END'}</div>
        <div style={{ ...textStyle, fontSize: variant === 'travel' ? 54 : 50, lineHeight: 1.35 }}>{plan.ending.text}</div>
        <div style={{ marginTop: 28, fontSize: 22, color: t.muted, letterSpacing: 3 }}>{plan.hashtags.slice(0, 3).map((h) => `#${h}`).join('  ')}</div>
      </div>
    </AbsoluteFill>;
  }

  if (variant === 'food') {
    return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <StyleLayer overlays={['warm_glow', 'film_grain', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 80, right: 80, top: 410, padding: '50px 44px', borderRadius: 34, background: 'rgba(55,27,12,.62)', border: `2px solid ${t.accent}`, boxShadow: '0 30px 90px rgba(0,0,0,.42)', opacity, transform: `translateY(${y}px)` }}>
        <div style={{ fontSize: 22, letterSpacing: 6, color: t.accent, fontWeight: 950, marginBottom: 18 }}>TASTE NOTE</div>
        <div style={{ ...textStyle, fontSize: 52, lineHeight: 1.32 }}>{plan.ending.text}</div>
      </div>
    </AbsoluteFill>;
  }

  if (variant === 'cute') {
    return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <StyleLayer overlays={['cute_pastel', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 88, right: 88, top: 440, padding: '58px 46px', borderRadius: 58, background: 'rgba(255,255,255,.28)', border: '8px solid rgba(255,255,255,.25)', textAlign: 'center', opacity, transform: `translateY(${y}px)` }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>✨ ♡ 🐾</div>
        <div style={{ ...textStyle, fontSize: 58, lineHeight: 1.25, textShadow: '0 12px 38px rgba(180,60,130,.28)' }}>{plan.ending.text}</div>
      </div>
      <StickerLayer stickers={plan.ending.stickers || ['heart', 'star']} typography={plan.typography} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
    </AbsoluteFill>;
  }

  if (variant === 'night') {
    return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <StyleLayer overlays={['dark_night', 'film_grain', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 90, right: 90, bottom: 310, opacity, transform: `translateY(${y}px)` }}>
        <div style={{ fontSize: 20, letterSpacing: 6, color: t.accent, marginBottom: 24 }}>NIGHT MEMORY</div>
        <div style={{ ...textStyle, fontSize: 50, lineHeight: 1.45 }}>{plan.ending.text}</div>
      </div>
    </AbsoluteFill>;
  }

  return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
    <StyleLayer overlays={plan.ending.overlays?.length ? plan.ending.overlays : pack?.overlays || ['warm_glow', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
    <div style={{ position: 'absolute', inset: 78, borderRadius: 46, border: `1px solid ${t.panelStrong}`, opacity: .36 }} />
    <div style={{ position: 'absolute', left: 90, right: 90, top: 540, textAlign: 'center', opacity, transform: `translateY(${y}px)` }}>
      <div style={{ ...textStyle, fontSize: plan.typography.endingFontSize, lineHeight: 1.28 }}>{plan.ending.text}</div>
      <div style={{ marginTop: 34, color: t.muted, fontSize: 24 }}>{plan.hashtags.slice(0, 4).map((h) => `#${h}`).join('  ')}</div>
    </div>
    <StickerLayer stickers={plan.ending.stickers || []} typography={plan.typography} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
  </AbsoluteFill>;
};
