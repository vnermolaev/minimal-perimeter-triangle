import test from '../ava';

import { Wedge, Circle,
         DegenWedgeLine, DegenWedgePoint, WedgeLine, WedgePoint,
         formTriangle, formDegenTriangle, pointWithinWedge } from './Inscribe';

import { Vec2 } from '../geometry/Vec2';
import { Line } from '../geometry/Line';

test("verifies that a line intersects a wedge", t=> {
    let left_arm: Line = new Line( new Vec2(0, 0), new Vec2(2, 0) ),
        right_arm: Line = new Line( new Vec2(0, 0), new Vec2(0, 2) ),
        w: Wedge = { left_arm: left_arm, right_arm: right_arm },
        l: Line = new Line( new Vec2(2, -1), new Vec2(-1, 2) );

    t.true( formTriangle(w, l) );

    l = new Line( new Vec2(1, -5), new Vec2(1, 20) );

    t.false( formTriangle(w, l) );
});


test("verifies that a point is within a wedge", t=> {
    let left_arm: Line = new Line( new Vec2(2, 0), new Vec2(0, 0) ),
        right_arm: Line = new Line( new Vec2(0, 0), new Vec2(0, 2) ),
        w: Wedge = { left_arm: left_arm, right_arm: right_arm },
        p: Vec2 = new Vec2(1, 1);

    // always true for this wedge
    t.true( pointWithinWedge(w, p) );

    right_arm = new Line( new Vec2(5, 2), new Vec2(1, 2) );
    w = { left_arm: left_arm, right_arm: right_arm };

    p = new Vec2(1, 1);
    t.true( pointWithinWedge(w, p) );

    p = new Vec2(1, 3);
    t.false( pointWithinWedge(w, p) );
});


test("fits a circle (touching given line) in a degenerate wedge", t => {
        // y = x + 1
    let left_arm: Line = new Line( new Vec2(0, 1), new Vec2(1, 2) ),
        // y = x - 1
        right_arm: Line = new Line( new Vec2(0, -1), new Vec2(1, 0) ),
        wedge: Wedge = { left_arm: left_arm, right_arm: right_arm },
        // y = 3x+1
        line: Line = new Line( new Vec2(0, 1), new Vec2(1, 4) );

    // control values
    let o2: Vec2 = new Vec2(0.6180339887498949, 0.6180339887498949),
        tp2: Vec2 = new Vec2(-0.052786404500042045, 0.841640786499874),
        o1: Vec2 = new Vec2(-1.618033988749895, -1.618033988749895),
        tp1: Vec2 = new Vec2(-0.947213595499958, -1.841640786499874),
        r: number = 0.7071067811865476;

    let circlesInfo: {circle: Circle, tangentParameter: number}[] = DegenWedgeLine( wedge, line );

    t.ok( circlesInfo[0].circle.centre.minus(o1).norm < 0.0001 );
    t.ok( circlesInfo[1].circle.centre.minus(o2).norm < 0.0001 );

    t.ok( Math.abs(r-circlesInfo[0].circle.r) < 0.0001 );
    t.ok( Math.abs(r-circlesInfo[1].circle.r) < 0.0001 );

    t.ok( line.evaluate(circlesInfo[0].tangentParameter).minus(tp1).norm < 0.0001 );
    t.ok( line.evaluate(circlesInfo[1].tangentParameter).minus(tp2).norm < 0.0001 );
});

