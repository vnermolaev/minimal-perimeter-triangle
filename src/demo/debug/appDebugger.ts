import { Vec2, Line } from '../../Geometry';
import { Wedge } from '../../inscribe/Inscribe';

const left_arm = new Line(new Vec2(1, 0), new Vec2(2, 0)),
    right_arm = new Line(new Vec2(2, -2), new Vec2(1, -1));
let w = Wedge.new(left_arm, right_arm, 0) !;


