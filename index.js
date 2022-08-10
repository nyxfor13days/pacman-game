// Creating Canvas, score, win screen and game over screen
const canvas = document.querySelector('canvas');
const scoreEl = document.querySelector('#scoreEl');
const totalScoreEl = document.querySelector('#totalScoreEl');
const winScreenEl = document.querySelector('#winScreenEl');
const gameOverScreenEl = document.querySelector('#gameOverScreenEl');

// Canvas Context
const context = canvas.getContext('2d');

// Canvas Size
canvas.width = 720;
canvas.height = 720;

// Creating Boundary Class
class Boundary {
	static width = 40;
	static height = 40;

	constructor({ position, image }) {
		this.position = position;
		this.width = 40;
		this.height = 40;
		this.image = image;
	}

	draw() {
		context.drawImage(this.image, this.position.x, this.position.y);
	}
}

// Creating Player Class
class Player {
	constructor({ position, velocity }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = 15;
		this.radians = 0.75;
		this.openRate = 0.05;
		this.rotation = 0;
	}

	draw() {
		context.save();
		context.translate(this.position.x, this.position.y);
		context.rotate(this.rotation);
		context.translate(-this.position.x, -this.position.y);
		context.fillStyle = '#eab308';
		context.beginPath();
		context.arc(
			this.position.x,
			this.position.y,
			this.radius,
			this.radians,
			Math.PI * 2 - this.radians
		);
		context.lineTo(this.position.x, this.position.y);
		context.fill();
		context.closePath();
		context.restore();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		if (this.radians < 0 || this.radians > 0.75)
			this.openRate = -this.openRate;
		this.radians += this.openRate;
	}
}

// Create Ghost Class
class Ghost {
	static speed = 2;

	constructor({ position, velocity, color = '#dc2626' }) {
		this.position = position;
		this.velocity = velocity;
		this.color = color;
		this.radius = 15;
		this.prevCollisions = [];
		this.speed = 2;
		this.vulnerable = false;
	}

