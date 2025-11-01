var blueprintModule = (function () {
  var canvas = null;
  var ctx = null;
  var currentBlueprint = null;

  function init(canvasSelector) {
    canvas = typeof canvasSelector === "string" ? document.querySelector(canvasSelector) : canvasSelector;
    if (!canvas) {
      console.error("No se encontró el canvas:", canvasSelector);
      return;
    }

    ctx = canvas.getContext("2d");

    // Only use pointerdown to avoid double event firing
    canvas.addEventListener("pointerdown", onPointerDown);
    console.log("Canvas inicializado con eventos.");
  }

  function onPointerDown(evt) {
    if (!currentBlueprint) return;
    evt.preventDefault();
    var pt = getCanvasCoords(evt);
    addPoint(pt.x, pt.y);
  }

  function getCanvasCoords(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.round((evt.clientX - rect.left) * (canvas.width / rect.width));
    var y = Math.round((evt.clientY - rect.top) * (canvas.height / rect.height));
    return { x: Math.min(Math.max(0, x), canvas.width), y: Math.min(Math.max(0, y), canvas.height) };
  }

  var onPointAdded = null;

  function addPoint(x, y) {
    if (!currentBlueprint) return;

    currentBlueprint.points.push({x, y});
    repaint();

    if (onPointAdded) onPointAdded(currentBlueprint.name, currentBlueprint.points.length);

    // enviar al WS
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            author: currentBlueprint.author,
            blueprintName: currentBlueprint.name,
            x: x,
            y: y
        }));
    }
  }

  function setOnPointAddedCallback(callback) {
    onPointAdded = callback;
  }

  function setCurrentBlueprint(bp) {
    currentBlueprint = bp
      ? { author: bp.author, name: bp.name, points: (bp.points || []).slice() }
      : null;
    repaint();
    $("#saveButton").prop("disabled", !currentBlueprint);
    $("#deleteButton").prop("disabled", !currentBlueprint);
  }

  function getCurrentBlueprint() {
    return currentBlueprint;
  }

  function clearCurrentBlueprint() {
    currentBlueprint = null;
    clearCanvas();
  }

  function clearCanvas() {
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function repaint() {
    clearCanvas();
    if (!ctx || !currentBlueprint || !currentBlueprint.points.length) return;

    ctx.beginPath();
    var pts = currentBlueprint.points;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  return {
    init,
    setCurrentBlueprint,
    getCurrentBlueprint,
    clearCurrentBlueprint,
    addPoint,
    repaint,
    setOnPointAddedCallback
  };
})();
