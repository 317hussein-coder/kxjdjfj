import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Gamepad2, 
  RotateCcw, 
  Trophy, 
  Zap, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Music, 
  Disc, 
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Target
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

type ActiveGame = '2048' | 'pong' | 'memory' | 'snake' | 'reaction' | 'beatpad' | 'wheel' | 'riddles';

export const ArcadeZone: React.FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('2048');

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      
      {/* Game Selector Tabs */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: '2048', label: '2048 Ultra', icon: <Layers className="w-4 h-4" /> },
          { id: 'pong', label: 'Cyber Pong', icon: <Activity className="w-4 h-4" /> },
          { id: 'memory', label: 'تقليب البطاقات', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'snake', label: 'الثعبان الكلاسيكي', icon: <Gamepad2 className="w-4 h-4" /> },
          { id: 'reaction', label: 'سرعة رد الفعل', icon: <Zap className="w-4 h-4" /> },
          { id: 'beatpad', label: 'استوديو الإيقاعات (16 Pad)', icon: <Music className="w-4 h-4" /> },
          { id: 'wheel', label: 'عجلة الحظ والقرارات', icon: <Disc className="w-4 h-4" /> },
          { id: 'riddles', label: 'بنك الألغاز الذكية', icon: <HelpCircle className="w-4 h-4" /> },
        ].map(tab => {
          const isActive = activeGame === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick(isActive ? 600 : 750);
                setActiveGame(tab.id as ActiveGame);
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-500/25'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Active Game View */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 min-h-[500px]">
        {activeGame === '2048' && <Game2048 />}
        {activeGame === 'pong' && <GameCyberPong />}
        {activeGame === 'memory' && <GameMemoryMatch />}
        {activeGame === 'snake' && <GameSnake />}
        {activeGame === 'reaction' && <GameReactionTime />}
        {activeGame === 'beatpad' && <GameBeatPad />}
        {activeGame === 'wheel' && <GameLuckyWheel />}
        {activeGame === 'riddles' && <GameRiddles />}
      </div>

    </div>
  );
};

