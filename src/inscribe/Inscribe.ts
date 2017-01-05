import { Vec2, Side, Line } from '../Geometry';

export interface Circle {
    centre: Vec2;
    r: number;
}

/**
 * Class describing a wedge.
 * Wedge can be degenerate, i.e., its arms are parallel,
 * in this case they must point in the same direction
 */
export class Wedge {
    readonly left_arm: Line;
    readonly right_arm: Line;
    readonly isDegenerate: boolean;

    private constructor(left_arm: Line, right_arm: Line, isDegenerate: boolean = false) {
        this.left_arm = left_arm;
        this.right_arm = right_arm;
        this.isDegenerate = isDegenerate;
    }

    static new(left_arm: Line, right_arm: Line, err: number): Wedge | null {
        if(left_arm === null || right_arm === null) {
            return null;
        }

        if(err !== 0 && left_arm.overlaps(right_arm, err)) {
            return null;
        }

        // Check if they are parallel
        // Such value of deviation ensure that angle in between the Lines regardless
        // their lengths is 0.1 radians
        const deviationFromZeroAngle = 0.1 / (left_arm.length * right_arm.length);
        if(left_arm.parallel(right_arm, deviationFromZeroAngle)) {
            // Check if they point in the same direction
            // middle is non-null due to the overlap check
            const middle = new Line(left_arm.evaluate(0.5), right_arm.evaluate(0.5));
            const p = middle.evaluate(0.5);
            // Now p lies in between the arms
            // If arms point in the same direction p must be on the right of one and the left of another
            // --------*------------>
            //          \
            //           \
            //            * p
            //             \
            //       -------*----------->
            const sideLeft = left_arm.pointOnSide(p, err);
            const sideRight = right_arm.pointOnSide(p, err);
            if(sideLeft === Side.Top || sideRight === Side.Top) { throw new Error(); }

            return sideLeft !== sideRight
                ? new Wedge(left_arm, right_arm, true)
                : new Wedge(left_arm, new Line(right_arm.end, right_arm.start));
        }

        // extensions of the wedge intersect, extend or cut the sides appropriately
        // err is set to 0 because we have already established that they intersect under appropriate angle
        const
            tLA = left_arm.intersectionParameter(right_arm, 0) !,
            tRA = right_arm.intersectionParameter(left_arm, 0) !;

        // If it's impossible to tell the excess that need to be cut
        if(tLA === 0.5 || tRA === 0.5) { return null; }

        // W will be the angle point of the wedge
        const W = left_arm.evaluate(tLA);

        // Arrange the arms in a way that they point away from W.
        // Make sure that after the cut, W and corresponding points are at least err distance apart
        const eLA = tLA < 1 - tLA
            ? left_arm.end
            : left_arm.start;

        const eRA = tRA < 1 - tRA
            ? right_arm.end
            : right_arm.start;

        return new Wedge(new Line(W, eLA), new Line(W, eRA));
    }

    formTriangle(line: Line, err: number): boolean {
        const thin =
            this.left_arm.parallel(line, 0.1 / (this.left_arm.length * line.length)) ||
            this.right_arm.parallel(line, 0.1 / (this.right_arm.length * line.length));
        if(thin) {
            return false;
        }

        const A = line.intersectionPoint(this.left_arm, 0) !,
            B = line.intersectionPoint(this.right_arm, 0) !;

        if(this.isDegenerate) {
            return !A.equals(B, err);
        }

        const C = this.left_arm.intersectionPoint(this.right_arm, 0) !;

        return !C.equals(A, err)
            && !C.equals(B, err)
            && !A.equals(B, err)
            && !new Line(A, B).pointOnTop(C, err);
    }

