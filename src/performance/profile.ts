import { Vec2 } from '../geometry/Vec2';
import { minTriangle } from '../minimalPerimeterTriangle';
import { testcases } from '../data';

import { fs } from '../node';

const i = parseInt(process.argv[2], 10);
minTriangle(testcases[i].data, 10 ** -5, 0.1);

