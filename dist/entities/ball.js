var Ball = /** @class */ (function () {
    function Ball(x, y, world, color) {
        if (color === void 0) { color = "#FFFFFF"; }
        this.radius = 10;
        this.dx = 0;
        this.dy = 0;
        this.mass = 1;
        this.isPocketed = false;
        this.x = x;
        this.y = y;
        this.color = color;
        this.canvas = world.canvas;
        this.table = world.table;
    }
    Ball.prototype.draw = function () {
        if (this.isPocketed)
            return;
        var ctx = this.canvas.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    };
    Ball.prototype.update = function () {
        if (this.isPocketed)
            return;
        this.x += this.dx;
        this.y += this.dy;
        // Apply friction
        this.dx *= 0.98;
        this.dy *= 0.98;
        // Stop the ball if it is moving very slowly
        if (Math.abs(this.dx) < 0.01)
            this.dx = 0;
        if (Math.abs(this.dy) < 0.01)
            this.dy = 0;
        // Table boundaries collision detection
        if (this.x + this.radius > this.canvas.width - this.table.padding ||
            this.x - this.radius < this.table.padding) {
            this.dx = -this.dx;
            // Adjust position to prevent sticking
            if (this.x + this.radius > this.canvas.width - this.table.padding)
                this.x = this.canvas.width - this.table.padding - this.radius;
            if (this.x - this.radius < this.table.padding)
                this.x = this.table.padding + this.radius;
        }
        if (this.y + this.radius > this.canvas.height - this.table.padding ||
            this.y - this.radius < this.table.padding) {
            this.dy = -this.dy;
            // Adjust position to prevent sticking
            if (this.y + this.radius > this.canvas.height - this.table.padding)
                this.y = this.canvas.height - this.table.padding - this.radius;
            if (this.y - this.radius < this.table.padding)
                this.y = this.table.padding + this.radius;
        }
        this.draw();
    };
    return Ball;
}());
export default Ball;
