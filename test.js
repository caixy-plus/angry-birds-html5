/**
 * Automated Test Suite for Angry Birds HTML5 Engine
 * Run with: node test.js
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { CONSTANTS, LEVELS, AngryBirdsEngine } = require("./game.js");

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Level initialization & state verification
test("Engine initializes Level 0 with blocks, pigs, and bird on slingshot", () => {
  const engine = new AngryBirdsEngine();
  assert.equal(engine.currentLevelIndex, 0);
  assert.equal(engine.state, "READY");
  assert.equal(engine.activeBirds.length, 1);
  assert.equal(engine.activeBirds[0].type, "red");
  assert.equal(engine.getRemainingBirdsCount(), LEVELS[0].birds.length);
  assert.equal(engine.getAlivePigsCount(), LEVELS[0].pigs.length);
  assert.equal(engine.blocks.length, LEVELS[0].blocks.length);
});

// 2. Slingshot pull clamping & velocity computation
test("Slingshot clamps pull distance to MAX_PULL and computes launch velocity", () => {
  const engine = new AngryBirdsEngine();
  const started = engine.startAim(CONSTANTS.SLING_X - 10, CONSTANTS.SLING_Y + 10);
  assert.equal(started, true);
  assert.equal(engine.state, "AIMING");

  // Pull way beyond MAX_PULL
  engine.updateAim(CONSTANTS.SLING_X - 500, CONSTANTS.SLING_Y + 500);
  const dist = Math.hypot(
    engine.aimPos.x - CONSTANTS.SLING_X,
    engine.aimPos.y - CONSTANTS.SLING_Y
  );
  assert.ok(
    Math.abs(dist - CONSTANTS.MAX_PULL) < 1e-4,
    `Expected clamped dist ${CONSTANTS.MAX_PULL}, got ${dist}`
  );

  const launched = engine.releaseAim();
  assert.equal(launched, true);
  assert.equal(engine.state, "FLYING");
  assert.ok(engine.activeBirds[0].vx > 0, "Bird should launch forward (+vx)");
  assert.ok(engine.activeBirds[0].vy < 0, "Bird should launch upward (-vy)");
});

// 3. Tiny pull snaps back without launching
test("Tiny slingshot pull (< 16px) snaps back to READY without launching", () => {
  const engine = new AngryBirdsEngine();
  engine.startAim(CONSTANTS.SLING_X - 4, CONSTANTS.SLING_Y + 4);
  engine.updateAim(CONSTANTS.SLING_X - 5, CONSTANTS.SLING_Y + 5);
  const launched = engine.releaseAim();
  assert.equal(launched, false);
  assert.equal(engine.state, "READY");
  assert.equal(engine.activeBirds[0].launched, false);
});

// 4. Gravity and projectile trajectory physics
test("Launched bird follows parabolic trajectory and collides with ground", () => {
  const engine = new AngryBirdsEngine();
  engine.launchBirdWithVelocity(500, -300);
  const initialX = engine.activeBirds[0].x;
  const initialVy = engine.activeBirds[0].vy;

  engine.step(0.03);
  assert.ok(engine.activeBirds[0].x > initialX, "Bird moves horizontally");
  assert.ok(engine.activeBirds[0].vy > initialVy, "Gravity increases downward vy");

  // Step until bird reaches ground
  for (let i = 0; i < 150; i++) {
    engine.step(0.02);
  }
  assert.ok(
    engine.activeBirds[0].y + engine.activeBirds[0].r <= CONSTANTS.GROUND_Y + 0.5,
    "Bird stays on or above ground"
  );
});

// 5. Yellow bird speed boost skill
test("Yellow bird skill boosts velocity in flight", () => {
  const engine = new AngryBirdsEngine();
  engine.loadLevel(1); // Level 1 starts with yellow bird
  assert.equal(engine.activeBirds[0].type, "yellow");
  engine.launchBirdWithVelocity(300, -100);
  const speedBefore = Math.hypot(
    engine.activeBirds[0].vx,
    engine.activeBirds[0].vy
  );
  const triggered = engine.triggerBirdSkill();
  assert.equal(triggered, true);
  const speedAfter = Math.hypot(
    engine.activeBirds[0].vx,
    engine.activeBirds[0].vy
  );
  assert.ok(speedAfter > speedBefore * 1.5, "Yellow bird speed boosted");
});

// 6. Blue bird split skill
test("Blue bird skill splits into 3 active birds", () => {
  const engine = new AngryBirdsEngine();
  engine.loadLevel(2); // Level 2 starts with blue bird
  assert.equal(engine.activeBirds[0].type, "blue");
  engine.launchBirdWithVelocity(450, -250);
  const triggered = engine.triggerBirdSkill();
  assert.equal(triggered, true);
  assert.equal(engine.activeBirds.length, 3);
});

// 7. Black bird explosion damages nearby blocks & pigs
test("Black bomb bird explosion damages blocks and pigs in radius", () => {
  const engine = new AngryBirdsEngine();
  engine.activeBirds[0].type = "black";
  engine.activeBirds[0].spec = CONSTANTS.BIRD_TYPES.black;
  engine.launchBirdWithVelocity(100, 0);

  // Place bird right next to first pig and block
  const targetPig = engine.pigs[0];
  engine.activeBirds[0].x = targetPig.x - 10;
  engine.activeBirds[0].y = targetPig.y - 10;

  const triggered = engine.triggerBirdSkill();
  assert.equal(triggered, true);
  assert.equal(targetPig.destroyed, true, "Nearby pig should be destroyed by bomb");
  assert.ok(engine.score >= 5000, "Score should increase after pig destruction");
});

// 8. Win state & unused bird bonus when all pigs are eliminated
test("Eliminating all pigs triggers WON state and awards unused bird bonus", () => {
  let endPayload = null;
  const engine = new AngryBirdsEngine({
    onLevelEnd(res) {
      endPayload = res;
    },
  });
  for (const p of engine.pigs) {
    engine._damagePig(p, 999);
  }
  engine.step(0.016);
  assert.equal(engine.state, "WON");
  assert.ok(endPayload && endPayload.won === true);
  assert.equal(endPayload.stars, 3);
  assert.ok(engine.score >= 3 * 5000 + 4 * 10000);
});

// 9. Lose state when all birds are spent and pigs survive
test("Spending all birds while pigs survive transitions to LOST state", () => {
  let endPayload = null;
  const engine = new AngryBirdsEngine({
    onLevelEnd(res) {
      endPayload = res;
    },
  });
  engine.birdQueue = [];
  engine.launchBirdWithVelocity(10, 0);
  engine.activeBirds[0].restTime = 2.0;

  // Step through settling timer
  for (let i = 0; i < 80; i++) {
    engine.step(0.03);
  }
  assert.equal(engine.state, "LOST");
  assert.ok(endPayload && endPayload.won === false);
});

// 10. Static HTML & CSS integrity check
test("index.html and style.css contain required elements and modal dialog setup", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "style.css"), "utf8");
  assert.ok(html.includes('<canvas id="game-canvas"'));
  assert.ok(html.includes('<dialog id="result-dialog"'));
  assert.ok(html.includes('id="demo-btn"'));
  assert.ok(css.includes("overscroll-behavior: contain"));
});

// 11. AI 1-Bird Clear Demo verification
test("startOneBirdDemo() automatically clears Level 1 using only 1 bird with 3 stars", () => {
  let endPayload = null;
  const engine = new AngryBirdsEngine({
    onLevelEnd(res) {
      endPayload = res;
    },
  });
  engine.startOneBirdDemo();
  for (let i = 0; i < 320; i++) {
    engine.step(1 / 60);
    if (engine.state === "WON") break;
  }
  assert.equal(engine.state, "WON");
  assert.equal(engine.getAlivePigsCount(), 0);
  assert.equal(engine.getRemainingBirdsCount(), 3, "3 unused birds should remain");
  assert.ok(endPayload && endPayload.won === true && endPayload.stars === 3);
});

// 12. Regression test for floating upper floor / stuck 45-deg tilted pillar bug
test("Destroying left pillar collapses upper floor to ground with zero floating or 45-deg stuck blocks", () => {
  const engine = new AngryBirdsEngine();
  engine.blocks[0].destroyed = true; // Destroy left first-floor pillar
  for (let i = 0; i < 220; i++) {
    engine.step(1 / 60);
  }
  for (const b of engine.blocks) {
    if (b.destroyed) continue;
    const corners = engine._getBlockCorners(b);
    const lowestY = Math.max(...corners.map((c) => c.y));
    assert.ok(
      lowestY >= CONSTANTS.GROUND_Y - 30,
      `Block ${b.id} is floating in mid-air (lowestY=${lowestY})`
    );
    const nearest90 = Math.round(b.angle / (Math.PI / 2)) * (Math.PI / 2);
    assert.ok(
      Math.abs(b.angle - nearest90) < 0.2,
      `Block ${b.id} froze at a diagonal angle (${b.angle} rad)`
    );
  }
});

// 13. Wood block hitting/toppling onto pig crushes the pig
test("Wood pillar toppling onto a pig crushes and eliminates the pig", () => {
  const engine = new AngryBirdsEngine();
  const rightPillar = engine.blocks[1]; // wood 24x120 at x=900
  const rightPig = engine.pigs[2]; // pig at x=970
  engine.blocks.forEach((b, idx) => {
    if (idx !== 1) b.destroyed = true;
  });
  // Push the top of the wood pillar to the right so it topples onto rightPig
  rightPillar.vx = 35;
  rightPillar.va = 1.2;
  for (let i = 0; i < 90; i++) {
    engine.step(1 / 60);
    if (rightPig.destroyed) break;
  }
  assert.equal(rightPig.destroyed, true, "Wood pillar hitting pig must crush the pig");
});

console.log(`\n🎉 All ${passed} tests passed!`);
