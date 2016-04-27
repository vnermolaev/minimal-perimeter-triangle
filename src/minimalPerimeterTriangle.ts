import * as Inscribe from './inscribe/Inscribe';

import {Vec2} from './geometry/Vec2';
import {Line} from './geometry/Line';

function sign(x: number): number {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}

function lineTangentToHull(line: Line, points: Vec2[]): {holds: boolean, side: number} {
    let holds: boolean = true;
    let side: number = 0;

    for (let i: number = 0; i<points.length; i++) {
        let side0: number = line.pointOnSide( points[i], 10**-5 );
        // point is on the line
        if ( side0 === 0 ) { continue; }
        //point is not on the line
        if ( side === 0 ) {
            // if this is the first point that doesnt lie on a line
            side = side0;
            continue;
        }
        // values of side and side0 must be equal for all points not lying on the line
        if ( side0 !== side ) {
            holds = false;
            break;
        }
    }
    return {holds: holds, side: side};
}

function findAntipode(points: Vec2[]): number {
    let n: number = points.length;
    let base: Line = new Line(points[0], points[n-1]);
    let antipod: number = 1;
    let distToAntipod: number = base.distanceToPoint( points[antipod] );

    for (let i: number = 2; i<n; i++) {
        let dist: number = base.distanceToPoint( points[i] );
        if ( dist > distToAntipod ) {
            antipod = i;
            distToAntipod = dist;
        }
    }
    return antipod;
}

