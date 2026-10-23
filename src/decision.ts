import type { Context } from '@deepseek-ai/cordis'
import { heartbeatEvents } from './events.ts'

// 测试期恒定命中；后续换成真正的判定逻辑。
const shouldDeliver = true

export function attachDecision(ctx: Context): void {
  ctx.on(heartbeatEvents.tick, () => {
    if (shouldDeliver)
      ctx.emit(heartbeatEvents.hit)
  })
}
