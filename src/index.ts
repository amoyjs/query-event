import { QueryEvent } from './types'
import RTouch, { RTOUCH_SUPPORT_EVENT } from './touch';

type callback = (ev: QueryEvent.RTouchEvent) => void

function bind(target: any, evName: string, fn: callback) {
    if (RTOUCH_SUPPORT_EVENT.includes(evName)) {
        if (!target['RTouch']) target['RTouch'] = new RTouch(target)
        target['RTouch'].on(evName, fn)
    } else {
        target.interactive = true
        target.on(evName, fn)
    }
}

function off(target: any, evName: string, fn?: callback) {
    if (RTOUCH_SUPPORT_EVENT.includes(evName) && target['RTouch']) {
        target['RTouch'].off(evName, fn)
    } else {
        target.interactive = true
        target.off(evName, fn)
    }
}

export const event = {
    on(name: string = '', closure: () => void = () => { }) {
        const events = name.split(' ')
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < events.length; j++) {
                this[i].interactive = true
                bind(this[i], events[j], closure)
            }
        }
        return this
    },
    off(name: string = '') {
        const events = name.split(' ')
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < events.length; j++) {
                this[i].off(events[j])
                off(this[i], events[j])
            }
        }
        return this
    }
}

export default event

// @ts-ignore
if (window.query) window.query.extend(event)