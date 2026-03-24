// Game state
let state = 'menu', countdownTimer = 3, gameTime = 0, scrollOffset = 0;
let screenShake = 0, winner = '', slowMo = 0, paused = false, sweepFlash = 0;
let selectedDiff = 0;
let diff = DIFFICULTIES.medium;

// Handle state transitions from actions
function handleActions() {
    if (state === 'menu') {
        if (hasAction('confirm') || hasAction('tap')) {
            if (!audioCtx) initAudio();
            state = 'difficulty'; lastTapGame = null;
        }
    } else if (state === 'difficulty') {
        // Touch: tap on a difficulty box
        if (hasAction('tap') && lastTapGame) {
            const boxW = 360;
            for (let i = 0; i < 4; i++) {
                const y = 140 + i * 105;
                if (lastTapGame.x > W / 2 - boxW / 2 && lastTapGame.x < W / 2 + boxW / 2 &&
                    lastTapGame.y > y && lastTapGame.y < y + 85) {
                    selectedDiff = i;
                    diff = DIFFICULTIES[diffKeys[selectedDiff]];
                    state = 'countdown'; countdownTimer = 3; initGame();
                    break;
                }
            }
            lastTapGame = null;
        }
        // Keyboard
        if (hasAction('confirm')) {
            diff = DIFFICULTIES[diffKeys[selectedDiff]];
            state = 'countdown'; countdownTimer = 3; initGame();
        }
        if (hasAction('diffUp')) selectedDiff = (selectedDiff - 1 + 4) % 4;
        if (hasAction('diffDown')) selectedDiff = (selectedDiff + 1) % 4;
        if (hasAction('diff0')) selectedDiff = 0;
        if (hasAction('diff1')) selectedDiff = 1;
        if (hasAction('diff2')) selectedDiff = 2;
        if (hasAction('diff3')) selectedDiff = 3;
    } else if (state === 'countdown' || state === 'playing') {
        // Keyboard: Escape toggles pause, second Escape while paused = quit
        if (hasAction('escape')) {
            if (paused) { paused = false; state = 'menu'; }
            else { paused = true; }
        }
        // Keyboard: P toggles pause
        if (hasAction('pause')) {
            paused = !paused;
        }
        // Touch: quit button (X) while paused = go to menu
        if (hasAction('quit')) { paused = false; state = 'menu'; }
        // Touch: tap anywhere while paused = resume
        if (paused && hasAction('tap')) { paused = false; }
    } else if (state === 'gameover') {
        if (hasAction('confirm') || hasAction('tap')) {
            state = 'difficulty'; lastTapGame = null;
        }
    }
}

// Main loop
let lastTime = 0;
function loop(ts) {
    const rawDt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    let dt = rawDt;
    if (slowMo > 0) { dt *= 0.25; slowMo -= rawDt; }
    gameTime += rawDt;

    updateInputFromKeys();
    handleActions();
    updateCanvasScale();

    // Clear and set up scaling
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvasOffX, canvasOffY);
    ctx.scale(canvasScale, canvasScale);

    if (state === 'menu') {
        drawMenu();
    } else if (state === 'difficulty') {
        drawDifficulty();
    } else if (state === 'countdown') {
        if (!paused) {
            countdownTimer -= rawDt;
            if (countdownTimer <= -0.6) state = 'playing';
        }
        drawCountdown();
        if (paused) drawPauseOverlay();
    } else if (state === 'playing') {
        if (!paused) {
            scrollOffset += 280 * dt;
            updatePlayer(dt); updateAlien(dt); updateBullets(dt);
            updatePowerUps(dt); updatePortals(dt); updateClones(dt);
            checkPortalCollision(); checkCollisions();
            updateParticles(dt); updateDmgNums(dt);
            if (screenShake > 0) screenShake -= dt;
        }
        ctx.save();
        if (screenShake > 0) ctx.translate((Math.random() - 0.5) * screenShake * 30, (Math.random() - 0.5) * screenShake * 30);
        drawRoad(); drawPortals(); drawPowerUps(); drawBullets(); drawClones();
        drawAlienShip(); drawPlayerCar(); drawParticles(); drawDmgNums(); drawUI();
        ctx.restore();
        if (sweepFlash > 0) {
            ctx.fillStyle = `rgba(255,255,255,${sweepFlash})`;
            ctx.fillRect(0, 0, W, H); sweepFlash -= dt * 1.5;
        }
        if (paused) drawPauseOverlay();
    } else if (state === 'gameover') {
        updateParticles(rawDt); updateDmgNums(rawDt);
        drawGameOver();
    }

    ctx.restore(); // end game-space scaling

    // Touch controls drawn in screen space (outside scaling)
    drawTouchControls();

    requestAnimationFrame(loop);
}

// Init
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
initGame();
requestAnimationFrame(loop);