    looselyContains(p: Vec2, err: number): boolean {
        const pLeft = this.left_arm.pointOnSide(p, err),
            pRight = this.right_arm.pointOnSide(p, err);

        if(pLeft === Side.Top || pRight === Side.Top) {
            return true;
        }

        // Point is on neither arms; To be within the wedge it:
        // 1. must lie on different sides w.r.t. the arms
        if(pLeft === pRight) {
            return false;
        }

        return this.isDegenerate
            // degenerate + different sides => true
            ? true
            // 2. (Because the arms intersect)
            // Projection params of the point onto the arms must be larger than 0
            : this.left_arm.closestPointParam(p) >= 0 && this.right_arm.closestPointParam(p) >= 0;
    }

    strictlyContains(p: Vec2, err: number): boolean {
        const pLeft = this.left_arm.pointOnSide(p, err),
            pRight = this.right_arm.pointOnSide(p, err);

        if(pLeft === Side.Top || pRight === Side.Top) {
            return false;
        }

        // Point is on neither arms; To be within the wedge it:
        // 1. must lie on different sides w.r.t. the arms
        if(pLeft === pRight) {
            return false;
        }

        return this.isDegenerate
            // degenerate + different sides => true
            ? true
            // 2. (Because the arms intersect)
            // Projection params of the point onto the arms must be larger than 0
            : this.left_arm.closestPointParam(p) >= 0 && this.right_arm.closestPointParam(p) >= 0;
    }

    // While fitting circles into a wedge
    // There are four distinct cases:
    // 1. Wedge is degenerate and additional element is a point
    // 2. Wedge is degenerate and additional element is a line
    // 3. Wedge is non-degenerate and additional element is a point
    // 4. Wedge is non-degenerate and additional element is a line
    // according to these assumptions, the following methods are named

    private fit_Dp(p: Vec2, err: number): { circle: Circle, tangent: Line }[] | null {
        if(!this.strictlyContains(p, err)) {
            // point is not within the wedge
            return null;
        }
        // Intersection are ensured by the previous check
        // => A and B are non-null-s
        //  -----------------------*(Ap)---------------(left)------->
        //                         |
        //                         |
        //                         |
        //   ----------------------*(I)-------------------
        //                         |
        //                         *(p)
        //                         |
        //  -----------------------*(A)----(right)----------->

        const A = this.right_arm.closestPoint(p),
            Ap = this.left_arm.closestPoint(A);

        // Line A-Ap is normal to both arms => I = (A+Ap)/2 is within arms of the wedge
        // and ||A-Ap|| is the radius of a circle to inscribe
        const I = A.plus(Ap).over(2),
            r: number = A.minus(Ap).norm / 2;
        // Now l = this.right_arm.delta*t + I = D_ra*t + I passes between the arms
        // We need to find Ic on l such that (Ic-p).(Ic-p) = r^2
        // |Ic-p|^2-r^2 = |D_ra*t + I - p|^2-r^2 = (D_ra*t + I - p).(D_ra*t + I - p)-r^2 =
        // |D_ra|^2 t^2 + 2*(I-P).D_ra*t + |I-p|^2 - r^2
        const a = this.right_arm.delta.normSquared,
            b = I.minus(p).dot(this.right_arm.delta) * 2,
            c = I.minus(p).normSquared - r * r,
            discriminant = b * b - 4 * a * c;

        if(discriminant < (-10) ** -5) {
            // Account for possible computation errors
            // This should not happen if point is strictly contained within the wedge with a reasonable err
            return null;
        }

        let t: number[] = [];

        if(Math.abs(discriminant) < 10 ** -5) {
            t.push(-b / (2 * a));
        } else {
            t.push((-b + Math.sqrt(discriminant)) / (2 * a));
            t.push((-b - Math.sqrt(discriminant)) / (2 * a));
        }

        let result: { circle: Circle, tangent: Line }[] = [];

        t.forEach((t0: number) => {
            let O = this.right_arm.delta.times(t0).plus(I);
            result.push({
                circle: { centre: O, r: r },
                tangent: new Line(p, p.plus(O.minus(p).normal()))
            });
        });

        return result;
    }

