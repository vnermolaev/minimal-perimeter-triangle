import { Paper } from './drawing';

// required
import { Vec2, Line } from '../../Geometry';

// to showcase
import { minTriangle as minABC } from '../../minimalPerimeterTriangle';

// on different data
import { testcases } from '../../data';

const
    canvas = <HTMLCanvasElement>document.getElementById('paper'),
    paper = new Paper(canvas.getContext('2d') !),
    select = <HTMLSelectElement>document.getElementById('testcases'),
    h = <HTMLHeadingElement>document.getElementById('casename');

// build options
for(let test of testcases) {
    let option = <HTMLOptionElement>document.createElement("option");
    option.text = test.name;
    select.add(option);
}

//handle the choice
select.onchange = (ev: Event) => {
    let opt: string = (<HTMLSelectElement>ev.srcElement).value;
    h.innerText = opt;

    let points: Vec2[] = [];
    let testcase = testcases.find(test => test.name === opt);

    testcase.data.forEach(p => { points.push(p.over(2).plus(new Vec2(350, 200))); });

    paper.clear();
    paper.points(points, 3, 'red');

    const triangle = minABC(points, 10 ** -5, 0.1);
    if(triangle !== null) {
        let {A, B, C} = triangle;
        paper.lines([new Vec2(A.x, A.y), new Vec2(B.x, B.y), new Vec2(C.x, C.y), new Vec2(A.x, A.y)], 'blue');
    }
};


