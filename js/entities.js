let player, alien, bullets, powerUps, trees, portals, alienClones;

function initGame() {
    player = {
        x: W / 2, y: H - 100, w: 40, h: 60,
        health: diff.playerHP, maxHealth: diff.playerHP, speed: 280,
        shootTimer: 0, shootCD: 0.22,
        shieldOn: false, shieldTimer: 0, shieldCD: 0, shieldDur: diff.shieldDur, shieldMaxCD: 12,
        rapidFire: 0, invincible: 0,
        homingMissiles: 0, missileTimer: 0
    };
    alien = {
        x: W / 2, y: 120, w: 50, h: 35,
        health: diff.alienHP, maxHealth: diff.alienHP, speed: diff.alienSpeed,
        shootTimer: 0, shootCD: diff.alienShootCD,
        hoverOn: false, hoverTimer: 0, hoverCD: 7, hoverDur: 3.5,
        targetX: W / 2, targetY: 120, moveTimer: 0,
        taunt: '', tauntTimer: 8, tauntShow: 0,
        cloneCD: 15, cloneActive: false, cloneTimer: 0
    };
    bullets = []; powerUps = []; particles = []; dmgNums = []; portals = []; alienClones = [];
    trees = [];
    for (let i = 0; i < 20; i++) {
        trees.push({
            x: Math.random() < 0.5 ? Math.random() * (ROAD_L - 30) : ROAD_R + 10 + Math.random() * (W - ROAD_R - 40),
            y: Math.random() * H, size: 12 + Math.random() * 18, hue: 90 + Math.random() * 50
        });
    }
    gameTime = 0; scrollOffset = 0; screenShake = 0; slowMo = 0; winner = ''; sweepFlash = 0;
}

function updatePlayer(dt) {
    if (input.left) player.x -= player.speed * dt;
    if (input.right) player.x += player.speed * dt;
    if (input.up) player.y -= player.speed * dt;
    if (input.down) player.y += player.speed * dt;
    player.x = Math.max(ROAD_L + player.w / 2, Math.min(ROAD_R - player.w / 2, player.x));
    player.y = Math.max(H * 0.35, Math.min(H - 40, player.y));

    player.shootTimer -= dt;
    const cd = player.rapidFire > 0 ? 0.08 : player.shootCD;
    if (input.shoot && player.shootTimer <= 0) {
        player.shootTimer = cd;
        bullets.push({ x: player.x - 10, y: player.y - 30, vx: 0, vy: -520, owner: 'p', dmg: diff.playerDmg, w: 4, h: 12 });
        bullets.push({ x: player.x + 10, y: player.y - 30, vx: 0, vy: -520, owner: 'p', dmg: diff.playerDmg, w: 4, h: 12 });
        playSound('shoot');
    }

    if (player.shieldOn) {
        player.shieldTimer -= dt;
        if (player.shieldTimer <= 0) { player.shieldOn = false; player.shieldCD = player.shieldMaxCD; }
    } else {
        player.shieldCD = Math.max(0, player.shieldCD - dt);
        if (input.shield && player.shieldCD <= 0) {
            player.shieldOn = true; player.shieldTimer = player.shieldDur;
            playSound('shield');
        }
    }
    if (player.rapidFire > 0) player.rapidFire -= dt;
    if (player.invincible > 0) player.invincible -= dt;

    // Homing missiles
    if (player.homingMissiles > 0) {
        player.homingMissiles -= dt;
        player.missileTimer -= dt;
        if (player.missileTimer <= 0) {
            player.missileTimer = 0.8;
            const ang = Math.atan2(alien.y - player.y, alien.x - player.x);
            bullets.push({
                x: player.x, y: player.y - 20,
                vx: Math.cos(ang) * 300, vy: Math.sin(ang) * 300,
                owner: 'p', dmg: diff.missileDmg, w: 12, h: 12, homing: true, trail: [], fuel: 3
            });
            playSound('shoot');
        }
    }

    // Exhaust
    if (Math.random() < 0.4) {
        spawnParticles(player.x + (Math.random() - 0.5) * 8, player.y + 30, 1,
            Math.random() < 0.5 ? '#ff6600' : '#ffaa00', 40, 0.25);
    }
}

