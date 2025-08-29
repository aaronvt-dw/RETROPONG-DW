
// Clase PongGame (sin módulos) con sonidos
class PongGame {
	constructor(canvas, scoreDiv, difficulty = 'normal') {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.scoreDiv = scoreDiv;
		this.width = canvas.width;
		this.height = canvas.height;
		this.paddleHeight = 110;
		this.paddleWidth = 22;
		this.ballSize = 16;
		this.playerY = (this.height - this.paddleHeight) / 2;
		this.aiY = (this.height - this.paddleHeight) / 2;
		this.playerScore = 0;
		this.aiScore = 0;
		this.ball = {
			x: this.width / 2 - this.ballSize / 2,
			y: this.height / 2 - this.ballSize / 2,
			vx: Math.random() > 0.5 ? 5 : -5,
			vy: (Math.random() - 0.5) * 6
		};
			this.running = false;
			this.keys = {};
			this.loop = this.loop.bind(this);
			window.addEventListener('keydown', e => this.keys[e.key] = true);
			window.addEventListener('keyup', e => this.keys[e.key] = false);
			// Sonidos
			this.sndBounce = this.createSound('bounce');
			this.sndScore = this.createSound('score');
			this.sndStart = this.createSound('start');
			this.playStart = false;
			// Dificultad IA
			this.setDifficulty(difficulty);

		}

		setDifficulty(level) {
			// Velocidad IA y precisión
			if (level === 'easy') {
				this.aiSpeed = 3.2;
				this.aiError = 60;
			} else if (level === 'normal') {
				this.aiSpeed = 5.5;
				this.aiError = 30;
			} else if (level === 'hard') {
				this.aiSpeed = 7.5;
				this.aiError = 10;
			} else if (level === 'pro') {
				this.aiSpeed = 10;
				this.aiError = 0;
			}
	}

	createSound(type) {
		let ctx = new (window.AudioContext || window.webkitAudioContext)();
		let buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
		let data = buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) {
			if (type === 'bounce') data[i] = Math.sin(i/2) * Math.exp(-i/1200);
			else if (type === 'score') data[i] = Math.sin(i/3) * Math.exp(-i/800);
			else if (type === 'start') data[i] = Math.sin(i/8) * Math.exp(-i/400);
		}
		return () => {
			let src = ctx.createBufferSource();
			src.buffer = buffer;
			src.connect(ctx.destination);
			src.start();
		};
	}

	start() {
		this.running = true;
		if (!this.playStart) {
			this.sndStart();
			this.playStart = true;
		}
		requestAnimationFrame(this.loop);
	}

	resetBall() {
		this.ball.x = this.width / 2 - this.ballSize / 2;
		this.ball.y = this.height / 2 - this.ballSize / 2;
		this.ball.vx = Math.random() > 0.5 ? 5 : -5;
		this.ball.vy = (Math.random() - 0.5) * 6;
		this.sndScore();
	}

	loop() {
		if (!this.running) return;
		this.update();
		this.draw();
		requestAnimationFrame(this.loop);
	}

	update() {
		// Movimiento jugador
		if (this.keys['ArrowUp']) this.playerY -= 7;
		if (this.keys['ArrowDown']) this.playerY += 7;
		this.playerY = Math.max(0, Math.min(this.height - this.paddleHeight, this.playerY));

		// Movimiento IA con error y velocidad según dificultad
		let aiTarget = this.ball.y + this.ballSize / 2 + (Math.random() - 0.5) * this.aiError;
		if (aiTarget > this.aiY + this.paddleHeight / 2) this.aiY += this.aiSpeed;
		else if (aiTarget < this.aiY + this.paddleHeight / 2) this.aiY -= this.aiSpeed;
		this.aiY = Math.max(0, Math.min(this.height - this.paddleHeight, this.aiY));

		// Movimiento bola
		this.ball.x += this.ball.vx;
		this.ball.y += this.ball.vy;

		// Rebote arriba/abajo
		if (this.ball.y <= 0 || this.ball.y + this.ballSize >= this.height) {
			this.ball.vy *= -1;
			this.ball.y = Math.max(0, Math.min(this.height - this.ballSize, this.ball.y));
			this.sndBounce();
		}

		// Colisión palas
		// Jugador
		if (this.ball.x <= this.paddleWidth &&
				this.ball.y + this.ballSize > this.playerY &&
				this.ball.y < this.playerY + this.paddleHeight) {
			this.ball.vx *= -1.08;
			this.ball.x = this.paddleWidth;
			let impact = ((this.ball.y + this.ballSize/2) - (this.playerY + this.paddleHeight/2)) / (this.paddleHeight/2);
			this.ball.vy += impact * 3.5;
			this.sndBounce();
		}
		// IA
		if (this.ball.x + this.ballSize >= this.width - this.paddleWidth &&
				this.ball.y + this.ballSize > this.aiY &&
				this.ball.y < this.aiY + this.paddleHeight) {
			this.ball.vx *= -1.08;
			this.ball.x = this.width - this.paddleWidth - this.ballSize;
			let impact = ((this.ball.y + this.ballSize/2) - (this.aiY + this.paddleHeight/2)) / (this.paddleHeight/2);
			this.ball.vy += impact * 3.5;
			this.sndBounce();
		}

		// Puntuación
		if (this.ball.x < -this.ballSize) {
			this.aiScore++;
			this.resetBall();
		}
		if (this.ball.x > this.width) {
			this.playerScore++;
			this.resetBall();
		}
		this.scoreDiv.textContent = `Jugador: ${this.playerScore} | IA: ${this.aiScore}`;
	}

	draw() {
		const ctx = this.ctx;
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.strokeStyle = '#fff';
		ctx.setLineDash([10, 10]);
		ctx.beginPath();
		ctx.moveTo(this.width/2, 0);
		ctx.lineTo(this.width/2, this.height);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, this.playerY, this.paddleWidth, this.paddleHeight);
		ctx.fillRect(this.width - this.paddleWidth, this.aiY, this.paddleWidth, this.paddleHeight);
		ctx.fillStyle = '#0ff';
		ctx.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);
	}
}

function resizeCanvas(canvas) {
	// Desktop: 900x520, móvil: ajusta a pantalla
	if (window.innerWidth < 900) {
		canvas.width = Math.min(window.innerWidth * 0.98, 700);
		canvas.height = Math.max(canvas.width * 0.58, 260);
	} else {
		canvas.width = 900;
		canvas.height = 520;
	}
}


window.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('gameCanvas');
	const scoreDiv = document.getElementById('score');
	const difficultySel = document.getElementById('difficulty');
	let game;
	if (canvas && scoreDiv && difficultySel) {
		resizeCanvas(canvas);
		window.addEventListener('resize', () => resizeCanvas(canvas));
		game = new PongGame(canvas, scoreDiv, difficultySel.value);
		game.start();
		// Solo permitir cambio de dificultad con mouse/touch, no con flechas
		difficultySel.addEventListener('change', () => {
			game.setDifficulty(difficultySel.value);
		});
		difficultySel.addEventListener('keydown', e => {
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				e.preventDefault();
			}
		});
	} else if (canvas && scoreDiv) {
		// Fallback: sin selector, dificultad normal
		resizeCanvas(canvas);
		window.addEventListener('resize', () => resizeCanvas(canvas));
		game = new PongGame(canvas, scoreDiv, 'normal');
		game.start();
	} else {
		console.error('No se encontró el canvas, el div de score o el selector de dificultad');
	}
});
