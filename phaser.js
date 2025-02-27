var config = {
    type: Phaser.AUTO,
    width: 515,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var board = [];
var rows = 8;
var columns = 8;
var candies = ["Blue", "Orange", "Green", "Red", "Purple", "Yellow"];
var score = 0;
var selectedCandy = null;
var candySize = 64;
var gameInProgress = false; 
var game = new Phaser.Game(config);
var resetButton; 
var scoreText;

function preload() {
    this.load.image('Blue', 'https://static.wikia.nocookie.net/candy-crush-saga/images/2/2d/BluecandyHTML5.png/revision/latest?cb=20211029175618');
    this.load.image('Orange', 'https://static.wikia.nocookie.net/candy-crush-saga/images/9/91/OrangecandyHTML5.png/revision/latest/scale-to-width-down/65?cb=20211029175615');
    this.load.image('Green', 'https://static.wikia.nocookie.net/candy-crush-saga/images/9/91/GreencandyHTML5.png/revision/latest/scale-to-width-down/65?cb=20211029175620');
    this.load.image('Red', 'https://static.wikia.nocookie.net/candy-crush-saga/images/4/45/RedcandyHTML5.png/revision/latest?cb=20211029175619');
    this.load.image('Purple', 'https://static.wikia.nocookie.net/candy-crush-saga/images/e/eb/PurplecandyHTML5.png/revision/latest/scale-to-width-down/69?cb=20211029175614');
    this.load.image('Yellow', 'https://static.wikia.nocookie.net/candy-crush-saga/images/2/24/YellowcandyHTML5.png/revision/latest/scale-to-width-down/65?cb=20211029175617');
}

function create() {
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    resetButton = this.add.text(410, 16, 'Reset', { 
        fontSize: '24px', 
        fill: '#fff',
        backgroundColor: '#ff0000',
        padding: { x: 10, y: 5 }
    }).setInteractive();
    
    resetButton.on('pointerdown', function() {
        resetGame(this.scene);
    });
    
    createBoard(this);
    this.input.on('gameobjectdown', onObjectClick, this);
}

function update() {

    if (gameInProgress) return;
    
    let matches = checkMatches();
    if (matches.length > 0) {
        gameInProgress = true;
        processMatches.call(this, matches);
    }
}

function resetGame(scene) {

    score = 0;
    scoreText.setText('Score: 0');
    
    if (selectedCandy) {
        selectedCandy.clearTint();
        selectedCandy = null;
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r] && board[r][c]) {
                board[r][c].destroy();
            }
        }
    }
    
    gameInProgress = false;
    createBoard(scene);
}

function createBoard(scene) {

    board = [];
    
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let xPos = c * candySize + candySize/2;
            let yPos = r * candySize + candySize/2 + 80; 
            
            let candy = scene.add.sprite(xPos, yPos, randomCandy())
                .setInteractive()
                .setDisplaySize(candySize - 6, candySize - 6) 
                .setOrigin(0.5);

            candy.setData('row', r);
            candy.setData('column', c);
            row.push(candy);
        }
        board.push(row);
    }
    
    while (checkMatches().length > 0) {

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                if (board[r][c]) board[r][c].destroy();
            }
        }

        board = [];
        for (let r = 0; r < rows; r++) {
            let row = [];
            for (let c = 0; c < columns; c++) {
                let xPos = c * candySize + candySize/2;
                let yPos = r * candySize + candySize/2 + 80;
                
                let candy = scene.add.sprite(xPos, yPos, randomCandy())
                    .setInteractive()
                    .setDisplaySize(candySize - 6, candySize - 6)
                    .setOrigin(0.5);

                candy.setData('row', r);
                candy.setData('column', c);
                row.push(candy);
            }
            board.push(row);
        }
    }
}

function randomCandy() {
    return candies[Phaser.Math.Between(0, candies.length - 1)];
}

function onObjectClick(pointer, gameObject) {

    if (gameInProgress) return;

    if (gameObject === resetButton) return;
    
    if (selectedCandy === null) {
        selectedCandy = gameObject;
        selectedCandy.setTint(0x00ff00); 
    } else {
        if (selectedCandy !== gameObject && isAdjacent(selectedCandy, gameObject)) {

            swapCandies.call(this, selectedCandy, gameObject);
        } else {

            selectedCandy.clearTint();
            selectedCandy = null;

            if (selectedCandy !== gameObject) {
                selectedCandy = gameObject;
                selectedCandy.setTint(0x00ff00);
            }
        }
    }
}

function isAdjacent(candy1, candy2) {
    let row1 = candy1.getData('row');
    let col1 = candy1.getData('column');
    let row2 = candy2.getData('row');
    let col2 = candy2.getData('column');

    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2);
}

