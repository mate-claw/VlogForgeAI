import fs from 'node:fs';
import path from 'node:path';
import { jobsDir } from './config';
import { renderWithRemotion } from './services/remotionRenderer';
import { sampleInput } from '../../remotion/src/sampleInput';

async function main() {
  const jobId = 'sample-remotion-components';
  const jobDir = path.resolve(jobsDir, jobId);
  fs.mkdirSync(jobDir, { recursive: true });
  const result = await renderWithRemotion({ jobId, jobDir, input: sampleInput });
  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
