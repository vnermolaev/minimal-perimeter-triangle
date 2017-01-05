import { Vec2 } from './Vec2';
import { Line, Side } from './Line';
import test from 'ava';

test("computes length", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.is(l.length, 5);
});

test("evaluates points", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.true(l.evaluate(.5).equals(new Vec2(2.5, 3), 0));
});

test("computes distance to points", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.is(l.distanceToPoint(new Vec2(8, 2)), 5);
});

test("computes point sidedness", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.true(l.pointOnSide(new Vec2(8, 2)) === Side.Right);
});

test("computes intersection point", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    let ll: Line = new Line(new Vec2(4, 1), new Vec2(0, 4));
    t.true(l.intersectionPoint(ll, 0)!.equals(new Vec2(52 / 25, 61 / 25), 0));
});