test("fits a circle (touching given line) in a degenerate wedge", t => {
        // y = x + 1
    let left_arm: Line = new Line( new Vec2(0, 1), new Vec2(1, 2) ),
        // y = x - 1
        right_arm: Line = new Line( new Vec2(0, -1), new Vec2(1, 0) ),
        wedge: Wedge = { left_arm: left_arm, right_arm: right_arm },
        // y = 3x+1
        line: Line = new Line( new Vec2(0, 1), new Vec2(1, 4) );

    // control values
    let o2: Vec2 = new Vec2(0.6180339887498949, 0.6180339887498949),
        tp2: Vec2 = new Vec2(-0.052786404500042045, 0.841640786499874),
        o1: Vec2 = new Vec2(-1.618033988749895, -1.618033988749895),
        tp1: Vec2 = new Vec2(-0.947213595499958, -1.841640786499874),
        r: number = 0.7071067811865476;

    let circlesInfo: {circle: Circle, tangentParameter: number}[] = DegenWedgeLine( wedge, line );

    t.ok( circlesInfo[0].circle.centre.minus(o1).norm < 0.0001 );
    t.ok( circlesInfo[1].circle.centre.minus(o2).norm < 0.0001 );

    t.ok( Math.abs(r-circlesInfo[0].circle.r) < 0.0001 );
    t.ok( Math.abs(r-circlesInfo[1].circle.r) < 0.0001 );

    t.ok( line.evaluate(circlesInfo[0].tangentParameter).minus(tp1).norm < 0.0001 );
    t.ok( line.evaluate(circlesInfo[1].tangentParameter).minus(tp2).norm < 0.0001 );
});

test("fits a circle (passing through given point) in a degenerate wedge", t => {
        // y = x + 2
    let left_arm: Line = new Line( new Vec2(0, 2), new Vec2(1, 3) ),
        // y = x - 1
        right_arm: Line = new Line( new Vec2(0, -1), new Vec2(1, 0) ),
        point: Vec2 = new Vec2(-0.14, 1.2);

    // control values
    let O2: Vec2 = new Vec2(-0.34136945531623936, 0.15863054468376064),
        O1: Vec2 = new Vec2(0.9013694553162392, 1.4013694553162392),
        r: number = 1.0606601717798212,
        // tangents at point for the circles
        d2: Vec2 = O2.minus(point).normal(),
        d1: Vec2 = O1.minus(point).normal();

    let circlesInfo = DegenWedgePoint( { left_arm: left_arm, right_arm: right_arm }, point );

    t.ok( circlesInfo[0].circle.centre.minus(O1).norm < 0.0001 );
    t.ok( circlesInfo[1].circle.centre.minus(O2).norm < 0.0001 );

    t.ok( Math.abs(r-circlesInfo[0].circle.r) < 0.0001 );
    t.ok( Math.abs(r-circlesInfo[1].circle.r) < 0.0001 );

    t.ok( circlesInfo[0].tangentLine.delta.minus(d1).norm < 0.0001 );
    t.ok( circlesInfo[1].tangentLine.delta.minus(d2).norm < 0.0001 );
});

