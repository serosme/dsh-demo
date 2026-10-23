import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { attachDecision } from './decision.ts'
import { attachDelivery } from './delivery.ts'
import { heartbeatEvents } from './events.ts'
import { startCronScheduler } from './scheduler.ts'

export const name = 'dsh-demo'
export const inject = ['agents', 'sessionController']

export const Config = Schema.object({
  cron: Schema.string()
    .default('*/1 * * * *')
    .description('Cron 表达式'),
  sessionId: Schema.string()
    .default('')
    .description('Session ID'),
  message: Schema.string()
    .default('心跳')
    .description('心跳信息'),
})

type ConfigValue = ReturnType<typeof Config>

export function apply(ctx: Context, config: ConfigValue): void {
  if (config.sessionId === '')
    console.warn('[dsh-demo] 未配置 Session ID')

  try {
    ctx.effect(() => {
      attachDecision(ctx)
      attachDelivery(ctx, {
        sessionId: config.sessionId,
        message: config.message,
      })

      return startCronScheduler({
        cron: config.cron,
        onTick: () => {
          try {
            ctx.emit(heartbeatEvents.tick)
          }
          catch (err) {
            console.warn(`[dsh-demo] 心跳触发失败：${err instanceof Error ? err.message : String(err)}`)
          }
        },
      })
    }, 'dsh-heartbeat')
  }
  catch (err) {
    console.warn(`[dsh-demo] 心跳启动失败：${err instanceof Error ? err.message : String(err)}`)
  }
}