function swapCandies(candy1, candy2) {
    gameInProgress = true;

    let row1 = candy1.getData('row');
    let col1 = candy1.getData('column');
    let row2 = candy2.getData('row');
    let col2 = candy2.getData('column');
    candy1.setData('row', row2);
    candy1.setData('column', col2);
    candy2.setData('row', row1);
    candy2.setData('column', col1);
    
    board[row1][col1] = candy2;
    board[row2][col2] = candy1;

    this.tweens.add({
        targets: candy1,
        x: candy2.x,
        y: candy2.y,
        duration: 200,
        ease: 'Power2'
    });
    
    this.tweens.add({
        targets: candy2,
        x: candy1.x,
        y: candy1.y,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {

            candy1.clearTint();
            selectedCandy = null;
            
            let matches = checkMatches();
            if (matches.length === 0) {

                candy1.setData('row', row1);
                candy1.setData('column', col1);
                candy2.setData('row', row2);
                candy2.setData('column', col2);
                
                board[row1][col1] = candy1;
                board[row2][col2] = candy2;

                this.tweens.add({
                    targets: candy1,
                    x: col1 * candySize + candySize/2,
                    y: row1 * candySize + candySize/2 + 80,
                    duration: 200,
                    ease: 'Power2'
                });
                
                this.tweens.add({
                    targets: candy2,
                    x: col2 * candySize + candySize/2,
                    y: row2 * candySize + candySize/2 + 80,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => {
                        gameInProgress = false;
                    }
                });
            } else {

                processMatches.call(this, matches);
            }
        }
    });
}

function checkMatches() {
    let matches = [];


    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];

            if (candy1 && candy2 && candy3 && 
                candy1.active && candy2.active && candy3.active &&
                candy1.texture.key === candy2.texture.key && 
                candy1.texture.key === candy3.texture.key) {
                matches.push([candy1, candy2, candy3]);
            }
        }
    }


    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];

            if (candy1 && candy2 && candy3 && 
                candy1.active && candy2.active && candy3.active &&
                candy1.texture.key === candy2.texture.key && 
                candy1.texture.key === candy3.texture.key) {
                matches.push([candy1, candy2, candy3]);
            }
        }
    }

    return matches;
}

function processMatches(matches) {

    let destroyedCandies = new Set();
    
    matches.forEach(match => {
        match.forEach(candy => {
            destroyedCandies.add(candy);
        });
    });
    

    destroyedCandies.forEach(candy => {
        let row = candy.getData('row');
        let col = candy.getData('column');

        board[row][col] = null;

        this.tweens.add({
            targets: candy,
            alpha: 0,
            scale: 1.2,
            duration: 100,
            onComplete: () => {
                candy.destroy();
                score += 10;
                scoreText.setText('Score: ' + score);
            }
        });
    });

    this.time.delayedCall(150, () => {
        dropCandies.call(this);
    });
}

function dropCandies() {
    let movesMade = false;

    for (let c = 0; c < columns; c++) {

        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c]) {

                for (let above = r - 1; above >= 0; above--) {
                    if (board[above][c]) {
                        let candy = board[above][c];
                        

                        board[r][c] = candy;
                        board[above][c] = null;

                        candy.setData('row', r);

                        this.tweens.add({
                            targets: candy,
                            y: r * candySize + candySize/2 + 80,
                            duration: 150 * (r - above), 
                            ease: 'Bounce.easeOut'
                        });
                        
                        movesMade = true;
                        break;
                    }
                }
            }
        }
    }
    

    this.time.delayedCall(300, () => {
        fillEmptySpaces.call(this);
    });
}

function fillEmptySpaces() {
    let anyEmpty = false;
    let animations = [];
    
    for (let c = 0; c < columns; c++) {
        let emptyCount = 0;
        

        for (let r = 0; r < rows; r++) {
            if (!board[r][c]) {
                emptyCount++;
                anyEmpty = true;
                

                let xPos = c * candySize + candySize/2;
                let yPos = (r - emptyCount) * candySize + candySize/2 + 80; 
                
                let newCandy = this.add.sprite(xPos, yPos, randomCandy())
                    .setInteractive()
                    .setDisplaySize(candySize - 6, candySize - 6)
                    .setOrigin(0.5);
                

                newCandy.setData('row', r);
                newCandy.setData('column', c);

                board[r][c] = newCandy;
                

                let anim = this.tweens.add({
                    targets: newCandy,
                    y: r * candySize + candySize/2 + 80, 
                    duration: 300,
                    ease: 'Bounce.easeOut'
                });
                
                animations.push(anim);
            }
        }
    }
    

    if (animations.length > 0) {
        this.time.delayedCall(350, () => {
            let matches = checkMatches();
            if (matches.length > 0) {
                processMatches.call(this, matches); 
            } else {
                gameInProgress = false; 
            }
        });
    } else {
        gameInProgress = false; 
    }
}