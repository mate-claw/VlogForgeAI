import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { DirectorScene, VlogPlan } from '@ai-vlog/shared';
import { AssetRenderer } from '../runtime/AssetRenderer';
import { getStyleTokens } from '../utils/styleTokens';
import { getVisualStylePackSpec } from '../styles/visualStylePacks';
import { getFontTokenSpec } from '../styles/fontTokens';
import { StickerLayer } from '../stickers/StickerLayer';
import { StyleLayer } from '../overlays/StyleLayer';
import { getStabilityMode } from '../utils/stability';

function openingScene(plan: VlogPlan): DirectorScene | undefined {
  return plan.scenes.find((s) => s.assetId === plan.opening.assetId) || plan.scenes[0];
}

const titleStyle = (plan: VlogPlan, color: string): React.CSSProperties => {
  const spec = getFontTokenSpec(plan.typography.titleFontToken || plan.typography.fontToken);
  return {
    fontFamily: spec?.family || plan.typography.fontFamily,
    fontSize: plan.typography.titleFontSize,
    fontWeight: spec?.weight || plan.typography.fontWeight,
    lineHeight: 1.04,
    letterSpacing: plan.typography.letterSpacing ?? spec?.letterSpacing ?? 0,
    color: plan.typography.titleColor || color,
  };
};

const BackgroundMedia: React.FC<{ scene?: DirectorScene; opacity?: number; blur?: number }> = ({ scene, opacity = .72, blur = 0 }) => scene ? (
  <AbsoluteFill style={{ opacity, filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? 'scale(1.08)' : undefined }}>
    <AssetRenderer scene={scene} volume={0} />
  </AbsoluteFill>
) : null;

