import test from 'ava';

import { Vec2, Line } from '../Geometry';
import { Wedge, Circle } from './Inscribe';

test("constructs a degenerate wedge", t => {
    const left_arm = new Line(new Vec2(0, 0), new Vec2(2, 0)),
        right_arm = new Line(new Vec2(2, -1), new Vec2(0, -1));
    let w = Wedge.new(left_arm, right_arm, 0);

    t.true(w!== null);
});

test("constructs a non-degenerate wedge", t => {
    const left_arm = new Line(new Vec2(1, 0), new Vec2(2, 0)),
        right_arm = new Line(new Vec2(2, -2), new Vec2(1, -1));
    let w = Wedge.new(left_arm, right_arm, 0)!;

    const
        control_left_arm = new Line(new Vec2(0, 0), new Vec2(2, 0)),
        control_right_arm = new Line(new Vec2(0, 0), new Vec2(2, -2));

    t.true(w.left_arm.start.equals(control_left_arm.start, 0));
    t.true(w.left_arm.end.equals(control_left_arm.end, 0));

    t.true(w.right_arm.start.equals(control_right_arm.start, 0));
    t.true(w.right_arm.end.equals(control_right_arm.end, 0));
});

test("verifies that a line intersects a wedge", t => {
    const left_arm = new Line(new Vec2(0, 0), new Vec2(2, 0)),
        right_arm = new Line(new Vec2(0, 0), new Vec2(0, 2));
    const w = Wedge.new(left_arm, right_arm, 0)!;

    let l = new Line(new Vec2(2, -1), new Vec2(-1, 2));

    t.true(w.formTriangle(l, 0));

    l = new Line(new Vec2(1, -5), new Vec2(1, 20));

    t.false(w.formTriangle(l, 0));
});

