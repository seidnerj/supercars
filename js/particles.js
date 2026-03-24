let particles = [];
let dmgNums = [];

function spawnParticles(x, y, count, color, speed, life) {
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, s = Math.random() * speed;
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            life: life * (0.5 + Math.random() * 0.5), maxLife: life,
            color, size: 2 + Math.random() * 4 });
    }
}

function spawnDmg(x, y, amt) { dmgNums.push({ x, y, amt, life: 1, vy: -80 }); }

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function updateDmgNums(dt) {
    for (let i = dmgNums.length - 1; i >= 0; i--) {
        const d = dmgNums[i]; d.y += d.vy * dt; d.life -= dt;
        if (d.life <= 0) dmgNums.splice(i, 1);
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawDmgNums() {
    ctx.save(); ctx.direction = 'ltr';
    for (const d of dmgNums) {
        ctx.globalAlpha = d.life;
        ctx.fillStyle = '#ff4444'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
        ctx.fillText('-' + d.amt, d.x, d.y);
    }
    ctx.globalAlpha = 1; ctx.restore();
}
