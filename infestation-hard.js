// infestation-hard.js

// Inject CSS rule for red hard-mode bugs
(function injectHardModeStyles() {
  const style = document.createElement('style');
  style.textContent = `
.bug.hard {
  background-color: #ff0000;
  width: 20px;
  height: 20px;
}

.bug.hard::before {
  content: '';
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  cursor: pointer;
}

#game-area.hard {
  background: linear-gradient(135deg, #fff0f0, #ffe8e8);
  border: 3px solid #f44336;
  box-shadow: inset 0 0 20px rgba(244, 67, 54, 0.3);
}
`;
  document.head.appendChild(style);
})();

export function startHardMode() {
  const gameArea     = document.getElementById('game-area');
  const scoreDisplay = document.getElementById('score');
  const missDisplay  = document.getElementById('misses');
  const medalPanel   = document.getElementById('medal-panel');
  const gameTitle    = document.querySelector('#game-container h1');

  // Update title and game area styling
  gameTitle.textContent = 'Infestation - Hard Mode';
  gameArea.classList.add('hard');

  // Set global game mode to prevent cross-contamination
  window.currentGameMode = 'hard';

  let score         = 0;
  let misses        = 0;
  let spawnInterval = 2000;
  const minInterval = 130;   // 0.13s = 130ms
  const adjustRate  = 5000;  // adjust every 5 seconds (faster than other modes)
  let lastAdjust    = Date.now();
  let spawnLoop;
  let gameEnded     = false;  // Add flag to prevent multiple game over triggers
  let activeBugTimers = [];   // Track all active bug timers for cleanup

  function spawnBug() {
    if (gameEnded) return;  // Don't spawn new bugs if game has ended
    
    const bug = document.createElement('div');
    bug.className = 'bug hard';
    bug.style.top  = `${Math.random() * 80 + 10}%`;
    bug.style.left = `-50px`;

    gameArea.appendChild(bug);

    const bugSpeed = 2000; // Fastest mode - 2000ms
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
      if (!squished && !gameEnded && window.currentGameMode === 'hard') {
        squished = true;
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        bug.remove();
      }
    });

    const bugTimer = setTimeout(() => {
      if (!squished && gameArea.contains(bug) && !gameEnded && window.currentGameMode === 'hard') {
        misses += 1;
        missDisplay.textContent = `Misses: ${misses}`;
        bug.remove();
        if (misses >= 10) endGame();
      }
    }, bugSpeed);
    
    // Track this timer so we can clear it if needed
    activeBugTimers.push(bugTimer);
  }

  function adjustSpawnRate() {
    if (gameEnded) return;  // Don't adjust if game has ended
    
    const now = Date.now();
    if (now - lastAdjust >= adjustRate && spawnInterval > minInterval) {
      // 1.4x speed increase (more gradual than other modes), rounded to 2nd decimal
      const newInterval = Math.round((spawnInterval / 1.4) * 100) / 100;
      spawnInterval = Math.max(newInterval, minInterval);
      lastAdjust = now;
      clearInterval(spawnLoop);
      spawnLoop = setInterval(gameTick, spawnInterval);
    }
  }

  function medalCheck() {
    if (score >= 1000) {
      medalPanel.textContent = '🏅 Honor Medal!';
    } else if (score >= 600) {
      medalPanel.textContent = '🥉 Bronze Medal!';
    } else {
      medalPanel.textContent = '';
    }
  }

  function saveScore() {
    const mode = 'Hard';
    
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
    
    // Clear all active bug timers
    activeBugTimers.forEach(timer => clearTimeout(timer));
    activeBugTimers = [];
    
    medalCheck();
    saveScore();
    
    // Clean up styling when game ends
    gameArea.classList.remove('hard');
    
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
  
  // Clear any active bug timers from previous games
  if (window.activeBugTimers) {
    window.activeBugTimers.forEach(timer => clearTimeout(timer));
  }
  window.activeBugTimers = activeBugTimers; // Store globally for cleanup
  
  // Reset displays
  scoreDisplay.textContent = 'Score: 0';
  missDisplay.textContent = 'Misses: 0';
  medalPanel.textContent = '';
  
  // Remove any previous mode styling and add hard styling
  gameArea.classList.remove('easy', 'normal');
  
  // Start the endless spawn loop and store globally for cleanup
  spawnLoop = setInterval(gameTick, spawnInterval);
  window.currentGameLoop = spawnLoop;
}