test("verifies that a point is strictly within a wedge", t => {
    let left_arm = new Line(new Vec2(2, 0), new Vec2(0, 0)),
        right_arm = new Line(new Vec2(0, 0), new Vec2(0, 2)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        p: Vec2 = new Vec2(1, 1);

    t.true(w.strictlyContains(p, 0));
});

test("verifies that a point is strictly within a degenerate wedge", t => {
    let left_arm = new Line(new Vec2(2, 0), new Vec2(0, 0)),
        right_arm = new Line(new Vec2(5, 2), new Vec2(1, 2)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        p: Vec2 = new Vec2(1, 1);

    t.true(w.strictlyContains(p, 0));

    p = new Vec2(1, 3);
    t.false(w.strictlyContains(p, 0));
});

test("fits circles passing through given point in a degenerate wedge (private fit_Dp)", t => {
    // y = x + 2
    const left_arm = new Line(new Vec2(0, 2), new Vec2(1, 3)),
        // y = x - 1
        right_arm = new Line(new Vec2(0, -1), new Vec2(1, 0)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        p = new Vec2(-0.14, 1.2);

    // control values
    const O2 = new Vec2(-0.34136945531623936, 0.15863054468376064),
        O1 = new Vec2(0.9013694553162392, 1.4013694553162392),
        r = 1.0606601717798212,
        // tangents at point for the circles
        d1 = O1.minus(p).normal(),
        d2 = O2.minus(p).normal();

    let circlesInfo = w.fitCircles(p, 10 ** -5)!;

    t.true(circlesInfo[0].circle.centre.minus(O1).norm < 0.0001);
    t.true(circlesInfo[1].circle.centre.minus(O2).norm < 0.0001);

    t.true(Math.abs(r - circlesInfo[0].circle.r) < 0.0001);
    t.true(Math.abs(r - circlesInfo[1].circle.r) < 0.0001);

    t.true(circlesInfo[0].tangent.delta.minus(d1).norm < 0.0001);
    t.true(circlesInfo[1].tangent.delta.minus(d2).norm < 0.0001);
});

test("fits circles touching given line in a degenerate wedge (private fit_Dl)", t => {
    // y = x + 1
    const left_arm = new Line(new Vec2(0, 1), new Vec2(1, 2)),
        // y = x - 1
        right_arm = new Line(new Vec2(0, -1), new Vec2(1, 0)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        // y = 3x+1
        segment = new Line(new Vec2(0, 1), new Vec2(1, 4));

    // control values
    const o2: Vec2 = new Vec2(0.6180339887498949, 0.6180339887498949),
        tp2: Vec2 = new Vec2(-0.052786404500042045, 0.841640786499874),
        o1: Vec2 = new Vec2(-1.618033988749895, -1.618033988749895),
        tp1: Vec2 = new Vec2(-0.947213595499958, -1.841640786499874),
        r: number = 0.7071067811865476;

    const circlesInfo = w.fitCircles(segment, 10 ** -5)!;

    t.true(circlesInfo[0].circle.centre.minus(o1).norm < 0.0001);
    t.true(circlesInfo[1].circle.centre.minus(o2).norm < 0.0001);

    t.true(Math.abs(r - circlesInfo[0].circle.r) < 0.0001);
    t.true(Math.abs(r - circlesInfo[1].circle.r) < 0.0001);

    t.true(segment.evaluate(circlesInfo[0].tangentParameter).minus(tp1).norm < 0.0001);
    t.true(segment.evaluate(circlesInfo[1].tangentParameter).minus(tp2).norm < 0.0001);
});

test("fits a circle passing through given point in a non-degenerate wedge (private fit_NDp) 1", t => {
    // y = 1.5x + 1
    const left_arm = new Line(new Vec2(0, 1), new Vec2(1, 2.5)),
        // y = -0.5x + 1
        right_arm = new Line(new Vec2(0, 1), new Vec2(1, 0.5)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        p = new Vec2(1, 1.5);

    // control values
    const O: Vec2 = new Vec2(3.094087527929452, 1.8216796126142416),
        r: number = 2.118650595969362,
        // tangents at the point for the circle
        d: Vec2 = O.minus(p).normal();

    const circleInfo = w.fitCircles(p, 10 ** -5)![0];

    t.true(circleInfo.circle.centre.minus(O).norm < 0.0001);
    t.true(Math.abs(circleInfo.circle.r - r) < 0.0001);
    t.true(circleInfo.tangent.delta.minus(d).norm < 0.0001);
});

test("fits a circle passing through given point in a non-degenerate wedge (private fit_NDp) 2", t => {
    // horizontal and vertical arms
    const left_arm = new Line(new Vec2(0, 2.5), new Vec2(1, 2.5)),
        right_arm = new Line(new Vec2(1, 1), new Vec2(1, 0.5)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        p = new Vec2(0.75, 1.6);

    // control values
    const O = new Vec2(-0.8208203932499367, 0.6791796067500633),
        r = 1.8208203932499365,
        // tangents at the point for the circle
        d = O.minus(p).normal();

    const circleInfo = w.fitCircles(p, 10 ** -5)![0];

    t.true(circleInfo.circle.centre.minus(O).norm < 0.0001);
    t.true(Math.abs(circleInfo.circle.r - r) < 0.0001);
    t.true(circleInfo.tangent.delta.minus(d).norm < 0.0001);
});

test("fits a circle touching given line in a non-degenerate wedge (private fit_NDl) 1", t => {
    // generic triangle
    const left_arm = new Line(new Vec2(0, 1), new Vec2(1, 2)),
        right_arm = new Line(new Vec2(0, 3), new Vec2(1, 2)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        s = new Line(new Vec2(0, 1), new Vec2(1, 3));

    const control = {
        circle: {
            centre: new Vec2(-1.3874258867227922, 2),
            r: 1.688165034081993
        },
        tangentParameter: 0.12251482265544192
    };

    const circleInfo = w.fitCircles(s, 10 ** -5)![0];

    t.true(circleInfo.circle.centre.minus(control.circle.centre).norm < 0.0001);
    t.true(Math.abs(circleInfo.circle.r - control.circle.r) < 0.0001);
    t.true(Math.abs(circleInfo.tangentParameter - control.tangentParameter) < 0.0001);
});

test("fits a circle touching given line in a non-degenerate wedge (private fit_NDl) 2", t => {
    // vertical and horizontal arms
    const left_arm = new Line(new Vec2(0, 0), new Vec2(0, 3)),
        right_arm = new Line(new Vec2(0, 0), new Vec2(3, 0)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        s = new Line(new Vec2(2, -1), new Vec2(-2, 3));

    const control = {
        circle: {
            centre: new Vec2(1.7071067811865477, 1.7071067811865477),
            r: 1.7071067811865477
        },
        tangentParameter: 0.375
    };

    const circleInfo = w.fitCircles(s, 10 ** -5)![0];

    t.true(circleInfo.circle.centre.minus(control.circle.centre).norm < 0.0001);
    t.true(Math.abs(circleInfo.circle.r - control.circle.r) < 0.0001);
    t.true(Math.abs(circleInfo.tangentParameter - control.tangentParameter) < 0.0001);
});

test("fits a circle touching given line in a non-degenerate wedge (private fit_NDl) 3", t => {
    // vertical line
    const left_arm = new Line(new Vec2(-1, -1), new Vec2(4, 4)),
        right_arm = new Line(new Vec2(-1, 0), new Vec2(3, 0)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        s = new Line(new Vec2(2, -1), new Vec2(2, 4));

    const control = {
        circle: {
            centre: new Vec2(3.414213562373095, 1.4142135623730954),
            r: 1.4142135623730947
        },
        tangentParameter: 0.482843
    };

    const circleInfo = w.fitCircles(s, 10 ** -5)![0];

    t.true(circleInfo.circle.centre.minus(control.circle.centre).norm < 0.0001);
    t.true(Math.abs(circleInfo.circle.r - control.circle.r) < 0.0001);
    t.true(Math.abs(circleInfo.tangentParameter - control.tangentParameter) < 0.0001);
});

test("fits a circle touching given line in a non-degenerate wedge (private fit_NDl) 4", t => {
    // horizontal line
    const left_arm = new Line(new Vec2(-1, -1), new Vec2(4, 4)),
        right_arm = new Line(new Vec2(0, 5), new Vec2(-3, 8)),
        w = Wedge.new(left_arm, right_arm, 0)!,
        s = new Line(new Vec2(2, -1), new Vec2(4, -1));

    const control = {
        circle: {
            centre: new Vec2(2.499999999999998, -9.449747468305835),
            r: 8.449747468305835
        },
        tangentParameter: 0.25
    };

    const circleInfo = w.fitCircles(s, 10 ** -5)![0];

    t.true(circleInfo.circle.centre.minus(control.circle.centre).norm < 0.0001);
    t.true(Math.abs(circleInfo.circle.r - control.circle.r) < 0.0001);
    t.true(Math.abs(circleInfo.tangentParameter - control.tangentParameter) < 0.0001);
});
