import {Vec2} from '../geometry/Vec2';
import {minTriangle as minABC} from '../minimalPerimeterTriangle';
import { testcases } from '../data';

import {fs} from '../node';

export function main(): void {

    const i0 = 3;
    let i = i0;
    let file = fs.createWriteStream('log.txt', { 'flags': 'a' });

    for (let testcase of testcases) {
        let log = `${testcase.name}`;
        const start = new Date();
        minABC(testcase.data, 10**-2);
        const end = new Date();
        log += ` => ${end.getTime() - start.getTime()} <=`;
        console.log(log);
        file.write(`${testcase.name} ${i} ${end.getTime() - start.getTime()}\n`);
        i++;
    }

    file.end();
}

main();
