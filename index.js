// Creating Canvas and Canvas Context
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// Creating Canvas Size
canvas.width = innerWidth;
canvas.height = innerHeight;

// Creating Boundary
class Boundary {
	static width = 40;
	static height = 40;

	constructor({ position }) {
		this.position = position;
		this.width = 40;
		this.height = 40;
	}

	draw() {
		context.fillStyle = '#1e40af';
		context.fillRect(
			this.position.x,
			this.position.y,
			this.width,
			this.height
		);
	}
}

// Creating Map Layout
const map = [
	['-', '-', '-', '-', '-', '-'],
	['-', ' ', ' ', ' ', ' ', '-'],
	['-', ' ', '-', '-', ' ', '-'],
	['-', ' ', ' ', ' ', ' ', '-'],
	['-', '-', '-', '-', '-', '-'],
];

const boundaries = [];

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
					})
				);
				break;
		}
	});
});

boundaries.forEach((boundary) => boundary.draw());

