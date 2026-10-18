
export interface BackpressureState {
  highWaterMark: number;
  bufferedBytes: number;
}

export function shouldPauseProducer(state: BackpressureState): boolean {
  return state.bufferedBytes >= state.highWaterMark;
}
