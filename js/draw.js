function drawRoad() {
    const grassGrad = ctx.createLinearGradient(0, 0, 0, H);
    grassGrad.addColorStop(0, '#2d5a1e'); grassGrad.addColorStop(1, '#3d7a2e');
    ctx.fillStyle = grassGrad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#444'; ctx.fillRect(ROAD_L, 0, ROAD_W, H);
    const roadGrad = ctx.createLinearGradient(ROAD_L, 0, ROAD_R, 0);
    roadGrad.addColorStop(0, '#3a3a3a'); roadGrad.addColorStop(0.5, '#555'); roadGrad.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = roadGrad; ctx.fillRect(ROAD_L, 0, ROAD_W, H);
    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(ROAD_L, 0); ctx.lineTo(ROAD_L, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ROAD_R, 0); ctx.lineTo(ROAD_R, H); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    ctx.setLineDash([30, 25]); ctx.lineDashOffset = -scrollOffset % 55;
    for (let i = 1; i < LANE_COUNT; i++) {
        const lx = ROAD_L + (ROAD_W / LANE_COUNT) * i;
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const tr of trees) {
        const ty = ((tr.y + scrollOffset * 0.5) % (H + 40)) - 20;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(tr.x + 4, ty + 4, tr.size, tr.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsl(${tr.hue},55%,30%)`;
        ctx.beginPath(); ctx.arc(tr.x, ty, tr.size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.arc(tr.x - tr.size * 0.3, ty - tr.size * 0.3, tr.size * 0.4, 0, Math.PI * 2); ctx.fill();
    }
}

function drawPlayerCar() {
    ctx.save(); ctx.translate(player.x, player.y);
    if (player.invincible > 0 && Math.floor(player.invincible * 20) % 2) ctx.globalAlpha = 0.4;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(3, 5, 22, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.fillRect(-23, -20, 7, 15); ctx.fillRect(16, -20, 7, 15); ctx.fillRect(-23, 10, 7, 15); ctx.fillRect(16, 10, 7, 15);
    ctx.fillStyle = '#333';
    ctx.fillRect(-22, -18, 5, 11); ctx.fillRect(17, -18, 5, 11); ctx.fillRect(-22, 12, 5, 11); ctx.fillRect(17, 12, 5, 11);
    const bg = ctx.createLinearGradient(-18, 0, 18, 0);
    bg.addColorStop(0, '#b00'); bg.addColorStop(0.3, '#f22'); bg.addColorStop(0.7, '#f22'); bg.addColorStop(1, '#b00');
    ctx.fillStyle = bg; ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(16, -15); ctx.lineTo(18, 15); ctx.lineTo(14, 28);
    ctx.lineTo(-14, 28); ctx.lineTo(-18, 15); ctx.lineTo(-16, -15);
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#800'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(100,200,255,0.45)'; ctx.beginPath();
    ctx.moveTo(-10, -14); ctx.lineTo(10, -14); ctx.lineTo(12, -2); ctx.lineTo(-12, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-3, -28, 6, 55);
    ctx.fillStyle = '#ffff88'; ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(-8, -27, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -27, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff2200'; ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 4;
    ctx.fillRect(-12, 24, 7, 3); ctx.fillRect(5, 24, 7, 3); ctx.shadowBlur = 0;
    ctx.restore();
    if (player.shieldOn) {
        ctx.save(); ctx.translate(player.x, player.y);
        const sa = 0.4 + Math.sin(gameTime * 10) * 0.2;
        ctx.strokeStyle = `rgba(68,136,255,${sa})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, 33, 42, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(68,136,255,${sa * 0.2})`;
        ctx.beginPath(); ctx.ellipse(0, 0, 33, 42, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
}

function drawAlienShip() {
    ctx.save(); ctx.translate(alien.x, alien.y);
    const floatY = Math.sin(gameTime * 3) * 4; ctx.translate(0, floatY);
    if (alien.hoverOn) {
        ctx.fillStyle = 'rgba(0,255,255,0.12)';
        ctx.beginPath(); ctx.ellipse(0, 35 - floatY + Math.sin(gameTime * 3) * 3, 35, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.35 + Math.sin(gameTime * 6) * 0.1;
    }
    if (!alien.hoverOn) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(3, 5, 26, 16, 0, 0, Math.PI * 2); ctx.fill(); }
    const sbg = ctx.createRadialGradient(0, 0, 5, 0, 0, 28);
    sbg.addColorStop(0, '#cc77ff'); sbg.addColorStop(0.6, '#7722cc'); sbg.addColorStop(1, '#440088');
    ctx.fillStyle = sbg; ctx.beginPath(); ctx.ellipse(0, 0, 28, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5500aa'; ctx.lineWidth = 1.5; ctx.stroke();
    const dg = ctx.createRadialGradient(-2, -8, 2, 0, -4, 14);
    dg.addColorStop(0, 'rgba(150,255,200,0.5)'); dg.addColorStop(1, 'rgba(50,200,150,0.15)');
    ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(0, -4, 14, 11, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(-5, -8, 3, 4.5, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -8, 3, 4.5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#44ff88';
    ctx.beginPath(); ctx.ellipse(-5, -9, 1.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -9, 1.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) {
        const a = gameTime * 3 + i * Math.PI * 2 / 6, hue = (gameTime * 100 + i * 60) % 360;
        ctx.fillStyle = `hsl(${hue},100%,65%)`; ctx.shadowColor = `hsl(${hue},100%,65%)`; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 23, Math.sin(a) * 12, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (alien.hoverOn) {
        ctx.strokeStyle = `rgba(0,255,255,${0.3 + Math.sin(gameTime * 8) * 0.2})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, 34, 20, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    if (alien.tauntShow > 0) {
        ctx.save(); ctx.globalAlpha = Math.min(1, alien.tauntShow);
        ctx.font = '14px Arial'; ctx.textAlign = 'center';
        const tw = ctx.measureText(alien.taunt).width + 24;
        const bx = alien.x, by = alien.y - 45 + Math.sin(gameTime * 3) * 4;
        ctx.fillStyle = 'rgba(50,0,80,0.85)'; ctx.strokeStyle = '#aa66ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(bx - tw / 2, by - 14, tw, 28, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.fillText(alien.taunt, bx, by + 5); ctx.restore();
    }
}

function drawClones() {
    for (const c of alienClones) {
        const s = c.style;
        ctx.save(); ctx.translate(c.x, c.y);
        ctx.globalAlpha = c.alpha + Math.sin(gameTime * 8) * 0.1;
        const floatY = Math.sin(gameTime * 4 + c.x) * 3; ctx.translate(0, floatY);
        const cbg = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
        cbg.addColorStop(0, s.bodyC); cbg.addColorStop(0.6, s.midC); cbg.addColorStop(1, s.darkC + 'aa');
        ctx.fillStyle = cbg; ctx.beginPath(); ctx.ellipse(0, 0, 24, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = s.bodyC + '88'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = s.bodyC + '40'; ctx.beginPath(); ctx.ellipse(0, -3, 11, 9, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath(); ctx.ellipse(-4, -7, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(4, -7, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = s.eyeC;
        ctx.beginPath(); ctx.ellipse(-4, -8, 1.2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(4, -8, 1.2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
        for (let j = 0; j < 4; j++) {
            const a = gameTime * 4 + j * Math.PI / 2 + c.x * 0.1;
            ctx.fillStyle = `hsla(${s.hue + j * 30},100%,65%,${0.5 + Math.sin(gameTime * 6 + j) * 0.2})`;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 19, Math.sin(a) * 10, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = c.alpha;
        const barW = 40, barH = 5, barY = c.y + floatY - 22;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(c.x - barW / 2 - 1, barY - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#333'; ctx.fillRect(c.x - barW / 2, barY, barW, barH);
        const chp = Math.max(0, c.health) / c.maxHealth;
        ctx.fillStyle = chp > 0.5 ? s.bodyC : chp > 0.25 ? '#ffaa00' : '#ff4444';
        if (chp > 0) ctx.fillRect(c.x - barW / 2, barY, barW * chp, barH);
        ctx.globalAlpha = 1;
    }
}

function drawBullets() {
    for (const b of bullets) {
        if (b.homing) {
            for (let t = 0; t < b.trail.length; t++) {
                ctx.fillStyle = `rgba(255,100,50,${t / b.trail.length * 0.4})`;
                ctx.beginPath(); ctx.arc(b.trail[t].x, b.trail[t].y, 3, 0, Math.PI * 2); ctx.fill();
            }
            ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
            ctx.fillStyle = '#ff3333'; ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 15;
            ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(7, 6); ctx.lineTo(0, 3); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0; ctx.fillStyle = '#ffaa00';
            ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(0, 14 + Math.random() * 6); ctx.lineTo(4, 6); ctx.fill();
            ctx.fillStyle = '#ffff44';
            ctx.beginPath(); ctx.moveTo(-2, 6); ctx.lineTo(0, 10 + Math.random() * 4); ctx.lineTo(2, 6); ctx.fill();
            ctx.restore();
        } else if (b.owner === 'p') {
            ctx.fillStyle = '#ffff44'; ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 8;
            ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,0,0.25)'; ctx.fillRect(b.x - b.w / 2, b.y + b.h / 2, b.w, 10);
        } else {
            ctx.fillStyle = '#ff44ff'; ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffaaff'; ctx.beginPath(); ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
    }
}

function drawPortals() {
    for (const p of portals) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
        const pulse = 0.6 + Math.sin(gameTime * 4) * 0.3;
        ctx.strokeStyle = `rgba(170,68,255,${pulse})`; ctx.lineWidth = 3; ctx.shadowColor = '#aa44ff'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(68,255,255,${pulse})`; ctx.lineWidth = 2; ctx.shadowColor = '#44ffff'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
        for (let i = 0; i < 4; i++) {
            const a = p.rotation * 2 + i * Math.PI / 2, hue = (gameTime * 120 + i * 90) % 360;
            ctx.fillStyle = `hsla(${hue},100%,70%,0.7)`;
            ctx.beginPath(); ctx.arc(Math.cos(a) * p.size * 0.4, Math.sin(a) * p.size * 0.4, 4, 0, Math.PI * 2); ctx.fill();
        }
        const cg = ctx.createRadialGradient(0, 0, 2, 0, 0, p.size * 0.5);
        cg.addColorStop(0, 'rgba(200,150,255,0.6)'); cg.addColorStop(1, 'rgba(100,0,200,0)');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

function drawPowerUps() {
    for (const p of powerUps) {
        ctx.save(); ctx.translate(p.x, p.y);
        const glow = p.size + 4 + Math.sin(gameTime * 5) * 3;
        if (p.type === 'health') {
            ctx.fillStyle = 'rgba(0,255,0,0.15)'; ctx.beginPath(); ctx.arc(0, 0, glow, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#44ff44'; ctx.fillRect(-3, -10, 6, 20); ctx.fillRect(-10, -3, 20, 6);
        } else if (p.type === 'rapidfire') {
            ctx.fillStyle = 'rgba(255,100,0,0.15)'; ctx.beginPath(); ctx.arc(0, 0, glow, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff8800'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('\u26A1', 0, 1);
        } else if (p.type === 'shield') {
            ctx.fillStyle = 'rgba(68,136,255,0.15)'; ctx.beginPath(); ctx.arc(0, 0, glow, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4488ff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('\uD83D\uDEE1\uFE0F', 0, 1);
        } else if (p.type === 'missile') {
            ctx.fillStyle = 'rgba(255,50,50,0.15)'; ctx.beginPath(); ctx.arc(0, 0, glow, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff3333'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('\uD83D\uDE80', 0, 1);
        } else if (p.type === 'sweep') {
            ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(0, 0, glow, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('\uD83E\uDDF9', 0, 1);
        }
        ctx.restore();
    }
}

function drawUI() {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(W - 230, 10, 220, 40, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'right';
    ctx.fillText('אתה \uD83C\uDFCE\uFE0F', W - 15, 35);
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.roundRect(W - 225, 18, 180, 22, 5); ctx.fill();
    const hp = Math.max(0, player.health) / player.maxHealth;
    ctx.fillStyle = hp > 0.6 ? '#44ff44' : hp > 0.3 ? '#ffaa00' : '#ff4444';
    if (hp > 0) { ctx.beginPath(); ctx.roundRect(W - 225 + 180 * (1 - hp), 18, 180 * hp, 22, 5); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
    ctx.fillText(Math.max(0, Math.ceil(player.health)) + '/' + player.maxHealth, W - 135, 34);

    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(10, 10, 220, 40, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'right';
    ctx.fillText('חייזר \uD83D\uDC7D', 225, 35);
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.roundRect(15, 18, 180, 22, 5); ctx.fill();
    const ahp = Math.max(0, alien.health) / alien.maxHealth;
    ctx.fillStyle = ahp > 0.6 ? '#bb66ff' : ahp > 0.3 ? '#ffaa00' : '#ff4444';
    if (ahp > 0) { ctx.beginPath(); ctx.roundRect(15 + 180 * (1 - ahp), 18, 180 * ahp, 22, 5); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
    ctx.fillText(Math.max(0, Math.ceil(alien.health)) + '/' + alien.maxHealth, 105, 34);

    // Shield
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.roundRect(W - 170, 55, 160, 22, 6); ctx.fill();
    ctx.fillStyle = '#bbb'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
    ctx.fillText(isTouchDevice ? 'מגן:' : 'מגן [S]:', W - 15, 70);
    if (player.shieldOn) {
        const sPct = player.shieldTimer / player.shieldDur;
        ctx.fillStyle = '#4488ff'; ctx.beginPath(); ctx.roundRect(W - 165 + 90 * (1 - sPct), 58, 90 * sPct, 16, 3); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.fillText('פעיל!', W - 120, 70);
    } else if (player.shieldCD > 0) {
        const cdPct = 1 - player.shieldCD / player.shieldMaxCD;
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.roundRect(W - 165 + 90 * (1 - cdPct), 58, 90 * cdPct, 16, 3); ctx.fill();
        ctx.fillStyle = '#aaa'; ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.fillText(Math.ceil(player.shieldCD) + 'שנ\'', W - 120, 70);
    } else {
        ctx.fillStyle = '#44ff44'; ctx.beginPath(); ctx.roundRect(W - 165, 58, 90, 16, 3); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('מוכן!', W - 120, 70);
    }

    let statusY = 95;
    if (player.rapidFire > 0) {
        ctx.fillStyle = 'rgba(255,100,0,0.8)'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'right';
        ctx.fillText('\u26A1 ירי מהיר! ' + Math.ceil(player.rapidFire) + 'שנ\'', W - 10, statusY); statusY += 20;
    }
    if (player.homingMissiles > 0) {
        const ma = 0.7 + Math.sin(gameTime * 5) * 0.3;
        ctx.fillStyle = `rgba(255,60,60,${ma})`; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'right';
        ctx.fillText('\uD83D\uDE80 טילים מתמבייתים! ' + Math.ceil(player.homingMissiles) + 'שנ\'', W - 10, statusY);
    }
    if (alien.hoverOn) {
        const a = 0.5 + Math.sin(gameTime * 6) * 0.3;
        ctx.fillStyle = `rgba(0,255,255,${a})`; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText('\u26A0\uFE0F החייזר מרחף! אי אפשר לפגוע בו! \u26A0\uFE0F', W / 2, H / 2 - 50);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(W / 2 - 35, 10, 70, 28, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'center';
    const m = Math.floor(gameTime / 60), s = Math.floor(gameTime % 60);
    ctx.fillText(m + ':' + String(s).padStart(2, '0'), W / 2, 30);
}

function drawStars() {
    for (let i = 0; i < 120; i++) {
        const sx = (Math.sin(i * 123.456) * 0.5 + 0.5) * W;
        const sy = (Math.cos(i * 789.012) * 0.5 + 0.5) * H;
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(gameTime * 2 + i) * 0.3})`;
        ctx.beginPath(); ctx.arc(sx, sy, 0.5 + Math.random() * 1.2, 0, Math.PI * 2); ctx.fill();
    }
}

function drawMenu() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H); drawStars();
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff3333'; ctx.font = 'bold 50px Arial';
    ctx.fillText('סופר-קאר \uD83C\uDFCE\uFE0F', W / 2, 115); ctx.shadowBlur = 0;
    ctx.shadowColor = '#8800ff'; ctx.shadowBlur = 15;
    ctx.fillStyle = '#aa44ff'; ctx.font = 'bold 34px Arial';
    ctx.fillText('נגד החייזר! \uD83D\uDC7D', W / 2, 165); ctx.shadowBlur = 0;
    ctx.font = '55px Arial'; ctx.fillText('\uD83C\uDFCE\uFE0F  \u26A1  \uD83D\uDC7D', W / 2, 235);

    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(W / 2 - 220, 260, 440, 330, 15); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 20px Arial'; ctx.fillText('איך לשחק:', W / 2, 290);

    if (isTouchDevice) {
        ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
        ctx.fillText('גרור בצד שמאל = תזוזה', W / 2, 320);
        ctx.fillText('כפתור ירי = ירי, כפתור מגן = מגן', W / 2, 348);
    } else {
        ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
        ctx.fillText('חצים \u2190 \u2191 \u2192 \u2193 = תזוזה', W / 2, 320);
        ctx.fillText('רווח (Space) = ירי, S = מגן', W / 2, 348);
    }

    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 16px Arial'; ctx.fillText('כוחות מיוחדים על הכביש:', W / 2, 385);
    ctx.fillStyle = '#fff'; ctx.font = '14px Arial';
    ctx.fillText('\uD83D\uDC9A חיים   \u26A1 ירי מהיר   \uD83D\uDEE1\uFE0F מגן', W / 2, 410);
    ctx.fillText('\uD83D\uDE80 טילים מתמבייתים   \uD83D\uDF00 פורטל   \uD83E\uDDF9 מטאטא', W / 2, 433);
    ctx.fillStyle = '#aaa'; ctx.font = '13px Arial'; ctx.fillText('השמד את החייזר כדי לנצח!', W / 2, 463);
    ctx.fillStyle = '#ff8888'; ctx.font = '12px Arial'; ctx.fillText('שים לב: החייזר מרפא את עצמו לאט!', W / 2, 483);

    const pulse = 0.4 + Math.sin(gameTime * 4) * 0.4;
    ctx.fillStyle = `rgba(255,255,100,${pulse})`; ctx.font = 'bold 24px Arial';
    ctx.fillText(isTouchDevice ? 'גע במסך להתחיל!' : 'לחץ Enter להתחיל!', W / 2, 560);

    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '14px Arial';
    ctx.fillText('משחק ע״י אדם זידנר', W / 2, H - 20);
}

function drawDifficulty() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H); drawStars();
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 40px Arial';
    ctx.fillText('בחר רמת קושי:', W / 2, 80);

    const boxW = 360, boxH = 85;
    for (let i = 0; i < 4; i++) {
        const d = DIFFICULTIES[diffKeys[i]], y = 140 + i * 105, sel = i === selectedDiff;
        if (sel) {
            ctx.fillStyle = d.color + '33'; ctx.strokeStyle = d.color; ctx.lineWidth = 3;
            ctx.shadowColor = d.color; ctx.shadowBlur = 20;
            ctx.beginPath(); ctx.roundRect(W / 2 - boxW / 2, y, boxW, boxH, 12); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(W / 2 - boxW / 2, y, boxW, boxH, 12); ctx.fill(); ctx.stroke();
        }
        if (sel && !isTouchDevice) {
            ctx.fillStyle = d.color; ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'right'; ctx.fillText('\u25B6', W / 2 + boxW / 2 - 15, y + 45);
            ctx.textAlign = 'left'; ctx.fillText('\u25C0', W / 2 - boxW / 2 + 15, y + 45);
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = sel ? d.color : '#888'; ctx.font = sel ? 'bold 30px Arial' : 'bold 24px Arial';
        ctx.fillText(d.name, W / 2, y + 38);
        ctx.fillStyle = sel ? '#fff' : '#666'; ctx.font = '14px Arial'; ctx.fillText(d.desc, W / 2, y + 62);
        ctx.fillText('\u2B50'.repeat(i + 1), W / 2, y + 78);
    }
    const pulse = 0.4 + Math.sin(gameTime * 4) * 0.4;
    ctx.fillStyle = `rgba(255,255,100,${pulse})`; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
    ctx.fillText(isTouchDevice ? 'גע ברמה שאתה רוצה!' : 'חצים לבחור, Enter להתחיל!', W / 2, 575);
}

function drawCountdown() {
    drawRoad(); drawPlayerCar(); drawAlienShip();
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H);
    const num = Math.ceil(countdownTimer);
    if (num > 0 && num <= 3) {
        const sc = 1 + (countdownTimer % 1) * 0.5;
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 100px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.fillText(num, 0, 0); ctx.shadowBlur = 0; ctx.restore();
    } else if (countdownTimer <= 0) {
        ctx.fillStyle = '#44ff44'; ctx.font = 'bold 80px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = '#44ff44'; ctx.shadowBlur = 30; ctx.fillText('קדימה!', W / 2, H / 2); ctx.shadowBlur = 0;
    }
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 50px Arial';
    ctx.fillText('השהייה', W / 2, H / 2 - 30);
    const pp = 0.4 + Math.sin(gameTime * 4) * 0.4;
    ctx.fillStyle = `rgba(255,255,100,${pp})`; ctx.font = 'bold 22px Arial';
    ctx.fillText(isTouchDevice ? 'גע להמשיך' : 'P להמשיך, Esc לתפריט ראשי', W / 2, H / 2 + 30);
}

function drawGameOver() {
    drawRoad(); drawBullets(); drawPowerUps();
    if (winner === 'player') drawPlayerCar(); else drawAlienShip();
    drawParticles(); drawDmgNums();
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H); drawParticles();
    ctx.textAlign = 'center';
    if (winner === 'player') {
        if (Math.random() < 0.12) {
            const cols = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
            spawnParticles(Math.random() * W, Math.random() * H * 0.6, 20, cols[Math.floor(Math.random() * cols.length)], 200, 1);
        }
        ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 58px Arial';
        ctx.fillText('\uD83C\uDF89 ניצחת! \uD83C\uDF89', W / 2, H / 2 - 50); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; ctx.font = '24px Arial'; ctx.fillText('החייזר הושמד!', W / 2, H / 2 + 10);
    } else {
        ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff4444'; ctx.font = 'bold 58px Arial';
        ctx.fillText('\uD83D\uDCA5 הפסדת! \uD83D\uDCA5', W / 2, H / 2 - 50); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; ctx.font = '24px Arial'; ctx.fillText('החייזר ניצח הפעם...', W / 2, H / 2 + 10);
    }
    const pulse = 0.4 + Math.sin(gameTime * 4) * 0.4;
    ctx.fillStyle = `rgba(255,255,100,${pulse})`; ctx.font = 'bold 22px Arial';
    ctx.fillText(isTouchDevice ? 'גע במסך לשחק שוב!' : 'לחץ Enter לשחק שוב!', W / 2, H / 2 + 70);
}
