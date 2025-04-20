'use client';
import { useState, useEffect, useRef } from "react";

export default function AimTrainerApp() {
  const [mode, setMode] = useState("click");
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [targets, setTargets] = useState([]);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('aimTrainerHistory') || '[]'));
  const canvasRef = useRef(null);

  const generateTarget = () => {
    const size = 50;
    const x = Math.random() * (800 - size);
    const y = Math.random() * (600 - size);
    return { x, y, size, id: Date.now() };
  };

  const handleCanvasClick = (e: any) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    setShots(prev => prev + 1);

    const target = targets[0];
    if (
      clickX >= target.x &&
      clickX <= target.x + target.size &&
      clickY >= target.y &&
      clickY <= target.y + target.size
    ) {
      setScore(prev => prev + 1);
      setTargets([generateTarget()]);
    }
  };

  useEffect(() => {
    if (started && mode === "click") {
      setScore(0);
      setShots(0);
      setStartTime(Date.now());
      setTargets([generateTarget()]);
    }
  }, [started, mode]);

  const endGame = () => {
    const duration = (Date.now() - startTime) / 1000;
    const accuracy = shots > 0 ? ((score / shots) * 100).toFixed(1) : 0;
    const newEntry = { mode, score, shots, accuracy, duration, timestamp: new Date().toISOString() };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('aimTrainerHistory', JSON.stringify(updatedHistory));
    setStarted(false);
  };

  useEffect(() => {
    let timer;
    if (started) {
      timer = setTimeout(endGame, 20000); // 20 seconds
    }
    return () => clearTimeout(timer);
  }, [started]);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Aim Trainer</h1>
        <p className="text-sm text-gray-400">Train your aim across multiple modes</p>
      </header>

      <nav className="flex gap-2 justify-center mb-4">
        {['click', 'tracking', 'flick', 'precision'].map((m) => (
          <button
            key={m}
            className={`px-4 py-2 rounded border ${mode === m ? 'bg-white text-black' : 'bg-gray-800 border-gray-700'}`}
            onClick={() => setMode(m)}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </nav>

      <main className="flex flex-col items-center">
        {!started ? (
          <button className="mb-6 bg-blue-500 px-4 py-2 rounded" onClick={() => setStarted(true)}>Start Training</button>
        ) : (
          <div className="w-full max-w-4xl h-[600px] bg-black relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={handleCanvasClick}
              className="cursor-crosshair absolute top-0 left-0"
            />
            {targets.map((t) => (
              <div
                key={t.id}
                className="absolute bg-red-500 rounded-full"
                style={{ width: t.size, height: t.size, left: t.x, top: t.y }}
              />
            ))}
          </div>
        )}
      </main>

      <section className="mt-8 text-center">
        <h2 className="text-xl font-semibold">Stats</h2>
        <p className="text-gray-400 text-sm">Accuracy, Reaction Time, Score History</p>
        {started && (
          <div className="mt-2">
            <p>Score: {score}</p>
            <p>Shots: {shots}</p>
            <p>Accuracy: {shots > 0 ? ((score / shots) * 100).toFixed(1) : 0}%</p>
          </div>
        )}
        {!started && history.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">History</h3>
            <ul className="text-sm text-gray-300">
              {history.map((entry, idx) => (
                <li key={idx} className="mb-1">
                  [{new Date(entry.timestamp).toLocaleTimeString()}] {entry.mode.toUpperCase()} - Score: {entry.score}, Accuracy: {entry.accuracy}%, Time: {entry.duration}s
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
