// 事件名的唯一来源；emit/on 都从这里取。
export const heartbeatEvents = {
  tick: 'dsh-demo:heartbeat:tick',
  hit: 'dsh-demo:heartbeat:hit',
} as const

declare module '@deepseek-ai/cordis' {
  interface Events {
    [heartbeatEvents.tick]: () => void
    [heartbeatEvents.hit]: () => void
  }
}
