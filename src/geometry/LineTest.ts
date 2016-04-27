import { Vec2 } from './Vec2';
import { Line } from './Line';
import test from '../ava';

test("computes length", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.is(l.length, 5);
});

test("evaluates points", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.same(l.evaluate(.5), new Vec2(2.5, 3));
});

test("computes distance to points", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.is(l.distanceToPoint(new Vec2(8, 2)), 5);
});

test("computes point sidedness", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    t.true(l.pointOnSide(new Vec2(8, 2))<0);
});

test("computes intersection parameters", t => {
    let l: Line = new Line(new Vec2(1, 1), new Vec2(4, 5));
    let ll: Line = new Line(new Vec2(4, 1), new Vec2(0, 4));
    t.is(l.evaluate(l.intersectionParameter(ll)).x, 2.08);
});