// ==========================================
// 1. GAME: 2048 ULTRA
// ==========================================
const Game2048: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>([
    [0, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState<number>(6);
  const [bestScore, setBestScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('superhub_2048_best') || '128', 10);
  });
  const [gameOver, setGameOver] = useState<boolean>(false);

  const addRandomTile = (currentGrid: number[][]): number[][] => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentGrid;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const initGame = () => {
    soundManager.playClick(800);
    let g = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
    setScore(0);
    setGameOver(false);
  };

  const slideRow = (row: number[]): { newRow: number[]; gained: number } => {
    const filtered = row.filter(val => val !== 0);
    const newRow: number[] = [];
    let gained = 0;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === filtered[i + 1]) {
        const merged = filtered[i] * 2;
        newRow.push(merged);
        gained += merged;
        i++;
      } else {
        newRow.push(filtered[i]);
      }
    }
    while (newRow.length < 4) newRow.push(0);
    return { newRow, gained };
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    let moved = false;
    let addedScore = 0;
    let newGrid = grid.map(row => [...row]);

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const { newRow, gained } = slideRow(newGrid[r]);
        if (newRow.some((val, idx) => val !== newGrid[r][idx])) moved = true;
        newGrid[r] = newRow;
        addedScore += gained;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...newGrid[r]].reverse();
        const { newRow, gained } = slideRow(reversed);
        const normal = newRow.reverse();
        if (normal.some((val, idx) => val !== newGrid[r][idx])) moved = true;
        newGrid[r] = normal;
        addedScore += gained;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        const { newRow, gained } = slideRow(col);
        for (let r = 0; r < 4; r++) {
          if (newGrid[r][c] !== newRow[r]) moved = true;
          newGrid[r][c] = newRow[r];
        }
        addedScore += gained;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
        const { newRow, gained } = slideRow(col);
        for (let r = 0; r < 4; r++) {
          if (newGrid[3 - r][c] !== newRow[r]) moved = true;
          newGrid[3 - r][c] = newRow[r];
        }
        addedScore += gained;
      }
    }

    if (moved) {
      soundManager.playPop();
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      const newTotal = score + addedScore;
      setScore(newTotal);
      if (newTotal > bestScore) {
        setBestScore(newTotal);
        localStorage.setItem('superhub_2048_best', newTotal.toString());
      }
    }
  }, [grid, score, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); move('left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move('right'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move('down'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const tileColors: Record<number, string> = {
    0: 'bg-white/5 text-transparent',
    2: 'bg-indigo-950/60 text-indigo-200 border border-indigo-700/30',
    4: 'bg-indigo-900/80 text-indigo-100 border border-indigo-600/40',
    8: 'bg-purple-900/80 text-purple-100 border border-purple-500/50 shadow-md',
    16: 'bg-purple-800 text-purple-100 border border-purple-400',
    32: 'bg-pink-800 text-pink-100 border border-pink-400',
    64: 'bg-pink-700 text-white font-extrabold shadow-lg shadow-pink-500/20',
    128: 'bg-amber-600 text-white font-extrabold shadow-lg shadow-amber-500/30',
    256: 'bg-amber-500 text-white font-black shadow-lg shadow-amber-500/40 text-2xl',
    512: 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/40 text-2xl',
    1024: 'bg-cyan-600 text-white font-black shadow-lg shadow-cyan-500/40 text-2xl',
    2048: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-pink-500 text-white font-black shadow-2xl text-3xl animate-pulse',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
      {/* Score Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white">2048 Ultra</h3>
          <p className="text-xs text-gray-400">استخدم الأسهم للتحريك ودمج المربعات</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 block font-bold">النقاط</span>
            <span className="text-sm font-black text-white font-mono">{score}</span>
          </div>
          <div className="bg-black/40 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-indigo-400 block font-bold">أفضل نتيجة</span>
            <span className="text-sm font-black text-indigo-200 font-mono">{bestScore}</span>
          </div>
          <button
            onClick={initGame}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="إعادة اللعب"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4x4 Grid Board */}
      <div className="relative p-3 bg-black/60 rounded-3xl border border-white/10 shadow-2xl">
        <div className="grid grid-cols-4 gap-2.5 w-72 h-72 sm:w-80 sm:h-80">
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-150 select-none ${
                  tileColors[val] || 'bg-indigo-500 text-white'
                }`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Touch Arrow Controls */}
      <div className="grid grid-cols-3 gap-2 w-48 pt-2 sm:hidden">
        <div />
        <button
          onClick={() => move('up')}
          className="p-3 bg-white/10 rounded-xl flex items-center justify-center text-white active:bg-indigo-600"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button
          onClick={() => move('left')}
          className="p-3 bg-white/10 rounded-xl flex items-center justify-center text-white active:bg-indigo-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => move('down')}
          className="p-3 bg-white/10 rounded-xl flex items-center justify-center text-white active:bg-indigo-600"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => move('right')}
          className="p-3 bg-white/10 rounded-xl flex items-center justify-center text-white active:bg-indigo-600"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. GAME: CYBER PONG (Canvas Physics)
// ==========================================
const GameCyberPong: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isGameRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 3;
    const paddleWidth = 10;
    const paddleHeight = 70;
    let playerPaddleY = canvas.height / 2 - paddleHeight / 2;
    let aiPaddleY = canvas.height / 2 - paddleHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      playerPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, mouseY - paddleHeight / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      playerPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, touchY - paddleHeight / 2));
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    const loop = () => {
      // Clear
      ctx.fillStyle = '#080a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Move Ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Wall bounce top/bottom
      if (ballY < 6 || ballY > canvas.height - 6) {
        ballSpeedY = -ballSpeedY;
        soundManager.playClick(400);
      }

      // AI Paddle tracking
      const aiTarget = ballY - paddleHeight / 2;
      aiPaddleY += (aiTarget - aiPaddleY) * 0.085; // AI difficulty

      // Player Paddle Collision (left)
      if (
        ballX - 6 <= 20 + paddleWidth &&
        ballX + 6 >= 20 &&
        ballY >= playerPaddleY &&
        ballY <= playerPaddleY + paddleHeight
      ) {
        ballSpeedX = Math.abs(ballSpeedX) + 0.15;
        const deltaY = ballY - (playerPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.18;
        soundManager.playClick(850);
      }

      // AI Paddle Collision (right)
      if (
        ballX + 6 >= canvas.width - 20 - paddleWidth &&
        ballX - 6 <= canvas.width - 20 &&
        ballY >= aiPaddleY &&
        ballY <= aiPaddleY + paddleHeight
      ) {
        ballSpeedX = -(Math.abs(ballSpeedX) + 0.15);
        const deltaY = ballY - (aiPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.18;
        soundManager.playClick(650);
      }

      // Point scored
      if (ballX < 0) {
        setAiScore(s => s + 1);
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = 4;
        soundManager.playClick(300);
      } else if (ballX > canvas.width) {
        setPlayerScore(s => s + 1);
        soundManager.playSuccess();
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -4;
      }

      // Draw Paddles
      // Player (Left - Cyan glow)
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.fillRect(20, playerPaddleY, paddleWidth, paddleHeight);

      // AI (Right - Pink glow)
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 10;
      ctx.fillRect(canvas.width - 20 - paddleWidth, aiPaddleY, paddleWidth, paddleHeight);

      // Draw Ball (White glow)
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isGameRunning]);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-xl font-black text-white">Cyber Pong (تنس الطاولة)</h3>
          <p className="text-xs text-gray-400">حرك الماوس للأعلى والأسفل لصد الكرة وهزيمة الذكاء الاصطناعي</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-lg font-black">
            <span className="text-cyan-400">أنت: {playerScore}</span>
            <span className="text-gray-500">-</span>
            <span className="text-pink-400">الكمبيوتر: {aiScore}</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick(700);
              setIsGameRunning(!isGameRunning);
            }}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            {isGameRunning ? 'إيقاف مؤقت' : 'ابدأ المباراة'}
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full max-w-[640px] h-auto bg-[#080a12] cursor-none block"
        />
        {!isGameRunning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <p className="text-base font-bold text-white mb-3">اضغط زر "ابدأ المباراة" للبدء باللعب</p>
            <button
              onClick={() => setIsGameRunning(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-sm shadow-xl active:scale-95"
            >
              انطلق الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. GAME: MEMORY MATCH 3D
// ==========================================
const GameMemoryMatch: React.FC = () => {
  const cardsList = ['🚀', '💎', '🔥', '⚡', '🌙', '🎯', '🪐', '🎸'];
  const [deck, setDeck] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);

  const initDeck = () => {
    soundManager.playClick(750);
    const duplicated = [...cardsList, ...cardsList];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((symbol, id) => ({ id, symbol, flipped: false, matched: false }));
    setDeck(shuffled);
    setFlippedIndices([]);
    setMoves(0);
  };

  useEffect(() => {
    initDeck();
  }, []);

  const handleCardClick = (idx: number) => {
    if (deck[idx].flipped || deck[idx].matched || flippedIndices.length === 2) return;
    soundManager.playClick(700);

    const newDeck = [...deck];
    newDeck[idx].flipped = true;
    setDeck(newDeck);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (newDeck[first].symbol === newDeck[second].symbol) {
        // Matched
        soundManager.playSuccess();
        setTimeout(() => {
          newDeck[first].matched = true;
          newDeck[second].matched = true;
          setDeck([...newDeck]);
          setFlippedIndices([]);
        }, 300);
      } else {
        // Not matched
        setTimeout(() => {
          newDeck[first].flipped = false;
          newDeck[second].flipped = false;
          setDeck([...newDeck]);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-xl font-black text-white">تحدي الذاكرة البصرية</h3>
          <p className="text-xs text-gray-400">اقلب البطاقات واكتشف الأزواج المتطابقة</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-indigo-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-bold">
            الحركات: {moves}
          </span>
          <button
            onClick={initDeck}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="إعادة التوزيع"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 p-4 bg-black/40 rounded-3xl border border-white/10">
        {deck.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl cursor-pointer select-none transition-all duration-300 border ${
              card.flipped || card.matched
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50'
            }`}
          >
            {card.flipped || card.matched ? card.symbol : '❓'}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. GAME: RETRO SNAKE
