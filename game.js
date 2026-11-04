/**
 * Angry Birds HTML5 - Pure Vanilla JS Physics & Game Engine
 * Compatible with Browser (Canvas 2D) and Node.js (Headless Unit/Integration Testing)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AngryBirds = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CONSTANTS = {
    WIDTH: 1280,
    HEIGHT: 720,
    GROUND_Y: 635,
    GRAVITY: 920, // px/s^2
    SLING_X: 230,
    SLING_Y: 500,
    MAX_PULL: 115,
    LAUNCH_POWER: 8.6,
    MATERIALS: {
      glass: {
        hp: 45,
        density: 0.9,
        restitution: 0.25,
        color: "#70d6ff",
        stroke: "#3a86ff",
        score: 500,
      },
      wood: {
        hp: 95,
        density: 1.4,
        restitution: 0.2,
        color: "#d9822b",
        stroke: "#7c4312",
        score: 650,
      },
      stone: {
        hp: 190,
        density: 2.5,
        restitution: 0.12,
        color: "#8d99ae",
        stroke: "#4a4e69",
        score: 900,
      },
    },
    BIRD_TYPES: {
      red: {
        name: "怒红鸟 (冲击波)",
        radius: 19,
        mass: 2.2,
        color: "#e63946",
        belly: "#f4e2d8",
        damageMult: 1.15,
      },
      yellow: {
        name: "飞镖黄 (极速冲刺)",
        radius: 18,
        mass: 2.0,
        color: "#ffbe0b",
        belly: "#fff3b0",
        damageMult: 1.45,
      },
      blue: {
        name: "蓝弟弟 (三重分身)",
        radius: 14,
        mass: 1.4,
        color: "#3a86ff",
        belly: "#caf0f8",
        damageMult: 0.95,
      },
      black: {
        name: "炸弹黑 (高爆震荡)",
        radius: 23,
        mass: 3.1,
        color: "#2b2d42",
        belly: "#8d99ae",
        damageMult: 1.35,
      },
    },
  };

  // Handcrafted Levels
  const LEVELS = [
    {
      id: 0,
      name: "第一关：木屋初探",
      birds: ["red", "yellow", "blue", "black"],
      blocks: [
        // Left & right pillars (first floor)
        { x: 780, y: 575, w: 24, h: 120, mat: "wood" },
        { x: 900, y: 575, w: 24, h: 120, mat: "wood" },
        // First floor roof
        { x: 840, y: 503, w: 165, h: 22, mat: "wood" },
        // Second floor glass pillars
        { x: 800, y: 447, w: 20, h: 90, mat: "glass" },
        { x: 880, y: 447, w: 20, h: 90, mat: "glass" },
        // Second floor roof
        { x: 840, y: 391, w: 130, h: 20, mat: "wood" },
        // Side guard block
        { x: 705, y: 595, w: 28, h: 80, mat: "glass" },
      ],
      pigs: [
        { x: 840, y: 612, r: 22, hp: 50, king: false },
        { x: 840, y: 472, r: 20, hp: 45, king: false },
        { x: 970, y: 613, r: 21, hp: 45, king: false },
      ],
    },
    {
      id: 1,
      name: "第二关：双塔防线",
      birds: ["yellow", "blue", "black", "red"],
      blocks: [
        // Left Tower
        { x: 700, y: 575, w: 24, h: 120, mat: "wood" },
        { x: 790, y: 575, w: 24, h: 120, mat: "wood" },
        { x: 745, y: 503, w: 135, h: 22, mat: "stone" },
        { x: 745, y: 452, w: 70, h: 78, mat: "glass" },

        // Right Tower
        { x: 920, y: 575, w: 26, h: 120, mat: "stone" },
        { x: 1030, y: 575, w: 26, h: 120, mat: "stone" },
        { x: 975, y: 503, w: 155, h: 24, mat: "wood" },
        { x: 940, y: 447, w: 22, h: 88, mat: "wood" },
        { x: 1010, y: 447, w: 22, h: 88, mat: "wood" },
        { x: 975, y: 392, w: 120, h: 20, mat: "glass" },
      ],
      pigs: [
        { x: 745, y: 613, r: 21, hp: 55, king: false },
        { x: 855, y: 615, r: 19, hp: 45, king: false },
        { x: 975, y: 608, r: 26, hp: 80, king: true },
        { x: 975, y: 472, r: 20, hp: 50, king: false },
      ],
    },
    {
      id: 2,
      name: "第三关：猪王要塞",
      birds: ["blue", "yellow", "black", "black", "red"],
      blocks: [
        // Front shield
        { x: 660, y: 580, w: 24, h: 110, mat: "stone" },
        { x: 695, y: 590, w: 22, h: 90, mat: "glass" },

        // Main Fortress Base
        { x: 765, y: 575, w: 28, h: 120, mat: "stone" },
        { x: 895, y: 575, w: 28, h: 120, mat: "stone" },
        { x: 1025, y: 575, w: 28, h: 120, mat: "stone" },

        // Middle beams
        { x: 830, y: 503, w: 128, h: 24, mat: "wood" },
        { x: 960, y: 503, w: 128, h: 24, mat: "wood" },

        // Second tier
        { x: 800, y: 442, w: 22, h: 96, mat: "wood" },
        { x: 895, y: 442, w: 24, h: 96, mat: "glass" },
        { x: 990, y: 442, w: 22, h: 96, mat: "wood" },
        { x: 895, y: 382, w: 230, h: 22, mat: "stone" },

        // Crown spire
        { x: 850, y: 326, w: 20, h: 90, mat: "glass" },
        { x: 940, y: 326, w: 20, h: 90, mat: "glass" },
        { x: 895, y: 270, w: 120, h: 20, mat: "wood" },
      ],
      pigs: [
        { x: 830, y: 612, r: 21, hp: 55, king: false },
        { x: 960, y: 612, r: 21, hp: 55, king: false },
        { x: 848, y: 470, r: 20, hp: 50, king: false },
        { x: 942, y: 470, r: 20, hp: 50, king: false },
        { x: 895, y: 344, r: 27, hp: 95, king: true },
      ],
    },
  ];

  // Web Audio Synthesizer (no external audio assets required)
  class SoundEffects {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    _ensureCtx() {
      if (!this.enabled) return null;
      if (typeof window === "undefined") return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    playLaunch() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(190, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }

    playHit(intensity = 1) {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const freq = Math.min(240, 85 + intensity * 12);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.11);
      gain.gain.setValueAtTime(Math.min(0.22, 0.04 * intensity), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }

    playPigPop() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    }

    playExplosion() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    }

    playWin() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const start = ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    }
  }

  class AngryBirdsEngine {
    constructor(options = {}) {
      this.canvas = options.canvas || null;
      this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
      this.onUIUpdate = options.onUIUpdate || (() => {});
      this.onLevelEnd = options.onLevelEnd || (() => {});
      this.sfx = new SoundEffects();

      this.currentLevelIndex = 0;
      this.score = 0;
      this.bestScores = { 0: 0, 1: 0, 2: 0 };

      this.state = "READY"; // READY, AIMING, FLYING, SETTLING, WON, LOST
      this.birdQueue = [];
      this.activeBirds = [];
      this.blocks = [];
      this.pigs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.shockwaves = [];

      this.aimPos = { x: CONSTANTS.SLING_X, y: CONSTANTS.SLING_Y };
      this.isDragging = false;
      this.settleTimer = 0;
      this.autoDemo = null;
      this.clouds = [
        { x: 180, y: 110, s: 1.0, v: 8 },
        { x: 540, y: 80, s: 1.3, v: 6 },
        { x: 920, y: 130, s: 0.9, v: 10 },
        { x: 1160, y: 95, s: 1.15, v: 7 },
      ];

      this.loadLevel(0);
    }

    loadLevel(levelIdx) {
      const idx = Math.max(0, Math.min(LEVELS.length - 1, levelIdx));
      this.currentLevelIndex = idx;
      const tpl = LEVELS[idx];

      this.score = 0;
      this.state = "READY";
      this.isDragging = false;
      this.settleTimer = 0;
      this.autoDemo = null;
      this.aimPos = { x: CONSTANTS.SLING_X, y: CONSTANTS.SLING_Y };

      this.birdQueue = tpl.birds.slice();
      this.activeBirds = [];
      this.particles = [];
      this.floatingTexts = [];
      this.shockwaves = [];

      this.blocks = tpl.blocks.map((b, i) => {
        const mat = CONSTANTS.MATERIALS[b.mat] || CONSTANTS.MATERIALS.wood;
        return {
          id: `block-${i}`,
          x: b.x,
          y: b.y,
          w: b.w,
          h: b.h,
          vx: 0,
          vy: 0,
          angle: 0,
          va: 0,
          matName: b.mat,
          mat,
          hp: mat.hp,
          maxHp: mat.hp,
          mass: (b.w * b.h * mat.density) / 900,
          destroyed: false,
        };
      });

      this.pigs = tpl.pigs.map((p, i) => ({
        id: `pig-${i}`,
        x: p.x,
        y: p.y,
        r: p.r,
        vx: 0,
        vy: 0,
        angle: 0,
        va: 0,
        hp: p.hp,
        maxHp: p.hp,
        king: Boolean(p.king),
        mass: (p.r * p.r) / 550,
        blinkTimer: Math.random() * 3,
        destroyed: false,
      }));

      this._spawnNextBirdOnSling();
      this._notifyUI();
    }

    _spawnNextBirdOnSling() {
      if (this.birdQueue.length === 0) {
        this.activeBirds = [];
        return false;
      }
      const typeKey = this.birdQueue.shift();
      const spec = CONSTANTS.BIRD_TYPES[typeKey] || CONSTANTS.BIRD_TYPES.red;
      this.activeBirds = [
        {
          type: typeKey,
          spec,
          x: CONSTANTS.SLING_X,
          y: CONSTANTS.SLING_Y,
          r: spec.radius,
          vx: 0,
          vy: 0,
          angle: 0,
          va: 0,
          mass: spec.mass,
          launched: false,
          skillUsed: false,
          trail: [],
          restTime: 0,
        },
      ];
      this.aimPos = { x: CONSTANTS.SLING_X, y: CONSTANTS.SLING_Y };
      this.state = "READY";
      return true;
    }

    getRemainingBirdsCount() {
      const onSling =
        this.activeBirds.length > 0 && !this.activeBirds[0].launched ? 1 : 0;
      return this.birdQueue.length + onSling;
    }

    getAlivePigsCount() {
      return this.pigs.filter((p) => !p.destroyed).length;
    }

    clampPullVector(targetX, targetY) {
      const dx = targetX - CONSTANTS.SLING_X;
      const dy = targetY - CONSTANTS.SLING_Y;
      const dist = Math.hypot(dx, dy);
      if (dist <= CONSTANTS.MAX_PULL || dist === 0) {
        return { x: targetX, y: targetY };
      }
      const ratio = CONSTANTS.MAX_PULL / dist;
      return {
        x: CONSTANTS.SLING_X + dx * ratio,
        y: CONSTANTS.SLING_Y + dy * ratio,
      };
    }

    computeLaunchVelocity(pullX, pullY) {
      const clamped = this.clampPullVector(pullX, pullY);
      const dx = CONSTANTS.SLING_X - clamped.x;
      const dy = CONSTANTS.SLING_Y - clamped.y;
      return {
        vx: dx * CONSTANTS.LAUNCH_POWER,
        vy: dy * CONSTANTS.LAUNCH_POWER,
        pullDist: Math.hypot(dx, dy),
      };
    }

    startAim(x, y) {
      if (this.state !== "READY" || this.activeBirds.length === 0) return false;
      const bird = this.activeBirds[0];
      const dist = Math.hypot(x - bird.x, y - bird.y);
      if (dist > 75) return false;
      this.isDragging = true;
      this.state = "AIMING";
      this.updateAim(x, y);
      return true;
    }

    updateAim(x, y) {
      if (!this.isDragging || this.state !== "AIMING") return;
      const clamped = this.clampPullVector(x, y);
      // Prevent dragging below ground
      clamped.y = Math.min(CONSTANTS.GROUND_Y - 22, clamped.y);
      this.aimPos = clamped;
      if (this.activeBirds[0]) {
        this.activeBirds[0].x = clamped.x;
        this.activeBirds[0].y = clamped.y;
      }
    }

    releaseAim() {
      if (!this.isDragging || this.state !== "AIMING") return false;
      this.isDragging = false;
      const { vx, vy, pullDist } = this.computeLaunchVelocity(
        this.aimPos.x,
        this.aimPos.y
      );
      if (pullDist < 16) {
        // Snap back if barely pulled
        this.aimPos = { x: CONSTANTS.SLING_X, y: CONSTANTS.SLING_Y };
        if (this.activeBirds[0]) {
          this.activeBirds[0].x = CONSTANTS.SLING_X;
          this.activeBirds[0].y = CONSTANTS.SLING_Y;
        }
        this.state = "READY";
        return false;
      }
      return this.launchBirdWithVelocity(vx, vy);
    }

    launchBirdWithVelocity(vx, vy) {
      if (this.activeBirds.length === 0) return false;
      const bird = this.activeBirds[0];
      bird.vx = vx;
      bird.vy = vy;
      bird.launched = true;
      bird.trail = [];
      this.state = "FLYING";
      this.settleTimer = 0;
      this.sfx.playLaunch();
      this._notifyUI();
      return true;
    }

    triggerBirdSkill() {
      if (this.state !== "FLYING" || this.activeBirds.length === 0) return false;
      const mainBird = this.activeBirds[0];
      if (!mainBird.launched || mainBird.skillUsed) return false;

      mainBird.skillUsed = true;

      if (mainBird.type === "yellow") {
        // Speed boost forward
        const speed = Math.hypot(mainBird.vx, mainBird.vy) || 400;
        const angle = Math.atan2(mainBird.vy, mainBird.vx);
        const boosted = Math.max(speed * 1.85, 880);
        mainBird.vx = Math.cos(angle) * boosted;
        mainBird.vy = Math.sin(angle) * boosted * 0.45;
        this._spawnParticles(mainBird.x, mainBird.y, "#ffbe0b", 18, 260);
        this._addFloatingText("⚡ 极速冲刺!", mainBird.x, mainBird.y - 28, "#ffbe0b");
        this.sfx.playLaunch();
        return true;
      }

      if (mainBird.type === "blue") {
        // Split into 3 birds
        const baseAngle = Math.atan2(mainBird.vy, mainBird.vx);
        const speed = Math.hypot(mainBird.vx, mainBird.vy);
        const spread = [-0.22, 0.22];
        spread.forEach((delta) => {
          const ang = baseAngle + delta;
          this.activeBirds.push({
            type: "blue",
            spec: mainBird.spec,
            x: mainBird.x,
            y: mainBird.y + (delta < 0 ? -12 : 12),
            r: mainBird.r,
            vx: Math.cos(ang) * speed * 1.05,
            vy: Math.sin(ang) * speed * 1.05,
            angle: 0,
            va: 0,
            mass: mainBird.mass,
            launched: true,
            skillUsed: true,
            trail: [],
            restTime: 0,
          });
        });
        this._spawnParticles(mainBird.x, mainBird.y, "#3a86ff", 16, 220);
        this._addFloatingText("✨ 三重分身!", mainBird.x, mainBird.y - 28, "#70d6ff");
        this.sfx.playLaunch();
        return true;
      }

      if (mainBird.type === "black") {
        this._triggerExplosion(mainBird.x, mainBird.y, 175, 210);
        mainBird.restTime = 99; // Finish bird flight shortly after explosion
        return true;
      }

      if (mainBird.type === "red") {
        // Red bird battle cry shockwave
        this._triggerExplosion(mainBird.x, mainBird.y, 125, 95);
        this._addFloatingText("💢 怒火冲击!", mainBird.x, mainBird.y - 28, "#ff4d6d");
        return true;
      }

      return false;
    }

    /**
     * AI Auto-Play Demo: Clears Level 1 with just 1 bird (3 Stars, 45,650 pts)
     * 1) Pulls slingshot to (SLING_X - 109, SLING_Y + 35) -> angle ~ -17.8 deg
     * 2) Releases to pierce the front glass guard and enter the ground floor
     * 3) Triggers Red Bird shockwave at x >= 820 to blast both indoor pigs and topple the right wall onto the 3rd pig
     */
    startOneBirdDemo() {
      this.loadLevel(0);
      const targetX = CONSTANTS.SLING_X - 109;
      const targetY = CONSTANTS.SLING_Y + 35;
      this.startAim(CONSTANTS.SLING_X, CONSTANTS.SLING_Y);
      this.autoDemo = {
        timer: 0,
        pullDuration: 1.05,
        holdDuration: 0.45,
        targetX,
        targetY,
        launched: false,
        skillTriggered: false,
        skillTriggerX: 820,
        statusText: "🤖 AI 演示：向后拉动弹弓至 (-109, +35)，仰角约 17.8°...",
      };
      return true;
    }

    _triggerExplosion(cx, cy, radius, maxDamage) {
      this.shockwaves.push({ x: cx, y: cy, r: 10, maxR: radius, alpha: 1 });
      this._spawnParticles(cx, cy, "#ff5400", 28, 340);
      this._spawnParticles(cx, cy, "#ffbd00", 18, 220);
      this.sfx.playExplosion();

      // Affect blocks
      for (const b of this.blocks) {
        if (b.destroyed) continue;
        const dist = Math.hypot(b.x - cx, b.y - cy);
        if (dist < radius) {
          const factor = 1 - dist / radius;
          const nx = (b.x - cx) / (dist || 1);
          const ny = (b.y - cy) / (dist || 1);
          b.vx += nx * 520 * factor;
          b.vy += (ny - 0.35) * 520 * factor;
          b.va += (Math.random() - 0.5) * 8 * factor;
          this._damageBlock(b, maxDamage * factor);
        }
      }

      // Affect pigs
      for (const p of this.pigs) {
        if (p.destroyed) continue;
        const dist = Math.hypot(p.x - cx, p.y - cy);
        if (dist < radius) {
          const factor = 1 - dist / radius;
          const nx = (p.x - cx) / (dist || 1);
          const ny = (p.y - cy) / (dist || 1);
          p.vx += nx * 560 * factor;
          p.vy += (ny - 0.4) * 560 * factor;
          this._damagePig(p, maxDamage * 1.15 * factor);
        }
      }
    }

    step(dt) {
      const clampedDt = Math.min(dt, 0.033);

      // Update clouds
      for (const c of this.clouds) {
        c.x += c.v * clampedDt;
        if (c.x > CONSTANTS.WIDTH + 120) c.x = -120;
      }

      // Update visual particles & floating texts
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.x += pt.vx * clampedDt;
        pt.y += pt.vy * clampedDt;
        pt.vy += CONSTANTS.GRAVITY * 0.65 * clampedDt;
        pt.life -= clampedDt;
        if (pt.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 38 * clampedDt;
        ft.life -= clampedDt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }

      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.r += (sw.maxR - sw.r) * 10 * clampedDt;
        sw.alpha -= 2.4 * clampedDt;
        if (sw.alpha <= 0) this.shockwaves.splice(i, 1);
      }

      // Sub-stepping for stable rigid body stacking & collisions (continues even after WON/LOST so debris settles naturally)
      const subSteps = 3;
      const subDt = clampedDt / subSteps;
      for (let s = 0; s < subSteps; s++) {
        this._physicsSubStep(subDt);
      }

      if (this.state === "WON" || this.state === "LOST") {
        return;
      }

      // Update AI Auto-Demo controller if active
      if (this.autoDemo) {
        this.autoDemo.timer += clampedDt;
        const d = this.autoDemo;
        if (!d.launched) {
          const progress = Math.min(1, d.timer / d.pullDuration);
          // Smooth ease-out interpolation
          const ease = 1 - Math.pow(1 - progress, 3);
          const curX =
            CONSTANTS.SLING_X + (d.targetX - CONSTANTS.SLING_X) * ease;
          const curY =
            CONSTANTS.SLING_Y + (d.targetY - CONSTANTS.SLING_Y) * ease;
          this.updateAim(curX, curY);

          if (d.timer >= d.pullDuration && d.timer < d.pullDuration + d.holdDuration) {
            d.statusText =
              "🎯 瞄准完成：轨迹穿过前排玻璃护盾直达一楼核心，准备发射！";
          } else if (d.timer >= d.pullDuration + d.holdDuration) {
            d.launched = true;
            d.statusText =
              "🚀 已发射！等待红鸟突入木屋内部 (x ≈ 820) 触发【怒火冲击】...";
            this.releaseAim();
          }
        } else if (
          !d.skillTriggered &&
          this.activeBirds[0] &&
          this.activeBirds[0].x >= d.skillTriggerX
        ) {
          d.skillTriggered = true;
          d.statusText =
            "💥 触发怒红鸟特技！震碎一二楼绿猪并推倒右墙砸扁第三只绿猪！";
          this.triggerBirdSkill();
        }
      }

      this._evaluateTurnAndWinState(clampedDt);
    }

    _physicsSubStep(dt) {
      // 1. Update Active Birds
      for (const bird of this.activeBirds) {
        if (!bird.launched) continue;

        bird.vy += CONSTANTS.GRAVITY * dt;
        bird.x += bird.vx * dt;
        bird.y += bird.vy * dt;
        bird.angle += bird.va * dt;

        // Record trajectory trail
        if (
          bird.trail.length === 0 ||
          Math.hypot(
            bird.x - bird.trail[bird.trail.length - 1].x,
            bird.y - bird.trail[bird.trail.length - 1].y
          ) > 18
        ) {
          bird.trail.push({ x: bird.x, y: bird.y });
          if (bird.trail.length > 42) bird.trail.shift();
        }

        // Ground collision
        if (bird.y + bird.r > CONSTANTS.GROUND_Y) {
          bird.y = CONSTANTS.GROUND_Y - bird.r;
          if (Math.abs(bird.vy) > 90) {
            bird.vy = -bird.vy * 0.42;
          } else {
            bird.vy = 0;
          }
          bird.vx *= Math.pow(0.28, dt);
          bird.va = bird.vx / bird.r;
        }

        // Screen boundaries
        if (bird.x - bird.r < 0) {
          bird.x = bird.r;
          bird.vx = Math.abs(bird.vx) * 0.5;
        } else if (bird.x - bird.r > CONSTANTS.WIDTH + 100) {
          bird.restTime = 99;
        }

        const speed = Math.hypot(bird.vx, bird.vy);
        if (speed < 28 && bird.y + bird.r >= CONSTANTS.GROUND_Y - 3) {
          bird.restTime += dt;
        } else {
          bird.restTime += dt * 0.18;
        }
      }

      // 2. Update Blocks (Rigid Body with 4-corner ground contact & toppling torque)
      for (const b of this.blocks) {
        if (b.destroyed) continue;
        b.vy += CONSTANTS.GRAVITY * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.angle += b.va * dt;

        // Air damping
        b.vx *= Math.pow(0.98, dt);
        b.va *= Math.pow(0.92, dt);

        // Ground collision using actual 4 rotated corners
        const corners = this._getBlockCorners(b);
        let maxPen = 0;
        let contactXSum = 0;
        let contactCount = 0;
        for (const pt of corners) {
          const pen = pt.y - CONSTANTS.GROUND_Y;
          if (pen > 0) {
            if (pen > maxPen) maxPen = pen;
          }
          if (pen > -1.5) {
            contactXSum += pt.x;
            contactCount++;
          }
        }

        if (maxPen > 0) {
          b.y -= maxPen;
          const impactVy = Math.abs(b.vy);
          if (b.vy > 0) {
            b.vy = impactVy > 130 ? -b.vy * b.mat.restitution : 0;
          }

          // Determine whether the block is currently near an upright narrow-end orientation
          const quarterTurns = Math.round(b.angle / (Math.PI / 2));
          const nearestRightAngle = quarterTurns * (Math.PI / 2);
          const isEvenTurn = Math.abs(quarterTurns % 2) === 0;
          const standingWidth = isEvenTurn ? b.w : b.h;
          const standingHeight = isEvenTurn ? b.h : b.w;
          const isNarrowEnd = standingHeight > standingWidth * 1.35;

          // Ground friction at the base of a tall standing block induces forward tipping torque
          if (isNarrowEnd && Math.abs(b.vx) > 12) {
            b.va += b.vx * 0.15 * dt;
          }
          b.vx *= Math.pow(0.08, dt);

          const tiltFromNearest = b.angle - nearestRightAngle;
          let targetAngle = nearestRightAngle;
          if (
            isNarrowEnd &&
            (Math.abs(tiltFromNearest) > 0.1 || Math.abs(b.va) > 0.45)
          ) {
            // Tilted or actively tipping past narrow-end balance: target the flat 90-degree side
            const dir =
              Math.abs(tiltFromNearest) > 0.05
                ? Math.sign(tiltFromNearest)
                : Math.sign(b.va || 1);
            targetAngle = nearestRightAngle + dir * (Math.PI / 2);
          }

          const toTarget = targetAngle - b.angle;
          if (!isNarrowEnd && Math.abs(toTarget) < 0.32) {
            // Landed on wide flat side: immediately arrest spin and settle flat onto ground
            b.angle += toTarget * 0.65;
            if (Math.abs(toTarget) < 0.08) b.angle = targetAngle;
            b.va = 0;
            b.vx *= 0.75;
          } else if (Math.abs(toTarget) > 0.12) {
            b.va += Math.sign(toTarget) * (14 + Math.abs(toTarget) * 8) * dt;
            b.vx += Math.sign(toTarget) * 14 * dt;
          } else {
            // Upright narrow-end with tiny tilt and low angular velocity: settle upright
            b.angle = targetAngle;
            b.va = 0;
            b.vx *= 0.8;
          }

          if (impactVy > 240) {
            this._damageBlock(b, (impactVy - 220) * 0.24);
          }
        }
      }

      // 3. Update Pigs
      for (const p of this.pigs) {
        if (p.destroyed) continue;
        p.blinkTimer -= dt;
        if (p.blinkTimer < -0.15) p.blinkTimer = 2 + Math.random() * 3;

        p.vy += CONSTANTS.GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.va * dt;

        if (p.y + p.r > CONSTANTS.GROUND_Y) {
          const impact = Math.hypot(p.vx, p.vy);
          p.y = CONSTANTS.GROUND_Y - p.r;
          p.vy = Math.abs(p.vy) > 95 ? -p.vy * 0.32 : 0;
          p.vx *= Math.pow(0.22, dt);
          p.va = p.vx / p.r;
          if (impact > 220) {
            this._damagePig(p, (impact - 200) * 0.24);
          }
        }

        if (p.x - p.r > CONSTANTS.WIDTH + 50 || p.x + p.r < -50) {
          this._damagePig(p, 999);
        }
      }

      // 4. Bird vs Block & Bird vs Pig Collisions
      for (const bird of this.activeBirds) {
        if (!bird.launched) continue;

        for (const b of this.blocks) {
          if (b.destroyed) continue;
          const col = this._circleRectCollision(bird, b);
          if (col) {
            this._resolveCircleRectImpulse(bird, b, col);
            const relSpeed = Math.hypot(bird.vx - b.vx, bird.vy - b.vy);
            if (relSpeed > 65) {
              const dmg =
                relSpeed * 0.21 * bird.spec.damageMult * (bird.mass / 2.0);
              this._damageBlock(b, dmg);
              this.sfx.playHit( dmg / 25 );
              if (bird.type === "black" && !bird.skillUsed && relSpeed > 220) {
                // Black bomb bird auto-detonates shortly after strong impact if not manually triggered
                bird.skillUsed = true;
                this._triggerExplosion(bird.x, bird.y, 165, 195);
              }
            }
          }
        }

        for (const p of this.pigs) {
          if (p.destroyed) continue;
          const col = this._circleCircleCollision(bird, p);
          if (col) {
            this._resolveCircleCircleImpulse(bird, p, col, 0.45);
            const relSpeed = Math.hypot(bird.vx - p.vx, bird.vy - p.vy);
            if (relSpeed > 45) {
              const dmg = relSpeed * 0.34 * bird.spec.damageMult;
              this._damagePig(p, dmg);
            }
          }
        }
      }

      // 5. Block vs Pig Collisions (falling/toppling/sliding wood & stone crushes pigs!)
      for (const b of this.blocks) {
        if (b.destroyed) continue;
        for (const p of this.pigs) {
          if (p.destroyed) continue;
          const col = this._circleRectCollision(p, b);
          if (col) {
            const rx = (col.contactX ?? p.x) - b.x;
            const ry = (col.contactY ?? p.y) - b.y;
            const bPointVx = b.vx - b.va * ry;
            const bPointVy = b.vy + b.va * rx;
            const relSpeed = Math.hypot(bPointVx - p.vx, bPointVy - p.vy);
            const blockTipSpeed =
              Math.hypot(b.vx, b.vy) + Math.abs(b.va) * Math.max(b.w, b.h) * 0.48;
            this._resolveCircleRectImpulse(p, b, col);

            // col.ny > -0.25 means the block is hitting the pig from above or the side (not acting as the floor beneath the pig)
            if (col.ny > -0.25) {
              const effectiveSpeed = Math.max(relSpeed, blockTipSpeed);
              if (effectiveSpeed > 28) {
                const crushMult = col.ny > 0.2 ? 1.85 : 1.35;
                const dmg =
                  (effectiveSpeed - 18) * 1.15 * (b.mat.density / 1.0) * crushMult;
                this._damagePig(p, dmg);
                this._damageBlock(b, effectiveSpeed * 0.06);
              }
            } else if (relSpeed > 95) {
              this._damagePig(p, (relSpeed - 75) * 0.55 * (b.mat.density / 1.0));
              this._damageBlock(b, relSpeed * 0.06);
            }
          }
        }
      }

      // 6. Block vs Block Stacking & Collisions (Oriented Bounding Box SAT + Cantilever Torque)
      const activeBlocks = this.blocks
        .filter((b) => !b.destroyed)
        .sort((a, b) => b.y - a.y);

      for (const b of activeBlocks) {
        b._supportMinX = Infinity;
        b._supportMaxX = -Infinity;
        b._supportedByGround = false;
        const corners = this._getBlockCorners(b);
        for (const pt of corners) {
          if (pt.y >= CONSTANTS.GROUND_Y - 2.5) {
            b._supportedByGround = true;
            if (pt.x < b._supportMinX) b._supportMinX = pt.x;
            if (pt.x > b._supportMaxX) b._supportMaxX = pt.x;
          }
        }
      }

      for (let i = 0; i < activeBlocks.length; i++) {
        for (let j = i + 1; j < activeBlocks.length; j++) {
          const b1 = activeBlocks[i];
          const b2 = activeBlocks[j];
          this._resolveBlockBlockOBB(b1, b2, dt);
        }
      }

      // Apply tipping torque if an elevated block's center of mass hangs outside its support span
      for (const b of activeBlocks) {
        if (!b._supportedByGround && b._supportMinX <= b._supportMaxX) {
          const margin = 3;
          if (b.x < b._supportMinX - margin) {
            const overhang = b._supportMinX - b.x;
            b.va -= (9 + overhang * 0.38) * dt;
            b.vx -= 18 * dt;
          } else if (b.x > b._supportMaxX + margin) {
            const overhang = b.x - b._supportMaxX;
            b.va += (9 + overhang * 0.38) * dt;
            b.vx += 18 * dt;
          } else {
            // Center of mass is supported on a flat block below: settle flat or topple if narrow-end tilted
            const qTurns = Math.round(b.angle / (Math.PI / 2));
            const nearest = qTurns * (Math.PI / 2);
            const isEven = Math.abs(qTurns % 2) === 0;
            const stW = isEven ? b.w : b.h;
            const stH = isEven ? b.h : b.w;
            const isNarrow = stH > stW * 1.35;
            const tilt = b.angle - nearest;
            let target = nearest;
            if (isNarrow && (Math.abs(tilt) > 0.12 || Math.abs(b.va) > 0.5)) {
              const dir =
                Math.abs(tilt) > 0.05 ? Math.sign(tilt) : Math.sign(b.va || 1);
              target = nearest + dir * (Math.PI / 2);
            }
            const toTarget = target - b.angle;
            if (!isNarrow && Math.abs(toTarget) < 0.35) {
              b.angle += toTarget * 0.55;
              if (Math.abs(toTarget) < 0.08) b.angle = target;
              b.va = 0;
            } else if (Math.abs(toTarget) > 0.12) {
              b.va += Math.sign(toTarget) * (12 + Math.abs(toTarget) * 6) * dt;
            } else if (Math.abs(b.va) < 0.35) {
              b.angle = target;
              b.va = 0;
            }
          }
        }
      }
    }

    _getBlockCorners(b) {
      const c = Math.cos(b.angle);
      const s = Math.sin(b.angle);
      const hw = b.w / 2;
      const hh = b.h / 2;
      return [
        { x: b.x - hw * c + hh * s, y: b.y - hw * s - hh * c },
        { x: b.x + hw * c + hh * s, y: b.y + hw * s - hh * c },
        { x: b.x + hw * c - hh * s, y: b.y + hw * s + hh * c },
        { x: b.x - hw * c - hh * s, y: b.y - hw * s + hh * c },
      ];
    }

    _circleCircleCollision(c1, c2) {
      const dx = c2.x - c1.x;
      const dy = c2.y - c1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = c1.r + c2.r;
      if (dist >= minDist) return null;
      const nx = dist === 0 ? 1 : dx / dist;
      const ny = dist === 0 ? 0 : dy / dist;
      return { overlap: minDist - dist, nx, ny };
    }

    _resolveCircleCircleImpulse(c1, c2, col, restitution = 0.4) {
      const totalMass = c1.mass + c2.mass;
      c1.x -= col.nx * col.overlap * (c2.mass / totalMass);
      c1.y -= col.ny * col.overlap * (c2.mass / totalMass);
      c2.x += col.nx * col.overlap * (c1.mass / totalMass);
      c2.y += col.ny * col.overlap * (c1.mass / totalMass);

      const rvx = c2.vx - c1.vx;
      const rvy = c2.vy - c1.vy;
      const velAlongNormal = rvx * col.nx + rvy * col.ny;
      if (velAlongNormal > 0) return;

      const j =
        (-(1 + restitution) * velAlongNormal) / (1 / c1.mass + 1 / c2.mass);
      const ix = j * col.nx;
      const iy = j * col.ny;

      c1.vx -= ix / c1.mass;
      c1.vy -= iy / c1.mass;
      c2.vx += ix / c2.mass;
      c2.vy += iy / c2.mass;
    }

    _circleRectCollision(circle, rect) {
      // Transform circle center into rect's local oriented frame
      const dx = circle.x - rect.x;
      const dy = circle.y - rect.y;
      const c = Math.cos(-rect.angle);
      const s = Math.sin(-rect.angle);
      const localX = dx * c - dy * s;
      const localY = dx * s + dy * c;

      const halfW = rect.w / 2;
      const halfH = rect.h / 2;
      const closestX = Math.max(-halfW, Math.min(localX, halfW));
      const closestY = Math.max(-halfH, Math.min(localY, halfH));
      const ldx = localX - closestX;
      const ldy = localY - closestY;
      const distSq = ldx * ldx + ldy * ldy;
      if (distSq >= circle.r * circle.r) return null;

      const dist = Math.sqrt(distSq);
      let lnx, lny, overlap;
      if (dist === 0) {
        lnx = 0;
        lny = -1;
        overlap = circle.r;
      } else {
        lnx = ldx / dist;
        lny = ldy / dist;
        overlap = circle.r - dist;
      }
      // Rotate normal and contact point back to world space
      const wc = Math.cos(rect.angle);
      const ws = Math.sin(rect.angle);
      const nx = lnx * wc - lny * ws;
      const ny = lnx * ws + lny * wc;
      const contactX = rect.x + closestX * wc - closestY * ws;
      const contactY = rect.y + closestX * ws + closestY * wc;
      return { nx, ny, overlap, contactX, contactY };
    }

    _resolveCircleRectImpulse(circle, rect, col) {
      const totalMass = circle.mass + rect.mass;
      circle.x += col.nx * col.overlap * (rect.mass / totalMass);
      circle.y += col.ny * col.overlap * (rect.mass / totalMass);
      rect.x -= col.nx * col.overlap * (circle.mass / totalMass);
      rect.y -= col.ny * col.overlap * (circle.mass / totalMass);

      const rx = (col.contactX ?? circle.x) - rect.x;
      const ry = (col.contactY ?? circle.y) - rect.y;
      const rectPointVx = rect.vx - rect.va * ry;
      const rectPointVy = rect.vy + rect.va * rx;

      const rvx = circle.vx - rectPointVx;
      const rvy = circle.vy - rectPointVy;
      const normalVel = rvx * col.nx + rvy * col.ny;
      if (normalVel > 0) return;

      const e = rect.mat ? rect.mat.restitution : 0.25;
      const j = (-(1 + e) * normalVel) / (1 / circle.mass + 1 / rect.mass);
      const ix = j * col.nx;
      const iy = j * col.ny;

      circle.vx += ix / circle.mass;
      circle.vy += iy / circle.mass;
      rect.vx -= ix / rect.mass;
      rect.vy -= iy / rect.mass;

      // Apply realistic torque around rect center of mass
      const torqueImpulse = rx * -iy - ry * -ix;
      const inertia = rect.mass * (rect.w * rect.w + rect.h * rect.h) * 0.12;
      rect.va += torqueImpulse / Math.max(40, inertia);
    }

    _resolveBlockBlockOBB(b1, b2, dt) {
      const c1 = this._getBlockCorners(b1);
      const c2 = this._getBlockCorners(b2);

      const axes = [
        { x: Math.cos(b1.angle), y: Math.sin(b1.angle) },
        { x: -Math.sin(b1.angle), y: Math.cos(b1.angle) },
        { x: Math.cos(b2.angle), y: Math.sin(b2.angle) },
        { x: -Math.sin(b2.angle), y: Math.cos(b2.angle) },
      ];

      let minOverlap = Infinity;
      let bestAxis = null;

      for (const axis of axes) {
        let min1 = Infinity,
          max1 = -Infinity;
        for (const p of c1) {
          const proj = p.x * axis.x + p.y * axis.y;
          if (proj < min1) min1 = proj;
          if (proj > max1) max1 = proj;
        }
        let min2 = Infinity,
          max2 = -Infinity;
        for (const p of c2) {
          const proj = p.x * axis.x + p.y * axis.y;
          if (proj < min2) min2 = proj;
          if (proj > max2) max2 = proj;
        }
        const overlap = Math.min(max1, max2) - Math.max(min1, min2);
        if (overlap <= 0) return; // Separating axis found -> no collision
        if (overlap < minOverlap) {
          minOverlap = overlap;
          bestAxis = axis;
        }
      }

      // Ensure normal points from b1 to b2
      const dcx = b2.x - b1.x;
      const dcy = b2.y - b1.y;
      let nx = bestAxis.x;
      let ny = bestAxis.y;
      if (dcx * nx + dcy * ny < 0) {
        nx = -nx;
        ny = -ny;
      }

      const relSpeed = Math.hypot(b2.vx - b1.vx, b2.vy - b1.vy);
      const totalMass = b1.mass + b2.mass;

      // If vertical collision (ny < -0.55 means b2 is on top of b1)
      const b1QTurns = Math.round(b1.angle / (Math.PI / 2));
      const b1Nearest90 = b1QTurns * (Math.PI / 2);
      const b1Tilt = Math.abs(b1.angle - b1Nearest90);
      const b1Even = Math.abs(b1QTurns % 2) === 0;
      const b1IsNarrow = (b1Even ? b1.h : b1.w) > (b1Even ? b1.w : b1.h) * 1.35;

      const b2Nearest90 = Math.round(b2.angle / (Math.PI / 2)) * (Math.PI / 2);
      const b2Tilt = Math.abs(b2.angle - b2Nearest90);

      if (
        ny < -0.55 &&
        b1Tilt < 0.22 &&
        (!b1IsNarrow || b2Tilt < 0.25)
      ) {
        // b1 is roughly level and supporting b2 from below
        const b1Share = b1._supportedByGround ? 0.05 : b2.mass / totalMass;
        const b2Share = 1 - b1Share;
        b1.x -= nx * minOverlap * b1Share;
        b1.y -= ny * minOverlap * b1Share;
        b2.x += nx * minOverlap * b2Share;
        b2.y += ny * minOverlap * b2Share;

        // Only count points near the contact plane (top of b1 / bottom of b2) for support span
        const contactY = Math.min(...c1.map((p) => p.y));
        let minContactX = Infinity;
        let maxContactX = -Infinity;
        for (const p of c1) {
          if (Math.abs(p.y - contactY) < 14) {
            if (p.x < minContactX) minContactX = p.x;
            if (p.x > maxContactX) maxContactX = p.x;
          }
        }
        let min2LowX = Infinity;
        let max2LowX = -Infinity;
        const max2Y = Math.max(...c2.map((p) => p.y));
        for (const p of c2) {
          if (Math.abs(p.y - max2Y) < 14) {
            if (p.x < min2LowX) min2LowX = p.x;
            if (p.x > max2LowX) max2LowX = p.x;
          }
        }
        const overlapLeft = Math.max(minContactX, min2LowX);
        const overlapRight = Math.min(maxContactX, max2LowX);
        if (overlapRight >= overlapLeft - 4) {
          if (overlapLeft < b2._supportMinX) b2._supportMinX = overlapLeft;
          if (overlapRight > b2._supportMaxX) b2._supportMaxX = overlapRight;
        }

        // If b2 is heavily tilted while resting on b1, push b1 sideways so they don't wedge at 45 deg
        if (b2Tilt > 0.25) {
          const pushDir = b2.x < b1.x ? 1 : -1;
          b1.vx += pushDir * 95 * dt;
          b1.va += pushDir * 5.5 * dt;
          b2.vx -= pushDir * 60 * dt;
        }

        if (b2.vy > b1.vy) {
          b2.vy = b1.vy * 0.2;
        }
        // Friction between stacked blocks + top-of-pillar torque transfer
        const dvx = b2.vx - b1.vx;
        const frictionImpulse = dvx * Math.min(1, 7 * dt);
        b2.vx -= frictionImpulse;
        b1.vx += frictionImpulse * 0.6;
        if (b1.h > b1.w * 1.5 && Math.abs(dvx) > 15) {
          // Moving upper beam torques the top of a supporting vertical pillar
          b1.va += dvx * 0.09 * dt;
        }
      } else {
        // Lateral or sloped/tilted collision -> blocks slide and topple off each other!
        b1.x -= nx * minOverlap * (b2.mass / totalMass);
        b1.y -= ny * minOverlap * (b2.mass / totalMass);
        b2.x += nx * minOverlap * (b1.mass / totalMass);
        b2.y += ny * minOverlap * (b1.mass / totalMass);

        const slideDir = b2.x >= b1.x ? 1 : -1;
        b2.vx += slideDir * 28 * dt;
        b2.va += slideDir * 6.5 * dt;
        b1.vx -= slideDir * 18 * dt;
        b1.va += slideDir * 5.5 * dt;

        const rvx = b2.vx - b1.vx;
        const rvy = b2.vy - b1.vy;
        const normalVel = rvx * nx + rvy * ny;
        if (normalVel < 0) {
          const j = (-(1 + 0.2) * normalVel) / (1 / b1.mass + 1 / b2.mass);
          b1.vx -= (j * nx) / b1.mass;
          b1.vy -= (j * ny) / b1.mass;
          b2.vx += (j * nx) / b2.mass;
          b2.vy += (j * ny) / b2.mass;

          if (normalVel < -260) {
            const dmg = (-normalVel - 240) * 0.14;
            this._damageBlock(b1, dmg);
            this._damageBlock(b2, dmg);
          }
        }
      }
    }

    _damageBlock(block, amount) {
      if (block.destroyed || amount <= 0) return;
      block.hp -= amount;
      if (block.hp <= 0) {
        block.destroyed = true;
        this.score += block.mat.score;
        this._spawnParticles(block.x, block.y, block.mat.color, 14, 180);
        this._addFloatingText(
          `+${block.mat.score}`,
          block.x,
          block.y - 10,
          block.mat.color
        );
        this._notifyUI();
      }
    }

    _damagePig(pig, amount) {
      if (pig.destroyed || amount <= 0) return;
      pig.hp -= amount;
      if (pig.hp <= 0) {
        pig.destroyed = true;
        const pts = pig.king ? 8000 : 5000;
        this.score += pts;
        this._spawnParticles(pig.x, pig.y, "#7ae582", 22, 240);
        this._spawnParticles(pig.x, pig.y, "#ffffff", 10, 160);
        this._addFloatingText(`+${pts}`, pig.x, pig.y - 18, "#2ed573");
        this.sfx.playPigPop();
        this._notifyUI();
      }
    }

    _spawnParticles(x, y, color, count, maxSpeed) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * maxSpeed;
        this.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 40,
          r: 3 + Math.random() * 5,
          color,
          life: 0.45 + Math.random() * 0.45,
        });
      }
    }

    _addFloatingText(text, x, y, color) {
      this.floatingTexts.push({
        text,
        x,
        y,
        color,
        life: 1.05,
      });
    }

    _evaluateTurnAndWinState(dt) {
      const alivePigs = this.getAlivePigsCount();

      if (alivePigs === 0 && this.state !== "WON") {
        // Award bonus for unused birds (10,000 per unused bird)
        const unusedBirds = this.getRemainingBirdsCount();
        if (unusedBirds > 0) {
          const bonus = unusedBirds * 10000;
          this.score += bonus;
          this._addFloatingText(
            `剩余小鸟奖励 +${bonus}`,
            CONSTANTS.SLING_X + 120,
            CONSTANTS.SLING_Y - 80,
            "#ffcc00"
          );
        }
        this.bestScores[this.currentLevelIndex] = Math.max(
          this.bestScores[this.currentLevelIndex] || 0,
          this.score
        );
        this.state = "WON";
        this.sfx.playWin();
        this._notifyUI();
        this.onLevelEnd({
          won: true,
          score: this.score,
          stars: unusedBirds >= 2 ? 3 : unusedBirds === 1 ? 2 : 1,
          levelIndex: this.currentLevelIndex,
        });
        return;
      }

      if (this.state === "FLYING") {
        const allBirdsDone = this.activeBirds.every((b) => b.restTime >= 1.15);
        if (allBirdsDone) {
          this.state = "SETTLING";
          this.settleTimer = 0;
        }
      }

      if (this.state === "SETTLING") {
        this.settleTimer += dt;
        const worldQuiet =
          this.blocks.every(
            (b) => b.destroyed || Math.hypot(b.vx, b.vy) < 22
          ) &&
          this.pigs.every((p) => p.destroyed || Math.hypot(p.vx, p.vy) < 22);

        if (worldQuiet || this.settleTimer > 1.6) {
          if (this.birdQueue.length > 0) {
            this._spawnNextBirdOnSling();
            this._notifyUI();
          } else if (this.getAlivePigsCount() > 0) {
            this.state = "LOST";
            this._notifyUI();
            this.onLevelEnd({
              won: false,
              score: this.score,
              stars: 0,
              levelIndex: this.currentLevelIndex,
            });
          }
        }
      }
    }

    _notifyUI() {
      this.bestScores[this.currentLevelIndex] = Math.max(
        this.bestScores[this.currentLevelIndex] || 0,
        this.score
      );
      this.onUIUpdate({
        levelIndex: this.currentLevelIndex,
        score: this.score,
        bestScore: this.bestScores[this.currentLevelIndex] || 0,
        remainingBirds: this.getRemainingBirdsCount(),
        alivePigs: this.getAlivePigsCount(),
        state: this.state,
      });
    }

    // ==================== RENDERING ====================
    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CONSTANTS.WIDTH, CONSTANTS.HEIGHT);

      this._drawBackground(ctx);
      this._drawTrajectory(ctx);
      this._drawSlingshotBack(ctx);
      this._drawWaitingBirds(ctx);
      this._drawActiveBirds(ctx);
      this._drawSlingshotFront(ctx);
      this._drawBlocks(ctx);
      this._drawPigs(ctx);
      this._drawShockwaves(ctx);
      this._drawParticles(ctx);
      this._drawFloatingTexts(ctx);
      this._drawAutoDemoOverlay(ctx);
    }

    _drawAutoDemoOverlay(ctx) {
      if (!this.autoDemo) return;
      const d = this.autoDemo;

      // Target explosion zone indicator at (820, 595)
      ctx.save();
      ctx.strokeStyle = "rgba(217, 43, 43, 0.9)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(820, 595, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#b81d1d";
      ctx.font = "bold 13px 'JetBrains Mono', -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🎯 爆破引爆点 (X=820)", 820, 556);

      // Parchment & Timber Banner at top-center
      ctx.fillStyle = "rgba(251, 243, 228, 0.95)";
      ctx.strokeStyle = "#5d3519";
      ctx.lineWidth = 3;
      const bw = 660;
      const bh = 40;
      const bx = (CONSTANTS.WIDTH - bw) / 2;
      const by = 22;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#2b1b10";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(d.statusText, CONSTANTS.WIDTH / 2, by + 25);
      ctx.restore();
    }

    _drawBackground(ctx) {
      // Warm sunlit sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CONSTANTS.GROUND_Y);
      skyGrad.addColorStop(0, "#4ea8de");
      skyGrad.addColorStop(0.62, "#ade8f4");
      skyGrad.addColorStop(1, "#fdf8e1");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CONSTANTS.WIDTH, CONSTANTS.GROUND_Y);

      // Distant misty mountain range
      ctx.fillStyle = "rgba(116, 168, 142, 0.45)";
      ctx.beginPath();
      ctx.moveTo(0, CONSTANTS.GROUND_Y);
      ctx.lineTo(0, 430);
      ctx.lineTo(190, 310);
      ctx.lineTo(390, 420);
      ctx.lineTo(640, 275);
      ctx.lineTo(910, 410);
      ctx.lineTo(1120, 320);
      ctx.lineTo(CONSTANTS.WIDTH, 415);
      ctx.lineTo(CONSTANTS.WIDTH, CONSTANTS.GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Rolling pasture hills
      ctx.fillStyle = "#80b918";
      ctx.beginPath();
      ctx.arc(260, CONSTANTS.GROUND_Y + 95, 290, Math.PI, 0);
      ctx.arc(760, CONSTANTS.GROUND_Y + 125, 355, Math.PI, 0);
      ctx.arc(1140, CONSTANTS.GROUND_Y + 85, 260, Math.PI, 0);
      ctx.fill();

      // Foreground hill layer
      ctx.fillStyle = "#55a630";
      ctx.beginPath();
      ctx.arc(140, CONSTANTS.GROUND_Y + 130, 240, Math.PI, 0);
      ctx.arc(540, CONSTANTS.GROUND_Y + 150, 280, Math.PI, 0);
      ctx.arc(980, CONSTANTS.GROUND_Y + 135, 260, Math.PI, 0);
      ctx.fill();

      // Soft volumetric clouds
      for (const c of this.clouds) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 26 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 24 * c.s, c.y - 8 * c.s, 32 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 52 * c.s, c.y, 24 * c.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wooden slingshot platform pedestal
      ctx.fillStyle = "#7f4f24";
      ctx.strokeStyle = "#3d2314";
      ctx.lineWidth = 2.5;
      ctx.fillRect(CONSTANTS.SLING_X - 34, CONSTANTS.GROUND_Y - 10, 68, 12);
      ctx.strokeRect(CONSTANTS.SLING_X - 34, CONSTANTS.GROUND_Y - 10, 68, 12);

      // Ground turf top & stratified soil
      ctx.fillStyle = "#38b000";
      ctx.fillRect(0, CONSTANTS.GROUND_Y, CONSTANTS.WIDTH, 7);
      ctx.fillStyle = "#2b9348";
      ctx.fillRect(0, CONSTANTS.GROUND_Y + 7, CONSTANTS.WIDTH, 11);

      ctx.fillStyle = "#582f0e";
      ctx.fillRect(
        0,
        CONSTANTS.GROUND_Y + 18,
        CONSTANTS.WIDTH,
        CONSTANTS.HEIGHT - CONSTANTS.GROUND_Y - 18
      );

      // Soil pebbles texture
      ctx.fillStyle = "rgba(38, 18, 5, 0.35)";
      for (let px = 45; px < CONSTANTS.WIDTH; px += 95) {
        ctx.beginPath();
        ctx.ellipse(px, CONSTANTS.GROUND_Y + 38, 14, 6, 0.1, 0, Math.PI * 2);
        ctx.ellipse(px + 42, CONSTANTS.GROUND_Y + 58, 9, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    _drawSlingshotBack(ctx) {
      // Back fork of slingshot + back elastic band
      ctx.strokeStyle = "#5c3818";
      ctx.lineWidth = 11;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(CONSTANTS.SLING_X, CONSTANTS.GROUND_Y + 4);
      ctx.lineTo(CONSTANTS.SLING_X, CONSTANTS.SLING_Y + 32);
      ctx.lineTo(CONSTANTS.SLING_X + 13, CONSTANTS.SLING_Y + 4);
      ctx.stroke();

      if (
        (this.state === "READY" || this.state === "AIMING") &&
        this.activeBirds[0]
      ) {
        const b = this.activeBirds[0];
        const attachX = b.x - b.r * 0.65;
        const attachY = b.y + 4;
        ctx.strokeStyle = "#3b1f0e";
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(CONSTANTS.SLING_X + 11, CONSTANTS.SLING_Y + 5);
        ctx.lineTo(attachX, attachY);
        ctx.stroke();
      }
    }

    _drawSlingshotFront(ctx) {
      if (
        (this.state === "READY" || this.state === "AIMING") &&
        this.activeBirds[0]
      ) {
        const b = this.activeBirds[0];
        const attachX = b.x - b.r * 0.65;
        const attachY = b.y + 4;
        ctx.strokeStyle = "#2b1508";
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(CONSTANTS.SLING_X - 11, CONSTANTS.SLING_Y + 8);
        ctx.lineTo(attachX, attachY);
        ctx.stroke();

        // Leather pouch behind bird
        ctx.fillStyle = "#3d2314";
        ctx.beginPath();
        ctx.arc(attachX, attachY, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "#6f4518";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(CONSTANTS.SLING_X, CONSTANTS.SLING_Y + 32);
      ctx.lineTo(CONSTANTS.SLING_X - 13, CONSTANTS.SLING_Y + 8);
      ctx.stroke();
    }

    _drawTrajectory(ctx) {
      // Flight trail for active birds
      for (const bird of this.activeBirds) {
        if (bird.trail && bird.trail.length > 1) {
          for (let i = 0; i < bird.trail.length; i++) {
            const pt = bird.trail[i];
            ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, i % 2 === 0 ? 3.5 : 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Predictive aiming parabola + Live Ballistic Rangefinder when dragging slingshot
      if (this.state === "AIMING") {
        const { vx, vy, pullDist } = this.computeLaunchVelocity(
          this.aimPos.x,
          this.aimPos.y
        );
        if (pullDist < 16) return;
        for (let step = 1; step <= 20; step++) {
          const t = step * 0.065;
          const px = this.aimPos.x + vx * t;
          const py =
            this.aimPos.y + vy * t + 0.5 * CONSTANTS.GRAVITY * t * t;
          if (py > CONSTANTS.GROUND_Y) break;
          const alpha = 1 - step / 24;
          ctx.fillStyle = `rgba(255, 252, 240, ${alpha.toFixed(2)})`;
          ctx.strokeStyle = `rgba(62, 34, 15, ${(alpha * 0.55).toFixed(2)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, step % 3 === 0 ? 5.2 : 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Signature Element: Live Ballistic Rangefinder Badge above Slingshot
        const elevDeg = ((-Math.atan2(vy, vx) * 180) / Math.PI).toFixed(1);
        const tensionPct = Math.round((pullDist / CONSTANTS.MAX_PULL) * 100);
        ctx.save();
        const rx = CONSTANTS.SLING_X - 72;
        const ry = CONSTANTS.SLING_Y - 86;
        ctx.fillStyle = "rgba(251, 243, 228, 0.94)";
        ctx.strokeStyle = "#5d3519";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rx, ry, 148, 30, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#2b1b10";
        ctx.font = "bold 12px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`∠ ${elevDeg}° · 满弓 ${tensionPct}%`, rx + 74, ry + 19);
        ctx.restore();
      }
    }

    _drawWaitingBirds(ctx) {
      for (let i = 0; i < this.birdQueue.length; i++) {
        const typeKey = this.birdQueue[i];
        const spec = CONSTANTS.BIRD_TYPES[typeKey] || CONSTANTS.BIRD_TYPES.red;
        const bx = CONSTANTS.SLING_X - 65 - i * 44;
        const by = CONSTANTS.GROUND_Y - spec.radius;
        this._drawSingleBird(ctx, bx, by, spec.radius, 0, typeKey, spec);
      }
    }

    _drawActiveBirds(ctx) {
      for (const bird of this.activeBirds) {
        this._drawSingleBird(
          ctx,
          bird.x,
          bird.y,
          bird.r,
          bird.angle,
          bird.type,
          bird.spec
        );
      }
    }

    _drawSingleBird(ctx, x, y, r, angle, typeKey, spec) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      if (typeKey === "yellow") {
        // Triangular Chuck bird
        ctx.fillStyle = spec.color;
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.15);
        ctx.lineTo(r * 1.1, r * 0.95);
        ctx.lineTo(-r * 1.1, r * 0.95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Round bird body
        ctx.fillStyle = spec.color;
        ctx.strokeStyle = "#1d1d1d";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Belly patch
        ctx.fillStyle = spec.belly;
        ctx.beginPath();
        ctx.arc(2, r * 0.35, r * 0.55, 0, Math.PI, false);
        ctx.fill();
      }

      // Fuse for bomb bird
      if (typeKey === "black") {
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(4, -r - 9);
        ctx.stroke();
        ctx.fillStyle = "#ffbe0b";
        ctx.beginPath();
        ctx.arc(4, -r - 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyes
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(r * 0.22, -r * 0.12, r * 0.24, 0, Math.PI * 2);
      ctx.arc(r * 0.56, -r * 0.12, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(r * 0.28, -r * 0.12, r * 0.1, 0, Math.PI * 2);
      ctx.arc(r * 0.6, -r * 0.12, r * 0.09, 0, Math.PI * 2);
      ctx.fill();

      // Angry Eyebrows
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.05, -r * 0.42);
      ctx.lineTo(r * 0.42, -r * 0.25);
      ctx.lineTo(r * 0.78, -r * 0.42);
      ctx.stroke();

      // Beak
      ctx.fillStyle = "#ff9f1c";
      ctx.beginPath();
      ctx.moveTo(r * 0.45, -r * 0.02);
      ctx.lineTo(r * 0.98, r * 0.12);
      ctx.lineTo(r * 0.45, r * 0.28);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    _drawBlocks(ctx) {
      for (const b of this.blocks) {
        if (b.destroyed) continue;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        const hw = b.w / 2;
        const hh = b.h / 2;

        // Base material fill
        ctx.fillStyle = b.mat.color;
        ctx.fillRect(-hw, -hh, b.w, b.h);

        // Procedural material texture details
        if (b.matName === "wood") {
          // Inner top highlight bevel
          ctx.fillStyle = "rgba(255, 225, 180, 0.28)";
          ctx.fillRect(-hw + 2, -hh + 2, b.w - 4, 4);

          // Wood grain lines along the longer axis
          ctx.strokeStyle = "rgba(110, 56, 15, 0.35)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          if (b.w >= b.h) {
            ctx.moveTo(-hw + 6, -hh * 0.3);
            ctx.lineTo(hw - 6, -hh * 0.3);
            ctx.moveTo(-hw + 10, hh * 0.35);
            ctx.lineTo(hw - 10, hh * 0.35);
          } else {
            ctx.moveTo(-hw * 0.3, -hh + 6);
            ctx.lineTo(-hw * 0.3, hh - 6);
            ctx.moveTo(hw * 0.35, -hh + 10);
            ctx.lineTo(hw * 0.35, hh - 10);
          }
          ctx.stroke();

          // Corner iron nail heads
          ctx.fillStyle = "#5c3211";
          const inset = 5;
          if (b.w >= 18 && b.h >= 18) {
            ctx.beginPath();
            ctx.arc(-hw + inset, -hh + inset, 1.7, 0, Math.PI * 2);
            ctx.arc(hw - inset, -hh + inset, 1.7, 0, Math.PI * 2);
            ctx.arc(-hw + inset, hh - inset, 1.7, 0, Math.PI * 2);
            ctx.arc(hw - inset, hh - inset, 1.7, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (b.matName === "glass") {
          // Specular ice highlight border & diagonal frost shine
          ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
          ctx.fillRect(-hw + 2, -hh + 2, b.w - 4, 4);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-hw * 0.45, hh * 0.35);
          ctx.lineTo(hw * 0.45, -hh * 0.35);
          ctx.stroke();
        } else if (b.matName === "stone") {
          // Quarried stone top highlight and bottom shadow bevel
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fillRect(-hw + 2, -hh + 2, b.w - 4, 4);
          ctx.fillStyle = "rgba(30, 34, 45, 0.3)";
          ctx.fillRect(-hw + 2, hh - 6, b.w - 4, 4);
        }

        // Crisp outer stroke
        ctx.strokeStyle = b.mat.stroke;
        ctx.lineWidth = 2.4;
        ctx.strokeRect(-hw, -hh, b.w, b.h);

        // Damage cracks when HP < 70%
        const hpRatio = b.hp / b.maxHp;
        if (hpRatio < 0.7) {
          ctx.strokeStyle = "rgba(20, 20, 20, 0.62)";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-b.w * 0.25, -b.h * 0.3);
          ctx.lineTo(0, 0);
          ctx.lineTo(b.w * 0.2, b.h * 0.25);
          if (hpRatio < 0.4) {
            ctx.moveTo(b.w * 0.22, -b.h * 0.22);
            ctx.lineTo(-b.w * 0.18, b.h * 0.2);
          }
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    _drawPigs(ctx) {
      for (const p of this.pigs) {
        if (p.destroyed) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Ears
        ctx.fillStyle = "#52b788";
        ctx.beginPath();
        ctx.arc(-p.r * 0.65, -p.r * 0.72, p.r * 0.24, 0, Math.PI * 2);
        ctx.arc(p.r * 0.65, -p.r * 0.72, p.r * 0.24, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = "#74c69d";
        ctx.strokeStyle = "#2d6a4f";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // King Crown
        if (p.king) {
          ctx.fillStyle = "#ffd166";
          ctx.strokeStyle = "#b58300";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-p.r * 0.55, -p.r * 0.85);
          ctx.lineTo(-p.r * 0.4, -p.r * 1.4);
          ctx.lineTo(-p.r * 0.12, -p.r * 1.05);
          ctx.lineTo(0, -p.r * 1.5);
          ctx.lineTo(p.r * 0.12, -p.r * 1.05);
          ctx.lineTo(p.r * 0.4, -p.r * 1.4);
          ctx.lineTo(p.r * 0.55, -p.r * 0.85);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(-p.r * 0.42, -p.r * 0.15, p.r * 0.22, 0, Math.PI * 2);
        ctx.arc(p.r * 0.42, -p.r * 0.15, p.r * 0.22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1b4332";
        ctx.beginPath();
        ctx.arc(-p.r * 0.4, -p.r * 0.15, p.r * 0.09, 0, Math.PI * 2);
        ctx.arc(p.r * 0.4, -p.r * 0.15, p.r * 0.09, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = "#95d5b2";
        ctx.strokeStyle = "#2d6a4f";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, p.r * 0.08, p.r * 0.36, p.r * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nostrils
        ctx.fillStyle = "#1b4332";
        ctx.beginPath();
        ctx.arc(-p.r * 0.13, p.r * 0.08, p.r * 0.08, 0, Math.PI * 2);
        ctx.arc(p.r * 0.13, p.r * 0.08, p.r * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Bruise indicator when hurt
        if (p.hp < p.maxHp * 0.65) {
          ctx.fillStyle = "rgba(108, 92, 231, 0.45)";
          ctx.beginPath();
          ctx.arc(p.r * 0.42, -p.r * 0.15, p.r * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    _drawShockwaves(ctx) {
      for (const sw of this.shockwaves) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 195, 0, ${Math.max(0, sw.alpha).toFixed(2)})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    _drawParticles(ctx) {
      for (const pt of this.particles) {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    _drawFloatingTexts(ctx) {
      ctx.save();
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      for (const ft of this.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = "rgba(0,0,0,0.65)";
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.restore();
    }
  }

  // ==================== BROWSER BOOTSTRAP ====================
  function initBrowserGame() {
    if (typeof document === "undefined") return null;
    const canvas = document.getElementById("game-canvas");
    if (!canvas) return null;

    const scoreEl = document.getElementById("score-val");
    const bestEl = document.getElementById("best-val");
    const birdsEl = document.getElementById("birds-val");
    const pigsEl = document.getElementById("pigs-val");
    const levelBtns = document.querySelectorAll(".level-btn");
    const demoBtn = document.getElementById("demo-btn");
    const skillBtn = document.getElementById("skill-btn");
    const soundBtn = document.getElementById("sound-btn");
    const restartBtn = document.getElementById("restart-btn");

    const dialog = document.getElementById("result-dialog");
    const dialogTitle = document.getElementById("dialog-title");
    const dialogStars = document.getElementById("dialog-stars");
    const dialogScore = document.getElementById("dialog-score");
    const dialogRetryBtn = document.getElementById("dialog-retry-btn");
    const dialogNextBtn = document.getElementById("dialog-next-btn");

    const engine = new AngryBirdsEngine({
      canvas,
      onUIUpdate(stats) {
        if (scoreEl) scoreEl.textContent = String(stats.score);
        if (bestEl) bestEl.textContent = String(stats.bestScore);
        if (birdsEl) birdsEl.textContent = String(stats.remainingBirds);
        if (pigsEl) pigsEl.textContent = String(stats.alivePigs);
        levelBtns.forEach((btn) => {
          btn.classList.toggle(
            "active",
            Number(btn.dataset.level) === stats.levelIndex
          );
        });
      },
      onLevelEnd(res) {
        if (!dialog) return;
        if (res.won) {
          dialogTitle.textContent = `🎉 第 ${res.levelIndex + 1} 关胜利！`;
          dialogStars.textContent = "⭐".repeat(res.stars) + "☆".repeat(3 - res.stars);
          dialogScore.textContent = `本关得分：${res.score} 分`;
          dialogNextBtn.style.display = "inline-block";
        } else {
          dialogTitle.textContent = "💥 闯关失败，绿猪还在偷笑！";
          dialogStars.textContent = "☆☆☆";
          dialogScore.textContent = `本关得分：${res.score} 分`;
          dialogNextBtn.style.display = "none";
        }
        if (typeof dialog.showModal === "function" && !dialog.open) {
          dialog.showModal();
        }
      },
    });

    function toCanvasCoords(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * CONSTANTS.WIDTH,
        y: ((clientY - rect.top) / rect.height) * CONSTANTS.HEIGHT,
      };
    }

    canvas.addEventListener("pointerdown", (e) => {
      const pos = toCanvasCoords(e.clientX, e.clientY);
      if (engine.state === "FLYING") {
        engine.triggerBirdSkill();
        return;
      }
      if (engine.startAim(pos.x, pos.y)) {
        canvas.setPointerCapture(e.pointerId);
      }
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!engine.isDragging) return;
      const pos = toCanvasCoords(e.clientX, e.clientY);
      engine.updateAim(pos.x, pos.y);
    });

    const handleRelease = () => {
      if (engine.isDragging) {
        engine.releaseAim();
      }
    };
    canvas.addEventListener("pointerup", handleRelease);
    canvas.addEventListener("pointercancel", handleRelease);

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        if (engine.state === "FLYING") {
          e.preventDefault();
          engine.triggerBirdSkill();
        }
      } else if (e.code === "KeyR") {
        if (dialog && dialog.open) dialog.close();
        engine.loadLevel(engine.currentLevelIndex);
      }
    });

    levelBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (dialog && dialog.open) dialog.close();
        engine.loadLevel(Number(btn.dataset.level));
      });
    });

    if (skillBtn) {
      skillBtn.addEventListener("click", () => {
        engine.triggerBirdSkill();
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        if (dialog && dialog.open) dialog.close();
        engine.startOneBirdDemo();
      });
    }

    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        engine.sfx.enabled = !engine.sfx.enabled;
        soundBtn.setAttribute("aria-pressed", String(engine.sfx.enabled));
        soundBtn.textContent = engine.sfx.enabled ? "🔊 音效: 开" : "🔇 音效: 关";
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        if (dialog && dialog.open) dialog.close();
        engine.loadLevel(engine.currentLevelIndex);
      });
    }

    if (dialogRetryBtn) {
      dialogRetryBtn.addEventListener("click", () => {
        dialog.close();
        engine.loadLevel(engine.currentLevelIndex);
      });
    }

    if (dialogNextBtn) {
      dialogNextBtn.addEventListener("click", () => {
        dialog.close();
        const nextIdx = (engine.currentLevelIndex + 1) % LEVELS.length;
        engine.loadLevel(nextIdx);
      });
    }

    if (typeof HTMLDialogElement !== "undefined" && !("closedBy" in HTMLDialogElement.prototype)) {
      const outside = (e, dlg) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      for (const dlg of document.querySelectorAll('dialog[closedby="any"]')) {
        let pressedOutside = false;
        dlg.addEventListener("pointerdown", (e) => {
          pressedOutside = outside(e, dlg);
        });
        dlg.addEventListener("pointerup", (e) => {
          if (pressedOutside && outside(e, dlg)) dlg.close();
        });
      }
    }

    // Main animation loop
    let lastTime = performance.now();
    function loop(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      engine.step(dt);
      engine.render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Auto-trigger 1-bird clear demo if URL has ?demo=1
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.search.includes("demo=1")
    ) {
      setTimeout(() => {
        if (dialog && dialog.open) dialog.close();
        engine.startOneBirdDemo();
      }, 450);
    }

    window.gameEngine = engine;
    return engine;
  }

  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initBrowserGame);
    } else {
      initBrowserGame();
    }
  }

  return {
    CONSTANTS,
    LEVELS,
    AngryBirdsEngine,
  };
});
