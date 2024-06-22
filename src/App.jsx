import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_FOOD = { x: 15, y: 15 };

function generateRandomCoordinates(exclude) {
  let x, y;
  do {
    x = Math.floor(Math.random() * GRID_SIZE);
    y = Math.floor(Math.random() * GRID_SIZE);
  } while (exclude.some(item => item.x === x && item.y === y));
  return { x, y };
}

function InstructionsModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Instructions</h2>
        <p>- Use arrow keys to control the snake</p>
        <p>- Eat the food to grow and increase your score</p>
        <p>- Avoid the obstacles</p>
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
}

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE.map(segment => ({ ...segment, className: 'snake' })));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE.map(segment => ({ ...segment, className: 'snake' })));
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setObstacles(generateRandomObstacles());
    setGameOver(false);
    setScore(0);
  };

  const generateRandomObstacles = () => {
    const newObstacles = [];
    for (let i = 0; i < 6; i++) { // Adjust the number of obstacles as needed
      const obstacle = generateRandomCoordinates([...snake, food, ...newObstacles]);
      newObstacles.push(obstacle);
    }
    return newObstacles;
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const newHead = {
        x: (prevSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (prevSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
        className: 'snake' // Default class
      };

      if (obstacles.some(obstacle => obstacle.x === newHead.x && obstacle.y === newHead.y)) {
        setGameOver(true);
        return prevSnake.map((segment, index) => ({
          ...segment,
          className: index === 0 ? 'snake-collision' : 'snake'
        }));
      }

      if (newHead.x === food.x && newHead.y === food.y) {
        setFood(() => {
          let newFood;
          do {
            newFood = generateRandomCoordinates([...snake, ...obstacles]);
          } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) || obstacles.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y));
          return newFood;
        });
        setScore(prevScore => {
          const newScore = prevScore + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        return [newHead, ...prevSnake];
      }

      if (prevSnake.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake.map((segment, index) => ({
          ...segment,
          className: index === 0 ? 'snake-collision' : 'snake'
        }));
      }

      return [newHead, ...prevSnake.slice(0, -1)];
    });
  }, [direction, food, gameOver, highScore, obstacles, snake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp': setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': setDirection({ x: 1, y: 0 }); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    setObstacles(generateRandomObstacles());
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 100);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="game-container">
      <div className="game-area">
        <h1 className="retro-title">Retro Viper</h1>
        <div className="score">Score: {score}</div>
        <div className="high-score">High Score: {highScore}</div>
        <div className="grid">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;
            const isObstacle = obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
            const snakeClass = isSnake ? (snake.find(segment => segment.x === x && segment.y === y)?.className || 'snake') : '';

            return (
              <div
                key={index}
                className={`cell ${snakeClass} ${isFood ? 'food' : ''} ${isObstacle ? 'obstacle' : ''}`}
              />
            );
          })}
        </div>
        {!gameOver && (
          <button onClick={toggleInstructions} className="instructions-btn">How to Play</button>
        )}
        {gameOver && (
          <div className="game-over">
            <div>Game Over!</div>
            <button onClick={resetGame} className="play-again-btn">Play Again</button>
            <p className="footer">Developed by asifaqeel50@gmail.com</p>
          </div>
        )}
      </div>
      {showInstructions && <InstructionsModal onClose={toggleInstructions} />}
    </div>
  );
}

export default App;
