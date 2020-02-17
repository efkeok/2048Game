let board = new Array();
let score = 0;
let score_tmp = 0;
let hasConflicted = new Array();
//初始可以返回的次数为3
let timesForReturn;

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

$(document).ready(function() {
    if (documentWidth > 500) {
        gridContainerWidth = 500;
        cellSpace = 20;
        cellSideLength = 100;
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            let $div = $("<div class='grid-cell'></div>")
            $div.attr("id", "grid-cell-" + i + "-" + j)
            $div.css("top", getPositionTop(i, j));
            $div.css("left", getPositionLeft(i, j));
            $("#grid-container").append($div)
        }
    }
    prepareForMobile();
    newGame();


    document.body.addEventListener('touchmove', function(e) {
        e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
    }, {
        passive: false
    }); //passive 参数不能省略，用来兼容ios和android


    let EventUtil = {
        addHandler: function(element, type, handler) {
            if (element.addEventListener)
                element.addEventListener(type, handler, false);
            else if (element.attachEvent)
                element.attachEvent("on" + type, handler);
            else
                element["on" + type] = handler;
        },
        removeHandler: function(element, type, handler) {
            if (element.removeEventListener)
                element.removeEventListener(type, handler, false);
            else if (element.detachEvent)
                element.detachEvent("on" + type, handler);
            else
                element["on" + type] = handler;
        },
        /**
         * 监听触摸的方向
         * @param target            要绑定监听的目标元素
         * @param isPreventDefault  是否屏蔽掉触摸滑动的默认行为（例如页面的上下滚动，缩放等）
         * @param upCallback        向上滑动的监听回调（若不关心，可以不传，或传false）
         * @param rightCallback     向右滑动的监听回调（若不关心，可以不传，或传false）
         * @param downCallback      向下滑动的监听回调（若不关心，可以不传，或传false）
         * @param leftCallback      向左滑动的监听回调（若不关心，可以不传，或传false）
         */
        listenTouchDirection: function(target, isPreventDefault, upCallback, rightCallback, downCallback,
            leftCallback) {
            this.addHandler(target, "touchstart", handleTouchEvent);
            this.addHandler(target, "touchend", handleTouchEvent);
            this.addHandler(target, "touchmove", handleTouchEvent);
            let startX;
            let startY;

            function handleTouchEvent(event) {
                switch (event.type) {
                    case "touchstart":
                        startX = event.touches[0].pageX;
                        startY = event.touches[0].pageY;
                        break;
                    case "touchend":
                        let spanX = event.changedTouches[0].pageX - startX;
                        let spanY = event.changedTouches[0].pageY - startY;
                        if (Math.abs(spanX) > Math.abs(spanY)) { //认定为水平方向滑动
                            if (spanX > 30) { //向右
                                rightCallback()
                            } else if (spanX < -30) { //向左
                                leftCallback()
                            }
                        } else { //认定为垂直方向滑动
                            if (spanY > 30) { //向下
                                downCallback();
                            } else if (spanY < -30) { //向上
                                upCallback();
                            }
                        }
                        break;
                }
            }
        }
    }

    EventUtil.listenTouchDirection(document, true, function() {
        if (moveUp()) {
            setTimeout("generateOneNumber()", 210);
            setTimeout("isGameOver()", 300);
        }
    }, function() {
        if (moveRight()) {
            setTimeout("generateOneNumber()", 210);
            setTimeout("isGameOver()", 300);
        }
    }, function() {
        if (moveDown()) {
            setTimeout("generateOneNumber()", 210);
            setTimeout("isGameOver()", 300);
        }
    }, function() {
        if (moveLeft()) {
            setTimeout("generateOneNumber()", 210);
            setTimeout("isGameOver()", 300);
        }
    });

});


function prepareForMobile() {
    $("#grid-container").css("width", gridContainerWidth - 2 * cellSpace);
    $("#grid-container").css("height", gridContainerWidth - 2 * cellSpace);
    $("#grid-container").css("padding", cellSpace);
    $("#grid-container").css("border-radius", 0.02 * gridContainerWidth);

    $(".grid-cell").css("width", cellSideLength);
    $(".grid-cell").css("height", cellSideLength);
    $(".grid-cell").css("border-radius", 0.04 * cellSideLength);
}

function newGame() {
    init();
    generateOneNumber();
    generateOneNumber();
}

