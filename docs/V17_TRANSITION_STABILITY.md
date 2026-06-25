# v17: true cross-scene dissolve + stable visual layout

This patch fixes the remaining 00:07-00:08 / scene-boundary stutter.

Root cause found from the uploaded final video:

- FPS normalization worked for the 23.976fps source asset.
- The new visible stutter is at a scene boundary, around the cut from the cutting-board detail scene to the dining scene.
- Previous `TransitionEngine` only drew an overlay on top of the current scene; it did not actually overlap the outgoing and incoming scenes.
- `SceneTimeline` used sequential `Sequence` blocks, so the underlying image still changed as a hard cut. This looked like a shake/jump, especially when the layout changed from close-up food detail to social/card layout.

What changed:

1. Added overlapping scene timing in `utils/timing.ts`.
2. `SceneTimeline` now renders adjacent scenes with true opacity overlap.
3. Opening and ending cards also fade into/out of scenes instead of hard cutting.
4. Stable `fade` / `crossfade` no longer draws extra flash overlays; the actual dissolve is handled by timeline opacity.
5. Added render-time visual layout sanitizer in `utils/renderScene.ts` so food/cafe scenes keep a consistent `food_card` visual language in stable mode instead of jumping between unrelated layouts.

This keeps AI-generated stories/captions intact. It only stabilizes the visual rendering layer.
