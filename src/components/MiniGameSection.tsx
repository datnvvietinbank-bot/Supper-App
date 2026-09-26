import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Fuel, 
  Award, 
  Play, 
  Info,
  Gift
} from 'lucide-react';
import contentData from '../data/contentData.json';

// Extend window for global callbacks requested in specification
declare global {
  interface Window {
    onFlappyVoucherWin?: (data: {
      score: number;
      voucherCode: string;
      reward: string;
      timestamp: string;
    }) => void;
    onFlappyVoucherLose?: (data: {
      score: number;
      timestamp: string;
    }) => void;
  }
}

// Config variables specified in PDF page 3 & 4
const WIN_SCORE = 20;
const GRAVITY = 0.28;
const JUMP_FORCE = -6.2;
const PIPE_SPEED = 2.2;
const PIPE_GAP = 160;
const PIPE_SPACING = 240;
const VOUCHER_TEXT = "Voucher 2 lít xăng";
const BRAND_NAME = "VietinBank";
const GAME_TITLE = "Chờ vui – Chơi hay – Nhận quà liền tay";

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

export const MiniGameSection: React.FC = () => {
  const { miniGame } = contentData;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game state
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [currentVoucher, setCurrentVoucher] = useState<string>('');
  const [latestSavedVoucher, setLatestSavedVoucher] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Audio Context (Synthesized sound effects, muted by default)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSynthSound = useCallback((type: 'jump' | 'score' | 'hit' | 'win') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'jump') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'score') {
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        osc.frequency.setValueAtTime(783.99, now + 0.3);
        osc.frequency.setValueAtTime(1046.50, now + 0.45);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch {
      // Audio not supported or blocked
    }
  }, [soundEnabled]);

  // Load persistence
  useEffect(() => {
    const savedHigh = localStorage.getItem('vietinbank_flappy_high_score');
    if (savedHigh) setHighScore(parseInt(savedHigh, 10));

    const savedVoucher = localStorage.getItem('vietinbank_flappy_last_voucher');
    if (savedVoucher) setLatestSavedVoucher(savedVoucher);
  }, []);

  // Generate Voucher code VB-XXXXXX
  const generateVoucherCode = (): string => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `VB-${randomDigits}`;
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Game loop references
  const birdRef = useRef({
    x: 80,
    y: 200,
    velocity: 0,
    width: 44,
    height: 32,
    rotation: 0
  });

  const pipesRef = useRef<Pipe[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const internalScoreRef = useRef<number>(0);
  const cloudsRef = useRef<{ x: number; y: number; speed: number; scale: number }[]>([
    { x: 50, y: 40, speed: 0.4, scale: 0.9 },
    { x: 220, y: 80, speed: 0.3, scale: 1.2 },
    { x: 380, y: 50, speed: 0.5, scale: 0.8 }
  ]);

  // Cheering dynamic message
  const getCheerText = (current: number) => {
    if (current < 5) return miniGame.cheers.under5;
    if (current < 10) return miniGame.cheers.under10;
    if (current < 15) return miniGame.cheers.under15;
    if (current < 20) return miniGame.cheers.under20;
    return miniGame.cheers.win;
  };

  // Jump action
  const jump = useCallback(() => {
    if (gameState !== 'playing') return;
    birdRef.current.velocity = JUMP_FORCE;
    playSynthSound('jump');
  }, [gameState, playSynthSound]);

  // Start Game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    internalScoreRef.current = 0;
    birdRef.current = {
      x: 80,
      y: 200,
      velocity: 0,
      width: 44,
      height: 32,
      rotation: 0
    };
    pipesRef.current = [];
    setIsShaking(false);
  };

  // End Game (Lose)
  const endGame = useCallback((finalScore: number) => {
    setGameState('gameover');
    playSynthSound('hit');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);

    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('vietinbank_flappy_high_score', finalScore.toString());
    }

    if (typeof window.onFlappyVoucherLose === 'function') {
      window.onFlappyVoucherLose({
        score: finalScore,
        timestamp: new Date().toISOString()
      });
    }
  }, [highScore, playSynthSound]);

  // Win Game
  const winGame = useCallback(() => {
    setGameState('won');
    playSynthSound('win');
    const voucher = generateVoucherCode();
    setCurrentVoucher(voucher);
    setLatestSavedVoucher(voucher);
    setHighScore(20);

    localStorage.setItem('vietinbank_flappy_high_score', '20');
    localStorage.setItem('vietinbank_flappy_last_voucher', voucher);

    // Confetti celebration blast
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#005baa', '#ed1b24', '#fbb03b', '#ffffff']
    });

    if (typeof window.onFlappyVoucherWin === 'function') {
      window.onFlappyVoucherWin({
        score: 20,
        voucherCode: voucher,
        reward: VOUCHER_TEXT,
        timestamp: new Date().toISOString()
      });
    }
  }, [playSynthSound]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastPipeTime = 0;

    const render = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear & Background (VietinBank Sky Gradient)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#e0f2fe'); // Light sky blue
      skyGrad.addColorStop(0.7, '#f0f9ff');
      skyGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      cloudsRef.current.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x < -100) cloud.x = width + 50;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 25 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 20 * cloud.scale, cloud.y - 10 * cloud.scale, 30 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 45 * cloud.scale, cloud.y, 25 * cloud.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant city skyline representing VietinBank branches
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(30, height - 120, 45, 70);
      ctx.fillRect(90, height - 150, 60, 100);
      ctx.fillRect(170, height - 110, 50, 60);
      ctx.fillRect(240, height - 165, 75, 115);
      ctx.fillRect(330, height - 130, 55, 80);

      // Ground (Grass + Bank border)
      ctx.fillStyle = '#005baa';
      ctx.fillRect(0, height - 45, width, 6);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, height - 39, width, 39);

      // Decorative ground stripes
      ctx.fillStyle = '#e2e8f0';
      for (let x = 0; x < width; x += 30) {
        ctx.fillRect(x, height - 35, 16, 35);
      }

      // If Playing
      if (gameState === 'playing') {
        // Physics: Bird Gravity & Velocity
        birdRef.current.velocity += GRAVITY;
        birdRef.current.y += birdRef.current.velocity;
        birdRef.current.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, birdRef.current.velocity * 0.08));

        // Check Floor and Ceiling Collisions
        if (birdRef.current.y + birdRef.current.height / 2 >= height - 45) {
          birdRef.current.y = height - 45 - birdRef.current.height / 2;
          endGame(internalScoreRef.current);
          return;
        }
        if (birdRef.current.y - birdRef.current.height / 2 <= 0) {
          birdRef.current.y = birdRef.current.height / 2;
          birdRef.current.velocity = 0;
        }

        // Spawn Pipes
        if (time - lastPipeTime > 1600 && pipesRef.current.length < 5) {
          const minHeight = 60;
          const maxHeight = height - 45 - PIPE_GAP - minHeight;
          const topHeight = Math.floor(minHeight + Math.random() * (maxHeight - minHeight));
          pipesRef.current.push({
            x: width,
            topHeight,
            bottomY: topHeight + PIPE_GAP,
            passed: false
          });
          lastPipeTime = time;
        }

        // Update Pipes
        const pipeWidth = 52;
        for (let i = pipesRef.current.length - 1; i >= 0; i--) {
          const pipe = pipesRef.current[i];
          pipe.x -= PIPE_SPEED;

          // Check Score
          if (!pipe.passed && pipe.x + pipeWidth < birdRef.current.x) {
            pipe.passed = true;
            internalScoreRef.current += 1;
            setScore(internalScoreRef.current);
            playSynthSound('score');

            if (internalScoreRef.current >= WIN_SCORE) {
              winGame();
              return;
            }
          }

          // Check Collisions (AABB)
          const birdBox = {
            left: birdRef.current.x - birdRef.current.width / 2 + 4,
            right: birdRef.current.x + birdRef.current.width / 2 - 4,
            top: birdRef.current.y - birdRef.current.height / 2 + 4,
            bottom: birdRef.current.y + birdRef.current.height / 2 - 4
          };

          // Top pipe collision
          if (
            birdBox.right > pipe.x &&
            birdBox.left < pipe.x + pipeWidth &&
            birdBox.top < pipe.topHeight
          ) {
            endGame(internalScoreRef.current);
            return;
          }

          // Bottom pipe collision
          if (
            birdBox.right > pipe.x &&
            birdBox.left < pipe.x + pipeWidth &&
            birdBox.bottom > pipe.bottomY
          ) {
            endGame(internalScoreRef.current);
            return;
          }

          // Remove offscreen
          if (pipe.x + pipeWidth < -20) {
            pipesRef.current.splice(i, 1);
          }
        }
      }

      // Draw Pipes (Modern Banking Pillars: VietinBank Deep Blue with Cyan Highlights)
      const pipeWidth = 52;
      pipesRef.current.forEach((pipe) => {
        // Top Pipe
        const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        topGrad.addColorStop(0, '#003b73');
        topGrad.addColorStop(0.5, '#005baa');
        topGrad.addColorStop(1, '#00284d');
        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Top Pipe Cap
        ctx.fillStyle = '#005baa';
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, pipeWidth + 8, 20);
        ctx.strokeStyle = '#ed1b24';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x - 4, pipe.topHeight - 20, pipeWidth + 8, 20);

        // Bottom Pipe
        const bottomGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        bottomGrad.addColorStop(0, '#003b73');
        bottomGrad.addColorStop(0.5, '#005baa');
        bottomGrad.addColorStop(1, '#00284d');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, height - 45 - pipe.bottomY);

        // Bottom Pipe Cap
        ctx.fillStyle = '#005baa';
        ctx.fillRect(pipe.x - 4, pipe.bottomY, pipeWidth + 8, 20);
        ctx.strokeStyle = '#ed1b24';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x - 4, pipe.bottomY, pipeWidth + 8, 20);
      });

      // Draw Hero Mascot: Flying VietinBank Card with Wings
      ctx.save();
      ctx.translate(birdRef.current.x, birdRef.current.y);
      ctx.rotate(birdRef.current.rotation);

      // Card body
      const cw = birdRef.current.width;
      const ch = birdRef.current.height;
      const cardGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
      cardGrad.addColorStop(0, '#005baa');
      cardGrad.addColorStop(1, '#002b55');
      ctx.fillStyle = cardGrad;
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6);
      ctx.fill();

      // Card border
      ctx.strokeStyle = '#fbb03b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Card Chip (Gold)
      ctx.fillStyle = '#fbb03b';
      ctx.fillRect(-cw / 2 + 5, -ch / 2 + 7, 9, 8);

      // Card Brand Text (VB)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Vietin', -cw / 2 + 16, -ch / 2 + 14);

      // Wings (Flapping animation)
      const flapOffset = Math.sin(time * 0.015) * 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#005baa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(-4, -ch / 2 - 2 + flapOffset * 0.4, 12, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [gameState, endGame, winGame, playSynthSound]);

  // Handle Spacebar & Pointer Jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start' || gameState === 'gameover' || gameState === 'won') {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump]);

  return (
    <div id="flappy-voucher-game" ref={containerRef} className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Game Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Mini Game Quầy Giao Dịch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {miniGame.gameTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {miniGame.description}
        </p>
      </div>

      {/* Main Game Card */}
      <div className={`relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-lg mx-auto ${isShaking ? 'animate-bounce' : ''}`}>
        {/* Top Control Bar: Audio + Score Tracker */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              Điểm: <strong className="text-[#005baa] text-sm">{score}</strong>/20
            </span>
            {highScore > 0 && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Kỷ lục: {highScore}/20
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#005baa]" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-[11px] font-semibold text-[#005baa] bg-blue-50 px-2 py-0.5 rounded-md">
              {getCheerText(score)}
            </span>
          </div>
        </div>

        {/* Progress Bar 0 to 20 */}
        <div className="w-full bg-slate-200 h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#005baa] via-amber-400 to-[#ed1b24] transition-all duration-200"
            style={{ width: `${Math.min(100, (score / WIN_SCORE) * 100)}%` }}
          />
        </div>

        {/* Canvas Game Stage */}
        <div 
          className="relative w-full aspect-4/5 sm:aspect-4/4.5 max-h-[460px] bg-sky-50 touch-none select-none cursor-pointer flex items-center justify-center overflow-hidden"
          onClick={() => {
            if (gameState === 'playing') jump();
          }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={460}
            className="w-full h-full object-contain block"
          />

          {/* OVERLAY: Start Screen */}
          {gameState === 'start' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#005baa] to-[#003b73] text-white flex items-center justify-center shadow-lg border border-white/20">
                <Fuel className="w-8 h-8 text-amber-300" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {miniGame.gameTitle}
                </h2>
                <p className="text-xs text-white/90 max-w-xs leading-relaxed">
                  {miniGame.description}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="px-8 py-3 bg-[#ed1b24] hover:bg-[#c9121a] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu chơi</span>
              </button>

              <p className="text-[11px] text-white/80 font-medium">
                {miniGame.instructionText}
              </p>
            </div>
          )}

          {/* OVERLAY: Game Over (Lose Screen) */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center shadow-md">
                <RotateCcw className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {miniGame.loseTitle.replace('{score}', score.toString())}
                </h3>
                <p className="text-xs text-slate-300 max-w-xs">
                  {miniGame.loseSubtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="w-full py-2.5 bg-[#005baa] hover:bg-[#004785] text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chơi lại</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameState('start');
                  }}
                  className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Về màn hình chính
                </button>
              </div>
            </div>
          )}

          {/* OVERLAY: Win Screen */}
          {gameState === 'won' && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-3.5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-400/40 animate-pulse">
                <Trophy className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-amber-300">
                  {miniGame.winTitle}
                </h3>
                <p className="text-xs text-slate-200 max-w-xs">
                  {miniGame.winDescription}
                </p>
              </div>

              {/* Prominent Voucher Code Box */}
              <div className="w-full max-w-xs bg-white text-slate-900 p-3.5 rounded-2xl shadow-xl border-2 border-amber-400 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Mã Voucher Của Bạn
                </span>
                <div className="text-2xl font-mono font-black tracking-wider text-[#005baa]">
                  {currentVoucher}
                </div>
                <div className="text-[11px] font-semibold text-[#ed1b24]">
                  {VOUCHER_TEXT}
                </div>
              </div>

              <p className="text-[11px] text-amber-200 max-w-xs leading-tight">
                {miniGame.winInstruction}
              </p>

              <div className="flex items-center gap-2 w-full max-w-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyVoucherCode(currentVoucher);
                  }}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép mã'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Chơi lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom helper tip */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#005baa]" />
            Thao tác: Nhấn chuột hoặc chạm màn hình
          </span>
          <span className="font-semibold text-slate-700">Mục tiêu: 20 điểm</span>
        </div>
      </div>

      {/* Latest Saved Voucher Box (Persisted in localStorage) */}
      {latestSavedVoucher && (
        <div className="max-w-lg mx-auto p-4 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl border border-blue-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005baa] text-white flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Mã nhận quà gần nhất đã lưu
              </span>
              <span className="text-base font-mono font-extrabold text-[#005baa]">
                {latestSavedVoucher}
              </span>
            </div>
          </div>
          <button
            onClick={() => copyVoucherCode(latestSavedVoucher)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép</span>
          </button>
        </div>
      )}
    </div>
  );
};
