import { sampleInput } from '../apps/remotion/src/sampleInput';

const allowed = {
  visualStyle: ['warm','rec','cute','cinematic','beat','social','food','night','travel','city','minimal'],
  pace: ['slow','medium_slow','slow_medium','medium','medium_fast','fast'],
};

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const plan = sampleInput.plan;
assert(plan.title && plan.subtitle, 'sample plan title/subtitle missing');
assert(allowed.visualStyle.includes(plan.visualStyle), `invalid visualStyle: ${plan.visualStyle}`);
assert(allowed.pace.includes(plan.pace), `invalid pace: ${plan.pace}`);
assert(plan.opening?.title, 'opening title missing');
assert(plan.scenes.length >= 3, 'sample scenes should be >= 3');
const ids = new Set(plan.scenes.map((s) => s.assetId));
for (const scene of plan.scenes) {
  assert(scene.caption, `scene ${scene.assetId} caption missing`);
  assert(scene.duration > 0, `scene ${scene.assetId} duration invalid`);
  assert(ids.has(scene.assetId), `scene asset not found: ${scene.assetId}`);
}
assert(plan.ending?.text, 'ending text missing');
assert(plan.revisionSuggestions.length >= 3, 'revision suggestions should be >= 3');
console.log('✅ sampleInput DirectorPlan 结构检查通过');
