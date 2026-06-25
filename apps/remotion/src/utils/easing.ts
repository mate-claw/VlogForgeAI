import { interpolate, Easing } from 'remotion';

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const softIn = (frame: number, duration = 18) =>
  interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

export const softOut = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

export const ease = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

export const breathe = (frame: number, amount = 1, speed = 34) => Math.sin(frame / speed) * amount;
export const pulse = (frame: number, amount = 1, speed = 8) => Math.sin(frame / speed) * amount;
export const floatY = (frame: number, index = 0, amount = 12) => Math.sin((frame + index * 17) / 24) * amount;
export const floatX = (frame: number, index = 0, amount = 10) => Math.cos((frame + index * 11) / 28) * amount;

export const entranceTransform = (frame: number, kind: 'fade_up' | 'typewriter' | 'pop' | 'slide' | 'none' = 'fade_up') => {
  const opacity = kind === 'none' ? 1 : softIn(frame, kind === 'pop' ? 10 : 16);
  if (kind === 'pop') {
    const scale = interpolate(frame, [0, 7, 13], [0.82, 1.08, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1)) });
    return { opacity, transform: `scale(${scale})` };
  }
  if (kind === 'slide') {
    const x = ease(frame, [0, 16], [-72, 0]);
    return { opacity, transform: `translateX(${x}px)` };
  }
  const y = ease(frame, [0, 16], [34, 0]);
  return { opacity, transform: `translateY(${y}px)` };
};

export const letterSpacingFor = (style?: string) => style === 'cinematic' ? 5 : style === 'beat' ? 2 : 0;