function updateAlien(dt) {
    alien.moveTimer -= dt;
    if (alien.moveTimer <= 0) {
        alien.moveTimer = 0.8 + Math.random() * 1.5;
        alien.targetX = ROAD_L + 60 + Math.random() * (ROAD_W - 120);
        alien.targetY = 50 + Math.random() * (H * 0.55);
    }

    // Dodge bullets
    for (const b of bullets) {
        if (b.owner === 'p' && Math.abs(b.x - alien.x) < 50 && b.y < alien.y + 80 && b.y > alien.y - 30) {
            alien.targetX = b.x < alien.x ? Math.min(ROAD_R - 30, alien.x + 90) : Math.max(ROAD_L + 30, alien.x - 90);
            alien.moveTimer = 0.3; break;
        }
    }

    const dx = alien.targetX - alien.x, dy = alien.targetY - alien.y;
    alien.x += Math.sign(dx) * Math.min(Math.abs(dx), alien.speed * dt);
    alien.y += Math.sign(dy) * Math.min(Math.abs(dy), alien.speed * dt);
    alien.x = Math.max(ROAD_L + alien.w / 2, Math.min(ROAD_R - alien.w / 2, alien.x));
    alien.y = Math.max(40, Math.min(H * 0.7, alien.y));

    // Hover
    if (alien.hoverOn) {
        alien.hoverTimer -= dt;
        if (alien.hoverTimer <= 0) { alien.hoverOn = false; alien.hoverCD = 8 + Math.random() * 5; }
        if (Math.random() < 0.4) spawnParticles(alien.x, alien.y + 20, 1, '#00ffff', 25, 0.4);
    } else {
        alien.hoverCD -= dt;
        if (alien.hoverCD <= 0 && (alien.health < alien.maxHealth * 0.4 || Math.random() < 0.005)) {
            alien.hoverOn = true; alien.hoverTimer = alien.hoverDur;
        }
    }

    // Shoot
    alien.shootTimer -= dt;
    if (alien.shootTimer <= 0 && !alien.hoverOn) {
        alien.shootTimer = alien.shootCD;
        const ax = player.x + (Math.random() - 0.5) * 50, ay = player.y;
        const ang = Math.atan2(ay - alien.y, ax - alien.x);
        bullets.push({ x: alien.x, y: alien.y + 20, vx: Math.cos(ang) * 320, vy: Math.sin(ang) * 320, owner: 'a', dmg: 8, w: 6, h: 6 });
        playSound('alienShoot');
    }

    // Taunts
    alien.tauntTimer -= dt;
    if (alien.tauntTimer <= 0 && alien.tauntShow <= 0) {
        const ts = ['לא תתפוס אותי! 👽', 'אני מהיר מדי!', 'הא הא הא!', 'נסה שוב!', 'החייזרים שולטים!'];
        alien.taunt = ts[Math.floor(Math.random() * ts.length)];
        alien.tauntShow = 2.5; alien.tauntTimer = 8 + Math.random() * 8;
    }
    if (alien.tauntShow > 0) alien.tauntShow -= dt;

    // Healing
    if (alien.health > 0 && alien.health < alien.maxHealth) {
        alien.health = Math.min(alien.maxHealth, alien.health + diff.alienHeal * dt);
        if (Math.random() < 0.05) spawnParticles(alien.x + (Math.random() - 0.5) * 20, alien.y + (Math.random() - 0.5) * 15, 1, '#44ff88', 30, 0.5);
    }

    // Clones
    if (diff.cloneMax) {
        if (alien.cloneActive) {
            alien.cloneTimer -= dt;
            if (alien.cloneTimer <= 0) {
                alien.cloneActive = false; alien.cloneCD = 20 + Math.random() * 10; alienClones = [];
            }
        } else {
            alien.cloneCD -= dt;
            if (alien.cloneCD <= 0) {
                alien.cloneActive = true; alien.cloneTimer = diff.cloneDur; alienClones = [];
                const cloneStyles = [
                    { hue: 280, bodyC: '#ff77aa', midC: '#cc2266', darkC: '#880044', eyeC: '#ff88cc' },
                    { hue: 180, bodyC: '#77ffee', midC: '#22ccaa', darkC: '#008866', eyeC: '#88ffdd' },
                    { hue: 50, bodyC: '#ffdd55', midC: '#ccaa22', darkC: '#886600', eyeC: '#ffee88' },
                ];
                const cloneHP = Math.round(diff.alienHP / 3);
                for (let i = 0; i < diff.cloneMax; i++) {
                    alienClones.push({
                        x: ROAD_L + 80 + Math.random() * (ROAD_W - 160), y: 50 + Math.random() * (H * 0.5),
                        targetX: W / 2, targetY: 120, moveTimer: 0, shootTimer: Math.random() * 2,
                        alpha: 0.7, health: cloneHP, maxHealth: cloneHP, style: cloneStyles[i % cloneStyles.length]
                    });
                    spawnParticles(alien.x, alien.y, 15, cloneStyles[i % cloneStyles.length].bodyC, 150, 0.5);
                }
            }
        }
    }

    if (Math.random() < 0.2) spawnParticles(alien.x, alien.y + 18, 1, '#aa44ff', 30, 0.3);
}

