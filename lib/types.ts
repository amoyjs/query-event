declare namespace QueryEvent {
    export type Handler = (e: object) => void
    export interface RTouchEvent {
        origin: PixiEvent
        type: string
        delta?: {
            scale?: number,
            rotate?: number,
            x?: number,
            y?: number,
        }
        stopPropagation?: () => void
    }
    interface PixiEvent {
        data: {
            global: Point,
            [props: string]: any,
        },
        [props: string]: any,
    }
    interface Point {
        x: number
        y: number
    }
}

type callback = (ev: QueryEvent.RTouchEvent) => void
declare module '@amoy/event' {
    function on(target: any, evName: string, fn: callback): any
    function off(target: any, evName: string, fn?: callback): any
    const queryEvent: {
        on: (name: string, closure: () => void) => any,
        off: (name: string) => any,
    }
    const RTOUCH_SUPPORT_EVENT: string[]
}
