export default class EventBus {
    private handlers: QueryEvent.Handler[] = []
    public add(handler: QueryEvent.Handler) {
        this.handlers.push(handler)
        return this
    }
    public del(handler: QueryEvent.Handler) {
        if (!handler) {
            this.handlers = []
        } else {
            this.handlers.map((value, index) => {
                value === handler && this.handlers.splice(index, 1)
            })
        }
        return this
    }
    public fire(evObj: QueryEvent.RTouchEvent, that?: any) {
        if (!this.handlers || !this.handlers.length) return
        this.handlers.map((handler) => {
            if (typeof handler === 'function') handler.bind(that)(evObj)
        })
        return this
    }
    public clear() {
        this.handlers = []
    }
}
