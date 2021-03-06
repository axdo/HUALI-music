// import Swiper from 'swiper'
import './icons.js'
import Swiper from './swiper.js'

const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)
if (document.documentElement.clientWidth > 500) {
    window.alert('请使用手机打开本页面，以保证浏览效果');
    const img = document.createElement('img');
    img.src = require('../image/musicqrcode.png');
    img.style.position = 'fixed';
    img.style.left = '35%';
    img.style.top = '51%';
    img.style.transform = 'translateX(-40%,50%)';
    img.style.boxShadow = '0 0 10px rgba(0,0,0,0.25)';
    document.body.appendChild(img)
}
class Player {
    constructor(node) {
        this.root = typeof node === 'string' ? document.querySelector(node) : node
        this.$ = selector => this.root.querySelector(selector)
        this.$$ = selector => this.root.querySelectorAll(selector)
        this.songList = []
        this.songTitle = []//歌名列表
        this.currentIndex = 0
        this.audio = new Audio()
        this.lyricsArr = []
        this.lyricIndex = -1
        this.start()
        this.bind()

    }

    start() {
        // fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
        fetch('https://axdo.github.io/data-mock//huali-music/music-list.json')
            .then(res => res.json())
            .then(data => {
                console.log(data)
                this.songList = data
                this.songTitle = data.map(song=>song.title)
                this.loadTitle()
                this.loadSong()
                // this.liBind()
            })
    }

    //加载歌名 有问题点击没反应 点到最下面提示没有playSong方法
    loadTitle(){
        let self = this
        for(let i = 0;i<this.songTitle.length;i++){
            let title = document.createElement('li')
            title.classList.add('song-name#'+i)
            //需要把文本设置在li节点里，否则就会出现<li></li>歌名，可能会影响绑定点击事件
            title.innerText = this.songTitle[i]
            // this.$('#song-list').append(this.songTitle[i],title)
            this.$('#song-list').append(title)
        }
        this.$('#song-list').style.visibility = 'hidden'
        //事件委托
        this.$('#song-list').onclick = function(e){
            // console.log(e.target.classList[0].split('#')[1])
            // console.log(self);
            self.currentIndex = e.target.classList[0].split('#')[1]
            self.loadSong()
            
            //改变图标
            document.querySelector('.btn-play-pause').classList.add('playing')
            document.querySelector('.btn-play-pause').classList.remove('pause')
            document.querySelector('.btn-play-pause').querySelector('use').setAttribute('xlink:href', '#icon-pause')
            
            self.playSong()
        }
        
        
    }

    

    bind() {
        let self = this;
        this.$('.btn-play-pause').onclick = function () {

            if (this.classList.contains('playing')) {
                self.audio.pause()
                this.classList.remove('playing')
                this.classList.add('pause')
                this.querySelector('use').setAttribute('xlink:href', '#icon-play')
            } else if (this.classList.contains('pause')) {
                self.audio.play()
                this.classList.add('playing')
                this.classList.remove('pause')
                this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
            }
            // self.playSong()
        }

        //重新播放
        this.$('.btn-order').onclick = function(){
            self.loadSong()
            self.playSong()
        }

        this.$('.btn-pre').onclick = function () {
            // self.playPreSong()
            self.currentIndex = (self.songList.length + self.currentIndex - 1) % self.songList.length
            self.loadSong()
            self.playSong()
        }
        this.$('.btn-next').onclick = function () {
            // self.playNextSong()
            self.currentIndex = (self.currentIndex + 1) % self.songList.length
            self.loadSong()
            self.playSong()
        }

        //查看歌名列表
        this.$('.btn-music-list').onclick = function(){
            let button = document.querySelector('#song-list')
            console.log('hi')
            button.style.visibility === 'hidden'? button.style.visibility = 'visible': button.style.visibility = 'hidden'
            // if(this.$('#song-title').style.visibility === 'hidden'){
            //     this.$('#song-title').style.visibility = 'visible'
            // } else
        }

        


        this.audio.ontimeupdate = function () {
            console.log(parseInt(self.audio.currentTime * 1000))
            self.locateLyric()
            self.setProgerssBar()
        }


        let swiper = new Swiper(this.$('.panel'))
        swiper.on('swiperLeft', function () {
            console.log('left')
            this.classList.remove('panel1')
            this.classList.add('panel2')
            document.querySelector('#ball-right').classList.add('current')
            document.querySelector('#ball-left').classList.remove('current')

        })
        swiper.on('swiperRight', function () {
            console.log('right')
            this.classList.remove('panel2')
            this.classList.add('panel1')
            document.querySelector('#ball-left').classList.add('current')
            document.querySelector('#ball-right').classList.remove('current')

        })
    }

