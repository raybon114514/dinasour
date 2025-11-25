const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');

// 遊戲變數
let gameSpeed = 3;
let score = 0;
let isGameOver = false;
let animationId;

// 恐龍物件
const dino = {
    x: 50,
    y: 150, // 地面高度 (canvas height - dino height)
    width: 30,
    height: 50,
    dy: 0,        // 垂直速度
    jumpForce: 10, // 跳躍力道
    gravity: 0.3, // 重力
    grounded: true,
    color: '#333'
};

// 障礙物陣列
let obstacles = [];
let spawnTimer = 0;

// 監聽按鍵 (空白鍵跳躍)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        jump();
    }
    // 遊戲結束後按空白鍵重玩
    if (isGameOver && event.code === 'Space') {
        resetGame();
    }
});

// 監聽觸控/點擊 (手機版)
document.addEventListener('touchstart', jump);
document.addEventListener('mousedown', () => {
    if(isGameOver) resetGame();
    else jump();
});

function jump() {
    if (dino.grounded) {
        dino.dy = -dino.jumpForce;
        dino.grounded = false;
    }
}

function spawnObstacle() {
    // 隨機生成障礙物
    spawnTimer++;
    // 每 60-150 幀生成一個 (隨機間隔)
    let randomInterval = Math.floor(Math.random() * 50) + 180;

    if (spawnTimer > randomInterval) {
        let obstacleHeight = Math.floor(Math.random() * 20) + 30; // 隨機高度 30-50
        obstacles.push({
            x: canvas.width,
            y: canvas.height - obstacleHeight,
            width: 20,
            height: obstacleHeight,
            color: '#d63031'
        });
        spawnTimer = 0;
    }
}

function update() {
    if (isGameOver) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 處理恐龍物理運動
    dino.dy += dino.gravity; // 加上重力
    dino.y += dino.dy;       // 更新位置

    // 地板碰撞檢測
    if (dino.y + dino.height > canvas.height) {
        dino.y = canvas.height - dino.height;
        dino.dy = 0;
        dino.grounded = true;
    } else {
        dino.grounded = false;
    }

    // 畫恐龍
    ctx.fillStyle = dino.color;
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // 2. 處理障礙物
    spawnObstacle();

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= gameSpeed; // 障礙物往左移

        // 畫障礙物
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // 碰撞檢測 (AABB 碰撞)
        if (
            dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y
        ) {
            // 撞到了！
            isGameOver = true;
            statusText.innerText = "遊戲結束！按空白鍵重試";
            statusText.style.color = "red";
        }

        // 移除超出畫面的障礙物並加分
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            gameSpeed += 0.1; // 越玩越快
            i--;
        }
    }

    // 3. 顯示分數
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    // 下一幀
    requestAnimationFrame(update);
}

function resetGame() {
    isGameOver = false;
    score = 0;
    gameSpeed = 3;
    obstacles = [];
    spawnTimer = 0;
    statusText.innerText = "遊戲進行中";
    statusText.style.color = "#535353";
    dino.y = 150;
    dino.dy = 0;
    update();
}

// 開始遊戲
update();