// starting with a degenerate wedge, find an arm for a regular wedge
// arm will always start on left_arm end at the tangent (to the polygon) point, i.e. Q
function findInitialArm(dWedge: Inscribe.Wedge, endVertex: number, points: Vec2[]): Line {
    // arms of the degenerate wedge point in the same direction
    let n: number = points.length;
    let startVertex: number = n-1;

    let arm: Line;

    let Q: Vec2,
        Qfound = false;

    let vertex: number = startVertex;

    do {
        // Q is guaranteed to be found by the algorithm before we exhaust edges

        // if edgePossibility = false, no edge will be considered,
        // but the last point point might be.
        let edgePossibility: boolean = vertex > 0;

        let p1: Vec2 = points[vertex];
        let p2: Vec2 = edgePossibility ? points[vertex-1] : null;

        // edge if considered if
        // 1. p1 and p2 are within the wedge
        // 2. p1 is within the wedge, p2 is on one of the arm
        // 3. p2 is within the wedge, p1 is on one of the arm
        // 4. p1 is on one arm, p2 is on another arm
        let p1PosLeft: number  = dWedge.left_arm.pointOnSide ( p1, 10**-5 ),
            p1PosRight: number = dWedge.right_arm.pointOnSide ( p1, 10**-5 ),
            p2PosLeft: number  = edgePossibility ? dWedge.left_arm.pointOnSide ( p2, 10**-5 ) : NaN,
            p2PosRight: number = edgePossibility ? dWedge.right_arm.pointOnSide ( p2, 10**-5 ) : NaN;

        if ( !Qfound && edgePossibility &&
            (
                // edge is completely within the wedge
                ( p1PosLeft === -p1PosRight && p2PosLeft === -p2PosRight ) ||
                 // p1 is within the wedge, p2 is on one of the arms
                ( p1PosLeft === -p1PosRight && ( p2PosLeft === 0 || p2PosRight === 0) ) ||
                // p2 is within the wedge, p1 is on one of the arms
                ( p2PosLeft === -p2PosRight && ( p1PosLeft === 0 || p1PosRight === 0) ) ||
                // p1 is on the left arm, p2 is on the right arm
                ( p1PosLeft === 0 && p2PosRight === 0 ) ||
                // p2 is on the left arm, p1 is on the right arm
                ( p1PosRight === 0 && p2PosLeft === 0 )
            )
         ) {
            let edge: Line = new Line( p1, p2 );

            let circlesWedgeLine = Inscribe.DegenWedgeLine( dWedge, edge );

            if (circlesWedgeLine !== null) {
                // pick a circle such that its centre is on another side compared to the
                // hull points (take the first one for test) w.r.t. the considered edge.
                // the corresponding tangent point will be considered as candidate for Q

                let tangentParameter: number =
                    edge.pointOnSide( points[0] ) !== edge.pointOnSide( circlesWedgeLine[0].circle.centre )
                    ? circlesWedgeLine[0].tangentParameter
                    : circlesWedgeLine[1].tangentParameter;

                //check whether this tangent point belongs to the edge
                if ( 0 < tangentParameter && tangentParameter < 1 ) {
                    Q = edge.evaluate( tangentParameter );
                    Qfound = true;
                    let joint: Vec2 = dWedge.left_arm.intersectionPoint(edge);
                    arm = new Line( joint, Q );
                }
            }
        }


        // point (p1 if we start from the antipod, p2 --- if from the last) is only considered if it's within the wedge
        if ( !Qfound &&
            (
                // starting from the antipod, first point to consider is p1
                (startVertex !== n-1 && p1PosLeft === -p1PosRight && Math.abs(p1PosLeft) !== 0) ||
                // starting from the end, first point to consider is p2
                (startVertex === n-1 && p2PosLeft === -p2PosRight && Math.abs(p2PosLeft) !== 0)
            )
        ) {
            // circle inscribed into a wedge and a line either doesnt touch the line (but its extension)
            // or the line is parallel to one of the arms of the wedge
            let point: Vec2 = startVertex === n-1 ? p2 : p1;
            let pointIndex: number = startVertex === n-1 ? vertex-1 : vertex;

            let circlesWedgePoint = Inscribe.DegenWedgePoint( dWedge, point );

            if ( circlesWedgePoint !== null ) {
                // we look for circle which is external to the polygon
                // and which tangent line at given point is also tangent to the polygon

                // sides where centres of circles lie w.r.t. the corresponding tangents
                let tangent1Centre: number = circlesWedgePoint[0].tangentLine.pointOnSide( circlesWedgePoint[0].circle.centre ),
                    tangent2Centre: number = circlesWedgePoint[1].tangentLine.pointOnSide( circlesWedgePoint[1].circle.centre );

                let isTangent1 = lineTangentToHull( circlesWedgePoint[0].tangentLine, points ),
                    isTangent2 = lineTangentToHull( circlesWedgePoint[1].tangentLine, points );

                // which circle's tangent is also a tangent to the hull
                let i_tangentToHull: number = 0;

                if ( isTangent1.holds /*tangent to polygon*/ &&
                     sign(tangent1Centre) !== sign(isTangent1.side) /*external circle*/) {
                    Qfound = true;
                    i_tangentToHull = 0;
                } else if ( isTangent2.holds &&
                        sign(tangent2Centre) !== sign(isTangent2.side)) {
                    Qfound = true;
                    i_tangentToHull = 1;
                }

                if ( Qfound ) {
                    Q = point;
                    let joint: Vec2 = dWedge.left_arm.intersectionPoint(circlesWedgePoint[ i_tangentToHull ].tangentLine);
                    arm = new Line( joint, Q );
                }
            }
        }

        vertex--;
        // edges connect points[pointIndex+1] and points[pointIndex],
        // thus pointIndex equal to endVertex is valid for edge consideration, but not a single point
    } while ( !Qfound && vertex>=endVertex );

    return Qfound ? arm : null;
}