function updateClones(dt) {
    for (let i = alienClones.length - 1; i >= 0; i--) {
        const c = alienClones[i];
        c.moveTimer -= dt;
        if (c.moveTimer <= 0) {
            c.moveTimer = 0.6 + Math.random() * 1.2;
            c.targetX = ROAD_L + 60 + Math.random() * (ROAD_W - 120);
            c.targetY = 50 + Math.random() * (H * 0.55);
        }
        const dx = c.targetX - c.x, dy = c.targetY - c.y;
        c.x += Math.sign(dx) * Math.min(Math.abs(dx), alien.speed * 0.8 * dt);
        c.y += Math.sign(dy) * Math.min(Math.abs(dy), alien.speed * 0.8 * dt);
        c.x = Math.max(ROAD_L + 25, Math.min(ROAD_R - 25, c.x));
        c.y = Math.max(40, Math.min(H * 0.7, c.y));

        c.shootTimer -= dt;
        if (c.shootTimer <= 0) {
            c.shootTimer = 1.2 + Math.random() * 0.5;
            const ang = Math.atan2(player.y - c.y, player.x + (Math.random() - 0.5) * 80 - c.x);
            bullets.push({ x: c.x, y: c.y + 15, vx: Math.cos(ang) * 280, vy: Math.sin(ang) * 280, owner: 'a', dmg: 5, w: 5, h: 5 });
            playSound('alienShoot');
        }

        if (Math.random() < 0.15) spawnParticles(c.x, c.y + 10, 1, c.style.bodyC, 20, 0.3);

        if (c.health <= 0) {
            spawnParticles(c.x, c.y, 25, c.style.bodyC, 200, 0.6);
            spawnParticles(c.x, c.y, 15, '#ffaa00', 150, 0.4);
            playSound('explosion'); screenShake = 0.15;
            alienClones.splice(i, 1);
        }
    }
}

function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.homing && state === 'playing') {
            b.fuel -= dt;
            if (b.fuel <= 0) {
                spawnParticles(b.x, b.y, 12, '#ff6600', 120, 0.4);
                spawnParticles(b.x, b.y, 8, '#ffaa00', 80, 0.3);
                playSound('missileHit'); bullets.splice(i, 1); continue;
            }
            let tx = alien.x, ty = alien.y;
            if (!b.homingTarget && alienClones.length > 0) {
                const targets = [alien, ...alienClones];
                b.homingTarget = targets[Math.floor(Math.random() * targets.length)];
            }
            if (b.homingTarget && b.homingTarget.health > 0 && (b.homingTarget === alien || alienClones.includes(b.homingTarget))) {
                tx = b.homingTarget.x; ty = b.homingTarget.y;
            }
            const targetAng = Math.atan2(ty - b.y, tx - b.x);
            const currentAng = Math.atan2(b.vy, b.vx);
            let angleDiff = targetAng - currentAng;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            const newAng = currentAng + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 4 * dt);
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            b.vx = Math.cos(newAng) * spd; b.vy = Math.sin(newAng) * spd;
            b.trail.push({ x: b.x, y: b.y });
            if (b.trail.length > 8) b.trail.shift();
        }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y < -20 || b.y > H + 20 || b.x < -20 || b.x > W + 20) bullets.splice(i, 1);
    }
}

function updatePowerUps(dt) {
    if (Math.random() < 0.005) {
        const types = ['health', 'rapidfire', 'shield', 'missile', 'sweep'];
        powerUps.push({
            x: ROAD_L + 40 + Math.random() * (ROAD_W - 80), y: -30,
            type: types[Math.floor(Math.random() * types.length)], size: 15, vy: 140
        });
    }
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += powerUps[i].vy * dt;
        if (powerUps[i].y > H + 30) powerUps.splice(i, 1);
    }
}

function updatePortals(dt) {
    if (Math.random() < 0.002) {
        portals.push({ x: ROAD_L + 50 + Math.random() * (ROAD_W - 100), y: -30, vy: 120, size: 25, life: 8, rotation: 0 });
    }
    for (let i = portals.length - 1; i >= 0; i--) {
        const p = portals[i];
        p.y += p.vy * dt; p.rotation += 3 * dt; p.life -= dt;
        if (Math.random() < 0.3) {
            const a = Math.random() * Math.PI * 2;
            spawnParticles(p.x + Math.cos(a) * p.size, p.y + Math.sin(a) * p.size, 1, Math.random() < 0.5 ? '#aa44ff' : '#44ffff', 30, 0.4);
        }
        if (p.y > H + 40 || p.life <= 0) portals.splice(i, 1);
    }
}

function checkPortalCollision() {
    for (let i = portals.length - 1; i >= 0; i--) {
        const p = portals[i];
        if (Math.abs(p.x - player.x) < 30 && Math.abs(p.y - player.y) < 30) {
            const newX = ROAD_L + 50 + Math.random() * (ROAD_W - 100);
            const newY = H * 0.4 + Math.random() * (H * 0.5);
            spawnParticles(player.x, player.y, 20, '#aa44ff', 200, 0.5);
            spawnParticles(player.x, player.y, 15, '#44ffff', 150, 0.4);
            player.x = newX; player.y = newY;
            spawnParticles(player.x, player.y, 20, '#44ffff', 200, 0.5);
            spawnParticles(player.x, player.y, 15, '#aa44ff', 150, 0.4);
            player.invincible = 0.5; playSound('powerup'); portals.splice(i, 1);
        }
    }
}