	draw() {
		context.fillStyle = this.vulnerable ? 'white' : this.color;
		context.beginPath();
		context.arc(
			this.position.x,
			this.position.y,
			this.radius,
			0,
			Math.PI * 2
		);
		context.fill();
		context.closePath();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

// Create Pellets Class
class Pellet {
	constructor({ position }) {
		this.position = position;
		this.radius = 3;
	}

	draw() {
		context.fillStyle = '#737373';
		context.beginPath();
		context.arc(
			this.position.x,
			this.position.y,
			this.radius,
			0,
			Math.PI * 2
		);
		context.fill();
		context.closePath();
	}
}

// Create Power Up Class
class PowerUp {
	constructor({ position }) {
		this.position = position;
		this.radius = 8;
	}

	draw() {
		context.fillStyle = '#fafafa';
		context.beginPath();
		context.arc(
			this.position.x,
			this.position.y,
			this.radius,
			0,
			Math.PI * 2
		);
		context.fill();
		context.closePath();
	}
}

// Creating Instances
const pellets = [];
const powerUps = [];
const boundaries = [];

// Win Screen
const winScreen = (win) => {
	if (win) {
		winScreenEl.classList.remove('invisible');
		totalScoreEl.innerHTML = scoreEl.innerHTML;
	}
};

// Game Over Screen
const gameOverScreen = (gameOver) => {
	if (gameOver) {
		gameOverScreenEl.classList.remove('invisible');
		totalScoreEl.innerHTML = scoreEl.innerHTML;
	}
};

// Create Ghosts
const ghosts = [
	new Ghost({
		position: {
			x: Boundary.width * 6 + Boundary.width / 2,
			y: Boundary.height + Boundary.height / 2,
		},
		velocity: { x: Ghost.speed, y: 0 },
	}),

	new Ghost({
		position: {
			x: Boundary.width * 6 + Boundary.width / 2,
			y: Boundary.height * 3 + Boundary.height / 2,
		},
		velocity: { x: Ghost.speed, y: 0 },
		color: '#22c55e',
	}),

	new Ghost({
		position: {
			x: Boundary.width * 6 + Boundary.width / 2,
			y: Boundary.height + Boundary.height / 2,
		},
		velocity: { x: Ghost.speed, y: 0 },
		color: '#a855f7',
	}),
];

// Create Player
const player = new Player({
	position: {
		x: Boundary.width + Boundary.width / 2,
		y: Boundary.height + Boundary.height / 2,
	},
	velocity: { x: 0, y: 0 },
});

// Create Keys for Control
const keys = {
	w: { pressed: false },
	a: { pressed: false },
	s: { pressed: false },
	d: { pressed: false },
};

let lastKey = '';
let score = 0;

// Creating Map Layout
// const map = [
// 	['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
// 	['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
// 	['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
// 	['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
// 	['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
// 	['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
// 	['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
// 	['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
// 	['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
// 	['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
// 	['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
// 	['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
// 	['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
// ];

const map = [
	['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
	['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', 'b', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', 'b', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', 'p', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', 'b', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', 'b', '.', '|'],
	['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
];

// Create Image for Boundaries
const createImage = (src) => {
	const image = new Image();
	image.src = src;
	return image;
};

// Draw out the map
map.forEach((row, rowIndex) => {
	row.forEach((symbol, symbolIndex) => {
		switch (symbol) {
			case '-':
				boundaries.push(
					new Boundary({
						position: {
							x: Boundary.width * symbolIndex,
							y: Boundary.height * rowIndex,
						},
						image: createImage('./assets/pipeHorizontal.png'),
					})
				);
				break;

			case '|':
				boundaries.push(
					new Boundary({
						position: {
							x: Boundary.width * symbolIndex,
							y: Boundary.height * rowIndex,
						},
						image: createImage('./assets/pipeVertical.png'),
					})
				);
				break;

			case '1':
				boundaries.push(
					new Boundary({
						position: {
							x: Boundary.width * symbolIndex,
							y: Boundary.height * rowIndex,
						},
						image: createImage('./assets/pipeCorner1.png'),
					})
				);
				break;

			case '2':
				boundaries.push(
					new Boundary({
						position: {
							x: Boundary.width * symbolIndex,
							y: Boundary.height * rowIndex,
						},
						image: createImage('./assets/pipeCorner2.png'),
					})
				);
				break;

			case '3':
				boundaries.push(
					new Boundary({
						position: {
							x: Boundary.width * symbolIndex,
							y: Boundary.height * rowIndex,
						},
						image: createImage('./assets/pipeCorner3.png'),
					})
				);
				break;

			case '4':
				boundaries.push(
					new Boundary({
						position: {
							x: Boundary.width * symbolIndex,
							y: Boundary.height * rowIndex,
						},
						image: createImage('./assets/pipeCorner4.png'),
					})
				);
				break;

			case 'b':
				boundaries.push(
					new Boundary({
						position: {
							x: Boundary.width * symbolIndex,
							y: Boundary.height * rowIndex,
						},
						image: createImage('./assets/block.png'),
					})
				);
				break;

			case '[':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						image: createImage('./assets/capLeft.png'),
					})
				);
				break;

			case ']':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						image: createImage('./assets/capRight.png'),
					})
				);
				break;

			case '_':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						image: createImage('./assets/capBottom.png'),
					})
				);
				break;

			case '^':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						image: createImage('./assets/capTop.png'),
					})
				);
				break;

			case '+':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						image: createImage('./assets/pipeCross.png'),
					})
				);
				break;

			case '5':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						color: '#1e40af',
						image: createImage('./assets/pipeConnectorTop.png'),
					})
				);
				break;

			case '6':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						color: '#1e40af',
						image: createImage('./assets/pipeConnectorRight.png'),
					})
				);
				break;

			case '7':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						color: '#1e40af',
						image: createImage('./assets/pipeConnectorBottom.png'),
					})
				);
				break;

			case '8':
				boundaries.push(
					new Boundary({
						position: {
							x: symbolIndex * Boundary.width,
							y: rowIndex * Boundary.height,
						},
						image: createImage('./assets/pipeConnectorLeft.png'),
					})
				);
				break;

			case '.':
				pellets.push(
					new Pellet({
						position: {
							x:
								symbolIndex * Boundary.width +
								Boundary.width / 2,
							y: rowIndex * Boundary.height + Boundary.height / 2,
						},
					})
				);
				break;

			case 'p':
				powerUps.push(
					new PowerUp({
						position: {
							x:
								symbolIndex * Boundary.width +
								Boundary.width / 2,
							y: rowIndex * Boundary.height + Boundary.height / 2,
						},
					})
				);
				break;
		}
	});
});

