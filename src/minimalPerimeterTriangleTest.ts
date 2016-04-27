import { minimalPerimeterTriangle } from './minimalPerimeterTriangle';
import test from './ava';

test("constructs min perimeter triangle for 3 points (vertices of equilateral triangle)", t=> {
    let a: number = 1;
    // equilateral triangle
    let points: {x: number, y: number}[] = [ {x: 0, y: 0}, {x: a, y: 0}, {x: a/2, y: a/2*Math.sqrt(3)} ] ;

    let triangle = minimalPerimeterTriangle(points);

    t.ok( (triangle.A.x - 0)**2 + (triangle.A.y - 0)**2 < 0.0001 );
    t.ok( (triangle.B.x - a)**2 + (triangle.B.y - 0)**2 < 0.0001 );
    t.ok( (triangle.C.x - a/2)**2 + (triangle.C.y - a/2*Math.sqrt(3))**2 < 0.0001 );
});
