import * as PIXI from "pixi.js"
import { on, off } from "../lib"
// @ts-ignore
import rect from './images/rect.jpg'
import "./main.scss"

const { innerWidth: width, innerHeight: height } = window
const game = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x00ffff,
    resolution: 2,
})
game.view.style.width = width + 'px'
game.view.style.height = height + 'px'
document.body.appendChild(game.view)

game.loader
.add('rect', rect)
.load((loader, resources) => {
    const sprite = PIXI.Sprite.from('rect')
    sprite.width = 200
    sprite.height = 200
    sprite.x = 100
    sprite.y = 100
    sprite['id'] = 1
    game.stage.addChild(sprite)

    sprite.sortableChildren = true

    const sprite2 = PIXI.Sprite.from('rect')
    sprite2.width = 400
    sprite2.height = 400
    sprite2.x = 0
    sprite2.y = 0
    sprite2['id'] = 2
    sprite2.name = 'singlebutton'

    sprite.addChild(sprite2)

    const sprite3 = PIXI.Sprite.from('rect')
    sprite3.width = 400
    sprite3.height = 400
    sprite3.x = 200
    sprite3.y = 200
    sprite3['id'] = 3

    sprite.addChild(sprite3)

    on(sprite, 'shorttap', function(this: any) {
        console.log('shorttap', this)
    })
})
