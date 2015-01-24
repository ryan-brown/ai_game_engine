// Game Engine
var GameEngine = function() {
  // Associative array of users to their bots
  var userFunctions = {};

  // Declare all functions
  var clone, setBotFunc, update, isGameOver, runGame,
      generateNumbers, generateBoard, generateGameState;

  // Deep copy of a JSON object
  clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Function called by bots to register their callback
  setBotFunc = function(name, func) {
    userFunctions[name] = func;
    console.log("Registered "+name);
  }

  // Update the gamestate based on a players move
  update = function(gameState, move) {
    // Get current player
    var player = gameState.players[gameState.turn];

    // If they are trying to move and can, move them!
    if(move == "UP" && player.y > 0) player.y--;
    else if(move == "RIGHT" && player.x < gameState.board.length-1) player.x++;
    else if(move == "DOWN" && player.y < gameState.board.length-1) player.y++;
    else if(move == "LEFT" && player.x > 0) player.x--;
    else if(move == "EAT") { // If they are tying to eat
      // Get tile they are on
      var tile = gameState.board[player.x][player.y];

      // If it's not empty...
      if(tile != 0) {
        // Increase score
        player.score += tile.value;
        // Give bonus if necessary/reset combo
        if(player.comboColor == tile.color) {
          player.comboCount += 1;
          player.score += player.comboCount-1;
        }
        else {
          player.comboColor = tile.color;
          player.comboCount = 1;
        }

        // Clear tile
        gameState.board[player.x][player.y] = 0;
      }
    }

    return gameState;
  }

  // Returns true if there are no more numbers on the board
  isGameOver = function(board) {
    for(var i = 0; i < board.length; i++) {
      for(var j = 0; j < board.length; j++) {
        if(board[i][j] != 0) return false;
      }
    }

    return true;
  }

  // Runs a game given 2 bots in an array and a gameState
  // bots[0] is player 1, and bots[1] is player 2
  // Returns results of the game
  runGame = function(bots, gameState) {
    // Results to put in DB (TODO)
    var results = {};

    // Game loop
    while(!isGameOver(gameState.board)) {
      // Give the bot the game state and get their move
      var move = bots[gameState.turn](clone(gameState));

      // Update the gameState
      update(gameState, move);

      // Swap turns
      gameState.turn = (gameState.turn+1)%2;
    }

    // Add data to results (TODO)
    results.player1Score = gameState.players[0].score;
    results.player2Score = gameState.players[1].score;

    return results;
  }

  // Add "num" numbers of value "value" to the given board
  generateNumbers = function(board, num, value) {
    var i = 0;
    while(i < num) {
      // Random spawn/color
      var x = Math.floor(Math.random()*board.length);
      var y = Math.floor(Math.random()*board.length);
      var color = Math.floor(Math.random()*3);

      if(board[x][y] == 0) {
        board[x][y] = {value:value, color:color};
        i++;
      }
    }

    return board;
  }

  // Generate a random board given size(width/height)
  generateBoard = function(boardSize) {
    // Fill boardSize x boardSize Array with 0s
    var board = new Array(boardSize);
    for(var i = 0; i < boardSize; i++) {
      board[i] = new Array(boardSize);
      for(var j = 0; j < boardSize; j++) {
        board[i][j] = 0;
      }
    }

    // Calculate number of 1s, 2s, and 3s to generate
    var fruitNum = boardSize*(Math.random()+1.5);
    var ones = Math.round(fruitNum*0.5454 + Math.random()*3-1.5);
    var twos = Math.round(fruitNum*0.2727 + Math.random()*2-1);
    var threes = Math.round(fruitNum*0.1818 + Math.random()-0.5);

    // Add 1s, 2s, and 3s to the board!
    generateNumbers(board, ones, 1);
    generateNumbers(board, twos, 2);
    generateNumbers(board, threes, 3);

    // Return this bad boy
    return board;
  }

  // Generate game data object
  this.generateGameState = function() {
    // Initializeeee
    var gameState = {};

    // Random board size from 5-15
    var boardSize = Math.floor(Math.random()*11)+5;

    // Generate the board
    gameState.board = generateBoard(boardSize);

    // Set turn to player 1
    gameState.turn = 0;

    // Starting coordinates for players
    var startX = Math.floor(Math.random()*boardSize);
    var startY = Math.floor(Math.random()*boardSize);

    // Are they spawning on a number? New spawn!
    while(gameState.board[startX][startY] != 0) {
      startX = Math.floor(Math.random()*boardSize);
      startY = Math.floor(Math.random()*boardSize);
    }

    // Add player objects
    gameState.players = new Array();
    gameState.players[0] = {x:startX , y:startY, score:0, comboColor:-1, comboCount:0};
    gameState.players[1] = {x:startX , y:startY, score:0, comboColor:-1, comboCount:0};

    return gameState;
  }

  // Public function to start a 2 game match between player1 and player2
  this.startMatch = function(player1, player2) {
    // Generate a random board to play on
    var gameState = generateGameState();

    // Game one results
    var game1 = runGame([userFunctions[player1], userFunctions[player2]],
                        clone(gameState));

    // Game two results (swap who goes first!)
    var game2 = runGame([userFunctions[player2], userFunctions[player1]],
                        clone(gameState));

    // Log dat shit (Add to Database - TODO)
    console.log(game1);
    console.log(game2);
  }

  this.evalPlayerCode = function(code) {
    var prefix = "(function() {";
    var suffix = "})();";

    eval(prefix + code + suffix);
  }
}