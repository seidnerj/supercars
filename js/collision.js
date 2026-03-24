function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.owner === 'p') {
            // vs alien
            if (!alien.hoverOn &&
                b.x > alien.x - alien.w / 2 && b.x < alien.x + alien.w / 2 &&
                b.y > alien.y - alien.h / 2 && b.y < alien.y + alien.h / 2) {
                alien.health -= b.dmg; bullets.splice(i, 1);
                if (b.homing) {
                    spawnParticles(b.x, b.y, 15, '#ff6600', 200, 0.5);
                    spawnParticles(b.x, b.y, 10, '#ffaa00', 150, 0.4);
                    playSound('missileHit'); screenShake = 0.2;
                } else {
                    spawnParticles(b.x, b.y, 8, '#ff44ff', 150, 0.3);
                    playSound('hit'); screenShake = 0.12;
                }
                spawnDmg(b.x, b.y, b.dmg);
                if (alien.health <= 0) {
                    winner = 'player'; state = 'gameover';
                    spawnParticles(alien.x, alien.y, 60, '#ff44ff', 300, 1);
                    spawnParticles(alien.x, alien.y, 40, '#ffaa00', 250, 0.8);
                    spawnParticles(alien.x, alien.y, 30, '#00ffff', 200, 0.6);
                    playSound('explosion'); slowMo = 1.5;
                }
                continue;
            }
            // vs clones
            let hitClone = false;
            for (const c of alienClones) {
                if (b.x > c.x - 24 && b.x < c.x + 24 && b.y > c.y - 14 && b.y < c.y + 14) {
                    c.health -= b.dmg; bullets.splice(i, 1);
                    spawnParticles(b.x, b.y, 8, c.style.bodyC, 120, 0.3);
                    spawnDmg(b.x, b.y, b.dmg);
                    if (b.homing) { playSound('missileHit'); screenShake = 0.15; }
                    else { playSound('hit'); screenShake = 0.1; }
                    hitClone = true; break;
                }
            }
            if (hitClone) continue;
        }
        if (b.owner === 'a') {
            // Shield block
            if (player.shieldOn && b.x > player.x - 35 && b.x < player.x + 35 && b.y > player.y - 45 && b.y < player.y + 45) {
                bullets.splice(i, 1); spawnParticles(b.x, b.y, 5, '#4488ff', 80, 0.2); continue;
            }
            // vs player
            if (!player.shieldOn && player.invincible <= 0 &&
                b.x > player.x - player.w / 2 && b.x < player.x + player.w / 2 &&
                b.y > player.y - player.h / 2 && b.y < player.y + player.h / 2) {
                player.health -= b.dmg; bullets.splice(i, 1);
                spawnParticles(b.x, b.y, 8, '#ff4444', 150, 0.3);
                spawnDmg(b.x, b.y, b.dmg); playSound('hit');
                screenShake = 0.15; player.invincible = 0.3;
                if (player.health <= 0) {
                    winner = 'alien'; state = 'gameover';
                    spawnParticles(player.x, player.y, 50, '#ff4444', 300, 1);
                    spawnParticles(player.x, player.y, 40, '#ffaa00', 250, 0.8);
                    playSound('explosion'); slowMo = 1.5;
                }
                continue;
            }
        }
    }

    // Power-up pickup
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        if (Math.abs(p.x - player.x) < 30 && Math.abs(p.y - player.y) < 40) {
            if (p.type === 'health') { player.health = Math.min(player.maxHealth, player.health + 30); spawnParticles(p.x, p.y, 10, '#44ff44', 100, 0.5); }
            else if (p.type === 'rapidfire') { player.rapidFire = diff.rapidFireDur; spawnParticles(p.x, p.y, 10, '#ff8800', 100, 0.5); }
            else if (p.type === 'shield') { player.shieldCD = 0; spawnParticles(p.x, p.y, 10, '#4488ff', 100, 0.5); }
            else if (p.type === 'missile') { player.homingMissiles = diff.missileDur; player.missileTimer = 0; spawnParticles(p.x, p.y, 10, '#ff4444', 100, 0.5); }
            else if (p.type === 'sweep') {
                for (const b of bullets) spawnParticles(b.x, b.y, 4, '#ffffff', 80, 0.3);
                bullets = [];
                for (const c of alienClones) {
                    spawnParticles(c.x, c.y, 20, c.style.bodyC, 200, 0.5);
                    spawnParticles(c.x, c.y, 10, '#ffffff', 150, 0.4);
                }
                alienClones = []; alien.cloneActive = false;
                sweepFlash = 0.6; playSound('explosion'); screenShake = 0.15;
                spawnParticles(p.x, p.y, 15, '#ffffff', 120, 0.5);
            }
            playSound('powerup'); powerUps.splice(i, 1);
        }
    }

    // Car vs alien
    if (player.invincible <= 0 && !alien.hoverOn &&
        Math.abs(player.x - alien.x) < (player.w / 2 + alien.w / 2) &&
        Math.abs(player.y - alien.y) < (player.h / 2 + alien.h / 2)) {
        const crashDmg = 15;
        player.health -= crashDmg; alien.health -= crashDmg;
        player.invincible = 1;
        player.y += player.y > alien.y ? 40 : -40;
        const mx = (player.x + alien.x) / 2, my = (player.y + alien.y) / 2;
        spawnParticles(mx, my, 20, '#ffaa00', 200, 0.5);
        spawnParticles(mx, my, 10, '#ff4444', 150, 0.4);
        spawnDmg(player.x, player.y - 30, crashDmg); spawnDmg(alien.x, alien.y - 20, crashDmg);
        playSound('missileHit'); screenShake = 0.25;
        if (player.health <= 0) { winner = 'alien'; state = 'gameover'; playSound('explosion'); slowMo = 1.5; }
        if (alien.health <= 0) { winner = 'player'; state = 'gameover'; playSound('explosion'); slowMo = 1.5; spawnParticles(alien.x, alien.y, 60, '#ff44ff', 300, 1); }
    }

    // Car vs clones
    if (player.invincible <= 0) {
        for (const c of alienClones) {
            if (Math.abs(player.x - c.x) < (player.w / 2 + 24) && Math.abs(player.y - c.y) < (player.h / 2 + 14)) {
                const crashDmg = 10;
                player.health -= crashDmg; c.health -= crashDmg;
                player.invincible = 1;
                player.y += player.y > c.y ? 35 : -35;
                spawnParticles((player.x + c.x) / 2, (player.y + c.y) / 2, 15, c.style.bodyC, 180, 0.4);
                spawnDmg(player.x, player.y - 30, crashDmg); spawnDmg(c.x, c.y - 20, crashDmg);
                playSound('hit'); screenShake = 0.2;
                if (player.health <= 0) { winner = 'alien'; state = 'gameover'; playSound('explosion'); slowMo = 1.5; }
                break;
            }
        }
    }
}
