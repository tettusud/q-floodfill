import { differenceCie76 } from 'd3-color-difference'

export type ColorRGBA = {
    r: number
    g: number
    b: number
    a: number
}

export function rgba2hex({ r, g, b }) {
    r = r.toString(16)
    g = g.toString(16)
    b = b.toString(16)

    if (r.length == 1) r = '0' + r
    if (g.length == 1) g = '0' + g
    if (b.length == 1) b = '0' + b

    return '#' + r + g + b
}

export function getColorAtPixel(
    imageData: ImageData,
    x: number,
    y: number,
): ColorRGBA {
    const { width, data } = imageData
    const startPos = 4 * (y * width + x)
    if (data[startPos + 3] === undefined) {
        throw new Error('Invalid pixel coordinates: x=' + x + '; y=' + y)
    }
    return {
        r: data[startPos],
        g: data[startPos + 1],
        b: data[startPos + 2],
        a: data[startPos + 3],
    }
}

export function setColorAtPixel(
    imageData: ImageData,
    color: ColorRGBA,
    x: number,
    y: number,
): void {
    const { width, data } = imageData
    const startPos = 4 * (y * width + x)
    if (data[startPos + 3] === undefined) {
        throw new Error(
            'Invalid pixel coordinates. Cannot set color at: x=' +
                x +
                '; y=' +
                y,
        )
    }
    data[startPos + 0] = color.r & 0xff
    data[startPos + 1] = color.g & 0xff
    data[startPos + 2] = color.b & 0xff
    data[startPos + 3] = color.a & 0xff
}

export function isSameColor(
    a: ColorRGBA,
    b: ColorRGBA,
    tolerance = 0,
): boolean {
    return differenceCie76(rgba2hex(a), rgba2hex(b)) < tolerance
}

export function hex2RGBA(hex: string, alpha = 255): ColorRGBA {
    let parsedHex = hex
    if (hex.indexOf('#') === 0) {
        parsedHex = hex.slice(1)
    }
    // convert 3-digit hex to 6-digits.
    if (parsedHex.length === 3) {
        parsedHex =
            parsedHex[0] +
            parsedHex[0] +
            parsedHex[1] +
            parsedHex[1] +
            parsedHex[2] +
            parsedHex[2]
    }
    if (parsedHex.length !== 6) {
        throw new Error(`Invalid HEX color ${parsedHex}.`)
    }
    const r = parseInt(parsedHex.slice(0, 2), 16)
    const g = parseInt(parsedHex.slice(2, 4), 16)
    const b = parseInt(parsedHex.slice(4, 6), 16)
    return {
        r,
        g,
        b,
        a: alpha,
    }
}

export function colorToRGBA(color: string): ColorRGBA {
    if (color.indexOf('rgba') !== -1) {
        const [
            _,
            r,
            g,
            b,
            a,
        ] = /rgba\(.*?([0-9]{1,3}).*?([0-9]{1,3}).*?([0-9]{1,3}).*?([0-9\.]{1,})/g.exec(
            color,
        )
        return {
            r: parseInt(r),
            g: parseInt(g),
            b: parseInt(b),
            a: Math.ceil(parseFloat(a) * 255),
        }
    } else if (color.indexOf('rgb') !== -1) {
        const [
            _,
            r,
            g,
            b,
        ] = /rgb\(.*?([0-9]{1,3}).*?([0-9]{1,3}).*?([0-9]{1,3})/g.exec(color)
        return {
            r: parseInt(r),
            g: parseInt(g),
            b: parseInt(b),
            a: 255,
        }
    } else if (color.indexOf('#') !== -1) {
        return hex2RGBA(color)
    } else {
        throw new Error(
            'Unsupported color format. Please use CSS rgba, rgb, or HEX!',
        )
    }
}

function padZero(str, len = 2) {
    const zeros = new Array(len).join('0')
    return (zeros + str).slice(-len)
}

export function invertColor(hex): string {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1)
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.')
    }
    // invert color components
    const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b)
}

/**
 *
 * @param a
 * @param b
 */
export function isExactlySameColor(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
}