function init() {
    for (let i = 0; i < 4; i++) {
        board[i] = new Array();
        hasConflicted[i] = new Array();
        for (let j = 0; j < 4; j++) {
            board[i][j] = 0;
            hasConflicted[i][j] = false;
        }
    }

    updateBoardView();

    score = 0;
    timesForReturn = 3;
    $("#times").text(timesForReturn + "次");
    $("#score").text(score);
}

function goBack() {

    if (timesForReturn == 0) {
        return;
    }
    if (gameHistory.getHistory().length > 0) {
        copyArray(gameHistory.getHistory(), board);
        timesForReturn--;
        gameHistory.index--;
        updateBoardView();
        $("#times").text(timesForReturn + "次");
    }
}

function updateBoardView() {
    $(".number-cell").remove();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            $("#grid-container").append("<div class='number-cell' id = 'number-cell-" + i + '-' + j + "'></div>");
            let theNumberCell = $("#number-cell-" + i + "-" + j);
            if (board[i][j] == 0) {
                theNumberCell.css("width", "0px");
                theNumberCell.css("height", "0px");
                theNumberCell.css("top", getPositionTop(i, j) + cellSideLength / 2);
                theNumberCell.css("left", getPositionLeft(i, j) + cellSideLength / 2);
            } else {
                theNumberCell.css("width", cellSideLength);
                theNumberCell.css("height", cellSideLength);
                theNumberCell.css("top", getPositionTop(i, j));
                theNumberCell.css("left", getPositionLeft(i, j));
                theNumberCell.css("background-color", getNumberBackgroundColor(board[i][j]));
                theNumberCell.css("color", getNumberColor(board[i][j]));
                theNumberCell.text(board[i][j]);
            }
            hasConflicted[i][j] = false;
        }
    }
    $(".number-cell").css("line-height", cellSideLength + "px")
    $(".number-cell").css("border-radius", 0.04 * cellSideLength + "px")
}

function generateOneNumber() {
    if (noSpace(board)) {
        return false;
    }
    let numX = Math.floor(Math.random() * 4);
    let numY = Math.floor(Math.random() * 4);
    while (true) {
        if (board[numX][numY] == 0) {
            break;
        }
        numX = Math.floor(Math.random() * 4);
        numY = Math.floor(Math.random() * 4);
    }

    let num = Math.random() < 0.5 ? 2 : 4;

    board[numX][numY] = num;
    showNumberWithAnimation(numX, numY, num);

    return true;
}

$(document).keydown(function(event) {
    if(event.keyCode == 37 || event.keyCode == 38 ||event.keyCode == 39 ||event.keyCode == 40){
        isGameOver();
    }
    switch (event.keyCode) {
        case 37:
            if (moveLeft()) {
                setTimeout("generateOneNumber()", 210);
            }
            break;
        case 38:
            event.preventDefault();
            if (moveUp()) {
                setTimeout("generateOneNumber()", 210);
            }
            break;
        case 39:
            if (moveRight()) {
                setTimeout("generateOneNumber()", 210);
            }
            break;
        case 40:
            event.preventDefault();
            if (moveDown()) {
                setTimeout("generateOneNumber()", 210);
            }
            break;
        default:
            break;
    }
});





// document.addEventListener('touchstart', function(event) {
//     startX = event.touches[0].pageX;
//     startY = event.touches[0].pageY;
// });

// document.addEventListener('touchend', function(event) {
//     endX = event.changedTouches[0].pageX;
//     endY = event.changedTouches[0].pageY;

//     let deltaX = endX - startX;
//     let deltaY = endY - startY;

//     if (Math.abs(deltaX) < 0.3 * documentWidth && Math.abs(deltaY) < 0.3 * documentWidth) {
//         return;
//     }

//     //x > y 横向
//     if (Math.abs(deltaX) >= Math.abs(deltaY)) {
//         if (deltaX > 0) {
//             if (moveRight()) {
//                 setTimeout("generateOneNumber()", 210);
//                 setTimeout("isGameOver()", 300);
//             }
//         } else {
//             if (moveLeft()) {
//                 setTimeout("generateOneNumber()", 210);
//                 setTimeout("isGameOver()", 300);
//             }
//         }
//     } else {
//         if (deltaY > 0) {
//             if (moveDown()) {
//                 setTimeout("generateOneNumber()", 210);
//                 setTimeout("isGameOver()", 300);
//             }
//         } else {
//             if (moveUp()) {
//                 setTimeout("generateOneNumber()", 210);
//                 setTimeout("isGameOver()", 300);
//             }
//         }
//     }
// });


