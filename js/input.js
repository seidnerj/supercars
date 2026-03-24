// === Unified input (shared by keyboard & touch) ===
const input = { left: false, right: false, up: false, down: false, shoot: false, shield: false };

// One-shot action queue
let actionQueue = [];
function pushAction(a) { if (!actionQueue.includes(a)) actionQueue.push(a); }
function hasAction(a) { const i = actionQueue.indexOf(a); if (i >= 0) { actionQueue.splice(i, 1); return true; } return false; }

// Touch detection
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Last tap in game-space coordinates (for menu interactions)
let lastTapGame = null;

// === KEYBOARD ===
const keys = {};
window.addEventListener('keydown', e => {
    if (keys[e.code]) return;
    keys[e.code] = true;
    if (e.code === 'Enter' || e.code === 'Space') pushAction('confirm');
    if (e.code === 'Escape') pushAction('escape');
    if (e.code === 'KeyP') pushAction('pause');
    if (e.code === 'ArrowUp' || e.code === 'ArrowRight') pushAction('diffUp');
    if (e.code === 'ArrowDown' || e.code === 'ArrowLeft') pushAction('diffDown');
    if (e.code === 'Digit1') pushAction('diff0');
    if (e.code === 'Digit2') pushAction('diff1');
    if (e.code === 'Digit3') pushAction('diff2');
    if (e.code === 'Digit4') pushAction('diff3');
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function updateInputFromKeys() {
    // Keyboard always feeds into input (touch overrides when active)
    if (!isTouchDevice || joystickTouchId === null) {
        input.left = !!(keys['ArrowLeft'] || keys['KeyA']);
        input.right = !!(keys['ArrowRight'] || keys['KeyD']);
        input.up = !!(keys['ArrowUp'] || keys['KeyW']);
        input.down = !!keys['ArrowDown'];
    }
    if (!isTouchDevice || shootTouchId === null) {
        input.shoot = !!keys['Space'];
    }
    if (!isTouchDevice || shieldTouchId === null) {
        input.shield = !!keys['KeyS'];
    }
}

// === TOUCH ===
let joystickTouchId = null, joystickCenter = null, joystickThumb = null;
let shootTouchId = null, shieldTouchId = null;
const JOY_R = 70, JOY_DEAD = 15;

function canvasTouchPos(touch) {
    const r = canvas.getBoundingClientRect();
    return { x: (touch.clientX - r.left) * (canvas.width / r.width), y: (touch.clientY - r.top) * (canvas.height / r.height) };
}
function touchToGame(cx, cy) {
    return { x: (cx - canvasOffX) / canvasScale, y: (cy - canvasOffY) / canvasScale };
}
function inCircle(px, py, cx, cy, r) { return (px - cx) ** 2 + (py - cy) ** 2 <= r * r; }

// Touch control layout - positioned relative to the game area, not raw canvas
function touchLayout() {
    const gx = canvasOffX, gy = canvasOffY;
    const gw = W * canvasScale, gh = H * canvasScale;
    const s = Math.min(gw, gh) / 600;
    return {
        shootBtn: { x: gx + gw - 70 * s, y: gy + gh - 90 * s, r: 48 * s },
        shieldBtn: { x: gx + gw - 70 * s, y: gy + gh - 200 * s, r: 36 * s },
        pauseBtn: { x: gx + gw - 30 * s, y: gy + 30 * s, r: 22 * s },
        // Game area bounds for joystick zone detection
        gameLeft: gx, gameTop: gy, gameW: gw, gameH: gh
    };
}

if (isTouchDevice) {
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if (!audioCtx) initAudio();
        const lay = touchLayout();

        for (const touch of e.changedTouches) {
            const p = canvasTouchPos(touch);

            // Pause / quit button
            if (inCircle(p.x, p.y, lay.pauseBtn.x, lay.pauseBtn.y, lay.pauseBtn.r)) {
                if (paused) { pushAction('quit'); } else { pushAction('pause'); }
                continue;
            }
            // Shoot
            if (inCircle(p.x, p.y, lay.shootBtn.x, lay.shootBtn.y, lay.shootBtn.r)) {
                shootTouchId = touch.identifier; input.shoot = true; continue;
            }
            // Shield
            if (inCircle(p.x, p.y, lay.shieldBtn.x, lay.shieldBtn.y, lay.shieldBtn.r)) {
                shieldTouchId = touch.identifier; input.shield = true; continue;
            }
            // Left ~40% of game area = joystick zone
            if (p.x >= lay.gameLeft && p.x < lay.gameLeft + lay.gameW * 0.4) {
                joystickTouchId = touch.identifier;
                joystickCenter = { x: p.x, y: p.y };
                joystickThumb = { x: p.x, y: p.y };
                continue;
            }
            // Otherwise = general tap (menus)
            const gp = touchToGame(p.x, p.y);
            lastTapGame = gp;
            pushAction('tap');
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            if (touch.identifier === joystickTouchId && joystickCenter) {
                const p = canvasTouchPos(touch);
                let dx = p.x - joystickCenter.x, dy = p.y - joystickCenter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxR = JOY_R * canvasScale;
                if (dist > maxR) { dx = dx / dist * maxR; dy = dy / dist * maxR; }
                joystickThumb = { x: joystickCenter.x + dx, y: joystickCenter.y + dy };
                const dead = JOY_DEAD * canvasScale;
                input.left = dx < -dead; input.right = dx > dead;
                input.up = dy < -dead; input.down = dy > dead;
            }
        }
    }, { passive: false });

    const endTouch = e => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            if (touch.identifier === joystickTouchId) {
                joystickTouchId = null; joystickCenter = null; joystickThumb = null;
                input.left = input.right = input.up = input.down = false;
            }
            if (touch.identifier === shootTouchId) { shootTouchId = null; input.shoot = false; }
            if (touch.identifier === shieldTouchId) { shieldTouchId = null; input.shield = false; }
        }
    };
    canvas.addEventListener('touchend', endTouch, { passive: false });
    canvas.addEventListener('touchcancel', endTouch, { passive: false });
}

