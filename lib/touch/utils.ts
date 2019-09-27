import { getValue } from '@amoy/common'

const u = { 
    getCurTargetByEv(evTarget: any, ev: QueryEvent.PixiEvent) {
        let curTarget
        let maxZindex = 0
        if (getValue(evTarget, 'children.length')) {
            evTarget.children.map((child) => {
                if (child.containsPoint) {
                    if (child.containsPoint(ev.data.global) && child.zIndex >= maxZindex) {
                        curTarget = child
                        maxZindex = child.zIndex
                    }
                }
            })
        }

        if (curTarget) {
            const childCurTarget = u.getCurTargetByEv(curTarget, ev)
            if (childCurTarget) {
                curTarget = childCurTarget
            }
        }
        return curTarget || evTarget
    },
    getFingers(ev: QueryEvent.PixiEvent) {
        return getValue(ev, 'data.originalEvent.touches.length') || 1
    },
    getPoint(ev: QueryEvent.PixiEvent, index: 0 | 1) {
        if (ev.data.pointerType === 'touch') {
            const touches = ev.data.originalEvent.touches
            return {
                x: Math.round(touches[index].pageX),
                y: Math.round(touches[index].pageY),
            }
        } else {
            return {
                x: Math.round(ev.data.global.x),
                y: Math.round(ev.data.global.y),
            }
        }
    },
    getVector(p1: QueryEvent.Point, p2: QueryEvent.Point) {
        const x = Math.round(p1.x - p2.x)
        const y = Math.round(p1.y - p2.y)
        return { x, y }
    },
    getLength(v1: QueryEvent.Point) {
        return Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    },
    getAngle(v1: QueryEvent.Point, v2: QueryEvent.Point) {
        if (typeof v1 !== 'object' || typeof v2 !== 'object') {
            console.error('getAngle error!')
            return
        }
        // 判断方向，顺时针为 1 ,逆时针为 -1；
        const direction = v1.x * v2.y - v2.x * v1.y > 0 ? 1 : -1
            // 两个向量的模；
        const len1 = this.getLength(v1)
        const len2 = this.getLength(v2)
        const mr = len1 * len2
        let dot
        let r
        if (mr === 0)return 0
        // 通过数量积公式可以推导出：
        // cos = (x1 * x2 + y1 * y2)/(|a| * |b|);
        dot = v1.x * v2.x + v1.y * v2.y
        r = dot / mr
        if (r > 1)r = 1
        if (r < -1)r = -1
        // 解值并结合方向转化为角度值；
        return Math.acos(r) * direction
    },
    getAnchorPoint(target: any) {
        return {
            x: target.x,
            y: target.y,
        }
    },
}

export default u
