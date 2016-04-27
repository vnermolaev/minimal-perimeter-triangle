export class Vec2 {
    private _x: number;
    private _y: number;

    private _normSquared: number;
    private _norm: number;
    private _normalized: Vec2;

    constructor (x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    times(s: number): Vec2 {
        return new Vec2(this._x * s, this._y * s);
    }

    over(s: number): Vec2 {
        return new Vec2(this._x / s, this._y / s);
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    plus(that: Vec2): Vec2 {
        return new Vec2(this._x + that._x, this._y + that._y);
    }

    minus(that: Vec2): Vec2 {
        return new Vec2(this._x - that._x, this._y - that._y);
    }

    get normSquared(): number {
        return this._normSquared === undefined ? this._normSquared = this.dot(this) : this._normSquared;
    }

    get norm(): number {
        return this._norm === undefined ? this._norm = Math.sqrt(this.normSquared) : this._norm;
    }

    get normalized(): Vec2 {
        return this._normalized === undefined ? this._normalized = this.over(this.norm) : this._normalized;
    }

    dot(that: Vec2): number {
        return this._x * that._x + this._y * that._y;
    }

    cross(that: Vec2): number {
        return this._x * that._y - this._y * that._x;
    }

    equals(that: Vec2): boolean {
        return this._x === that._x && this._y === that.y;
    }

    normal(): Vec2 {
        return new Vec2(this._y, -this._x);
    }
}
