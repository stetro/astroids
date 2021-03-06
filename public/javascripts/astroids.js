/**
 * Astroids Module
 *
 * Astroids Game with websockets
 */
var AstroidsModule = angular.module('AstroidsModule', ['btford.socket-io']);

AstroidsModule.controller('AstroidsController', function($scope, socket) {
	var canvas = document.getElementById('astroids');
	canvas.width = $("#astroids").css("width").substr(0, $("#astroids").css("width").length - 2);
	canvas.height = canvas.width * (9 / 16);
	var context = canvas.getContext('2d');

	$scope.otherPlayer = [];
	angular.extend($scope, {
		player: {
			acceleration: 0.3,
			speed: false,
			dx: 0.0,
			dy: 0.0,
			rotation: 0.0,
			direction: 0.0,
			x: canvas.width / 2,
			y: canvas.height / 2,
			user: "",
			bullets: []
		},
		keys: {
			w: false,
			a: false,
			d: false,
			space: false
		}
	});

	socket.on('recieveShipData', function(data) {
		$scope.otherPlayer[data.name] = data;
	});
	socket.on('disconnectShipData', function(data) {
		delete $scope.otherPlayer[data];
	});
	$scope.$watch('player', function(newValue, oldValue) {
		socket.emit('collectShipData', newValue);
	}, true);

	$scope.$watch('keys', function(newValue, oldValue, scope) {
		if (newValue.space) {
			$scope.player.bullets.push({
				x: $scope.player.x,
				y: $scope.player.y,
				direction: $scope.player.rotation
			});
		}
	}, true);
	var gameLoop = function() {
		$scope.$apply(function() {
			shipControl();
			bulletControl();
			drawCanvas();
		});
	};
	var drawCanvas = function() {
		context.fillStyle = 'rgb(16, 16, 16)';
		context.strokeStyle = 'rgb(16, 16, 16)';
		context.fillRect(0, 0, canvas.width, canvas.height);
		drawOtherShips();
		drawBullets();
	};
	var drawBullets = function() {

	};
	var drawOtherShips = function() {
		for (name in $scope.otherPlayer) {
			var player = $scope.otherPlayer[name];
			context.save();
			context.translate(player.x, player.y);
			context.fillStyle = 'rgb(200,200,200)';
			context.strokeStyle = 'rgb(200,200,200)';
			context.fillText(player.user, 10, 10);
			context.rotate(player.rotation)
			context.beginPath();
			context.moveTo(0, -5);
			context.lineTo(-3, 5);
			context.lineTo(0, 3);
			context.lineTo(3, 5);
			context.closePath();
			context.stroke();
			context.restore();
			for (var i = 0; i < player.bullets.length; i++) {
				context.save();
				context.translate(player.bullets[i].x, player.bullets[i].y);
				context.fillStyle = 'rgb(200,200,200)';
				context.fillRect(0, 0, 1, 1);
				context.restore();
			};
		}
	};

	var bulletControl = function() {
		for (var i = $scope.player.bullets.length - 1; i >= 0; i--) {
			$scope.player.bullets[i].x = $scope.player.bullets[i].x + Math.sin($scope.player.bullets[i].direction) * 10;
			$scope.player.bullets[i].y = $scope.player.bullets[i].y - Math.cos($scope.player.bullets[i].direction) * 10;
			if ($scope.player.bullets[i].x > canvas.width || $scope.player.bullets[i].x < 0 || $scope.player.bullets[i].y > canvas.height || $scope.player.bullets[i].y < 0) {
				$scope.player.bullets.splice(i, 1);
				i--;
			}
		}
	};
	var shipControl = function() {
		if ($scope.keys.w) {
			$scope.player.dx = ($scope.player.dx + Math.sin($scope.player.rotation) * $scope.player.acceleration).max(10);
			$scope.player.dy = ($scope.player.dy + Math.cos($scope.player.rotation) * $scope.player.acceleration).max(10);
		}
		if ($scope.keys.a) {
			$scope.player.rotation = ($scope.player.rotation - 0.2).mod(6.28);
		}
		if ($scope.keys.d) {
			$scope.player.rotation = ($scope.player.rotation + 0.2).mod(6.28);
		}
		$scope.player.x = ($scope.player.x + $scope.player.dx).mod(canvas.width);
		$scope.player.y = ($scope.player.y - $scope.player.dy).mod(canvas.height);
	};
	var interval = setInterval(gameLoop, 1000 / 15);
});

AstroidsModule.directive('ngKeycontrol', function() {
	return function(scope, element, attrs) {
		element.bind('keydown', function(event) {
			scope.$apply(function() {
				switch (event.which) {
					case 87:
						scope.keys.w = true;
						break;
					case 65:
						scope.keys.a = true;
						break;
					case 68:
						scope.keys.d = true;
						break;
					case 32:
						scope.keys.space = true;
						event.preventDefault();
						break;
				}
			});
		});
		element.bind('keyup', function(event) {
			scope.$apply(function() {
				switch (event.which) {
					case 87:
						scope.keys.w = false;
						break;
					case 65:
						scope.keys.a = false;
						break;
					case 68:
						scope.keys.d = false;
						break;
					case 32:
						scope.keys.space = false;
						event.preventDefault();
						break;
				}
			});
		});
	};
});

Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
};
Number.prototype.max = function(n) {
	if (this > 0) {
		return (this > n) ? n : this;
	} else {
		return (this < (-1 * n)) ? (-1 * n) : this;
	}
};
Number.prototype.pos = function() {
	return (this <= 0) ? 0 : this;
};