// given a wedge find a side such that the hull will be enclosed within this side and given wedge
// "side" will start on left_arm and end at tangent (to the polygon, i.e. either P or Q) point
function findThirdSide(wedge: Inscribe.Wedge, startVertex: number, endVertex: number, points: Vec2[]): Line {
    let n: number = points.length;

    // this side can be AB or AC in the main algorithm
    let side: Line;

    // PQ can be P or Q in the main algorithm
    let PQ: Vec2,
        PQfound: boolean = false;

    let vertex: number = startVertex;

    do {
        // if edgePossibility = false, no edge will be considered,
        // but the last point point might be.
        let edgePossibility: boolean = vertex > 0;

        let p1: Vec2 = points[vertex];
        let p2: Vec2 = edgePossibility ? points[vertex-1] : null;

        // edge if considered if
        // 1. p1 and p2 are within the wedge
        // 2. p1 is within the wedge, p2 is on one of the arm
        // 3. p2 is within the wedge, p1 is on one of the arm
        // 4. p1 is on one arm, p2 is on another arm
        let p1PosLeft: number = wedge.left_arm.pointOnSide ( p1, 10**-5 ),
            p1PosRight: number = wedge.right_arm.pointOnSide ( p1, 10**-5 ),
            p2PosLeft: number = edgePossibility ? wedge.left_arm.pointOnSide ( p2, 10**-5 ) : NaN,
            p2PosRight: number = edgePossibility ? wedge.right_arm.pointOnSide ( p2, 10**-5 ) : NaN;

        if ( !PQfound && edgePossibility &&
            (
                // edge is completely within the wedge
                ( p1PosLeft === -p1PosRight && p2PosLeft === -p2PosRight ) ||
                // p1 is within the wedge, p2 is on one of the arms
                ( p1PosLeft === -p1PosRight && ( p2PosLeft === 0 || p2PosRight === 0) ) ||
                // p2 is within the wedge, p1 is on one of the arms
                ( p2PosLeft === -p2PosRight && ( p1PosLeft === 0 || p1PosRight === 0) ) ||
                // p1 is on the left arm, p2 is on the right arm
                ( p1PosLeft === 0 && p2PosRight === 0 ) ||
                // p2 is on the left arm, p1 is on the right arm
                ( p1PosRight === 0 && p2PosLeft === 0 )
            )
        ) {
            let edge: Line = new Line( p1, p2 );

            let circleWedgeLine = Inscribe.WedgeLine( wedge, edge );

            if ( circleWedgeLine !== null ) {
                // check whether the circle is not only tangent to some extension of the edge
                // but also tangent to the polygon
                if ( 0 < circleWedgeLine.tangentParameter && circleWedgeLine.tangentParameter < 1 ) {
                    PQ = edge.evaluate( circleWedgeLine.tangentParameter );
                    PQfound = true;
                    let joint: Vec2 = wedge.left_arm.intersectionPoint( edge );
                    side = new Line( joint, PQ );
                }
            }
        }

        // point (p1 = points[pointIndex]) is only considered if it's within the wedge
        if ( !PQfound &&
            (
                // starting from the antipod, first point to consider is p1
                (startVertex !== n-1 && p1PosLeft === -p1PosRight && Math.abs(p1PosLeft) !== 0) ||
                // starting from the end, first point to consider is p2
                (startVertex === n-1 && p2PosLeft === -p2PosRight && Math.abs(p2PosLeft) !== 0)
            )
        ) {
            // circle inscribed into a wedge and a line either doesnt touch the edge (but its extension)
            // or the edge is parallel to one of the arms of the wedge

            let point: Vec2 = startVertex === n-1 ? p2 : p1;
            let pointIndex: number = startVertex === n-1 ? vertex-1 : vertex;

            let circleWedgePoint = Inscribe.WedgePoint( wedge, point, points );
            // check if the tangent to the circle in given point is also a tangent to the polygon

            if ( circleWedgePoint !== null ) {
                let isTangent = lineTangentToHull(circleWedgePoint.tangentLine, points);

                if ( isTangent.holds ) {
                    // tangent to polygon
                    PQ = point;
                    PQfound = true;
                    let joint: Vec2 = wedge.left_arm.intersectionPoint( circleWedgePoint.tangentLine );
                    side = new Line( joint, PQ );
                }
            }
        }
        vertex--;
    } while ( !PQfound && vertex >= endVertex );

    return PQfound ? side : null;
}

