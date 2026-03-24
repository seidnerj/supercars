// Game dimensions
const W = 1200, H = 800;
const ROAD_L = 150, ROAD_R = 1050, ROAD_W = 900;
const LANE_COUNT = 6;

// Canvas scaling (updated each frame)
let canvasScale = 1, canvasOffX = 0, canvasOffY = 0;

function updateCanvasScale() {
    const sx = canvas.width / W, sy = canvas.height / H;
    canvasScale = Math.min(sx, sy);
    canvasOffX = (canvas.width - W * canvasScale) / 2;
    canvasOffY = (canvas.height - H * canvasScale) / 2;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.direction = 'rtl';
    updateCanvasScale();
}

// Difficulty settings
const DIFFICULTIES = {
    easy: {
        name: 'קל', color: '#44ff44', desc: 'לשחקנים מתחילים',
        playerHP: 150, playerDmg: 12, missileDmg: 8,
        alienHP: 100, alienSpeed: 170, alienHeal: 2, alienShootCD: 0.8,
        shieldDur: 4, rapidFireDur: 7, missileDur: 6
    },
    medium: {
        name: 'בינוני', color: '#ffcc00', desc: 'האתגר האמיתי',
        playerHP: 100, playerDmg: 10, missileDmg: 5,
        alienHP: 150, alienSpeed: 230, alienHeal: 5, alienShootCD: 0.55,
        shieldDur: 3, rapidFireDur: 5, missileDur: 4
    },
    hard: {
        name: 'קשה', color: '#ff6600', desc: 'החייזר משכפל את עצמו!',
        playerHP: 80, playerDmg: 8, missileDmg: 4,
        alienHP: 200, alienSpeed: 280, alienHeal: 8, alienShootCD: 0.4,
        shieldDur: 2.5, rapidFireDur: 4, missileDur: 3,
        cloneMax: 2, cloneDur: 12
    },
    insane: {
        name: 'מטורף!', color: '#ff2222', desc: 'החייזר משכפל 3 עותקים!',
        playerHP: 60, playerDmg: 6, missileDmg: 3,
        alienHP: 250, alienSpeed: 340, alienHeal: 12, alienShootCD: 0.3,
        shieldDur: 2, rapidFireDur: 3, missileDur: 2,
        cloneMax: 3, cloneDur: 15
    }
};
const diffKeys = ['easy', 'medium', 'hard', 'insane'];
