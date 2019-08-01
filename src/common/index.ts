import { type } from '@amoy/common'

export const get = (root: any, get: string) => {
    if (type(root) !== 'object') return root
    let value = root
    const keyArr = get.split('.')
    for (let i = 0, l = keyArr.length; i < l; i++) {
        const v = keyArr[i]
        if (v) {
            if (value[v]) {
                value = value[v]
            } else {
                value = undefined
                break
            }
        }
    }
    return value
}