// Check Collision
const circleCollision = ({ circle, rectangle }) => {
	const padding = Boundary.width / 2 - circle.radius - 1;

	return (
		circle.position.y - circle.radius + circle.velocity.y <=
			rectangle.position.y + rectangle.height + padding &&
		circle.position.x + circle.radius + circle.velocity.x >=
			rectangle.position.x - padding &&
		circle.position.y + circle.radius + circle.velocity.y >=
			rectangle.position.y - padding &&
		circle.position.x - circle.radius + circle.velocity.x <=
			rectangle.position.x + rectangle.width + padding
	);
};

// Creating infinite loop to update the game
let animationId;
const animate = () => {
	animationId = requestAnimationFrame(animate);
	context.clearRect(0, 0, innerWidth, innerHeight);

	// Movement of the player
	if (keys.w.pressed && lastKey === 'w') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				circleCollision({
					circle: { ...player, velocity: { x: 0, y: -5 } },
					rectangle: boundary,
				})
			) {
				player.velocity.y = 0;
				break;
			} else {
				player.velocity.y = -5;
			}
		}
	} else if (keys.s.pressed && lastKey === 's') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				circleCollision({
					circle: { ...player, velocity: { x: 0, y: 5 } },
					rectangle: boundary,
				})
			) {
				player.velocity.y = 0;
				break;
			} else {
				player.velocity.y = 5;
			}
		}
	} else if (keys.a.pressed && lastKey === 'a') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				circleCollision({
					circle: { ...player, velocity: { x: -5, y: 0 } },
					rectangle: boundary,
				})
			) {
				player.velocity.x = 0;
				break;
			} else {
				player.velocity.x = -5;
			}
		}
	} else if (keys.d.pressed && lastKey === 'd') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				circleCollision({
					circle: { ...player, velocity: { x: 5, y: 0 } },
					rectangle: boundary,
				})
			) {
				player.velocity.x = 0;
				break;
			} else {
				player.velocity.x = 5;
			}
		}
	}

	// Collision with ghosts
	for (let i = ghosts.length - 1; 0 <= i; i--) {
		const ghost = ghosts[i];

		// Detect collision with ghosts
		if (
			Math.hypot(
				ghost.position.x - player.position.x,
				ghost.position.y - player.position.y
			) <
			player.radius + ghost.radius
		) {
			if (ghost.vulnerable) {
				ghosts.splice(i, 1);
			} else {
				cancelAnimationFrame(animationId);
				gameOverScreen(true);
			}
		}
	}

	// Draw Power Ups
	for (let i = powerUps.length - 1; 0 <= i; i--) {
		const powerUp = powerUps[i];
		powerUp.draw();

		// Power up collision with player
		if (
			Math.hypot(
				powerUp.position.x - player.position.x,
				powerUp.position.y - player.position.y
			) <
			player.radius + powerUp.radius
		) {
			powerUps.splice(powerUps.indexOf(powerUp), 1);
			score += 50;
			scoreEl.innerHTML = score;

			// Vulnerable ghost effect
			ghosts.forEach((ghost) => {
				ghost.vulnerable = true;

				setTimeout(() => {
					ghost.vulnerable = false;
				}, 3000);
			});
		}
	}

	// Draw Pallets
	for (let i = pellets.length - 1; 0 <= i; i--) {
		const pellet = pellets[i];
		pellet.draw();

		// Pallet collision with player
		if (
			Math.hypot(
				pellet.position.x - player.position.x,
				pellet.position.y - player.position.y
			) <
			player.radius + pellet.radius
		) {
			pellets.splice(pellets.indexOf(pellet), 1);
			score += 10;
			scoreEl.innerHTML = score;
		}
	}

	// Stay within boundary
	boundaries.forEach((boundary) => {
		boundary.draw();

		if (circleCollision({ circle: player, rectangle: boundary })) {
			player.velocity.x = 0;
			player.velocity.y = 0;
		}
	});
	player.update();

	// Movement of Ghosts
	ghosts.forEach((ghost) => {
		ghost.update();
		const collisions = [];

		// Collision detection with boudnaries
		boundaries.forEach((boundary) => {
			if (
				!collisions.includes('right') &&
				circleCollision({
					circle: { ...ghost, velocity: { x: ghost.speed, y: 0 } },
					rectangle: boundary,
				})
			) {
				collisions.push('right');
			}

			if (
				!collisions.includes('left') &&
				circleCollision({
					circle: { ...ghost, velocity: { x: -ghost.speed, y: 0 } },
					rectangle: boundary,
				})
			) {
				collisions.push('left');
			}

			if (
				!collisions.includes('up') &&
				circleCollision({
					circle: { ...ghost, velocity: { x: 0, y: -ghost.speed } },
					rectangle: boundary,
				})
			) {
				collisions.push('up');
			}

			if (
				!collisions.includes('down') &&
				circleCollision({
					circle: { ...ghost, velocity: { x: 0, y: ghost.speed } },
					rectangle: boundary,
				})
			) {
				collisions.push('down');
			}
		});

		if (collisions.length > ghost.prevCollisions.length)
			ghost.prevCollisions = collisions;

		if (
			JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)
		) {
			if (ghost.velocity.x > 0) ghost.prevCollisions.push('right');
			else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left');
			else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up');
			else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down');

			const pathways = ghost.prevCollisions.filter((collision) => {
				return !collisions.includes(collision);
			});

			const direction =
				pathways[Math.floor(Math.random() * pathways.length)];

			switch (direction) {
				case 'down':
					ghost.velocity.y = ghost.speed;
					ghost.velocity.x = 0;
					break;

				case 'up':
					ghost.velocity.y = -ghost.speed;
					ghost.velocity.x = 0;
					break;

				case 'right':
					ghost.velocity.x = ghost.speed;
					ghost.velocity.y = 0;
					break;

				case 'left':
					ghost.velocity.x = -ghost.speed;
					ghost.velocity.y = 0;
					break;
			}

			ghost.prevCollisions = [];
		}
	});

	// Win Condition
	if (pellets.length === 0) {
		cancelAnimationFrame(animationId);
		winScreen(true);
	}

	// Rotation of player towards the direction it is moving
	if (player.velocity.x > 0) player.rotation = 0;
	else if (player.velocity.x < 0) player.rotation = Math.PI;
	else if (player.velocity.y > 0) player.rotation = Math.PI / 2;
	else if (player.velocity.y < 0) player.rotation = (3 * Math.PI) / 2;
}; // end of animate function

