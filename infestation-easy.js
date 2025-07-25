// infestation-easy.js

export function startEasyMode() {
  const gameArea = document.getElementById('game-area');
  const scoreDisplay = document.getElementById('score');
  const missDisplay = document.getElementById('misses');
  const medalPanel = document.getElementById('medal-panel');

  let score = 0;
  let misses = 0;
  let spawnInterval = 2000;
  const minInterval = 125;
  const spawnTimerAdjustRate = 10000; // every 10s
  let lastAdjustTime = Date.now();

  function spawnBug() {
    const bug = document.createElement('div');
    bug.className = 'bug easy';
    bug.style.top = `${Math.random() * 80 + 10}%`;
    bug.style.left = '-50px';

    gameArea.appendChild(bug);

    const bugSpeed = 4000;
    bug.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${gameArea.offsetWidth + 50}px)` }
    ], {
      duration: bugSpeed,
      easing: 'linear',
    });

    let squished = false;

    bug.addEventListener('click', () => {
      if (!squished) {
        squished = true;
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        gameArea.removeChild(bug);
      }
    });

    setTimeout(() => {
      if (!squished && gameArea.contains(bug)) {
        misses += 1;
        missDisplay.textContent = `Misses: ${misses}`;
        gameArea.removeChild(bug);
        if (misses >= 10) endGame();
      }
    }, bugSpeed);
  }

  function adjustSpawnRate() {
    const now = Date.now();
    if (now - lastAdjustTime >= spawnTimerAdjustRate && spawnInterval > minInterval) {
      spawnInterval = Math.max(spawnInterval / 2, minInterval);
      lastAdjustTime = now;
    }
  }

  function medalCheck() {
    if (score >= 200) {
      medalPanel.textContent = '🥈 Silver Medal!';
    } else if (score >= 100) {
      medalPanel.textContent = '🥉 Bronze Medal!';
    } else {
      medalPanel.textContent = '';
    }
  }

  function endGame() {
    clearInterval(spawnLoop);
    medalCheck();
    alert('Game Over! Final Score: ' + score);
  }

  const spawnLoop = setInterval(() => {
    adjustSpawnRate();
    spawnBug();
    clearInterval(spawnLoop);
    setInterval(spawnLoop._onTimeout, spawnInterval); // restart with new interval
  }, spawnInterval);
}
