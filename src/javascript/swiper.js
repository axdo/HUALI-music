// let Swiper = (function () {
//     let root = document
//     let eventHub = { 'swiperLeft': [], 'swiperRight': [] }
//     function bind(node) {
//         root = node
//     }
//     function on(type, fn) {
//         if (eventHub[type]) {
//             eventHub[type].push(fn)
//         }
//     }

//     var initX
//     var newX
//     var clock
//     root.ontouchstart = function (e) {
//         initX = e.changedTouches[0].pageX
//     }
//     root.ontouchmove = function (e) {
//         if (clock) clearInterval(clock)
//         clock = setTimeout(() => {
//             newX = e.changedTouches[0].pageX
//             if (newX - initX > 0) {
//                 eventHub['swiperRight'].forEach(fn => fn())
//             } else if (newX - initX < 0) {
//                 eventHub['swiperLeft'].forEach(fn => fn())
//             }
//         }, 100)

//     }
//     return {
//         bind: bind,
//         on: on
//     }
// })()

// Swiper.bind(document.querySelector('#player'))

class Swiper {
    constructor(node) {
        if (!node) throw new Error('需要传递需要绑定的DOM元素')
        let root = typeof node === 'string' ? document.querySelector(node) : node
        let eventHub = { 'swiperLeft': [], 'swiperRight': [] }

        let initX
        let newX
        let clock
        root.ontouchstart = function (e) {
            initX = e.changedTouches[0].pageX
        }

        root.ontouchmove = function (e) {
            if (clock) clearInterval(clock)

            clock = setTimeout(() => {
                newX = e.changedTouches[0].pageX
                if (newX - initX > 30) {
                    eventHub['swiperRight'].forEach(fn => fn.bind(root)())
                } else if (newX - initX < 30) {
                    eventHub['swiperLeft'].forEach(fn => fn.bind(root)())
                }
            }, 100);
        }

        this.on = function (type, fn) {
            if (eventHub[type]) {
                eventHub[type].push(fn)
            }
        }
        this.off = function (type, fn) {
            let index = eventHub[type].indexOf(fn)
            if (index != -1) {
                eventHub[type].splice(index, 1)
            }
        }

    }
}
export default Swiper