type Task<T> = () => Promise<T>;

type QueueItem<T> = {
  task: Task<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

export class RenderQueue {
  private active = 0;
  private queue: QueueItem<unknown>[] = [];

  constructor(private readonly concurrency: number) {}

  getStats() {
    return { pending: this.queue.length, active: this.active };
  }

  run<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task: task as Task<unknown>, resolve: resolve as (value: unknown) => void, reject });
      this.drain();
    });
  }

  private drain() {
    while (this.active < this.concurrency && this.queue.length) {
      const item = this.queue.shift()!;
      this.active += 1;
      item.task()
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.active -= 1;
          this.drain();
        });
    }
  }
}
