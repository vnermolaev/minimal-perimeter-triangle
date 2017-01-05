import { Vec2 } from "../../Geometry";

export class Paper {
    private ctx: CanvasRenderingContext2D;

    constructor (ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.clear();
    }

    /** Draw (a number of) straight line segments. */
    lines(points: Vec2[], color: string = "black") {
        if (points.length === 0) {
            return;
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineCap = 'round';
        let p = points[0];
        for (let i = 1; i < points.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            p = points[i];
            this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
        }
    }

    circle(o: Vec2, r: number, color: string = "black") {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(o.x, o.y, r, 0, 2*Math.PI);
        this.ctx.stroke();
    }

    /** Clear the canvas. */
    clear() {
        let width: number = this.ctx.canvas.width,
            height: number = this.ctx.canvas.height;
        this.ctx.clearRect(0, 0, width, height);
    }


    /** Draw square points */
    // height must be odd in order to form a symmetric square around a given pixel position
    // otherwise it will be clipped down to a closest odd number
    points( pts: Vec2[], height: number = 1, color: string = 'black') {
        let h: number = height % 2 === 0 ? height/2 - 1 : (height - 1)/2;
        this.ctx.save();
        this.ctx.fillStyle = color;
        pts.forEach( (p: Vec2)=> {
            this.ctx.fillRect(p.x-h, p.y-h, 2*h+1, 2*h+1);
        });
        this.ctx.restore();
    }
}
