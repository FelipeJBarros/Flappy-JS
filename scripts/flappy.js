function newElement(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const edge = newElement('div', 'edge')
    const pipe = newElement('div', 'pipe')

    this.element.appendChild(reverse ? pipe : edge)
    this.element.appendChild(reverse ? edge : pipe)

    this.setHeight = heigth => pipe.style.height = `${heigth}px`
}

function PairOfBarriers(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.higher = new Barrier(true)
    this.lower = new Barrier(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.lower.element)

    this.drawHeight = () => {
        const topHeight = Math.random() * (height - opening)
        const bottomHeight = height - opening - topHeight

        this.higher.setHeight(topHeight)
        this.lower.setHeight(bottomHeight)

    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.drawHeight()
    this.setX(x)
}

function Barriers (height, width, opening ,space, notifyPoints) {
    this.pairs = []
    for(let i = 0; i <= 3; i++)
        this.pairs.push(new PairOfBarriers(height, opening, width + (space * i)))

    const speed = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - speed)

            if(pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.drawHeight()
            }

            const middle = width / 2
            const crossesMiddle = pair.getX() + speed >= middle && pair.getX() < middle

            if(crossesMiddle) notifyPoints()
        })
    }
}

function Bird(gameheight) {
    let isFlying = false

    this.element = newElement('img', 'bird')
    this.element.src = '../src/imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => isFlying = true
    window.onkeyup = e => isFlying = false

    this.animate = () => {
        const newY = this.getY() + (isFlying ? 8 : -5)
        const maxHeight = gameheight - this.element.clientHeight

        if(newY <= 0) {
            this.setY(0)
        } else if(newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameheight / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth
    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400, () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            barriers.animate()
            bird.animate()

            if(hasColide(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

function isOverlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left 
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function hasColide(bird, barriers) {
    let hasColide = false

    barriers.pairs.forEach(pairOfBarriers => {
        if(!hasColide) {
            const higher = pairOfBarriers.higher.element
            const lower = pairOfBarriers.lower.element

            hasColide = isOverlapping(bird.element, higher) || isOverlapping(bird.element, lower)  
        }
    })

    return hasColide
}

new FlappyBird().start()