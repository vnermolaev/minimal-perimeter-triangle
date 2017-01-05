import test from 'ava';

import { Vec2, Line, Side } from './Geometry';
import { lineTangentToHull, minTriangleWithBase } from './MinimalPerimeterTriangle';

test("verifies that a line is tangent to a convex hull", t => {
    const points = [
        new Vec2(1, 3), new Vec2(2, 2), new Vec2(3, 1), new Vec2(3, 0),
        new Vec2(3, -1), new Vec2(2, -2), new Vec2(1, -3)];
    const line = new Line(new Vec2(3, 3), new Vec2(3, -3));

    t.true(lineTangentToHull(line, points, 10 ** -5).holds);
});

test("verifies that a line is not tangent to a convex hull", t => {
    const points = [
        new Vec2(1, 3), new Vec2(2, 2), new Vec2(3, 1), new Vec2(3, 0),
        new Vec2(3, -1), new Vec2(2, -2), new Vec2(1, -3)];
    const line = new Line(new Vec2(3, 3), new Vec2(2, -3));

    t.false(lineTangentToHull(line, points, 10 ** -5).holds);
});

test("compute minimal perimeter triangle condinitoned on the base", t => {
    const points = [
        new Vec2(-2, 0), new Vec2(-2, 1), new Vec2(-1, 2), new Vec2(0, 2.5),
        new Vec2(1, 2), new Vec2(2, 1), new Vec2(2, 0)];
    const {A, B, C} = minTriangleWithBase(points, 10 ** -7)!;

    t.true(Math.abs(0 - A.x) < 0.2);
    t.true(Math.abs(3 - A.y) < 0.2);

    t.true(Math.abs(-3 - B.x) < 0.1);
    t.true(Math.abs(0 - B.y) < 0.1);

    t.true(Math.abs(3 - C.x) < 0.11);
    t.true(Math.abs(0 - C.y) < 0.1);
});