export const OpeningCard: React.FC<{ plan: VlogPlan }> = ({ plan }) => {
  const f = useCurrentFrame();
  const mode = getStabilityMode(plan);
  const t = getStyleTokens(plan.visualStyle, plan.typography, plan.visualStylePack);
  const pack = getVisualStylePackSpec(plan.visualStylePack);
  const scene = openingScene(plan);
  const enter = {
    opacity: interpolate(f, [0, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    transform: `translateY(${interpolate(f, [0, 24], [34, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
  };
  const title = plan.opening.title || plan.title;
  const subtitle = plan.opening.subtitle || plan.subtitle;
  const variant = pack?.openingVariant || 'warm';
  const overlays = plan.opening.overlays?.length ? plan.opening.overlays : pack?.overlays || [];

  if (variant === 'rec') {
    return <AbsoluteFill style={{ background: '#060b10', color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <BackgroundMedia scene={scene} opacity={.48} />
      <StyleLayer overlays={['clean_modern', 'noise_texture', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', inset: 52, border: `2px solid ${t.panelStrong}`, borderRadius: 32 }} />
      <div style={{ position: 'absolute', left: 78, top: 78, fontFamily: 'Consolas, monospace', color: '#fff', fontSize: 30, fontWeight: 800 }}><span style={{ color: '#ff3b30' }}>●</span> REC / TODAY</div>
      <div style={{ position: 'absolute', right: 78, top: 84, fontFamily: 'Consolas, monospace', color: 'rgba(255,255,255,.78)', fontSize: 22 }}>00:00:00</div>
      <div style={{ position: 'absolute', left: 78, right: 90, bottom: 230, ...enter }}>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 24, letterSpacing: 4, color: t.accent, marginBottom: 22 }}>LIFE LOG</div>
        <div style={{ ...titleStyle(plan, t.text), fontSize: Math.min(88, plan.typography.titleFontSize), textAlign: 'left' }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 22, fontSize: plan.typography.subtitleFontSize, color: t.muted, lineHeight: 1.38, maxWidth: 760 }}>{subtitle}</div> : null}
      </div>
    </AbsoluteFill>;
  }

  if (variant === 'cinematic' || variant === 'travel') {
    const isTravel = variant === 'travel';
    return <AbsoluteFill style={{ background: '#050505', color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <BackgroundMedia scene={scene} opacity={isTravel ? .78 : .62} />
      <StyleLayer overlays={isTravel ? ['film_grain', 'soft_vignette', 'light_leak'] : ['cinematic_letterbox', 'film_grain', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 72, right: 72, top: isTravel ? 112 : 180, bottom: isTravel ? 164 : 180, border: isTravel ? '14px solid rgba(255,255,255,.88)' : '1px solid rgba(255,255,255,.18)', borderRadius: isTravel ? 18 : 0, boxShadow: '0 28px 90px rgba(0,0,0,.38)' }} />
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: isTravel ? 240 : 260, ...enter, textAlign: isTravel ? 'left' : 'center' }}>
        <div style={{ fontSize: 22, letterSpacing: 8, color: t.accent, fontWeight: 900, marginBottom: 28 }}>{isTravel ? 'POSTCARD' : 'A SHORT FILM'}</div>
        <div style={{ ...titleStyle(plan, t.text), fontSize: isTravel ? 76 : 82, textTransform: isTravel ? 'none' : 'uppercase' }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 22, fontSize: plan.typography.subtitleFontSize, color: t.muted, lineHeight: 1.45 }}>{subtitle}</div> : null}
      </div>
    </AbsoluteFill>;
  }

  if (variant === 'food') {
    return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <BackgroundMedia scene={scene} opacity={.42} blur={10} />
      <StyleLayer overlays={['warm_glow', 'film_grain', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 76, right: 76, top: 250, padding: '54px 46px', borderRadius: 34, background: 'rgba(55,27,12,.58)', border: `2px solid ${t.accent}`, boxShadow: '0 30px 100px rgba(0,0,0,.42)', ...enter }}>
        <div style={{ fontSize: 22, letterSpacing: 6, color: t.accent, fontWeight: 950, marginBottom: 20 }}>TODAY TASTE</div>
        <div style={{ ...titleStyle(plan, t.text), fontSize: 72 }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 22, fontSize: 32, lineHeight: 1.42, color: t.muted }}>{subtitle}</div> : null}
      </div>
      <StickerLayer stickers={plan.opening.stickers || ['food_label']} progress={f / 90} typography={plan.typography} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
    </AbsoluteFill>;
  }

  if (variant === 'cute') {
    return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <BackgroundMedia scene={scene} opacity={.28} blur={12} />
      <StyleLayer overlays={['cute_pastel', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 82, right: 82, top: 212, bottom: 262, borderRadius: 58, background: 'rgba(255,255,255,.22)', border: '10px solid rgba(255,255,255,.28)', boxShadow: '0 30px 100px rgba(255,105,170,.22)' }} />
      <div style={{ position: 'absolute', left: 95, right: 95, top: 520, ...enter, textAlign: 'center' }}>
        <div style={{ fontSize: 28, letterSpacing: 5, color: t.accent, fontWeight: 950, marginBottom: 22 }}>♡ LITTLE MOMENT</div>
        <div style={{ ...titleStyle(plan, '#fff'), fontSize: 78, textShadow: '0 12px 40px rgba(180,60,130,.35)' }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 24, fontSize: 32, lineHeight: 1.38, color: '#3f2a4b' }}>{subtitle}</div> : null}
      </div>
      <StickerLayer stickers={plan.opening.stickers || ['paw', 'heart', 'star']} progress={f / 90} typography={plan.typography} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
    </AbsoluteFill>;
  }

  if (variant === 'social' || variant === 'minimal' || variant === 'night') {
    return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
      <BackgroundMedia scene={scene} opacity={variant === 'night' ? .32 : .44} blur={variant === 'social' ? 8 : 0} />
      <StyleLayer overlays={variant === 'night' ? ['dark_night', 'film_grain'] : ['clean_modern', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      <div style={{ position: 'absolute', left: 82, right: 82, top: variant === 'night' ? 620 : 360, ...enter, textAlign: 'left' }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: t.accent, fontWeight: 800, marginBottom: 18 }}>{variant === 'night' ? 'NIGHT NOTE' : new Date().toLocaleDateString('zh-CN')}</div>
        <div style={{ ...titleStyle(plan, t.text), fontSize: variant === 'night' ? 64 : 72, lineHeight: 1.1 }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 24, fontSize: 30, color: t.muted, lineHeight: 1.5 }}>{subtitle}</div> : null}
      </div>
    </AbsoluteFill>;
  }

  return <AbsoluteFill style={{ background: t.bg, color: t.text, fontFamily: t.fontFamily, overflow: 'hidden' }}>
    <BackgroundMedia scene={scene} opacity={.34} blur={12} />
    <StyleLayer overlays={overlays.length ? overlays : ['warm_glow', 'soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
    <div style={{ position: 'absolute', inset: 70, border: `1px solid ${t.panelStrong}`, borderRadius: 46, opacity: .42 }} />
    <div style={{ position: 'absolute', left: 86, right: 86, top: 520, ...enter, textAlign: 'center' }}>
      <div style={{ fontSize: 22, letterSpacing: 6, marginBottom: 28, color: t.accent, fontWeight: 900 }}>MEMORY</div>
      <div style={{ ...titleStyle(plan, t.text) }}>{title}</div>
      {subtitle ? <div style={{ fontSize: plan.typography.subtitleFontSize, marginTop: 30, lineHeight: 1.36, opacity: .88, color: t.muted }}>{subtitle}</div> : null}
    </div>
    <StickerLayer stickers={plan.opening.stickers || []} progress={f / 90} typography={plan.typography} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
  </AbsoluteFill>;
};