test("fits a circle (touching given line) in a wedge", t => {
    // generic triangle
    let wedge: Wedge = {
            left_arm: new Line( new Vec2(0, 1), new Vec2(1, 2) ),
            right_arm: new Line( new Vec2(0, 3), new Vec2(1, 2) )
        },
        line: Line = new Line( new Vec2(0, 1), new Vec2(1, 3) );

    let circleInfo: {circle: Circle, tangentParameter: number} = WedgeLine(wedge, line);
    let control: {circle: Circle, tangentParameter: number} = {
            circle: {
                centre: new Vec2(-1.3874258867227922, 2),
                r: 1.688165034081993
            },
            tangentParameter: 0.12251482265544192
        };

    t.ok( circleInfo.circle.centre.minus( control.circle.centre ).norm < 0.0001 );
    t.ok( Math.abs( circleInfo.circle.r - control.circle.r ) < 0.0001 );
    t.ok( Math.abs( circleInfo.tangentParameter - control.tangentParameter ) <0.0001);

    // vertical and horizontal arms
    wedge = {
            left_arm:  new Line( new Vec2(0, 0), new Vec2(0, 3) ),
            right_arm: new Line( new Vec2(0, 0), new Vec2(3, 0) )
        };
    line = new Line( new Vec2(2, -1), new Vec2(-2, 3) );

    circleInfo = WedgeLine(wedge, line);
    control= {
        circle: {
            centre: new Vec2(1.7071067811865477, 1.7071067811865477),
            r: 1.7071067811865477
        },
        tangentParameter: 0.375
    };

    t.ok( circleInfo.circle.centre.minus( control.circle.centre ).norm < 0.0001 );
    t.ok( Math.abs( circleInfo.circle.r - control.circle.r ) < 0.0001 );
    t.ok( Math.abs( circleInfo.tangentParameter - control.tangentParameter ) <0.0001);

    // vertical line
    wedge = {
            left_arm:  new Line( new Vec2(-1, -1), new Vec2(4, 4) ),
            right_arm: new Line( new Vec2(-1, 0), new Vec2(3, 0) )
        };
    line = new Line( new Vec2(2, -1), new Vec2(2, 4) );

    circleInfo = WedgeLine(wedge, line);
    control= {
        circle: {
            centre: new Vec2(3.414213562373095, 1.4142135623730954),
            r: 1.4142135623730947
        },
        tangentParameter: 0.482843
    };

    t.ok( circleInfo.circle.centre.minus( control.circle.centre ).norm < 0.0001 );
    t.ok( Math.abs( circleInfo.circle.r - control.circle.r ) < 0.0001 );
    t.ok( Math.abs( circleInfo.tangentParameter - control.tangentParameter ) <0.0001);

    // horizontal line
    wedge = {
            left_arm: new Line( new Vec2(-1, -1), new Vec2(4, 4) ),
            right_arm: new Line( new Vec2(0, 5), new Vec2(-3, 8) )
        };
    line = new Line( new Vec2(2, -1), new Vec2(4, -1) );

    circleInfo = WedgeLine(wedge, line);
    control= {
        circle: {
            centre: new Vec2(2.499999999999998, -9.449747468305835),
            r: 8.449747468305835
        },
        tangentParameter: 0.25
    };

    t.ok( circleInfo.circle.centre.minus( control.circle.centre ).norm < 0.0001 );
    t.ok( Math.abs( circleInfo.circle.r - control.circle.r ) < 0.0001 );
    t.ok( Math.abs( circleInfo.tangentParameter - control.tangentParameter ) <0.0001);
});


test("fits a circle (passing through given point) in a wedge", t => {
    // generic case
        // y = 1.5x + 1
    let left_arm: Line = new Line( new Vec2(0, 1), new Vec2(1, 2.5) ),
        // y = -0.5x + 1
        right_arm: Line = new Line( new Vec2(0, 1), new Vec2(1, 0.5) ),
        point: Vec2 = new Vec2(1, 1.5);

    // control values
    let O: Vec2 = new Vec2(3.094087527929452, 1.8216796126142416),
        r: number = 2.118650595969362,
        // tangents at the point for the circle
        d: Vec2 = O.minus(point).normal();

    // third parameter is empty because `point` is stricly within the wedge
    let circleInfo = WedgePoint( { left_arm: left_arm, right_arm: right_arm }, point, [] );

    t.ok( circleInfo.circle.centre.minus(O).norm < 0.0001 );
    t.ok( Math.abs(circleInfo.circle.r - r) < 0.0001 );
    t.ok( circleInfo.tangentLine.delta.minus(d).norm < 0.0001 );

    // horisontal and vertical arms
    left_arm = new Line( new Vec2(0, 2.5), new Vec2(1, 2.5) );
    right_arm = new Line( new Vec2(1, 1), new Vec2(1, 0.5) );
    point = new Vec2(0.75, 1.6);

    O = new Vec2(-0.8208203932499367, 0.6791796067500633);
    r = 1.8208203932499365;
    // tangents at the point for the circle
    d = O.minus(point).normal();

    // third parameter is empty because `point` is stricly within the wedge
    circleInfo = WedgePoint( { left_arm: left_arm, right_arm: right_arm }, point, [] );

    t.ok( circleInfo.circle.centre.minus(O).norm < 0.0001 );
    t.ok( Math.abs(circleInfo.circle.r - r) < 0.0001 );
    t.ok( circleInfo.tangentLine.delta.minus(d).norm < 0.0001 );
});
