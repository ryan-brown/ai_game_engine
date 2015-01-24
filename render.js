// Renderer for Canvas
// Takes the id for canvas element
var CanvasRender = function(canvasElementId) {
  // Functions
  var clearCanvas, renderNumbers, renderPlayers, renderGrid;

  // Grab canvas and context
  var canvas = document.getElementById(canvasElementId);
  var ctx = canvas.getContext("2d");

  // Clear screen
  clearCanvas = function() {
    canvas.width = canvas.width;
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Render Numbers given gameState
  renderNumbers = function(gameState) {
    var board = gameState.board;

    // Loop through every cell
    for(var i = 0; i < board.length; i++) {
      for(var j = 0; j < board.length; j++) {
        // If it's not empty...
        if(board[i][j] != 0) {
          // Grab cell
          var n = board[i][j];

          // Size of each cell
          var cellSize = canvas.width/board.length;

          // Paint cell below number
          ctx.fillStyle = "#FFFFAA";
          ctx.fillRect(i*cellSize, j*cellSize, cellSize, cellSize)

          // Set color of number
          if(n.color == 0) {
            ctx.fillStyle = "#FF0000";
          }
          else if(n.color == 1) {
            ctx.fillStyle = "#00FF00";
          }
          else if(n.color == 2) {
            ctx.fillStyle = "#0000FF";
          }
          // Set font size/type and draw
          ctx.font = (30+(15-board.length)*5)+"px Arial";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(n.value, (i+0.5)*cellSize, (j+0.5)*cellSize);
        }
      }
    }
  }

  // Render the players given the gameState
  renderPlayers = function(gameState) {
    // Grab players and cellsize
    var players = gameState.players;
    var cellSize = canvas.width/gameState.board.length;

    // Center of player
    var player1X = (1/3+players[0].x)*cellSize;
    var player1Y = (1/3+players[0].y)*cellSize;
    var player2X = (2/3+players[1].x)*cellSize;
    var player2Y = (2/3+players[1].y)*cellSize;

    // Draw P2 Circle
    ctx.beginPath();
    ctx.arc(player2X, player2Y, cellSize/3-3, 0, 2*Math.PI);
    ctx.fillStyle = '#C8BFE7';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.closePath();

    // Draw P2 text
    ctx.fillStyle = '#000000';
    ctx.font = (cellSize/3)+"px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("P2", player2X, player2Y);

    // Draw P1 Circle
    ctx.beginPath();
    ctx.arc(player1X, player1Y, cellSize/3-3, 0, 2*Math.PI);
    ctx.fillStyle = '#99D9EA';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.closePath();

    // Draw P1 text
    ctx.fillStyle = '#000000';
    ctx.font = (cellSize/3)+"px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("P1", player1X, player1Y);
  }

  // Render the grid given boardState
  renderGrid = function(boardState) {
    // Size of grid
    var boardSize = boardState.board.length;

    // Draw lines
    for(var i = 1; i < boardSize; i++) {
      var cellSize = canvas.width/boardSize;

      ctx.fillStyle = "#000000";
      
      // Vertical lines!
      ctx.beginPath();
      ctx.moveTo(i*cellSize,0);
      ctx.lineTo(i*cellSize, canvas.width);
      ctx.stroke();
      
      // Not vertical lines!
      ctx.beginPath();
      ctx.moveTo(0, i*cellSize);
      ctx.lineTo(canvas.width, i*cellSize);
      ctx.stroke();
    }
  }

  // Public render function given gameState
  this.render = function(gameState) {
    clearCanvas();
    renderNumbers(gameState);
    renderPlayers(gameState);
    renderGrid(gameState);
  }
}