import * as PIXI from 'pixi.js'
import { QueryEvent } from '../types'
import EventBus from './eventBus'
import u from './utils'

export const RTOUCH_SUPPORT_EVENT = [
    'touchstart',
    'touchmove',
    'touchend',
    // 拖动
    'drag',
    'dragstart',
    'dragend',
    // 双指缩放
    'pinch',
    'pinchstart',
    'pinchend',
    // 双指旋转
    'rotate',
    'rotatestart',
    'rotateend',
    // 划动
    'swipeleft',
    'swiperight',
    'swipeup',
    'swipedown',
    // 短点击
    'shorttap',
    'longtap',
    // 单指缩放
    'singlepinch',
    'singlepinchstart',
    'singlepinchend',
    // 单指旋转
    'singlerotate',
    'singlerotatestart',
    'singlerotateend',
]

// 挟持的原生事件
const ORIGIN_EVENT_MAP = [{
    name: 'pointerdown',
    fn: '_start',
}, {
    name: 'pointermove',
    fn: '_move',
}, {
    name: 'pointerup',
    fn: '_end',
}, {
    name: 'pointerupoutside',
    fn: '_end',
}]

// 事件中心

export default class RTouch {
    // 精灵
    private target: PIXI.Sprite | PIXI.Graphics | PIXI.Text
    // 触摸手指数量
    private fingers: number = 0
    // 第一触控点
    private swipeStartPoint: QueryEvent.Point | null
    private startPoint: QueryEvent.Point | null
    private startTime: number
    // 第二触控点
    private secondPoint: QueryEvent.Point | null
    // 初始向量
    private vector1: QueryEvent.Point | null
    // 初始向量模
    private pinchStartLength: number | null
    // 是否开始触摸
    // 用于解决 精灵区域外 move 也被触发的问题
    private touching: boolean = false
    private singleBasePoint: QueryEvent.Point
    private singlePinchStartLength: number
    private Bus: {
        [evName: string]: EventBus,
    } = {}
    constructor(target: PIXI.Sprite | PIXI.Graphics | PIXI.Text) {
        this.target = target
        // 初始化事件中心
        this.initEventBus()
        // 事件挟持
        this.bindOriginEvent()
    }
    private initEventBus() {
        RTOUCH_SUPPORT_EVENT.map((evName: string) => {
            Object.defineProperty(this.Bus, evName, { value: new EventBus() })
        })
    }
    private bindOriginEvent() {
        ORIGIN_EVENT_MAP.map(({name, fn}) => {
            this.target.interactive = true
            this.target.on(name, this[fn], this)
        })
    }
    public _start(ev: QueryEvent.PixiEvent) {
        this.touching = true
        this.startTime = Date.now()
        this.fingers = u.getFingers(ev)
        this.singleBasePoint = u.getAnchorPoint(this.target)
        // 记录第一触控点
        this.swipeStartPoint = this.startPoint = u.getPoint(ev, 0)

        if (this.fingers === 1) {
            // 单指且监听 singlePinch 时，计算向量模；
            const startVector = u.getVector(this.startPoint, this.singleBasePoint)
            this.singlePinchStartLength = u.getLength(startVector)
        } else if (this.fingers > 1) {
            // 双指操作时，记录第二触控点
            this.secondPoint = u.getPoint(ev, 1)
            // 计算双指向量；
            this.vector1 = u.getVector(this.secondPoint, this.startPoint)
            // 计算向量模
            this.pinchStartLength = u.getLength(this.vector1)
        }

        this.fireEvent('touchstart', {
            origin: ev,
        })
    }
    public _move(ev: QueryEvent.PixiEvent) {
        if (!this.touching) return
        const curPoint = u.getPoint(ev, 0)
        // 判断触控区域是否为单指操作的按钮
        // const isSingleButton = ev.tapTarget.name === 'singlebutton'
        const isSingleButton = false
        if (!this.startPoint) this.startPoint = curPoint
        if (this.fingers > 1) {
            // 双指操作， 触发 pinch 与 rotate
            const curSecPoint = u.getPoint(ev, 1)
            const vector2 = u.getVector(curSecPoint, curPoint)
            const pinchLength = u.getLength(vector2)

            if (this.pinchStartLength) {
                this.eventStart('pinch', {
                    origin: ev,
                    delta: {
                        scale: pinchLength / this.pinchStartLength,
                    },
                })
                this.pinchStartLength = pinchLength
            }

            if (this.vector1) {
                this.eventStart('rotate', {
                    delta: {
                        rotate: u.getAngle(this.vector1, vector2),
                    },
                    origin: ev,
                })
                this.vector1 = vector2
            }
        } else {
            // 触发 单指缩放
            if (isSingleButton) {
                const pinchV2 = u.getVector(curPoint, this.singleBasePoint)
                const singlePinchLength = u.getLength(pinchV2)

                this.eventStart('singlepinch', {
                    delta: {
                        scale: singlePinchLength / this.singlePinchStartLength,
                        deltaX: curPoint.x - this.startPoint.x,
                        deltaY: curPoint.y - this.startPoint.y,
                    },
                    origin: ev,
                })
                this.singlePinchStartLength = singlePinchLength
            }
            // 触发 单指旋转;
            if (isSingleButton) {
                const rotateV1 = u.getVector(this.startPoint, this.singleBasePoint)
                const rotateV2 = u.getVector(curPoint, this.singleBasePoint)

                this.eventStart('singlerotate', {
                    delta: {
                        rotate: u.getAngle(rotateV1, rotateV2),
                    },
                    origin: ev,
                })
            }
        }

        // 触发 drag
        this.eventStart('drag', {
            delta: {
                x: curPoint.x - this.startPoint.x,
                y: curPoint.y - this.startPoint.y,
            },
            origin: ev,
        })

        this.fireEvent('touchmove', {
            origin: ev,
        })

        this.startPoint = curPoint
    }
    public _end(ev: QueryEvent.PixiEvent) {
        const evArr = ['pinch', 'drag', 'rotate', 'singlerotate', 'singlepinch']
        this.touching = false
        this.fingers = u.getFingers(ev)

        evArr.map((evName: string) => {
            this.eventEnd(evName, {
                origin: ev,
                type: evName,
            })
        })

        if (this.swipeStartPoint) {
            const endPoint = {
                x: Math.round(ev.data.global.x),
                y: Math.round(ev.data.global.y),
            }
            const deltaX = endPoint.x - this.swipeStartPoint.x
            const deltaY = endPoint.y - this.swipeStartPoint.y
            const endTime = Date.now()
            let eventType: string = ''
            if (deltaX > 30 && Math.abs(deltaY) < 100) {
                // 右划
                eventType = 'swiperight'
            } else if (deltaX < -30 && Math.abs(deltaY) < 100) {
                // 左划
                eventType = 'swipeleft'
            } else if (deltaY > 30 && Math.abs(deltaX) < 100) {
                // 下划
                eventType = 'swipedown'
            } else if (deltaY < -30 && Math.abs(deltaX) < 100) {
                // 上划
                eventType = 'swipeup'
            } else if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30 ) {
                if (endTime - this.startTime < 500) {
                    // 触发短点击
                    eventType = 'shorttap'
                } else {
                    // 触发长按
                    eventType = 'longtap'
                }
            }

            if (eventType) {
                this.fireEvent(eventType, {
                    origin: ev,
                })
            }
        }

