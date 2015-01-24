// Game Engine
var Engine = function() {
	// Associative array of users to their bots
	var userFunctions = {};

	// Declare all functions
	var setBotFunc, update, isGameOver, runGame, generateNumbers, generateBoard, generateGameState;

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
		if(move == 0 && player.y > 0) player.y--;
		else if(move == 1 && player.x < gameState.boardSize-1) player.x++;
		else if(move == 2 && player.y < gameState.boardSize-1) player.y++;
		else if(move == 3 && player.x > 0) player.x--;
		else if(move == 4) { // If they are tying to eat
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
		while(true) {
			// Give the bot the game state and get their move
			var move = bots[gameState.turn](JSON.parse(JSON.stringify(gameState)));

			// Update the gameState
			update(gameState, move);

			// Swap turns
			gameState.turn = (gameState.turn+1)%2;

			// Stop loop if game is over
			if(isGameOver(gameState.board)) break;
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
		generateNumbers(board, boardSize, ones, 1);
		generateNumbers(board, boardSize, twos, 2);
		generateNumbers(board, boardSize, threes, 3);

		// Return this bad boy
		return board;
	}

	// Generate game data object
	generateGameState = function() {
		// Initializeeee
		var gameState = {};

		// Random board size from 5-15
		gameState.boardSize = Math.floor(Math.random()*11)+5;

		// Generate the board
		gameState.board = generateBoard(gameState.boardSize);

		// Set turn to player 1
		gameState.turn = 0;

		// Starting coordinates for players
		var startX = Math.floor(Math.random()*gameState.boardSize);
		var startY = Math.floor(Math.random()*gameState.boardSize);

		// Are they spawning on a number? New spawn!
		while(gameState.board[startX][startY] != 0) {
			startX = Math.floor(Math.random()*gameState.boardSize);
			startY = Math.floor(Math.random()*gameState.boardSize);
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
						JSON.parse(JSON.stringify(gameState)));

		// Game two results (swap who goes first!)
		var game2 = runGame([userFunctions[player2], userFunctions[player1]],
						JSON.parse(JSON.stringify(gameState)));

		// Log dat shit (Add to Database - TODO)
		console.log(game1);
		console.log(game2);
	}

	// Public function to initialize the bots and grab code from Database
	this.init = function() {
		// Array of users code
		var usersCode = [];

		// Get code from DB!!

		// Ok, examples hard coded in until databases

		// Bot named Near that goes to closest number
		usersCode[0] = "var makeMove = function(gameData) {\
							var me = gameData.players[gameData.turn];\
							var him = gameData.players[(gameData.turn+1)%2];\
							if(gameData.board[me.x][me.y] != 0) return 4;\
							var closest = -1;\
							for(var i = 0; i < gameData.board.length; i++) {\
								for(var j = 0; j < gameData.board.length; j++) {\
									if(gameData.board[i][j] != 0) {\
										var d = Math.abs(me.x-i) + Math.abs(me.y-j);\
										if(closest == -1 || d < closest.dist) {\
											closest = {x:i, y:j, dist:d};\
										}\
									}\
								}\
							}\
							if(closest.y < me.y) return 0;\
							if(closest.x > me.x) return 1;\
							if(closest.y > me.y) return 2;\
							if(closest.x < me.x) return 3;\
							return 4;\
						};\
						setBotFunc('Near', makeMove);";

		// Bot named BigNum that goes to the nearest high number
		usersCode[1] = "var makeMove = function(gameData) {\
							var me = gameData.players[gameData.turn];\
							var him = gameData.players[(gameData.turn+1)%2];\
							var board = gameData.board;\
							var closest = -1;\
							for(var i = 0; i < board.length; i++) {\
								for(var j = 0; j < board.length; j++) {\
									var tile = board[i][j];\
									if(tile != 0) {\
										var d = Math.abs(me.x-i) + Math.abs(me.y-j);\
										if(	closest == -1 ||\
											tile.value > closest.value ||\
											(tile.value == closest.value && tile.dist < closest.dist)) {\
											closest = {x:i, y:j, dist:d, value:board[i][j].value};\
										}\
									}\
								}\
							}\
							if(closest.y < me.y) return 0;\
							if(closest.x > me.x) return 1;\
							if(closest.y > me.y) return 2;\
							if(closest.x < me.x) return 3;\
							return 4;\
						};\
						setBotFunc('BigNum', makeMove);";

		// Bots that always move left, just to show how we can load any number of bots
		usersCode[2] = "var foo = function (gameState) { return 3; }; setBotFunc('Foo', foo);";
		usersCode[3] = "var bar = function (gameState) { return 3; }; setBotFunc('Bar', bar);";
		usersCode[4] = "var foobar = function (gameState) { return 3; }; setBotFunc('FooBar', foobar);";

		// Prefix and suffix to fix scoping issues with eval
		var prefix = "(function() {";
		var suffix = "})();";

		// Register all bots!
		for(var i = 0; i < usersCode.length; i++) {
			eval(prefix+usersCode[i]+suffix);
		}
	}

}

// Initialize an engine and play match between Near and BigNum
var engine = new Engine();
engine.init();
engine.startMatch('Near', 'BigNum');