function triangleWithBase(points: Vec2[]): {A: Vec2, B: Vec2, C: Vec2} {
    let A: Vec2, B: Vec2, C: Vec2;
    let AB: Line, AC: Line, BC: Line;

    // the previous re-arrangement assures that the base if formed by the first
    // and the last point of the hull
    let n: number = points.length,
        base: Line = new Line(points[0], points[n-1]);

    BC = base;

    // find the antipodal point to the base, i.e. the farthest point
    let antipod: number = findAntipode(points);
    // baseParallel points in the same direction as BC
    let baseParallel: Line = new Line( points[antipod], points[antipod].plus(BC.delta) );

    // start with a degenerate wedge
    let wedge: Inscribe.Wedge = {left_arm: base, right_arm: baseParallel};

    let Q: Vec2, P: Vec2;
    // BP must always be greater or equal to CQ (by the algorithm design)
    let BP: number = 10,
        CQ: number = 0;

    let regularWedge: boolean = false;

    do { //iterations
        if (!regularWedge) {
            AC = findInitialArm( wedge, antipod, points );
            regularWedge = true;
        } else {
            AC = findThirdSide( wedge, n-1, antipod, points );
        }

        // assert AC is non-null
        if (AC === null) {
            return null;
        }

        Q = AC.end;

        // reverse left arm of the wedge so both rays leave the angle point of the wedge
        // correct value for the angle point is AC.start
        wedge.left_arm = new Line(AC.start, wedge.left_arm.start);
        wedge.right_arm = AC;

        AB = findThirdSide( wedge, antipod, 0, points );

        // assert AB is non-null
        if (AB === null) {
            return null;
        }

        P = AB.end;

        // calculate vertices of the triangle
        A = AB.intersectionPoint(AC);
        B = BC.intersectionPoint(AB);
        C = BC.intersectionPoint(AC);

        // flip wedge
        wedge.left_arm = new Line(B, C);
        wedge.right_arm = new Line(B, A);

        BP = B.minus(P).norm;
        CQ = C.minus(Q).norm;
    } while ( BP - CQ > 0.1 );

    // AB, BC and AC are guaranteed to be well deifined,
    // otherwise the program would have terminated before
    A = AB.intersectionPoint(AC);
    B = BC.intersectionPoint(AB);
    C = BC.intersectionPoint(AC);

    return {A: A, B: B, C: C};
}

export function minimalPerimeterTriangle(convexHull: {x: number, y: number}[]):
    {A: {x: number, y: number}, B: {x: number, y: number}, C: {x: number, y: number}} {

    if (convexHull.length < 3) {
        return null;
    }

    if (convexHull.length === 3) {
        return {A: convexHull[0], B: convexHull[1], C: convexHull[2]};
    }

    let points: Vec2[] = [];
    convexHull.forEach( (p: {x: number, y: number})=> { points.push( new Vec2(p.x, p.y) ); });

    let A: Vec2, B: Vec2, C: Vec2, perimeter: number;
    let rotations: number = 0;

    while ( rotations < points.length ) {
        // rotate array of points
        if (rotations>0) {
            points.push( points.shift() );
        }

        // re-calculate the triangle
        // console.log( points[0] );console.log( points[1] );console.log( points[2] );
        let triangle = triangleWithBase( points );
        //assert triangle is found
        if ( triangle === null ) {
            rotations++;
            continue;
        }

        // decompose the triangle
        let {A: A1, B: B1, C: C1} = triangle;

        // if this is the first traingle found, fill in the initial vertices
        if ( A === undefined ) {
            [A, B, C] = [A1, B1, C1];
            perimeter = A.minus(B).norm + B.minus(C).norm + C.minus(A).norm;
        } else {
            let perimeter1: number = A1.minus(B1).norm + B1.minus(C1).norm + C1.minus(A1).norm;
            if (perimeter1 < perimeter) {
                [A, B, C] = [A1, B1, C1];
                perimeter = perimeter1;
            }
        }

        rotations++;
    }

    return A === undefined
           ? null
           : { A: {x: A.x, y: A.y},
               B: {x: B.x, y: B.y},
               C: {x: C.x, y: C.y} };
}