    loadSong() {
        let songObj = this.songList[this.currentIndex]
        this.$('.header h1').innerText = songObj.title
        this.$('.header p').innerText = songObj.author + ' - ' + songObj.albumn
        this.audio.src = songObj.url
        this.audio.onloadedmetadata = () => this.$('.time-end').innerText = this.formateTime(this.audio.duration)//加载修改总时长
        this.loadLyrics()
    }

    playSong() {

        this.audio.oncanplaythrough = () => this.audio.play()//不能直接调用
    }

    playPreSong() {
        this.currentIndex = (this.songList.length + this.currentIndex - 1) % this.songList.length
        this.audio.src = this.songList[this.currentIndex].url
        this.audio.oncanplaythrough = () => this.audio.play()
    }
    playNextSong() {
        this.currentIndex = (this.songList.length + this.currentIndex + 1) % this.songList.length
        this.audio.src = this.songList[this.currentIndex].url
        this.audio.oncanplaythrough = () => this.audio.play()
    }

    loadLyrics() {
        console.log(this.songList[this.currentIndex].lyric);
        fetch(this.songList[this.currentIndex].lyric)
            .then(res => res.json())
            .then(data => {
                console.log(data.lrc)
                this.setLyrics(data.lrc.lyric)
                window.lyric = data.lrc.lyric
            })
    }
    locateLyric() {
        console.log('locateLyric')
        let currentTime = this.audio.currentTime * 1000
        console.log(this.lyricsArr[this.lyricIndex + 1])
        let nextLineTime = this.lyricsArr[this.lyricIndex + 1][0]
        if (currentTime > nextLineTime && this.lyricIndex < this.lyricsArr.length - 1) {
            this.lyricIndex++
            let node = this.$('[data-time="' + this.lyricsArr[this.lyricIndex][0] + '"]')
            if (node) this.setLyricToCenter(node)
            this.$$('.panel-effect .lyric p')[0].innerText = this.lyricsArr[this.lyricIndex][1]
            this.$$('.panel-effect .lyric p')[1].innerText = this.lyricsArr[this.lyricIndex + 1] ? this.lyricsArr[this.lyricIndex + 1][1] : ''

        }
    }
    setLyrics(lyrics) {
        this.lyricIndex = 0
        let fragment = document.createDocumentFragment()
        let lyricsArr = []
        this.lyricsArr = lyricsArr
        lyrics.split(/\n/)
            .filter(str => str.match(/\[.+?\]/))
            .forEach(line => {
                let str = line.replace(/\[.+?\]/g, '')
                line.match(/\[.+?\]/g).forEach(t => {
                    t = t.replace(/[\[\]]/g, '')
                    let milliseconds = parseInt(t.slice(0, 2)) * 60 * 1000 + parseInt(t.slice(3, 5)) * 1000 + parseInt(t.slice(6))
                    lyricsArr.push([milliseconds, str])
                })
            })

        lyricsArr.filter(line => line[1].trim() !== '').sort((v1, v2) => {
            if (v1[0] > v2[0]) {
                return 1
            } else {
                return -1
            }
        }).forEach(line => {
            let node = document.createElement('p')
            node.setAttribute('data-time', line[0])
            node.innerText = line[1]
            fragment.appendChild(node)
        })
        this.$('.panel-lyrics .container').innerHTML = ''
        this.$('.panel-lyrics .container').appendChild(fragment)
    }

    setLyricToCenter(node) {
        console.log(node)
        let translateY = node.offsetTop - this.$('.panel-lyrics').offsetHeight / 2
        translateY = translateY > 0 ? translateY : 0
        this.$('.panel-lyrics .container').style.transform = `translateY(-${translateY}px)`
        this.$$('.panel-lyrics p').forEach(node => node.classList.remove('current'))
        node.classList.add('current')
    }

    setProgerssBar() {
        console.log('set setProgerssBar')
        let percent = (this.audio.currentTime * 100 / this.audio.duration) + '%'
        console.log(percent)
        this.$('.bar .progress').style.width = percent
        this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
        console.log(this.$('.bar .progress').style.width)
    }

    formateTime(secondsTotal) {
        let minutes = parseInt(secondsTotal / 60)
        minutes = minutes >= 10 ? '' + minutes : '0' + minutes
        let seconds = parseInt(secondsTotal % 60)
        seconds = seconds >= 10 ? '' + seconds : '0' + seconds
        return minutes + ':' + seconds
    }

}


window.p = new Player('#player')

