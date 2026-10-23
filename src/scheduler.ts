import { Cron } from 'croner'

export interface CronSchedulerOptions {
  readonly cron: string
  readonly onTick: () => void
}

export function startCronScheduler(options: CronSchedulerOptions): () => void {
  const job = new Cron(options.cron, options.onTick)
  return () => job.stop()
}
