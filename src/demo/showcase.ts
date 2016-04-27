import { Paper } from './drawing';

// required
import {Vec2} from '../geometry/Vec2';
import {Line} from '../geometry/Line';

// to showcase
import {minimalPerimeterTriangle as minABC} from '../minimalPerimeterTriangleDemo';

// on different data
import {correctness} from './data_correctness';
import {sample} from './data_sample';

let canvas = <HTMLCanvasElement> document.getElementById('paper'),
    paper: Paper = new Paper( canvas.getContext('2d') );

function buildSelect(select: HTMLSelectElement, h: HTMLHeadingElement, data: Vec2[]) {
    for (let key in data) {
        if ( data.hasOwnProperty(key) ) {
            let option = <HTMLOptionElement> document.createElement("option");
            option.text = key;
            select.add(option);
        }
    }

    select.onchange = (ev: Event)=> {
        let opt: string = (<HTMLSelectElement>ev.srcElement).value;
        h.innerText = opt;

        let points: Vec2[] = [];
        //data[opt].forEach( (p: Vec2)=> { points.push( p.over(3).plus(new Vec2(300,150)) ); });
        data[opt].forEach( (p: Vec2)=> { points.push( p.over(2).plus(new Vec2(350,200)) ); });
        paper.clear();
        paper.points( points, 3, 'red' );

        let stopIter = <HTMLInputElement> document.getElementById('stopIter');
        minABC(points, paper, parseInt(stopIter.value, 10));
    };
}

export function main(): void {
    let select_sample = <HTMLSelectElement> document.getElementById('sample'),
        select_correctness = <HTMLSelectElement> document.getElementById('correctness'),
        dataCase = <HTMLHeadingElement> document.getElementById('case');

    // build options
    buildSelect(select_sample, dataCase, sample);
    buildSelect(select_correctness, dataCase, correctness);

    // draw default option
    //addressCase(0, paper);

    /*select.onchange = (ev: Event)=> {
        let n: number = parseInt( (<HTMLSelectElement>ev.srcElement).value, 10 );
        addressCase(n, paper);
    };*/


}
