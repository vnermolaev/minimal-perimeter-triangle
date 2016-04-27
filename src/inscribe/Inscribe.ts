import {Vec2} from '../geometry/Vec2';
import {Line} from '../geometry/Line';

// arms of a wedge have directions
// if wedge is degenerate, i.e., its arms a re parallel,
// they need to point in the same direction
export interface Wedge {
    left_arm: Line;
    right_arm: Line;
}

export interface Circle {
    centre: Vec2;
    r: number;
}

export function formTriangle(w: Wedge, l: Line): boolean {
    let d_right: Vec2 = w.right_arm.delta,
        d_left: Vec2 = w.left_arm.delta,
        d_line: Vec2 = l.delta;

    return Math.abs( d_right.cross(d_left) )>1/10 &&
           Math.abs( d_right.cross(d_line) )>1/10 &&
           Math.abs(  d_left.cross(d_line) )>1/10;
}

export function formDegenTriangle(w: Wedge, l: Line): boolean {
    let d_right: Vec2 = w.right_arm.delta,
        d_left: Vec2 = w.left_arm.delta,
        d_line: Vec2 = l.delta;

    return Math.abs( d_right.cross(d_line) )>1/10 &&
           Math.abs(  d_left.cross(d_line) )>1/10;
}

export function pointWithinWedge(w: Wedge, p: Vec2): boolean {
    // if arms of the wedge intersect, point is always within a wedge
    if ( w.right_arm.intersectionPoint(w.left_arm)!==null ) { return true; }
    // if parallel, check whether point is in between these lines
    let right: Line = w.right_arm,
        left: Line = w.left_arm;
    // by default arms MUST point in the same direction,
    // thus we can apply pointOnSide function
    let p_left: number = left.pointOnSide(p),
        p_right: number = right.pointOnSide(p);
    return p_left!==p_right && p_left!==0 && p_right!==0;
}

export function DegenWedgeLine(w: Wedge, l: Line): {circle: Circle, tangentParameter: number}[] {
    if ( !formDegenTriangle(w, l) ) {
        // edge is parallel to one of the arms
        return null;
    }

    let A: Vec2 = l.intersectionPoint(w.right_arm),
        B: Vec2 = l.intersectionPoint(w.left_arm);

    let AB: Line = new Line(A, B);

    let Ap: Vec2 = w.left_arm.closestPoint(A);

    // segment A-Ap is normal to both arms => I=(A+Ap)/2 is within arms of the wedge
    // and |A-Ap| is the radius of a circle to inscribe
    let I: Vec2 = A.plus(Ap).over(2),
        r: number = A.minus(Ap).norm/2;
    // now l = w.right_arm.delta*t + I passes between the arms

    let t1: number = ( AB.delta.cross( A.minus(I) ) + r*AB.delta.norm )/ AB.delta.cross( w.right_arm.delta ),
        t2: number = ( AB.delta.cross( A.minus(I) ) - r*AB.delta.norm )/ AB.delta.cross( w.right_arm.delta );

    let o1: Vec2 = w.right_arm.delta.times(t1).plus(I),
        o2: Vec2 = w.right_arm.delta.times(t2).plus(I);

    return [ {
            circle: {
                centre: o1,
                r: r
            },
            tangentParameter: l.closestPointParam(o1)
        }, {
            circle: {
                centre: o2,
                r: r
            },
            tangentParameter: l.closestPointParam(o2)
        } ];
}