function moveLeft() {
    if (!canMoveLeft(board)) {
        return false;
    }
    gameHistory.update(board);

    for (let i = 0; i < 4; i++) {
        for (let j = 1; j < 4; j++) {
            if (board[i][j] != 0) {
                for (let k = 0; k < j; k++) {
                    if (board[i][k] == 0 && noBlockHorizontal(i, k, j, board)) {
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;

                        continue;
                    } else if (board[i][k] == board[i][j] && noBlockHorizontal(i, k, j, board) && !hasConflicted[i][k]) {
                        showMoveAnimation(i, j, i, k);
                        board[i][k] *= 2;
                        board[i][j] = 0;

                        score += board[i][k];
                        //score += 1000;

                        score_tmp += board[i][k];
                        //score_tmp += 1000;

                        timesForReturn += Math.floor(score_tmp / 1000);
                        $("#times").text(timesForReturn + "次");

                        if (Math.floor(score_tmp / 1000) > 0) {
                            score_tmp = score_tmp % 1000;
                        }

                        updateScore(score);

                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }
    setTimeout("updateBoardView()", 200);
    return true;
}

function moveRight() {
    if (!canMoveRight(board)) {
        return false;
    }
    gameHistory.update(board);

    for (let i = 0; i < 4; i++) {
        for (let j = 2; j >= 0; j--) {
            if (board[i][j] != 0) {
                for (let k = 3; k > j; k--) {
                    if (board[i][k] == 0 && noBlockHorizontal(i, j, k, board)) {
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;

                        continue;
                    } else if (board[i][k] == board[i][j] && noBlockHorizontal(i, j, k, board) && !hasConflicted[i][k]) {
                        showMoveAnimation(i, j, i, k);
                        board[i][k] *= 2;
                        board[i][j] = 0;
                        score += board[i][k];
                        score_tmp += board[i][k];

                        timesForReturn += Math.floor(score_tmp / 1000);
                        $("#times").text(timesForReturn + "次");

                        if (Math.floor(score_tmp / 1000) > 0) {
                            score_tmp = score_tmp % 1000;
                        }
                        updateScore(score);
                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }
    setTimeout("updateBoardView()", 200);
    return true;
}

function moveUp() {
    if (!canMoveUp(board)) {
        return false;
    }
    gameHistory.update(board);

    for (let j = 0; j < 4; j++) {
        for (let i = 1; i < 4; i++) {
            if (board[i][j] != 0) {
                for (let k = 0; k < i; k++) {
                    if (board[k][j] == 0 && noBlockVertical(j, k, i, board)) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[k][j] == board[i][j] && noBlockVertical(j, k, i, board) && !hasConflicted[k][j]) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] *= 2;
                        board[i][j] = 0;
                        score += board[k][j];
                        score_tmp += board[k][j];

                        timesForReturn += Math.floor(score_tmp / 1000);
                        $("#times").text(timesForReturn + "次");

                        if (Math.floor(score_tmp / 1000) > 0) {
                            score_tmp = score_tmp % 1000;
                        }
                        updateScore(score);
                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }
    setTimeout("updateBoardView()", 200);
    return true;
}

function moveDown() {
    if (!canMoveDown(board)) {
        return false;
    }
    gameHistory.update(board);
    for (let j = 0; j < 4; j++) {
        for (let i = 2; i >= 0; i--) {

            if (board[i][j] != 0) {
                for (let k = 3; k > i; k--) {
                    if (board[k][j] == 0 && noBlockVertical(j, i, k, board)) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[k][j] == board[i][j] && noBlockVertical(j, i, k, board) && !hasConflicted[k][j]) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] *= 2;
                        board[i][j] = 0;
                        score += board[k][j];
                        score_tmp += board[k][j];

                        timesForReturn += Math.floor(score_tmp / 1000);
                        $("#times").text(timesForReturn + "次");

                        if (Math.floor(score_tmp / 1000) > 0) {
                            score_tmp = score_tmp % 1000;
                        }
                        updateScore(score);
                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }
    setTimeout("updateBoardView()", 200);
    return true;
}

function isGameOver() {
    if (!canMoveDown(board) && !canMoveUp(board) && !canMoveLeft(board) && !canMoveRight(board)) {
        alert("游戏结束");
    }
}