        this.fireEvent('touchend', {
            origin: ev,
        })
    }
    private fireEvent(evName: string, ev: {
        origin: QueryEvent.PixiEvent,
        [any: string]: any,
    }) {
        if (this.Bus[evName]) {
            this.Bus[evName].fire(Object.assign(ev, {
                type: evName,
                stopPropagation() {
                    ev.origin.stopPropagation()
                },
            }))
        }
    }
    public destory() {
        ORIGIN_EVENT_MAP.map(({name, fn}) => {
            this.target.off(name, this[fn], this)
        })
    }

    private eventStart(evName: string, ev: {
        origin: QueryEvent.PixiEvent,
        [any: string]: any,
    }) {
        const ing = `${evName}ing`
        const start = `${evName}start`
        if (!this[ing]) {
            this.fireEvent(start, ev)
            this[ing] = true
        } else {
            this.fireEvent(evName, ev)
        }
    }

    private eventEnd(evName: string, ev: QueryEvent.RTouchEvent) {
        const ing = `${evName}ing`
        const end = `${evName}end`
        if (this[ing]) {
            ev.type = end
            this.fireEvent(end, ev)
            this[ing] = false
        }
    }

    public on(evName: string, handler: QueryEvent.Handler) {
        const _evName = evName.trim().toLowerCase()
        _evName.split(' ').map((name: string) => {
            this.Bus[name].add(handler)
        })
        return this
    }

    public off(evName: string, handler?: QueryEvent.Handler) {
        const _evName = evName.trim().toLowerCase()
        _evName.split(' ').map((name: string) => {
            handler ? this.Bus[name].del(handler) : this.Bus[name].clear()
        })
        return this
    }
}