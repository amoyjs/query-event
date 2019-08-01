# query event

A event extension for @amoy/query

## Installation

```sh
$ npm i @amoy/query-event
# or
$ yarn add @amoy/query-event
```

or:

```html
<script src="path/to/query.min.js"></script>
<!-- include after query.min.js, queryEvent will automatically extended -->
<script src="path/to/query-event.min.js"></script>
```

## Usage

```js
import { Applacation } from 'pixi.js'
import query from '@amoy/query'
import query from '@amoy/query-event'

const game = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
})

query(game.stage)

const text = new Text('Hello World.')

$(text).on(eventName, cb)
$(text).off(eventName, cb)
```

## Supported Events

- touchstart
- touchmove
- touchend
- drag
- dragstart
- dragend
- pinch
- pinchstart
- pinchend
- rotate
- rotatestart
- rotateend
- swipeleft
- swiperight
- swipeup
- swipedown
- shorttap
- longtap
- singlepinch
- singlepinchstart
- singlepinchend
- singlerotate
- singlerotatestart
- singlerotateend