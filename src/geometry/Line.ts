import { Vec2 } from './Vec2';

export enum Side {
    Right = -1,
    Top = 0,
    Left = 1
}

export class Line {
    readonly start: Vec2;
    readonly end: Vec2;
    readonly delta: Vec2;

    constructor(start: Vec2, end: Vec2) {
        this.start = start;
        this.end = end;
        this.delta = end.minus(start);
    }

    /**
     * Length of a line is the length between its two defining points
     */
    get length(): number {
        return this.delta.norm;
    }

    evaluate(t: number): Vec2 {
        return this.start.plus(this.delta.times(t));
    }

    distanceToPoint(p: Vec2): number {
        return Math.abs(p.cross(this.delta) - this.start.cross(this.end)) / this.delta.norm;
    }

    pointOnSide(p: Vec2, err: number = 0): number {
        const num = this.start.cross(this.end) - p.cross(this.delta);
        if(num === 0 || Math.abs(num) / this.delta.norm < err) {
            return Side.Top;
        }
        return num > 0 ? Side.Left : Side.Right;
    }

    pointOnTop(p: Vec2, err: number): boolean {
        return this.pointOnSide(p, err) === Side.Top;
    }

    overlaps(that: Line, err: number): boolean {
        return this.pointOnTop(that.start, err) && this.pointOnTop(that.end, err);
    }

    /**
     *  If alpha is less than deviationFromZeroAngle, the 2 lines are
     *  considered parallel.
     *  _______________________________
     *                        alpha (/
     *                              /
     *                             /
     *                            /
     */
    parallel(that: Line, deviationFromZeroAngle: number): boolean {
        const d: number = Math.abs(this.delta.cross(that.delta));
        //https://en.wikipedia.org/wiki/Cross_product#Geometric_meaning
        return d === 0 || d < this.length * this.length * Math.sin(deviationFromZeroAngle);
    }

    intersectionParameter(that: Line, err: number): number | null {
        const d = this.delta.cross(that.delta);
        if(d === 0 || Math.abs(d) < err) {
            return null; // lines are parallel
        }
        const dStart: Vec2 = this.start.minus(that.start);
        return that.delta.cross(dStart) / d;
    }

    closestPointParam(p: Vec2): number {
        return this.delta.dot(p.minus(this.start)) / this.delta.normSquared;
    }

    closestPoint(p: Vec2): Vec2 {
        return this.evaluate(this.closestPointParam(p));
    }

    intersectionPoint(that: Line, err: number): Vec2 | null {
        const t = this.intersectionParameter(that, err);
        return t === null ? null : this.evaluate(t);
    }
}