// ==========================================
const GameSnake: React.FC = () => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [isDead, setIsDead] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const gridSize = 20;

  const restartSnake = () => {
    soundManager.playClick(800);
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ]);
    setFood({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
    setDirection('UP');
    setIsDead(false);
    setScore(0);
  };

  useEffect(() => {
    if (isDead) return;
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        if (direction === 'UP') head.y -= 1;
        else if (direction === 'DOWN') head.y += 1;
        else if (direction === 'LEFT') head.x -= 1;
        else if (direction === 'RIGHT') head.x += 1;

        // Wall collisions (teleport or die - let's wrap around for smooth gameplay!)
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;

        // Self collision
        if (prevSnake.slice(1).some(seg => seg.x === head.x && seg.y === head.y)) {
          soundManager.playClick(300);
          setIsDead(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          soundManager.playPop();
          setScore(s => s + 10);
          setFood({
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [direction, food, isDead]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && direction !== 'DOWN') setDirection('UP');
      else if (e.key === 'ArrowDown' && direction !== 'UP') setDirection('DOWN');
      else if (e.key === 'ArrowLeft' && direction !== 'RIGHT') setDirection('LEFT');
      else if (e.key === 'ArrowRight' && direction !== 'LEFT') setDirection('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-xl font-black text-white">الثعبان السلس (Retro Snake)</h3>
          <p className="text-xs text-gray-400">التفاف حول الجدران دون الاصطدام بالجسم</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-green-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono">
            النقاط: {score}
          </span>
          <button
            onClick={restartSnake}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="إعادة البدء"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-black/60 rounded-3xl border border-white/10 p-2 shadow-2xl">
        <div className="relative w-full h-full bg-[#0a0d18] rounded-2xl overflow-hidden">
          {/* Food */}
          <div
            className="absolute rounded-full bg-pink-500 shadow-md shadow-pink-500/50 transition-all duration-100"
            style={{
              width: `${100 / gridSize}%`,
              height: `${100 / gridSize}%`,
              left: `${(food.x / gridSize) * 100}%`,
              top: `${(food.y / gridSize) * 100}%`,
            }}
          />
          {/* Snake */}
          {snake.map((segment, idx) => (
            <div
              key={idx}
              className={`absolute rounded-md ${
                idx === 0
                  ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 z-10'
                  : 'bg-emerald-600/80'
              }`}
              style={{
                width: `${100 / gridSize}%`,
                height: `${100 / gridSize}%`,
                left: `${(segment.x / gridSize) * 100}%`,
                top: `${(segment.y / gridSize) * 100}%`,
              }}
            />
          ))}

          {isDead && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
              <span className="text-xl font-black text-red-400 mb-1">انتهت المحاولة!</span>
              <p className="text-xs text-gray-300 mb-3">جمعت {score} نقطة</p>
              <button
                onClick={restartSnake}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                العب مرة أخرى
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. GAME: REACTION TIME TESTER
// ==========================================
const GameReactionTime: React.FC = () => {
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const startTest = () => {
    soundManager.playClick(600);
    setState('waiting');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = window.setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
      soundManager.playPop();
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      // Clicked too early
      clearTimeout(timerRef.current!);
      setState('idle');
      soundManager.playClick(300);
      alert('ضغطت مبكراً جداً! انتظر حتى تصبح الشاشة خضراء.');
    } else if (state === 'ready') {
      const elapsed = Date.now() - startTime;
      setReactionTime(elapsed);
      setState('result');
      soundManager.playSuccess();
    } else if (state === 'result' || state === 'idle') {
      startTest();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
      <div className="text-center">
        <h3 className="text-xl font-black text-white">مقياس سرعة رد الفعل العصبي</h3>
        <p className="text-xs text-gray-400">انقر بمجرد تحول لون الصندوق إلى الأخضر الفسفوري</p>
      </div>

      <div
        onClick={handleClick}
        className={`w-full h-64 rounded-3xl cursor-pointer flex flex-col items-center justify-center p-6 text-center select-none transition-all duration-150 border shadow-2xl ${
          state === 'idle'
            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/40'
            : state === 'waiting'
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            : state === 'ready'
            ? 'bg-emerald-500 border-emerald-300 text-black shadow-emerald-500/50 animate-pulse'
            : 'bg-indigo-900/80 border-indigo-400 text-white'
        }`}
      >
        {state === 'idle' && (
          <>
            <Zap className="w-12 h-12 text-indigo-400 mb-2" />
            <span className="text-lg font-bold">اضغط هنا لبدء الاختبار</span>
            <span className="text-xs text-gray-400 mt-1">ثم استعد للنقر الفوري عند الإشارة الخضراء</span>
          </>
        )}
        {state === 'waiting' && (
          <>
            <span className="text-2xl font-black mb-1">انتظر... 🛑</span>
            <span className="text-xs text-rose-300">لا تنقر الآن، ترقب الأخضر!</span>
          </>
        )}
        {state === 'ready' && (
          <span className="text-3xl font-black tracking-widest text-black">
            انقر الآن فوراً! ⚡
          </span>
        )}
        {state === 'result' && (
          <>
            <Trophy className="w-10 h-10 text-yellow-400 mb-1" />
            <span className="text-4xl font-mono font-black text-white">{reactionTime} ms</span>
            <span className="text-xs text-indigo-200 mt-2 font-semibold">
              {reactionTime! < 200
                ? 'خارق وسرعة رد فعل مذهلة! 🚀'
                : reactionTime! < 280
                ? 'ممتاز وأسرع من المعدل البشري الطبيعي! 👍'
                : 'جيد، يمكنك المحاولة للوصول إلى سرعة أعلى!'}
            </span>
            <span className="text-[11px] text-gray-400 mt-3 underline">انقر لإعادة الاختبار</span>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. GAME: 16-PAD BEAT SYNTHESIZER
// ==========================================
const GameBeatPad: React.FC = () => {
  const padLabels = [
    'Kick 808', 'Snare 1', 'Hi-Hat', 'Pluck C',
    'Sub Bass', 'Rimshot', 'Open Hat', 'Synth E',
    'Clap Vibe', 'Tom Low', 'Chime Zen', 'Chord G',
    'Laser SFX', 'Tom High', 'Sweep Up', 'Lead C6'
  ];

  return (
    <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto">
      <div className="text-center">
        <h3 className="text-xl font-black text-white">استوديو الإيقاعات والنغمات (16 Beat Pads)</h3>
        <p className="text-xs text-gray-400">انقر على الوسادات لتوليد نغمات ومؤثرات صوتية حية بالويب أوديو</p>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-4 bg-black/60 rounded-3xl border border-white/10 w-full">
        {padLabels.map((label, idx) => (
          <button
            key={idx}
            onClick={() => soundManager.playSynthPad(idx)}
            className="h-16 sm:h-20 rounded-2xl bg-white/5 hover:bg-gradient-to-tr hover:from-indigo-600 hover:to-pink-600 border border-white/10 hover:border-indigo-400 text-gray-300 hover:text-white flex flex-col items-center justify-center p-2 text-center transition-all duration-100 active:scale-95 group shadow-sm hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <Music className="w-4 h-4 text-indigo-400 group-hover:text-white mb-1" />
            <span className="text-[10px] sm:text-xs font-bold leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 7. GAME: LUCKY DECISION WHEEL
// ==========================================
const GameLuckyWheel: React.FC = () => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);

  const options = ['بيتزا 🍕', 'برجر 🍔', 'مشاوي 🥩', 'شاورما 🌯', 'سوشي 🍣', 'سلطة خفيفة 🥗', 'فلافل 🥙', 'باستا 🍝'];

  const spinWheel = () => {
    if (isSpinning) return;
    soundManager.playClick(800);
    setIsSpinning(true);
    setWinner(null);

    const randomRot = 1440 + Math.floor(Math.random() * 360);
    const newRot = rotation + randomRot;
    setRotation(newRot);

    setTimeout(() => {
      setIsSpinning(false);
      soundManager.playSuccess();
      const actualDeg = newRot % 360;
      const sliceSize = 360 / options.length;
      const index = Math.floor((360 - actualDeg) / sliceSize) % options.length;
      setWinner(options[index]);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto text-center">
      <div>
        <h3 className="text-xl font-black text-white">عجلة الحظ واتخاذ القرارات</h3>
        <p className="text-xs text-gray-400">محتار ماذا تأكل أو تقرر؟ دع عجلة الفيزياء تختار لك!</p>
      </div>

      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-pink-500 drop-shadow-md" />

        {/* Wheel Disc */}
        <div
          className="w-full h-full rounded-full border-4 border-white/20 shadow-2xl overflow-hidden relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
            background: 'conic-gradient(#6366f1 0deg 45deg, #a855f7 45deg 90deg, #ec4899 90deg 135deg, #f43f5e 135deg 180deg, #06b6d4 180deg 225deg, #10b981 225deg 270deg, #f59e0b 270deg 315deg, #3b82f6 315deg 360deg)'
          }}
        >
          {options.map((opt, i) => (
            <div
              key={i}
              className="absolute w-full h-full text-center pt-2 font-bold text-xs text-white drop-shadow"
              style={{
                transform: `rotate(${i * 45 + 22.5}deg)`,
                transformOrigin: '50% 50%'
              }}
            >
              {opt}
            </div>
          ))}
        </div>

        {/* Center Hub Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="absolute z-20 w-16 h-16 rounded-full bg-black text-white font-black text-xs border-2 border-white shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center"
        >
          {isSpinning ? 'يدور...' : 'دوّر!'}
        </button>
      </div>

      {winner && (
        <div className="p-3 bg-gradient-to-r from-indigo-600/30 to-pink-600/30 border border-indigo-400 rounded-2xl animate-in zoom-in-95">
          <span className="text-xs text-gray-300 block">القرار الفائز هو:</span>
          <span className="text-xl font-black text-white">{winner}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 8. GAME: RIDDLES & TRIVIA QUEST
// ==========================================
const GameRiddles: React.FC = () => {
  const riddles = [
    { q: 'ما هو الشيء الذي يمشي بأربع أرجل في الصباح، واثنتين في الظهر، وثلاث في المساء؟', a: 'الإنسان (يحبو طفلاً، يمشي شاباً، ويتوكأ على عصا شيخاً).' },
    { q: 'ما هو الشيء الذي كلما أخذت منه كَبُرَ؟', a: 'الحفرة.' },
    { q: 'شيء يملك أسناناً كثيرة ولكنه لا يعض، فما هو؟', a: 'المشط.' },
    { q: 'أنا أتكلم بلا لسان، وأسمع بلا أذنين، ولا جسد لي، ولكني أتنفس مع الرياح.. فمن أنا؟', a: 'الصدى.' },
    { q: 'ما هو الشيء الذي يوجد في وسط باريس؟', a: 'حرف الراء (ر).' },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const nextRiddle = () => {
    soundManager.playClick(750);
    setShowAnswer(false);
    setCurrentIndex(prev => (prev + 1) % riddles.length);
  };

  const current = riddles[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-4 max-w-lg mx-auto text-center">
      <div>
        <h3 className="text-xl font-black text-white">بنك الألغاز الذكية وتحديات التفكير</h3>
        <p className="text-xs text-gray-400">حاول حل اللغز في ذهنك قبل كشف الإجابة</p>
      </div>

      <div className="w-full glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold inline-block">
          لغز رقم {currentIndex + 1} من {riddles.length}
        </span>

        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          "{current.q}"
        </p>

        {showAnswer ? (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl animate-in fade-in">
            <span className="text-xs text-emerald-400 block font-semibold">الحل:</span>
            <span className="text-sm font-bold text-white">{current.a}</span>
          </div>
        ) : (
          <button
            onClick={() => {
              soundManager.playSuccess();
              setShowAnswer(true);
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            كشف الحل 💡
          </button>
        )}
      </div>

      <button
        onClick={nextRiddle}
        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 active:scale-95 transition"
      >
        اللغز التالي ➔
      </button>
    </div>
  );
};