    private fit_Dl(l: Line, err: number): { circle: Circle, tangentParameter: number }[] | null {
        if(!this.formTriangle(l, err)) {
            // edge is parallel to the arms
            return null;
        }

        // Intersection are ensured by the previous check
        // => A and B are non-null-s
        //  ------(B)*-----*(Ap)---------------(left)------->
        //            \    |
        //             \   |
        //   -----------\--*(I)-------------------
        //               \ |
        //                \|
        //  ---------------*(A)-------------(right)----------->
        const A = l.intersectionPoint(this.right_arm, 0) !,
            B = l.intersectionPoint(this.left_arm, 0) !;

        const AB = new Line(A, B) !;
        const Ap = this.left_arm.closestPoint(A);

        // Line A-Ap is normal to both arms => I = (A+Ap)/2 is within arms of the wedge
        // and ||A-Ap|| is the radius of a circle to inscribe
        const I = A.plus(Ap).over(2),
            r = A.minus(Ap).norm / 2;
        // Now this.right_arm.delta*t + I passes between the arms and parallel to them

        const t1 = (AB.delta.cross(A.minus(I)) + r * AB.delta.norm) / AB.delta.cross(this.right_arm.delta),
            t2 = (AB.delta.cross(A.minus(I)) - r * AB.delta.norm) / AB.delta.cross(this.right_arm.delta);

        const o1: Vec2 = this.right_arm.delta.times(t1).plus(I),
            o2: Vec2 = this.right_arm.delta.times(t2).plus(I);

        return [{
            circle: { centre: o1, r: r },
            tangentParameter: l.closestPointParam(o1)
        }, {
            circle: { centre: o2, r: r },
            tangentParameter: l.closestPointParam(o2)
        }];
    }

    private fit_NDp(p: Vec2, err: number): { circle: Circle, tangent: Line }[] | null {
        if(!this.strictlyContains(p, err)) {
            return null;
        }
        // Point is in-between the wedge's arms

        //              *(C)
        //             /|
        //            / |
        //           /  |
        //          /   |
        //         /    |
        //        / *(p)|
        //       /      |
        //   (A)*       *(B)


        // By construction of wedge
        const
            C = this.left_arm.start, // or = this.right_arm.end
            A = this.left_arm.end,
            B = this.right_arm.end;

        const
            a: number = C.minus(B).norm,
            b: number = C.minus(A).norm;

        const D = A.minus(B).times(a / (a + b)).plus(B);

        const bisector = new Line(C, D);

        const // coefficients for quadratic equations
            e_a = D.minus(C).normSquared - (A.minus(C).cross(D.minus(C)) / b) ** 2,
            e_b = D.minus(C).dot(C.minus(p)) * 2,
            e_c = C.minus(p).normSquared,
            discriminant = e_b * e_b - 4 * e_a * e_c;

        if(discriminant < (-10) ** -5) {
            // Account for possible computation errors
            // This should not happen if point is strictly contained within the wedge with a reasonable err
            return null;
        }

        let O: Vec2, r: number;

        if(Math.abs(discriminant) < 10 ** -5) {
            const t = -e_b / (2 * e_a);
            O = bisector.evaluate(t);
            r = O.minus(p).norm;
        } else {
            const t1 = (-e_b + Math.sqrt(discriminant)) / (2 * e_a),
                t2 = (-e_b - Math.sqrt(discriminant)) / (2 * e_a);
            // Pick the value corresponding to larger radius
            if(bisector.evaluate(t1).minus(p).normSquared > bisector.evaluate(t2).minus(p).normSquared) {
                O = bisector.evaluate(t1);
                r = bisector.evaluate(t1).minus(p).norm;
            } else {
                O = bisector.evaluate(t2);
                r = bisector.evaluate(t2).minus(p).norm;
            }
        }

        return [{
            circle: { centre: O, r: r },
            tangent: new Line(p, p.plus(O.minus(p).normal()))
        }];
    }

