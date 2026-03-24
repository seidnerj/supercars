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

// Touch control layout (screen-space pixels, scales with screen size)
function touchLayout() {
    const cw = canvas.width, ch = canvas.height;
    const s = Math.min(cw, ch) / 600; // scale factor for small screens
    return {
        shootBtn: { x: cw - 80 * s, y: ch - 100 * s, r: 50 * s },
        shieldBtn: { x: cw - 80 * s, y: ch - 220 * s, r: 38 * s },
        pauseBtn: { x: cw - 35 * s, y: 35 * s, r: 24 * s }
    };
}

if (isTouchDevice) {
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if (!audioCtx) initAudio();
        const lay = touchLayout();

        for (const touch of e.changedTouches) {
            const p = canvasTouchPos(touch);

            // Pause
            if (inCircle(p.x, p.y, lay.pauseBtn.x, lay.pauseBtn.y, lay.pauseBtn.r)) {
                pushAction('escape'); continue;
            }
            // Shoot
            if (inCircle(p.x, p.y, lay.shootBtn.x, lay.shootBtn.y, lay.shootBtn.r)) {
                shootTouchId = touch.identifier; input.shoot = true; continue;
            }
            // Shield
            if (inCircle(p.x, p.y, lay.shieldBtn.x, lay.shieldBtn.y, lay.shieldBtn.r)) {
                shieldTouchId = touch.identifier; input.shield = true; continue;
            }
            // Left ~40% of screen = joystick zone
            if (p.x < canvas.width * 0.4) {
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
                const maxR = JOY_R * (canvas.width / 800);
                if (dist > maxR) { dx = dx / dist * maxR; dy = dy / dist * maxR; }
                joystickThumb = { x: joystickCenter.x + dx, y: joystickCenter.y + dy };
                const dead = JOY_DEAD * (canvas.width / 800);
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
    const maxR = JOY_R * (canvas.width / 800);
    if (joystickCenter) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(joystickCenter.x, joystickCenter.y, maxR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (joystickThumb) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath(); ctx.arc(joystickThumb.x, joystickThumb.y, maxR * 0.38, 0, Math.PI * 2); ctx.fill();
        }
    }

    // Shoot button
    const sb = lay.shootBtn;
    ctx.fillStyle = shootTouchId !== null ? 'rgba(255,50,50,0.45)' : 'rgba(255,50,50,0.2)';
    ctx.strokeStyle = 'rgba(255,100,100,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sb.x, sb.y, sb.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `bold ${Math.round(sb.r * 0.5)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ירי', sb.x, sb.y);

    // Shield button
    const shb = lay.shieldBtn;
    ctx.fillStyle = shieldTouchId !== null ? 'rgba(68,136,255,0.45)' : 'rgba(68,136,255,0.2)';
    ctx.strokeStyle = 'rgba(100,150,255,0.4)';
    ctx.beginPath(); ctx.arc(shb.x, shb.y, shb.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `bold ${Math.round(shb.r * 0.5)}px Arial`;
    ctx.fillText('מגן', shb.x, shb.y);

    // Pause button
    const pb = lay.pauseBtn;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.arc(pb.x, pb.y, pb.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `bold ${Math.round(pb.r * 0.6)}px Arial`;
    ctx.fillText('| |', pb.x, pb.y);

    ctx.textBaseline = 'alphabetic';
}