export function DegenWedgePoint(w: Wedge, p: Vec2): {circle: Circle, tangentLine: Line}[] {
    if ( !pointWithinWedge(w, p) ) {
        // point is not within the wedge
        return null;
    }

    // arms are paralle, find a point in betwween arms which is equidistant from them
    let A: Vec2 = w.right_arm.closestPoint(p),
        Ap: Vec2 = w.left_arm.closestPoint(A);

    // segment A-Ap is normal to both arms => I=(A+Ap)/2 is within arms of the wedge
    // and |A-Ap| is the radius of a circle to inscribe
    let I: Vec2 = A.plus(Ap).over(2),
        r: number = A.minus(Ap).norm/2;
    // now l = w.right_arm.delta*t + I = D_ra*t + I passes between the arms
    // we need to find Ic on l such that (Ic-p).(Ic-p) = r^2
    // |Ic-p|^2-r^2 = |D_ra*t + I - p|^2-r^2 = (D_ra*t + I - p).(D_ra*t + I - p)-r^2 =
    // |D_ra|^2 t^2 + 2*(I-P).D_ra*t + |I-p|^2 - r^2
    let a = w.right_arm.delta.normSquared,
        b = I.minus(p).dot(w.right_arm.delta)*2,
        c = I.minus(p).normSquared - r*r,
        discriminant = b*b - 4*a*c;

    if ( discriminant<(-10)**-5 ) {
        return null;
    }

    let t: number[] = [];

    if ( Math.abs(discriminant)<10**-5 ) {
        t.push( -b/(2*a) );
    } else {
        t.push( (-b + Math.sqrt(discriminant))/(2*a) );
        t.push( (-b - Math.sqrt(discriminant))/(2*a) );
    }

    let result: {circle: Circle, tangentLine: Line}[] = [];

    t.forEach( (t0: number)=> {
        let O: Vec2 = w.right_arm.delta.times(t0).plus(I);
        result.push( {
            circle: {
                centre:  O,
                r: r
            },
            tangentLine: new Line(p, p.plus( O.minus(p).normal() ))
        } );
    });

    return result;
}

export function WedgeLine(w: Wedge, l: Line): {circle: Circle, tangentParameter: number} {
    if ( !formTriangle(w, l) ) {
        // edge is parallel to one of the arms
        return null;
    }

    // form a triangle such that:
    // vertex C is the wedge corner point
    let C: Vec2 = w.left_arm.intersectionPoint(w.right_arm);
    // vertex A is the line-left-arm intersection
    let A: Vec2 = l.intersectionPoint(w.left_arm);
    // vertex B is the line-right-arm intersection
    let B: Vec2 = l.intersectionPoint(w.right_arm);

    // sides of the triangle
    let AC: Line = new Line(A, C),
        BC: Line = new Line(B, C),
        AB: Line = new Line(A, B);

    // lengths of sides
    let a: number = AC.length,
        b: number = BC.length,
        c: number = AB.length;
    // half perimeter
    let s: number = (a + b + c)/2;

    if ( s*(s-a)*(s-b)/(s-c)<0 ) {
        // case of a very thin triangle
        return null;
    }
    // we need to find excribed circle touching AB
    // radius of such circle
    let r: number = Math.sqrt(s*(s-a)*(s-b)/(s-c));

    let det: number = AB.delta.cross(AC.delta);

    let lhs_all: Vec2[] = [
        new Vec2( B.cross(A) + r*c, C.cross(A) + r*a),
        new Vec2( B.cross(A) + r*c, C.cross(A) - r*a),
        new Vec2( B.cross(A) - r*c, C.cross(A) + r*a),
        new Vec2( B.cross(A) - r*c, C.cross(A) - r*a)
    ];
    // possible centres
    let O_all: Vec2[] = [];
    lhs_all.forEach((lhs: Vec2)=> {
        O_all.push(
            new Vec2(
                new Vec2(AB.delta.x, AC.delta.x).cross( lhs ),
                new Vec2(AB.delta.y, AC.delta.y).cross( lhs )
            ).over( -det )
        );
    });

    //choose the one touching the third side
    let o: Vec2;
    let dists: {raw: number, norm: number}[] = [];
    O_all.forEach((O: Vec2)=> {
        dists.push( {raw: Math.abs(BC.distanceToPoint(O) - r), norm: Math.abs(BC.distanceToPoint(O)/r-1)} );
        // absolute error --- is the distance between circle and a line, this is the ultimate measure of closeness
        let absolute_error: number = Math.abs(BC.distanceToPoint(O) - r);
        // relative error --- is the distance between circle and a line normalized to the radius
        // this measure is usefull when circle has a very large radius and absolute error might grow
        let relative_error: number = Math.abs(BC.distanceToPoint(O)/r - 1);
        if ( ( absolute_error < 10**(-5) || relative_error<10**(-5) ) &&
               AC.pointOnSide(O) !== BC.pointOnSide(O) ) {
            o = O;
        }
    });

    if ( o === undefined ) {
        console.log("WedgeLine, centre is undefined");
        for (let i: number = 0; i<O_all.length; i++) {
            console.log(`centre: (${O_all[i].x}, ${O_all[i].y}), r: ${r}, dist raw: ${dists[i].raw},  dist norm: ${dists[i].norm}`);
        }
        console.log('\n');
    }

    return { circle: {
                centre: o,
                r: r
            },
            tangentParameter: l.closestPointParam(o)
        };
}

