import { Bodies, Body, Events, Engine, Render, Runner, World } from "matter-js";
import { FRUITS_HLW, CANDY_UPGRADE_MAP} from "./fruits";


function createWorld() {
    const engine = Engine.create();
    const element = document.getElementById('game-container');
    const isMobile = window.innerWidth <= 480; // True if screen width is 480px or less

    const render = Render.create({
        element,
        engine: engine,
        options: {
            wireframes: false,
            background: "#f9e2bb",
            width: isMobile ? 340 : 400,  // Adjust width for mobile
            height: isMobile ? 480 : 540, // Adjust height for mobile
        }

    });

    
   // Adjust walls based on screen size
const world = engine.world;
const leftWall = Bodies.rectangle(isMobile ? 0 : 0, isMobile ? 230 : 255, 15, isMobile ? 480 : 520, { 
    isStatic: true, 
    render: { fillStyle:  "#f9e2bb" } 
});
const rightWall = Bodies.rectangle(isMobile ? 335 : 400, isMobile ? 230 : 255, 10, isMobile ? 480: 520, { 
    isStatic: true, 
    render: { fillStyle:  "#f9e2bb" } 
});
const ground = Bodies.rectangle(isMobile ? 170 : 200, isMobile ? 470 : 520, isMobile ? 350 : 400, 15, { 
    isStatic: true, 
    render: { fillStyle: "#68A542" } 
});
const topLine = Bodies.rectangle(isMobile ? 170 : 200, 0, isMobile ? 350 : 400, 10, { 
    isStatic: true, 
    render: { fillStyle:  "#f9e2bb" } 
});
const base = Bodies.rectangle(isMobile ? 170 : 200, isMobile ? 480 : 530, isMobile ? 350 : 400, 20, { 
    isStatic: true, 
    render: { fillStyle: "#B7BFFC" } 
});
const gameEndLine = Bodies.rectangle(isMobile ? 170 : 200, 80, isMobile ? 360 : 400, 10, { 
    isStatic: true, 
    isSensor: true, 
    render: { visible: false }, 
    label: 'gameEnd' 
});

// Add walls to the world
World.add(world, [leftWall, rightWall, ground, topLine, base, gameEndLine]);

    // Add your gameEndLine using a gradient line in the DOM
    const gameEndLineElement = document.createElement('div');
    gameEndLineElement.className = 'gameEndLine';
    gameEndLineElement.style.display = 'none';  // Initially hide the game end line
    element.appendChild(gameEndLineElement);  // Attach the game end line to the game container


    Render.run(render);
    const runner = Runner.create();
    const start = Date.now();

    function gameLoop() {
        Runner.tick(runner, engine, Date.now() - start);
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);



// Load the best score from localStorage; if none exists, show 0
const loadBestScore = () => {
    const bestScore = localStorage.getItem('bestScore');
    return bestScore ? parseInt(bestScore) : 0;
};
    const gameState = {
        topLineVisible: false,
        topLineTriggered: false,
        isGameOver: false,
        score: 0,
        currentFruit: null,
        disableAction: false,
        currentBody: null,
        pairsColliding: {},
        bestScore: loadBestScore(), // Load best score from localStorage
    };
    const sounds = {
        drop: new Audio('/sounds/drop.mp3'),
        collide: new Audio('/sounds/collision.mp3'),
        largeCandy: new Audio('/sounds/largeCandy.mp3'),
        burstsound: new Audio('/sounds/burst.mp3')
    };
    

    const scoreDisplay = document.getElementById('scoreboard');
    const bestScoreDisplay = document.getElementById('bestvalue');

    function updateScoreboard() {
        scoreDisplay.textContent = `${gameState.score}`;
        bestScoreDisplay.textContent = `${gameState.bestScore}`;
    }
    updateScoreboard();

    let nextFruitIndex = 0;  // Store the next fruit index globally
    let upcomingFruitIndex = Math.floor(Math.random() * 5);  // Store a separate index for the next fruit to show
    
    function addFruit() {
        if (gameState.isGameOver) return;
    
        // Get the current fruit and its index
        const currentFruit = FRUITS_HLW[nextFruitIndex];
        const adjustedRadius = currentFruit.radius;
    
        // Show the next candy in the bubble using the upcoming fruit index
        const nextCandyElement = document.getElementById('nextCandy');
        nextCandyElement.innerHTML = '<div class="next">ネクスト</div>';  // Clear any previous candy image
    
        const img = document.createElement('img');
        img.src = `${FRUITS_HLW[upcomingFruitIndex].name}.png`;  // Show the image of the next upcoming candy
        nextCandyElement.appendChild(img);
    
        // Prepare for the next candy to drop after showing the current one
        setTimeout(() => {
            const candyFilter = {
                category: 0x0001,
                mask: 0x0001
            };
    
            // Create the body with the current fruit's details
            const body = Bodies.circle(180, 50, adjustedRadius, {
                collisionFilter: candyFilter,
                index: nextFruitIndex,  // Use the stored next fruit index for the current drop
                isSleeping: true,
                label: 'Circle Body',
                render: {
                    sprite: {
                        texture: `${currentFruit.name}.png`,  // Use the current candy's texture for display
                    }
                },
                restitution: 0.3,
                friction: 0.05,
                density: 0.5,
            });
    
            gameState.currentBody = body;
            gameState.currentFruit = currentFruit;
            World.add(world, body);
            updateScoreboard();
    
            // Now update the nextFruitIndex to the upcomingFruitIndex (the one already shown in the Next Bubble)
            nextFruitIndex = upcomingFruitIndex;
    
            // Randomize the next upcoming fruit index for the future drop
            let newIndex;
            do {
                // newIndex = Math.floor(Math.random() * FRUITS_HLW.length);  // Randomize the next fruit
                newIndex = Math.floor(Math.random() * 6);  // Randomize the next fruit
            } while (newIndex === nextFruitIndex);  // Ensure it's not the same as the current one
    
            // Set the upcomingFruitIndex to the newly randomized one for the Next Bubble
            upcomingFruitIndex = newIndex;
    
        }, 100);  // Delay before the candy appears on the game board
    }
    

    let burstPool = [];

    function createBurstPool() {
        for (let i = 0; i < 100; i++) {
            const burst = document.createElement('div');
            burst.className = 'burst-animation';
            burst.style.display = 'none';
    
            // Randomize size of the bubble
            const size = Math.random() * 20 + 10; // Bubble size between 10px to 30px
            burst.style.width = `${size}px`;
            burst.style.height = `${size}px`;
    
            document.getElementById('game-container').appendChild(burst);
            burstPool.push(burst);
        }
    }
    
    createBurstPool();

    function addBurstAnimation(position, _candyColor) {
        const numBursts = 20;  // Number of bursts per collision
        for (let i = 0; i < numBursts; i++) {
            const burst = burstPool.pop();
            if (!burst) return;
    
            // Randomize position around the collision point
            const randomOffsetX = (Math.random() - 0.5) * 10; // Random offset between -25 to +25px
            const randomOffsetY = (Math.random() - 0.5) * 15;
    
            // Set the position and translation CSS variables for animation
            burst.style.left = `${position.x + randomOffsetX}px`;
            burst.style.top = `${position.y + randomOffsetY}px`;
            burst.style.setProperty('--x-translate', `${randomOffsetX}px`);
            burst.style.setProperty('--y-translate', `${randomOffsetY}px`);
    
            // Randomize animation delay for a more natural effect
            burst.style.animationDelay = `${Math.random() * 0.5}s`;
    
            // Use gradient for colorful bubbles
            burst.style.background = `radial-gradient(circle, hsl(${Math.random() * 360}, 100%, 70%), hsl(${Math.random() * 360}, 100%, 50%))`;
    
            // Show burst
            burst.style.display = 'block';
    
            // Hide burst after animation
            setTimeout(() => {
                burst.style.display = 'none';
                burstPool.push(burst);  // Return the burst to the pool
            }, 1000);  // Match the burst animation duration
        }
    }
    
     function handleMouseOrTouch(event) {
        if (gameState.disableAction || gameState.isGameOver || !gameState.currentBody) return;
        const rect = document.getElementById('game-container').getBoundingClientRect();
        let xPosition = event.type === 'mousedown' ? event.clientX - rect.left : event.touches[0].clientX - rect.left;

        xPosition = Math.max(gameState.currentFruit.radius, Math.min(xPosition, rect.width - gameState.currentFruit.radius));
        if (gameState.currentBody) {
            Body.setPosition(gameState.currentBody, { x: xPosition, y: gameState.currentBody.position.y });
            gameState.disableAction = true;
            setTimeout(() => {
                sounds.drop.play();
                gameState.currentBody.isSleeping = false;
                Body.setVelocity(gameState.currentBody, { x: 0, y: 3 });

                setTimeout(() => {
                    gameState.disableAction = false;
                    addFruit();
                }, 1000);
            }, 100);
        }

    }

    document.getElementById('game-container').addEventListener('mousedown', handleMouseOrTouch);
    document.getElementById('game-container').addEventListener('touchstart', handleMouseOrTouch);
    window.onkeydown = (event) => {
        if (gameState.disableAction || gameState.isGameOver) return;

        switch (event.code) {
            case "KeyA":
                if (gameState.currentBody.position.x - gameState.currentFruit.radius > 10) {
                    Body.setPosition(gameState.currentBody, { x: gameState.currentBody.position.x - 10, y: gameState.currentBody.position.y });
                }
                break;
            case "KeyD":
                const containerWidth = document.getElementById('game-container').offsetWidth;
                if (gameState.currentBody.position.x + gameState.currentFruit.radius < containerWidth - 15) {
                    Body.setPosition(gameState.currentBody, { x: gameState.currentBody.position.x + 10, y: gameState.currentBody.position.y });
                }
                break;
                case "KeyS":
                    if (gameState.currentBody) {
                        gameState.currentBody.isSleeping = false;
                        sounds.drop.play();
                        gameState.disableAction = true;
                        setTimeout(() => {
                            addFruit();
                            gameState.disableAction = false;
                        }, 1000);
                    }
                    break;
                
        }
    };

    function applyAttraction(bodyA, bodyB) {
        const distance = Math.sqrt(
            (bodyB.position.x - bodyA.position.x) ** 2 + 
            (bodyB.position.y - bodyA.position.y) ** 2
        );
        
        if (distance < 100) {  // Adjust this value based on how close the candies need to be
            const forceMagnitude = 0.00002;  // Tune this value for the desired attraction strength
            
            const force = {
                x: (bodyB.position.x - bodyA.position.x) * forceMagnitude,
                y: (bodyB.position.y - bodyA.position.y) * forceMagnitude,
            };
    
            Body.applyForce(bodyA, bodyA.position, force);
            Body.applyForce(bodyB, bodyB.position, { x: -force.x, y: -force.y });
        }
    }

    engine.constraintIterations = 10;  // Increase this value if collisions are inaccurate
    engine.positionIterations = 10;  // Helps prevent overlap by running collision checks more times

    

    Events.on(engine, "collisionActive", (event) => {
        const collisions = event.pairs;
        collisions.forEach((collision) => {
            const { bodyA, bodyB } = collision;
             // Stop score updates if the game is already over
             if (gameState.isGameOver) return;
            if (!gameState.disableAction &&
                (collision.bodyA.label === "gameEnd" || collision.bodyB.label === "gameEnd")) {
                gameEndLineElement.style.display = 'block';
                endGame();
                return;
            }
            const indexA = bodyA.index;
            const indexB = bodyB.index;
            Body.applyForce(bodyA, bodyA.position, {
                x: (bodyB.position.x - bodyA.position.x) * 0.005,
                y: (bodyB.position.y - bodyA.position.y) * 0.005,
            });
            if (indexA !== undefined && indexB !== undefined && indexA === indexB && !gameState.isGameOver) {
                if (!gameState.pairsColliding[indexA]) {
                    gameState.pairsColliding[indexA] = true;
                     // Add attraction before they merge
                    applyAttraction(bodyA, bodyB);
                    sounds.collide.play();
                    addBurstAnimation(collision.bodyA.position, '_candyColor');
                    sounds.burstsound.play();
                    setTimeout(() => {
                        World.remove(world, [bodyA, bodyB]);
                    }, 100);
                    // Increment score if the game is not over
                if (!gameState.isGameOver) {
                    gameState.score += Math.floor(Math.random() * 8) + 1;
                    updateScoreboard();
                }
                     // Check the upgrade map for the next candy
                const upgradedIndex = CANDY_UPGRADE_MAP[indexA];
                if (upgradedIndex !== undefined && upgradedIndex < FRUITS_HLW.length) {
                    const upgradedFruit = FRUITS_HLW[upgradedIndex];
                    const upgradedBody = Bodies.circle(bodyA.position.x, bodyA.position.y, upgradedFruit.radius, {
                        index: upgradedIndex,
                        render: {
                            sprite: {
                                texture: `${upgradedFruit.name}.png`,
                            }
                        },
                        restitution: 0.3,
                        friction: 0.01,
                        density: 0.5,
                    });
                        World.add(world, upgradedBody);
                        sounds.largeCandy.play();
                    }
                    setTimeout(() => {
                        gameState.pairsColliding[indexA] = false;
                    }, 100);

                }
            }
        });

    });

    function endGame() {
        gameState.isGameOver = true;
        gameState.disableAction = true;

        const candies = world.bodies.filter(body => body.label === 'Circle Body');
        let candyIndex = 0;

        // Check and update best score in localStorage if the current score is the highest
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('bestScore', gameState.bestScore);
    }
    
        function burstNextCandy() {
            if (candyIndex >= candies.length) return;
    
            const candy = candies[candyIndex];
            addBurstAnimation(candy.position);  // Trigger the burst animation
            sounds.largeCandy.play();  // Play the burst sound
            World.remove(world, candy);  // Remove the candy from the world
            
            candyIndex++;
            setTimeout(burstNextCandy, 100);  // Delay next burst for more natural effect
        }
    
        burstNextCandy();
        
        setTimeout(() => {
            document.getElementById('final-score').textContent = `最終スコア: ${gameState.score}`;
            const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'), {
                keyboard: false
            });

            Runner.stop(runner);
            gameOverModal.show();
        }, 6000);
    }

    document.getElementById('replay-button').addEventListener('click', function () {
        // Reload the page to reset the game
        location.reload();
    });
    


    addFruit();
}
createWorld(1000 / 70);
