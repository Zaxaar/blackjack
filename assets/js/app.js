(function() {
  var app = angular.module('appBlackJack', ['ngRoute']);
  var gamePlay = false;

  app.config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'assets/views/start-screen.html',
      })
      .when('/game', {
        templateUrl: 'assets/views/game.html',
        resolve: {
          "check": ($location) => gamePlay ? $location.path('/game') : $location.path('/')
        }
      })
      .when('/end', {
        templateUrl: 'assets/views/end-screen.html',
      })
  });

  app.controller('mainController', function($scope, $http, $location) {
    $scope.cards;
    $scope.deck = [];
    $scope.players = [];
    $scope.playersSetup = [{
        finalScore: 0,
        points: 0,
        cards: [],
        name: 'Player One'
      },
      {
        finalScore: 0,
        points: 0,
        cards: [],
        name: 'Player Two'
      },
    ]
    $scope.cash = [0, 0];
    $scope.activePlayer = 0;
    $scope.gameOn = false;
    $scope.computerPlayer = false;
    $scope.winner = null;

    $http({
      method: 'GET',
      url: './assets/cards.json'
    }).then(function(success) {
      $scope.cards = success.data.cards;
    }, function(error) {
      console.log("oops... cards.json", error)
    })

    $scope.playGame = function() {
      if ($scope.cash[0] > 0 && $scope.cash[1] > 0) {
        Object.assign($scope.deck, $scope.cards);
        angular.copy($scope.playersSetup, $scope.players);

        gamePlay = true;
        $scope.gameOn = true;
        $scope.shuffleDeck();
        $scope.activePlayer = 0;
        $location.path('/game');
      }
    }

    $scope.restartGame = function(player) {
      player === 'computer' ? $scope.computerPlayer = true : $scope.computerPlayer = false;
      $scope.cash = [100, 100];
      $scope.playGame();
    }

    $scope.endGame = function() {
      gameOn = false;
      $scope.gameOn = false;
      $location.path('/end');
    }

    $scope.backHome = function() {
      $scope.winner = null;
      $location.path('/');
    }

    $scope.shuffleDeck = function() {
      for (var i = $scope.deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = $scope.deck[i];
        $scope.deck[i] = $scope.deck[j];
        $scope.deck[j] = temp;
      }
      $scope.hit(0);
      $scope.hit(1);
      $scope.hit(0);
      $scope.hit(1);
      return $scope.deck;
    }

    $scope.hit = function(playerIndex) {
      let player = $scope.players[playerIndex];

      if ($scope.deck.length && player.points < 21) {
        let currentCard = $scope.deck.shift();
        player.cards.push(currentCard);

        if (currentCard.value === 'ace') {
          player.points <= 10 ? player.points += 11 : player.points++;
        } else {
          player.points += currentCard.value
        };

        if (player.points >= 21 && player.cards.length > 2) {
          player.finalScore = player.points;
          $scope.hold();
        } else {
          player.finalScore = player.points;
        }
      }
    }

    $scope.hold = function() {
      if ($scope.gameOn) {
        if ($scope.activePlayer === 0) {
          $scope.computerPlayer ? $scope.computerMove() : $scope.activePlayer = 1;
        } else if ($scope.activePlayer === 1) {
          $scope.checkWinner();
        }
      }
    }

    $scope.checkWinner = function() {
      let playerOne = $scope.players[0].finalScore;
      let playerTwo = $scope.players[1].finalScore;

      if (playerOne > 21 && playerTwo > 21 || playerOne === playerTwo) {
        $scope.winner = 'Draw';
      } else if (playerOne > playerTwo && playerOne <= 21 || playerOne < playerTwo && playerTwo > 21) {
        $scope.cash[0] += 10;
        $scope.cash[1] -= 10;
        $scope.winner = 0;
      } else {
        $scope.cash[0] -= 10;
        $scope.cash[1] += 10;
        $scope.winner = 1;
      };

      if ($scope.cash[0] <= 0) {
        $scope.winner = 1;
        $scope.endGame();
      } else if ($scope.cash[1] <= 0) {
        $scope.winner = 0;
        $scope.endGame();
      }
      $scope.gameOn = false;
    }

    $scope.markActivePlayer = (playerIndex) => $scope.activePlayer === playerIndex ? 'active-player' : null;

    $scope.computerMove = function() {
      $scope.activePlayer = 1;
      let computer = $scope.players[1];
      let playerOne = $scope.players[0];

      if (playerOne.finalScore <= 21 && computer.finalScore < playerOne.finalScore) {
        $scope.hit(1);
        $scope.computerMove();
      } else {
        $scope.hold();
      }
    }

  })
}())
