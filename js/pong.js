export class PongGame {
  constructor(canvas, scoreDiv) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scoreDiv = scoreDiv;
    this.width = canvas.width;
    this.height = canvas.height;
    this.paddleHeight = 80;
    this.paddleWidth = 14;
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
  }

  start() {
    this.running = true;
    requestAnimationFrame(this.loop);
  }

  resetBall() {
    this.ball.x = this.width / 2 - this.ballSize / 2;
    this.ball.y = this.height / 2 - this.ballSize / 2;
    this.ball.vx = Math.random() > 0.5 ? 5 : -5;
    this.ball.vy = (Math.random() - 0.5) * 6;
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }

  update() {
    // Player movement
    if (this.keys['ArrowUp']) this.playerY -= 7;
    if (this.keys['ArrowDown']) this.playerY += 7;
    this.playerY = Math.max(0, Math.min(this.height - this.paddleHeight, this.playerY));

    // AI movement (simple tracking)
    if (this.ball.y + this.ballSize / 2 > this.aiY + this.paddleHeight / 2) this.aiY += 5.5;
    else if (this.ball.y + this.ballSize / 2 < this.aiY + this.paddleHeight / 2) this.aiY -= 5.5;
    this.aiY = Math.max(0, Math.min(this.height - this.paddleHeight, this.aiY));

    // Ball movement
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Ball collision with top/bottom
    if (this.ball.y <= 0 || this.ball.y + this.ballSize >= this.height) {
      this.ball.vy *= -1;
      this.ball.y = Math.max(0, Math.min(this.height - this.ballSize, this.ball.y));
    }

    // Ball collision with paddles
    // Player paddle
    if (this.ball.x <= this.paddleWidth &&
        this.ball.y + this.ballSize > this.playerY &&
        this.ball.y < this.playerY + this.paddleHeight) {
      this.ball.vx *= -1.08;
      this.ball.x = this.paddleWidth;
      // Añadir efecto según donde golpea
      let impact = ((this.ball.y + this.ballSize/2) - (this.playerY + this.paddleHeight/2)) / (this.paddleHeight/2);
      this.ball.vy += impact * 3.5;
    }
    // AI paddle
    if (this.ball.x + this.ballSize >= this.width - this.paddleWidth &&
        this.ball.y + this.ballSize > this.aiY &&
        this.ball.y < this.aiY + this.paddleHeight) {
      this.ball.vx *= -1.08;
      this.ball.x = this.width - this.paddleWidth - this.ballSize;
      let impact = ((this.ball.y + this.ballSize/2) - (this.aiY + this.paddleHeight/2)) / (this.paddleHeight/2);
      this.ball.vy += impact * 3.5;
    }

    // Score
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
    // Fondo
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
    // Red central
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(this.width/2, 0);
    ctx.lineTo(this.width/2, this.height);
    ctx.stroke();
    ctx.setLineDash([]);
    // Paletas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, this.playerY, this.paddleWidth, this.paddleHeight);
    ctx.fillRect(this.width - this.paddleWidth, this.aiY, this.paddleWidth, this.paddleHeight);
    // Bola
    ctx.fillStyle = '#0ff';
    ctx.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);
  }
}
