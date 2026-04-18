gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

let speedFactor = 1;
let lastTime = 0;
const fps = 60;
const interval = 1000 / fps;

gsap.to({}, {
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
            speedFactor = 1 + self.progress * 3;
        }
    }

});

let scrollY = 0;
let scrollDelta = 0;
let lastScrollY = 0;

window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
    const rawDelta = window.scrollY - lastScrollY;
    scrollDelta = Math.max(-10, Math.min(10, rawDelta));
    lastScrollY = window.scrollY;
});

window.spaceState = {
    glowColor: "#ffffff"
};

const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
let mouse = { x: null, y: null };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", resizeCanvas);

class Star {
    constructor(layer) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.layer = layer;
        this.size = Math.random() * (layer * 1.5);
        this.speed = layer * 0.2;

        this.vx = (Math.random() - 0.5) * this.speed;
        this.vy = (Math.random() - 0.5) * this.speed;
    }

    update() {
        //Move
        this.x += this.vx * speedFactor;
        this.y += this.vy * speedFactor;

        //Parrallax
        this.y += scrollDelta * 0.125 * this.layer;

        //Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        //Mouse interaction
        if (mouse.x && mouse.y) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                let force = (120 - dist) / 120;
                this.x += (dx / dist) * force * 2;
                this.y += (dy / dist) * force * 2;

                //orbit
                this.x += dy * 0.002;
                this.y += dx * 0.002;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        //glow effect
        ctx.shadowBlur = 3 * this.layer;
        ctx.shadowColor = "#ffffff";

        ctx.fillStyle = "white";
        ctx.fill();
    }
}

//Stars
function initStars() {
    stars = [];
    for (let i = 0; i < 200; i++) stars.push(new Star(1));
    for (let i = 0; i < 100; i++) stars.push(new Star(2));
    for (let i = 0; i < 50; i++) stars.push(new Star(3));
}

initStars();


class ShootingStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.len = Math.random() * 80 + 10;
        this.speed = Math.random() * 10 + 6;
        this.opacity = 1;
    }

    update() {
        this.x += this.speed;
        this.y += this.speed;
        this.opacity -= 0.02;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.len, this.y - this.len);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawNebula() {
    let shift = scrollY * 0.0005;

    const gradient = ctx.createRadialGradient(
        canvas.width * (0.7 + shift),
        canvas.height * (0.3 + shift),
        0,
        canvas.width * (0.7 + shift),
        canvas.height * (0.3 + shift),
        400
    );

    gradient.addColorStop(0, "rgba(0, 150, 255, 0.3)");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate(time = 0) {
    if (time - lastTime < interval) {
        requestAnimationFrame(animate);
        return;
    }
    lastTime = time;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawNebula();

    stars.forEach((star) => {
        star.update();
        star.draw();
    });

    //Mouse Glowing effect
    const mx = mouse.x !== null ? mouse.x : canvas.width / 2;
    const my = mouse.y !== null ? mouse.y : canvas.height / 2;

    const gradient = ctx.createRadialGradient(
        mx, my, 0,
        mx, my, 200
    );

    gradient.addColorStop(0, "rgba(255,255,255,0.1)");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //shooting stars
    if (Math.random() < 0.02 + scrollY * 0.00001) {
        shootingStars.push(new ShootingStar());
    }

    shootingStars.forEach((s, i) => {
        s.update();
        s.draw();
        if (s.opacity <= 0) shootingStars.splice(i, 1);
    });

    requestAnimationFrame(animate);
}

animate();