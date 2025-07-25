// infestation-normal.js

// Inject CSS rule for blue normal-mode bugs
(function injectNormalModeStyles() {
  const style = document.createElement('style');
  style.textContent = `
.bug.normal {
  background-color: #0066ff;
  width: 20px;
  height: 20px;
}

.bug.normal::before {
  content: '';
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  cursor: pointer;
}

#game-area.normal {
  background: linear-gradient(135deg, #f0f4ff, #e8f0ff);
  border: 3px solid #2196F3;
  box-shadow: inset 0 0 20px rgba(33, 150, 243, 0.3);
}
`;
  document.head.appendChild(style);
})();

export function startNormalMode() {
  const gameArea     = document.getElementById('game-area');
  const scoreDisplay = document.getElementById('score');
  const missDisplay  = document.getElementById('misses');
  const medalPanel   = document.getElementById('medal-panel');
  const gameTitle    = document.querySelector('#game-container h1');

  // Update title and game area styling
  gameTitle.textContent = 'Infestation - Normal Mode';
  gameArea.classList.add('normal');

  let score         = 0;
  let misses        = 0;
  let spawnInterval = 2000;
  const minInterval = 130;   // 0.13s = 130ms
  const adjustRate  = 10000;  // adjust every 10 seconds
  let lastAdjust    = Date.now();
  let spawnLoop;
  let gameEnded     = false;  // Add flag to prevent multiple game over triggers

  function spawnBug() {
    if (gameEnded) return;  // Don't spawn new bugs if game has ended
    
    const bug = document.createElement('div');
    bug.className = 'bug normal';
    bug.style.top  = `${Math.random() * 80 + 10}%`;
    bug.style.left = `-50px`;

    gameArea.appendChild(bug);

    const bugSpeed = 4000; // 1.5x faster than easy mode (4000)
    bug.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(${gameArea.offsetWidth + 50}px)` }
      ],
      {
        duration: bugSpeed,
        easing:   'linear'
      }
    );

    let squished = false;
    bug.addEventListener('click', () => {
      if (!squished && !gameEnded) {
        squished = true;
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        bug.remove();
      }
    });

    setTimeout(() => {
      if (!squished && gameArea.contains(bug) && !gameEnded) {
        misses += 1;
        missDisplay.textContent = `Misses: ${misses}`;
        bug.remove();
        if (misses >= 10) endGame();
      }
    }, bugSpeed);
  }

  function adjustSpawnRate() {
    if (gameEnded) return;  // Don't adjust if game has ended
    
    const now = Date.now();
    if (now - lastAdjust >= adjustRate && spawnInterval > minInterval) {
      // 1.6x speed increase, rounded to 2nd decimal
      const newInterval = Math.round((spawnInterval / 1.6) * 100) / 100;
      spawnInterval = Math.max(newInterval, minInterval);
      lastAdjust = now;
      clearInterval(spawnLoop);
      spawnLoop = setInterval(gameTick, spawnInterval);
    }
  }

  function medalCheck() {
    if (score >= 1000) {
      medalPanel.textContent = '🥈 Silver Medal!';
    } else if (score >= 600) {
      medalPanel.textContent = '🥉 Bronze Medal!';
    } else {
      medalPanel.textContent = '';
    }
  }

  function saveScore() {
    const mode = 'Normal';
    
    // Save last score
    localStorage.setItem(`lastScore-${mode}`, score);
    
    // Check and update best score
    const currentBest = localStorage.getItem(`bestScore-${mode}`);
    const bestScore = currentBest ? parseInt(currentBest) : 0;
    
    if (score > bestScore) {
      localStorage.setItem(`bestScore-${mode}`, score);
      medalPanel.innerHTML += '<br/>🏆 NEW BEST SCORE!';
    }
  }

  function endGame() {
    if (gameEnded) return;  // Prevent multiple calls to endGame
    
    gameEnded = true;
    clearInterval(spawnLoop);
    window.currentGameLoop = null; // Clear global reference
    medalCheck();
    saveScore();
    
    // Clean up styling when game ends
    gameArea.classList.remove('normal');
    
    // Use toScreen function instead of redirect to stay on same page
    setTimeout(() => {
      if (window.toScreen) {
        window.toScreen('menu');
      } else {
        // Fallback if toScreen is not available
        window.location.href = 'infestation.html';
      }
    }, 3000);  // 3 second delay to show the medal and new best score
  }

  function gameTick() {
    if (gameEnded) return;  // Don't continue if game has ended
    
    adjustSpawnRate();
    spawnBug();
  }

  // Clear any existing bugs and intervals from previous games
  gameArea.innerHTML = '';
  
  // Clear any existing intervals (important for mode switching!)
  if (window.currentGameLoop) {
    clearInterval(window.currentGameLoop);
  }
  
  // Reset displays
  scoreDisplay.textContent = 'Score: 0';
  missDisplay.textContent = 'Misses: 0';
  medalPanel.textContent = '';
  
  // Remove any previous mode styling and add normal styling
  gameArea.classList.remove('easy', 'hard');
  
  // Start the endless spawn loop and store globally for cleanup
  spawnLoop = setInterval(gameTick, spawnInterval);
  window.currentGameLoop = spawnLoop;
}