// Creating Event Listener for Key Presses
addEventListener('keydown', ({ code }) => {
	// Switch Case to control movement with W, A, S and D keys
	switch (code) {
		case 'KeyW':
			keys.w = { pressed: true };
			lastKey = 'w';
			break;

		case 'KeyA':
			keys.a = { pressed: true };
			lastKey = 'a';
			break;

		case 'KeyS':
			keys.s = { pressed: true };
			lastKey = 's';
			break;

		case 'KeyD':
			keys.d = { pressed: true };
			lastKey = 'd';
			break;

		case 'ArrowUp':
			keys.w = { pressed: true };
			lastKey = 'w';
			break;

		case 'ArrowLeft':
			keys.a = { pressed: true };
			lastKey = 'a';
			break;

		case 'ArrowDown':
			keys.s = { pressed: true };
			lastKey = 's';
			break;

		case 'ArrowRight':
			keys.d = { pressed: true };
			lastKey = 'd';
			break;
	}
});

// Stop movement when key is released
addEventListener('keyup', ({ code }) => {
	// Switch Case to control movement with W, A, S and D keys
	switch (code) {
		case 'KeyW':
			keys.w = { pressed: false };
			break;

		case 'KeyA':
			keys.a = { pressed: false };
			break;

		case 'KeyS':
			keys.s = { pressed: false };
			break;

		case 'KeyD':
			keys.d = { pressed: false };
			break;

		case 'ArrowUp':
			keys.w = { pressed: false };
			break;

		case 'ArrowLeft':
			keys.a = { pressed: false };
			break;

		case 'ArrowDown':
			keys.s = { pressed: false };
			break;

		case 'ArrowRight':
			keys.d = { pressed: false };
			break;
	}
});

// Start the game
animate();

