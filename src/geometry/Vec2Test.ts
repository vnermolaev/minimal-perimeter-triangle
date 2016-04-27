import test from "../ava";

import { Vec2 } from "./Vec2";

test("multiplies with scalars", t => {
    t.same(new Vec2(3, 4).times(-.5), new Vec2(-1.5, -2));
});

test("divides by scalars", t => {
    t.same(new Vec2(3, 4).over(-.5), new Vec2(-6, -8));
});

test("adds", t => {
    t.same(new Vec2(3, 4).plus(new Vec2(2, -.5)), new Vec2(5, 3.5));
});

test("subtracts", t => {
    t.same(new Vec2(3, 4).minus(new Vec2(2, -.5)), new Vec2(1, 4.5));
});

test("computes norms", t => {
    let v: Vec2 = new Vec2(3, 4);
    t.is(v.norm, 5);
});

test("normalizes", t => {
    let v: Vec2 = new Vec2(3, 4);
    t.is(v.normalized.norm, 1);
});

test("dots", t => {
    t.is(new Vec2(3, 4).dot(new Vec2(2, -.5)), 4);
});

test("crosses", t => {
    t.is(new Vec2(3, 4).cross(new Vec2(2, -.5)), -9.5);
});

test("compute normal of a vector", t=> {
    let v: Vec2 = new Vec2(1, 1);
    let n: Vec2 = v.normal();
    t.ok( n.minus( new Vec2(1, -1) ).norm === 0 );
});
