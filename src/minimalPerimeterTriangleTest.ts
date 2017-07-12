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
    // this test contains two funny examples of counter intuitive but correct results
    // 1. the minimal perimeter triangle is generated for the side new Vec2(2, 1), new Vec2(2, 0)
    // 2. the min triangle is different from the expected one by slight shift of the expected tip new Vec2(0, 2.5)
    //    to the left (due counter clockwise search). But such shift indeed delivers smaller perimeter!

    const points = [
        new Vec2(2, 1), new Vec2(2, 0), new Vec2(-2, 0), new Vec2(-2, 1),
        new Vec2(-1, 2), new Vec2(0, 2.5), new Vec2(1, 2)];

    const { A, B, C } = minTriangleWithBase(points, 10 ** -5, 0.1)!;
    t.true(A.minus(new Vec2(-2.893530107256646, 0)).norm < 0.1);
    t.true(B.minus(new Vec2(3, 0)).norm < 0.1);
    t.true(C.minus(new Vec2(-0.11245650896737835, 3.1124565089673784)).norm < 0.1);
});
