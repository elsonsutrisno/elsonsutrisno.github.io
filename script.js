// --- Global Elements & Tracking Variables ---
const mouse = { x: null, y: null, radius: 140 };
const follower = document.getElementById('cursor-follower');
const heroName = document.querySelector('.hero-name');

let isCanvasActive = false; // Tracks if canvas should render
let animId = null;           // Stores animation frame ID

// --- Optimized Mouse Movement (Runs only when needed) ---
document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  // Lightweight custom cursor update
  follower.style.left = `${e.clientX}px`;
  follower.style.top = `${e.clientY}px`;

  // Only calculate name gradient if canvas/hero is active
  if (isCanvasActive && heroName) {
    const rect = heroName.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroName.style.setProperty('--mouse-x', `${x}px`);
    heroName.style.setProperty('--mouse-y', `${y}px`);
  }
});

// --- Interactive Background Canvas ---
const canvas = document.getElementById('interactive-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 1;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.color = '#38bdf8';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
    if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

    // Interactive Cursor Repulsion
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        let force = (mouse.radius - distance) / mouse.radius;
        this.x -= (dx / distance) * force * 5;
        this.y -= (dy / distance) * force * 5;
      }
    }
  }
}

function initParticles() {
  particlesArray = [];
  // Reduced particle count slightly for extra performance headroom
  for (let i = 0; i < 65; i++) {
    particlesArray.push(new Particle());
  }
}

// --- Smart Animation Loop (Can be paused) ---
function animateParticles() {
  if (!isCanvasActive) return; // Completely STOP calculation when hidden

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => { p.update(); p.draw(); });
  animId = requestAnimationFrame(animateParticles);
}

initParticles();


// --- Separate Particle Class Just for Blackholes ---
class VortexParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 1;
    this.color = '#a855f7';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    const bhX = canvas.width * 0.75; 
    const bhY = canvas.height * 0.5;

    let dx = bhX - this.x;
    let dy = bhY - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Orbit physics
    let angle = Math.atan2(dy, dx);
    let orbitAngle = angle + (Math.PI / 2.1); 
    let speed = 300 / (distance + 15); 

    this.x += Math.cos(orbitAngle) * speed + (dx * 0.006); 
    this.y += Math.sin(orbitAngle) * speed + (dy * 0.006);

    // FIXED: Respawn randomly across the ENTIRE canvas instead of just the left side
    if (distance < 40) {
      this.x = Math.random() * canvas.width; 
      this.y = Math.random() * canvas.height;
    }

    // Mouse interactivity
    if (mouse.x !== null && mouse.y !== null) {
      let dxMouse = mouse.x - this.x;
      let dyMouse = mouse.y - this.y;
      let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      
      if (distMouse < mouse.radius) {
        let force = (mouse.radius - distMouse) / mouse.radius;
        this.x -= (dxMouse / distMouse) * force * 5;
        this.y -= (dyMouse / distMouse) * force * 5;
      }
    }
  }
}

// --- Intersection Observer (Controls Pause / Play) ---
const sections = document.querySelectorAll('section');
const dots = document.querySelectorAll('.dot');
const snapWrapper = document.getElementById('snap-wrapper');

const observerOptions = {
  root: snapWrapper,
  threshold: 0.6
};

// --- Updated Intersection Observer ---
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');

      const sectionId = entry.target.id;
      const newAccent = entry.target.getAttribute('data-accent');
      follower.style.borderColor = newAccent;

      // Check if the current section has the blackhole effect class
      if (entry.target.classList.contains('blackhole-effect')) {
        document.body.classList.add('show-canvas');
        
        particlesArray = [];
        // 1. Start with only a few particles immediately
        for (let i = 0; i < 8; i++) {
          let p = new VortexParticle();
          p.color = newAccent;
          particlesArray.push(p);
        }

        // 2. Gradually add more particles over time until it reaches 65
        let spawnInterval = setInterval(() => {
          // Stop if user scrolled away or max particles reached
          if (!entry.target.classList.contains('active') || particlesArray.length >= 65) {
            clearInterval(spawnInterval);
            return;
          }
          let p = new VortexParticle();
          p.color = newAccent;
          particlesArray.push(p);
        }, 150); // Adds a new particle every 150ms

        if (!isCanvasActive) {
          isCanvasActive = true;
          animateParticles();
        }

      } else if (sectionId === 'hero' || sectionId === 'contact') {
        document.body.classList.add('show-canvas');
        
        // CLEAR and reload normal bouncing particles
        initParticles(); 
        particlesArray.forEach(p => { p.color = newAccent; });

        if (!isCanvasActive) {
          isCanvasActive = true;
          animateParticles();
        }
        
      } else {
        // Pause canvas on middle plain pages
        document.body.classList.remove('show-canvas');
        isCanvasActive = false;
        if (animId) cancelAnimationFrame(animId);
      }

      // Sync active side indicator dot
      const sectionIndex = Array.from(sections).indexOf(entry.target);
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === sectionIndex);
      });
    } else {
      entry.target.classList.remove('active');
    }
  });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

// --- Dot Navigation Clicks ---
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const slideIndex = dot.getAttribute('data-slide');
    sections[slideIndex].scrollIntoView({ behavior: 'smooth' });
  });
});