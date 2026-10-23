import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { SessionController } from '@deepseek-ai/dsh-api-session-controller'
import { createUserMessage } from '@deepseek-ai/dsh-llm/message'
import { SessionId } from '@deepseek-ai/dsh-session'
import { heartbeatEvents } from './events.ts'

declare module '@deepseek-ai/dsh-llm/message' {
  interface MessageSourceMap {
    heartbeat: { kind: 'heartbeat' }
  }
}

export interface DeliveryOptions {
  readonly sessionId: string
  readonly message: string
}

export function attachDelivery(ctx: Context, options: DeliveryOptions): void {
  if (options.sessionId === '')
    return

  ctx.on(heartbeatEvents.hit, () => {
    void deliver(ctx, options).catch((err) => {
      console.warn(`[dsh-demo] 心跳投递失败 ${err instanceof Error ? err.message : String(err)}`)
    })
  })
}

async function deliver(ctx: Context, options: DeliveryOptions): Promise<void> {
  const sessionId = SessionId(options.sessionId)
  let agent: Agent | undefined = ctx.agents.get(sessionId)

  if (agent === undefined) {
    const controller: SessionController = ctx.sessionController
    const resolved = await controller.resolveAgent(sessionId)
    if ('error' in resolved)
      throw new Error(`${resolved.error.code} ${resolved.error.message}`)
    agent = resolved.agent
  }

  agent.followup(createUserMessage({
    content: [{ type: 'text', text: options.message }],
    source: { kind: 'heartbeat' },
  }))
}
