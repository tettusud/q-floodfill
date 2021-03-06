import {
    isSameColor,
    setColorAtPixel,
    getColorAtPixel,
    colorToRGBA,
    ColorRGBA,
    invertColor,
    isExactlySameColor,
} from './util/colorUtils'

type PixelCoords = {
    x: number
    y: number
}

/**
 * [startX, endX, y, parentY]
 */
type LineQueued = [number, number, number, number]

export default class FloodFill {
    public imageData: ImageData
    public collectModifiedPixels = false
    public modifiedPixelsCount = 0
    public modifiedPixels: Set<string> = new Set()

    private _tolerance = 0
    private _queue: Array<LineQueued> = []
    private _replacedColor: ColorRGBA
    private _newColor: ColorRGBA

    constructor(imageData: ImageData) {
        this.imageData = imageData
    }
    /**
     * color should be in CSS format - rgba, rgb, or HEX
     */
    public fill(color: string, x: number, y: number, tolerance: number): void {
        this._newColor = colorToRGBA(color)
        this._replacedColor = getColorAtPixel(this.imageData, x, y)
        this._tolerance = tolerance

        if (isSameColor(this._replacedColor, this._newColor, this._tolerance)) {
            // check if both are exactly same color, if not invert fill color, apply twice
            if (isExactlySameColor(this._replacedColor, this._newColor)) {
                return
            }
            // if not same invert the color
            this._newColor = colorToRGBA(invertColor(color))
            this.addToQueue([x, x, y, -1])
            this.fillQueue()
            // restore the color back
            this._newColor = colorToRGBA(color)
            this._replacedColor = getColorAtPixel(this.imageData, x, y)
        }
        this.addToQueue([x, x, y, -1])
        this.fillQueue()
    }

    private addToQueue(line: LineQueued): void {
        this._queue.push(line)
    }

    private popFromQueue(): LineQueued | null {
        if (!this._queue.length) {
            return null
        }
        return this._queue.pop()
    }

    private isValidTarget(pixel: PixelCoords | null): boolean {
        if (pixel === null) {
            return
        }
        const pixelColor = getColorAtPixel(this.imageData, pixel.x, pixel.y)
        return isSameColor(this._replacedColor, pixelColor, this._tolerance)
    }

    private fillLineAt(x: number, y: number): [number, number] {
        if (!this.isValidTarget({ x, y })) {
            return [-1, -1]
        }
        this.setPixelColor(this._newColor, { x, y })
        let minX = x
        let maxX = x
        let px = this.getPixelNeighbour('left', minX, y)
        while (px && this.isValidTarget(px)) {
            this.setPixelColor(this._newColor, px)
            minX = px.x
            px = this.getPixelNeighbour('left', minX, y)
        }
        px = this.getPixelNeighbour('right', maxX, y)
        while (px && this.isValidTarget(px)) {
            this.setPixelColor(this._newColor, px)
            maxX = px.x
            px = this.getPixelNeighbour('right', maxX, y)
        }
        return [minX, maxX]
    }

    private fillQueue(): void {
        let line = this.popFromQueue()
        while (line) {
            const [start, end, y, parentY] = line
            let currX = start
            while (currX !== -1 && currX <= end) {
                const [lineStart, lineEnd] = this.fillLineAt(currX, y)
                if (lineStart !== -1) {
                    if (
                        lineStart >= start &&
                        lineEnd <= end &&
                        parentY !== -1
                    ) {
                        if (parentY < y && y + 1 < this.imageData.height) {
                            this.addToQueue([lineStart, lineEnd, y + 1, y])
                        }
                        if (parentY > y && y > 0) {
                            this.addToQueue([lineStart, lineEnd, y - 1, y])
                        }
                    } else {
                        if (y > 0) {
                            this.addToQueue([lineStart, lineEnd, y - 1, y])
                        }
                        if (y + 1 < this.imageData.height) {
                            this.addToQueue([lineStart, lineEnd, y + 1, y])
                        }
                    }
                }
                if (lineEnd === -1 && currX <= end) {
                    currX += 1
                } else {
                    currX = lineEnd + 1
                }
            }
            line = this.popFromQueue()
        }
    }

    private setPixelColor(color: ColorRGBA, pixel: PixelCoords): void {
        setColorAtPixel(this.imageData, color, pixel.x, pixel.y)
        this.modifiedPixelsCount++
        this.collectModifiedPixels &&
            this.modifiedPixels.add(`${pixel.x}|${pixel.y}`)
    }

    private getPixelNeighbour(
        direction: string,
        x: number,
        y: number,
    ): PixelCoords | null {
        x = x | 0
        y = y | 0
        let coords: PixelCoords
        switch (direction) {
            case 'right':
                coords = { x: (x + 1) | 0, y }
                break
            case 'left':
                coords = { x: (x - 1) | 0, y }
                break
        }
        if (coords.x >= 0 && coords.x < this.imageData.width) {
            return coords
        }
        return null
    }
}