export function WedgePoint(w: Wedge, p: Vec2, points: Vec2[]): {circle: Circle, tangentLine: Line} {
    let C: Vec2 = w.left_arm.intersectionPoint(w.right_arm);
    let dLeft: Vec2 = w.left_arm.delta,
        dRight: Vec2 = w.right_arm.delta;

    let ABs: {A: Vec2, B: Vec2}[] = [
        { A: C.plus(dLeft), B: C.plus(dRight) },
        { A: C.plus(dLeft), B: C.minus(dRight) },
        { A: C.minus(dLeft), B: C.plus(dRight) },
        { A: C.minus(dLeft), B: C.minus(dRight) }
    ];

    let A: Vec2,
        B: Vec2;

    for (let AB of ABs) {
        let arm1: Line = new Line(AB.A, C),
            arm2: Line = new Line(C, AB.B);
        if ( arm1.pointOnSide(p) === -1 && arm2.pointOnSide(p) === -1 ) {
            // point is to the left of the sides forming the wedge, it means we are in the right quadrant
            ( {A: A, B: B} = AB );
        }
    }

    if (typeof A === 'undefined' || typeof B === 'undefined') {
        // point lies on the edge of some quadrant, we need to analyse other points
        let quadrants: number[] = [0, 0, 0, 0];

        for (let ab: number = 0; ab < 4; ab++ ) {
            for (let i: number = 0; i<points.length; i++) {
                let arm1: Line = new Line(ABs[ab].A, C),
                    arm2: Line = new Line(C, ABs[ab].B);
                let p0: Vec2 = points[i];
                let inside: number = (arm1.pointOnSide(p0, 10**-5) === -1 && arm2.pointOnSide(p0, 10**-5) === -1)
                                     ? 1 : 0;
                quadrants[ab] += inside;
            }
        }

        // pick a quadrant containing the most points
        let i_max: number = 0,
            q_max: number = quadrants[i_max];
        for (let ab: number = 0; ab<4; ab++) {
            if (quadrants[ab]>q_max) {
                q_max = quadrants[ab];
                i_max = ab;
            }
        }

        ( {A: A, B: B} = ABs[i_max] );
    }

    if (typeof A === 'undefined' || typeof B === 'undefined') {
        return null;
    }

    let a: number = C.minus(B).norm,
        b: number = C.minus(A).norm,
        c: number = A.minus(B).norm;

    let D: Vec2 = A.minus(B).times( a/(a+b) ).plus(B);

    let bisector: Line = new Line(C, D);

    let // coefficients for quadratic equations
        e_a = D.minus(C).norm**2 - (A.minus(C).cross( D.minus(C) )/b)**2,
        e_b = D.minus(C).dot( C.minus(p) )*2,
        e_c = C.minus(p).norm**2,
        discriminant = e_b*e_b - 4*e_a*e_c;

    if (discriminant<(-10)**-5) {
        return null;
    }

    let O: Vec2,
        r: number;

    if ( Math.abs(discriminant)<10**-5 ) {
        let t: number = -e_b/(2*e_a);
        O = bisector.evaluate(t);
        r = O.minus(p).norm;
    } else {
        let t1: number = (-e_b + Math.sqrt(discriminant))/(2*e_a),
            t2: number = (-e_b - Math.sqrt(discriminant))/(2*e_a);
        // pick the value corresponding to larger radius
        if ( bisector.evaluate(t1).minus(p).normSquared > bisector.evaluate(t2).minus(p).normSquared ) {
            O = bisector.evaluate(t1);
            r = bisector.evaluate(t1).minus(p).norm;
        } else {
            O = bisector.evaluate(t2);
            r = bisector.evaluate(t2).minus(p).norm;
        }
    }

    return {
        circle: {
            centre: O,
            r: r
        },
        tangentLine: new Line( p, p.plus( O.minus(p).normal() ) )
    };
}
