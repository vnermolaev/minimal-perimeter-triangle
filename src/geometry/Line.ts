import { Vec2 } from './Vec2';

export class Line {
    private _start: Vec2;
    private _end: Vec2;
    private _delta: Vec2;

    constructor(start: Vec2, end: Vec2) {
        this._start = start;
        this._end = end;
        this._delta = end.minus(start);
    }

    get start(): Vec2 {
        return this._start;
    }

    get end(): Vec2 {
        return this._end;
    }

    get delta(): Vec2 {
        return this._delta;
    }

    get length(): number {
        return this._delta.norm;
    }

    evaluate(t: number): Vec2 {
        return this._start.plus(this._delta.times(t));
    }

    distanceToPoint(p: Vec2): number {
        let b: Vec2 = this._start.minus(p);
        return b.minus(this._delta.normalized.times(b.dot(this._delta.normalized))).norm;
    }

    pointOnSide(p: Vec2, err: number = 0): number {
        let c: number = this._delta.cross(p.minus(this._start));
        if (c < -1*err) {
            return -1.0;
        }
        if (c > err) {
            return 1.0;
        }
        return 0.0;
    }

   intersectionParameter(that: Line): number {
        let d: number = this._delta.cross(that._delta);
        if (d === 0) {
            return null; // lines are parallel
        }
        let dStart: Vec2 = this._start.minus(that._start);
        return that._delta.cross(dStart) / d;
    }

    closestPointParam(p: Vec2): number {
        return this._delta.dot(p.minus(this._start)) / this._delta.normSquared;
    }

    closestPoint(p: Vec2): Vec2 {
        return this.evaluate( this.closestPointParam(p) );
    }

    intersectionPoint(that: Line): Vec2 {
        let t: number = this.intersectionParameter(that);
        return t === null ? null : this.evaluate(t);
    }
}
