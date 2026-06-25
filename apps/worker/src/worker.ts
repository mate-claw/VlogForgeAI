import { config, completeTask, ensureStorageDirs, failTask, queueStats, takeNextTask, type QueueTask } from '@ai-vlog/core';
import { processCreateVlog, processExportSquare, processReviseVlog } from './processor';

ensureStorageDirs();

async function handleTask(task: QueueTask) {
  console.log(`[worker] start ${task.taskId} ${task.type} job=${task.jobId} attempt=${task.attempts}/${task.maxAttempts}`);
  if (task.type === 'create_vlog') await processCreateVlog(task.jobId, task.payload as never);
  else if (task.type === 'revise_vlog') await processReviseVlog(task.jobId, task.payload as never);
  else if (task.type === 'export_square') await processExportSquare(task.jobId, task.payload as never);
  else throw new Error(`未知任务类型：${task.type}`);
  completeTask(task);
  console.log(`[worker] done ${task.taskId}`);
}

let active = 0;
let stopping = false;
const once = process.argv.includes('--once');

process.on('SIGINT', () => { stopping = true; console.log('[worker] stopping...'); });
process.on('SIGTERM', () => { stopping = true; console.log('[worker] stopping...'); });

async function tick() {
  if (stopping) return;
  while (active < Math.max(1, config.workerConcurrency)) {
    const task = takeNextTask();
    if (!task) break;
    active += 1;
    handleTask(task)
      .catch((error) => {
        const result = failTask(task, error);
        console.error(`[worker] ${result} ${task.taskId}`, error);
      })
      .finally(() => { active -= 1; });
  }
  if (once) {
    if (active === 0) process.exit(0);
    return;
  }
  setTimeout(tick, config.workerPollIntervalMs);
}

console.log('VlogForgeAI Worker running');
console.log('Queue driver:', config.queueDriver);
console.log('Database driver:', config.databaseDriver);
console.log('Storage driver:', config.storageDriver);
console.log('Worker concurrency:', config.workerConcurrency);
console.log('Queue stats:', queueStats());
void tick();
