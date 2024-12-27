export function applyRectanglesBackground(network) {
    network.on("beforeDrawing", function (ctx) {

        var width = ctx.canvas.clientWidth;
        var height = ctx.canvas.clientHeight;
        var spacing = 20;
        var gridExtentFactor = 4;
        ctx.strokeStyle = "lightgrey";

        // draw grid
        ctx.beginPath();
        for (var x = -width * gridExtentFactor; x <= width * gridExtentFactor; x += spacing) {
            ctx.moveTo(x, height * gridExtentFactor);
            ctx.lineTo(x, -height * gridExtentFactor);
        }
        for (var y = -height * gridExtentFactor; y <= height * gridExtentFactor; y += spacing) {
            ctx.moveTo(width * gridExtentFactor, y);
            ctx.lineTo(-width * gridExtentFactor, y);
        }
        ctx.stroke();

    });
}

export function applyPointsBackground(network) {
    network.on("beforeDrawing", function (ctx) {
        var width = ctx.canvas.clientWidth;
        var height = ctx.canvas.clientHeight;
        var spacing = 20;
        var gridExtentFactor = 4;
        ctx.fillStyle = "lightgrey";

        // Dessiner une grille de points
        for (var x = -width * gridExtentFactor; x <= width * gridExtentFactor; x += spacing) {
            for (var y = -height * gridExtentFactor; y <= height * gridExtentFactor; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 1.25, 0, 2 * Math.PI); // Dessiner un petit point (rayon 1.25)
                ctx.fill();
            }
        }
    });
}