// === Draw touch controls (called in screen space, outside game transform) ===
function drawTouchControls() {
    if (!isTouchDevice) return;
    if (state !== 'playing' && state !== 'countdown') return;

    const lay = touchLayout();

    // Joystick
    const maxR = JOY_R * canvasScale;
    if (joystickCenter) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(joystickCenter.x, joystickCenter.y, maxR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (joystickThumb) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath(); ctx.arc(joystickThumb.x, joystickThumb.y, maxR * 0.38, 0, Math.PI * 2); ctx.fill();
        }
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // Shoot button - crosshair icon
    const sb = lay.shootBtn;
    const pressed = shootTouchId !== null;
    ctx.fillStyle = pressed ? 'rgba(255,50,50,0.5)' : 'rgba(255,50,50,0.2)';
    ctx.strokeStyle = pressed ? 'rgba(255,150,150,0.6)' : 'rgba(255,100,100,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sb.x, sb.y, sb.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Crosshair
    const sl = sb.r * 0.55;
    ctx.strokeStyle = `rgba(255,255,255,${pressed ? 0.9 : 0.65})`;
    ctx.lineWidth = pressed ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(sb.x, sb.y - sl); ctx.lineTo(sb.x, sb.y + sl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sb.x - sl, sb.y); ctx.lineTo(sb.x + sl, sb.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(sb.x, sb.y, sb.r * 0.32, 0, Math.PI * 2); ctx.stroke();

    // Shield button - shield icon
    const shb = lay.shieldBtn;
    const shPressed = shieldTouchId !== null;
    ctx.fillStyle = shPressed ? 'rgba(68,136,255,0.5)' : 'rgba(68,136,255,0.2)';
    ctx.strokeStyle = shPressed ? 'rgba(130,180,255,0.6)' : 'rgba(100,150,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(shb.x, shb.y, shb.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Shield shape
    const ss = shb.r * 0.5;
    ctx.fillStyle = `rgba(100,180,255,${shPressed ? 0.85 : 0.55})`;
    ctx.beginPath();
    ctx.moveTo(shb.x, shb.y - ss);
    ctx.quadraticCurveTo(shb.x + ss, shb.y - ss * 0.6, shb.x + ss, shb.y + ss * 0.1);
    ctx.quadraticCurveTo(shb.x + ss * 0.5, shb.y + ss * 0.9, shb.x, shb.y + ss);
    ctx.quadraticCurveTo(shb.x - ss * 0.5, shb.y + ss * 0.9, shb.x - ss, shb.y + ss * 0.1);
    ctx.quadraticCurveTo(shb.x - ss, shb.y - ss * 0.6, shb.x, shb.y - ss);
    ctx.fill();

    // Pause / quit button
    const pb = lay.pauseBtn;
    ctx.fillStyle = paused ? 'rgba(255,60,60,0.25)' : 'rgba(255,255,255,0.12)';
    ctx.strokeStyle = paused ? 'rgba(255,100,100,0.5)' : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(pb.x, pb.y, pb.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (paused) {
        // X icon (quit)
        const xd = pb.r * 0.4;
        ctx.strokeStyle = 'rgba(255,100,100,0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(pb.x - xd, pb.y - xd); ctx.lineTo(pb.x + xd, pb.y + xd); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pb.x + xd, pb.y - xd); ctx.lineTo(pb.x - xd, pb.y + xd); ctx.stroke();
    } else {
        // Pause bars
        const pw = pb.r * 0.2, ph = pb.r * 0.6, pg = pb.r * 0.18;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillRect(pb.x - pg - pw, pb.y - ph, pw, ph * 2);
        ctx.fillRect(pb.x + pg, pb.y - ph, pw, ph * 2);
    }

    ctx.textBaseline = 'alphabetic';
}