    private fit_NDl(l: Line, err: number): { circle: Circle, tangentParameter: number }[] | null {
        if(!this.formTriangle(l, err)) {
            // Edge is parallel to one of the arms
            return null;
        }

        // Intersections are ensured by the previous check;
        // => A, B, and C are non-null-s
        // Form a triangle such that:
        // 1. vertex C is the wedge corner point
        const C = this.left_arm.start;

        // 2. vertex A is the line-left-arm intersection
        const A = l.intersectionPoint(this.left_arm, 0) !;

        // 3. vertex B is the line-right-arm intersection
        const B = l.intersectionPoint(this.right_arm, 0) !;

        // => sides of the triangle are
        const
            AC = new Line(A, C),
            BC = new Line(B, C),
            AB = new Line(A, B);

        // lengths of sides
        const
            a = AC.length,
            b = BC.length,
            c = AB.length;
        // half perimeter
        const s = (a + b + c) / 2;

        if(s * (s - a) * (s - b) / (s - c) < 0) {
            // Case of a very thin triangle
            // Should not happen with a reasonable err
            return null;
        }

        // We need to find an escribed circle touching AB
        // Radius of such circle
        const r = Math.sqrt(s * (s - a) * (s - b) / (s - c));

        const det: number = AB.delta.cross(AC.delta);

        const lhs_all: Vec2[] = [
            new Vec2(B.cross(A) + r * c, C.cross(A) + r * a),
            new Vec2(B.cross(A) + r * c, C.cross(A) - r * a),
            new Vec2(B.cross(A) - r * c, C.cross(A) + r * a),
            new Vec2(B.cross(A) - r * c, C.cross(A) - r * a)
        ];

        // Possible centres
        let O_all: Vec2[] = [];
        lhs_all.forEach((lhs: Vec2) => {
            O_all.push(
                new Vec2(
                    new Vec2(AB.delta.x, AC.delta.x).cross(lhs),
                    new Vec2(AB.delta.y, AC.delta.y).cross(lhs)
                ).over(-det)
            );
        });

        //choose the one touching the third side
        let o: Vec2 | null = null;
        let dists: { raw: number, norm: number }[] = [];
        for(let O of O_all) {
            dists.push({ raw: Math.abs(BC.distanceToPoint(O) - r), norm: Math.abs(BC.distanceToPoint(O) / r - 1) });
            // absolute error --- is the distance between circle and a line, this is the ultimate measure of closeness
            const absolute_error = Math.abs(BC.distanceToPoint(O) - r);
            // relative error --- is the distance between circle and a line normalized to the radius
            // this measure is usefull when circle has a very large radius and absolute error might grow
            const relative_error = Math.abs(BC.distanceToPoint(O) / r - 1);
            if((absolute_error < 10 ** (-5) || relative_error < 10 ** (-5)) &&
                AC.pointOnSide(O) !== BC.pointOnSide(O)) {
                o = O;
                break;
            }
        }

        let msg = '';
        if(o === null) {
            msg = "fit_NDl, centre is undefined";
            for(let i: number = 0; i < O_all.length; i++) {
                msg += `centre: (${O_all[i].x}, ${O_all[i].y}), r: ${r}, dist raw: ${dists[i].raw},  dist norm: ${dists[i].norm}\n`;
            }
        }
        if(o === null) { throw new Error(msg); }

        return [{
            circle: { centre: o!, r: r },
            tangentParameter: l.closestPointParam(o!)
        }];
    }

    fitCircles(element: Vec2, err: number): { circle: Circle, tangent: Line }[] | null;
    fitCircles(element: Line | Line, err: number): { circle: Circle, tangentParameter: number }[] | null;
    fitCircles(element: Vec2 | Line | Line, err: number): any {
        if(element instanceof Vec2) {
            return this.isDegenerate
                ? this.fit_Dp(element, err)
                : this.fit_NDp(element, err);
        }
        if(element instanceof Line || element instanceof Line) {
            return this.isDegenerate
                ? this.fit_Dl(element instanceof Line ? element : element, err)
                : this.fit_NDl(element instanceof Line ? element : element, err);
        }
        return null;
    }

    toString(): string {
        return `LA: ${this.left_arm.start} --> ${this.left_arm.end}\n` +
            `RA: ${this.right_arm.start} --> ${this.right_arm.end}`;
    }
}
