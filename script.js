const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initTextPoints();
    initRain();
});

// إعداد مطر الأرقام (Matrix Rain)
const fontSize = 16;
let columns = Math.floor(width / fontSize);
let drops = [];

function initRain() {
    columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }
}
initRain();

// تحديد نقاط اسم "روان"
let textPoints = [];
function initTextPoints() {
    textPoints = [];
    const offscreenCanvas = document.createElement('canvas');
    const offCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const targetFontSize = Math.min(width * 0.22, 180);
    offCtx.font = `bold ${targetFontSize}px sans-serif`;
    offCtx.fillStyle = 'white';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('روان ❤', width / 2, height / 2);

    const imageData = offCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const step = 8; // كثافة النقاط

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const index = (y * width + x) * 4;
            if (data[index + 3] > 128) {
                textPoints.push({ x, y });
            }
        }
    }
}
initTextPoints();

// إعداد الجسيمات التفاعلية
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.target = null;
        this.speed = Math.random() * 0.03 + 0.02;
        this.char = Math.random() > 0.5 ? '1' : '0';
        // جعل الألوان كلها باللون الأخضر بدرجات متناسقة
        this.color = '#00ff41';
        this.alpha = Math.random() * 0.8 + 0.2;
    }

    update(isForming) {
        if (isForming && this.target) {
            this.x += (this.target.x - this.x) * this.speed;
            this.y += (this.target.y - this.y) * this.speed;
            this.color = '#00ff66'; // لون أخضر مضيء ومميز عند تشكيل الاسم
        } else {
            this.y += Math.random() * 3 + 2;
            if (this.y > height) {
                this.y = 0;
                this.x = Math.random() * width;
            }
            this.color = '#00cc33'; // أخضر لمطر الماتريكس
        }

        if (Math.random() < 0.02) {
            this.char = Math.random() > 0.5 ? '1' : '0';
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(this.char, this.x, this.y);
    }
}

// إنشاء الجسيمات وربطها بنقاط الاسم
const particles = [];
const particleCount = 1200;

for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    if (i < textPoints.length) {
        p.target = textPoints[i];
    }
    particles.push(p);
}

let startTime = Date.now();
let isForming = false;

function animate() {
    // خلفية شفافة قليلاً لترك أثر (Trail) خلف الأرقام المنسدلة
    ctx.fillStyle = 'rgba(5, 15, 5, 0.15)';
    ctx.fillRect(0, 0, width, height);

    const elapsed = Date.now() - startTime;
    if (elapsed > 3000) {
        isForming = true; // البدء بتشكيل اسم روان بعد 3 ثوانٍ
    }

    // رسم مطر الماتريكس الأخضر في الخلفية
    ctx.fillStyle = 'rgba(0, 255, 65, 0.25)';
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < drops.length; i++) {
        const text = Math.random() > 0.5 ? '1' : '0';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    // رسم الجسيمات وحركتها
    particles.forEach(p => {
        p.update(isForming);
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// زر إعادة التشغيل
document.getElementById('restartBtn').addEventListener('click', () => {
    startTime = Date.now();
    isForming = false;
    particles.forEach(p => p.reset());
    for (let i = 0; i < particles.length; i++) {
        if (i < textPoints.length) {
            particles[i].target = textPoints[i];
        }
    }
});