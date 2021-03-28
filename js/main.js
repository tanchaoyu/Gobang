function win(arr, x, y, who) {
  let res = cheakRow(arr, x, y, who);
  let res2 = cheakLine(arr, x, y, who);
  let res3 = cheakSlash(arr, x, y, who);
  let res4 = cheakBackslash(arr, x, y, who);
  if (res || res2 || res3 || res4) {
    return true;
  } else {
    return false;
  }
}
function cheakRow(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (y - order > -1) {
    console.log(arr[x][y - order], "left");
    if (arr[x][y - order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (y + order < arr.length) {
    console.log(arr[x][y + order], "right");
    if (arr[x][y + order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  if (count >= 5) {
    return true;
  }
}
function cheakLine(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (x - order > -1) {
    console.log(arr[x - order][y], "up");
    if (arr[x - order][y] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (x + order < arr.length) {
    console.log(arr[x + order][y], "down");
    if (arr[x + order][y] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  if (count >= 5) {
    return true;
  }
}
function cheakSlash(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (x - order > -1 && y + order < arr.length) {
    console.log(arr[x - order][y + order], "slashup");
    if (arr[x - order][y + order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (x + order < arr.length && y - order > -1) {
    console.log(arr[x + order][y - order], "slashdown");
    if (arr[x + order][y - order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  if (count >= 5) {
    return true;
  }
}
function cheakBackslash(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (x - order > -1 && y - order > -1) {
    console.log(arr[x - order][y - order], "Backslashup");
    if (arr[x - order][y - order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (x + order < arr.length && y + order < arr.length) {
    console.log(arr[x + order][y + order], "Backslashdown");
    if (arr[x + order][y + order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  if (count >= 5) {
    return true;
  }
}
class ChessEvent {
  constructor(stepStack = [], steper = 1, iswin = false) {
    //棋盘边数
    this.boardLength = 16;
    //棋盘二维数组表示状态 0空1黑2白
    this.boardStates = [];
    //步栈
    this.stepStack = stepStack;
    //当前下棋者 1黑2白
    this.steper = steper;
    //悔棋栈
    this.withdrawStack = [];
    this.iswin = iswin;
  }
  initBoardStates() {
    for (let i = 0; i < this.boardLength; i++) {
      this.boardStates.push([]);
    }
    for (let row of this.boardStates) {
      for (let item = 0; item < this.boardLength; item++) {
        row.push(0);
      }
    }
  }
  cheakWin(step) {
    return win(this.boardStates, step.x, step.y, step.steper);
  }
  setStep(action) {
    let step = {
      steper: this.steper,
      x: action.x,
      y: action.y,
    };
    if (this.boardStates[step.x][step.y] || this.iswin) {
      return "nowork";
    } else {
      this.stepStack.push(step);
      this.withdrawStack = [];
      this.boardStates[step.x][step.y] = step.steper;
      this.iswin = this.cheakWin(step);
      this.steper == 1 ? (this.steper = 2) : (this.steper = 1);
      if (this.iswin) {
        return step.steper;
      } else {
        return step;
      }
    }
  }
  withDraw() {
    if (this.stepStack.length > 1) {
      let step = this.stepStack.pop();
      this.withdrawStack.push(step);
      this.boardStates[step.x][step.y] = 0;
      this.steper = step.steper;
      return step;
    }
  }
  unwithDraw() {
    let step = this.withdrawStack.pop();
    this.boardStates[step.x][step.y] = step.steper;
    step.steper == 1 ? (this.steper = 2) : (this.steper = 1);
    this.stepStack.push(step);
    return step;
  }
}
let ChessBoard = new ChessEvent();
ChessBoard.initBoardStates();

window.onload = function () {
  let canvas = document.getElementById("boardbackground");
  let canvas2 = document.getElementById("board");
  let board = canvas.getContext("2d");
  let board2 = canvas2.getContext("2d");
  canvas2.addEventListener("click", function (e) {
    console.log(e);
    let line = Math.abs(((e.offsetX - 20) / 40).toFixed());
    let row = Math.abs(((e.offsetY - 20) / 40).toFixed());
    console.log(row, line);
    let step = ChessBoard.setStep({ x: row, y: line });
    if (step.steper == 1) {
      board2.fillStyle = "#000";
    } else {
      board2.fillStyle = "#fff";
    }

    board2.beginPath();
    board2.arc(line * 40 + 20, row * 40 + 20, 15, 0, Math.PI * 2, true);
    board2.closePath();
    board2.fill();
  });
  canvas2.addEventListener("auxclick", function (e) {
    let step = ChessBoard.withDraw();
    board2.fillStyle = "rgba(255, 255, 255, 0)";
    let line = step.y; //((e.offsetX-20)/40).toFixed();
    let row = step.x; //((e.offsetY-20)/40).toFixed();
    board2.clearRect(line * 40 + 5, row * 40 + 5, 30, 30);
    console.log(1);
  });
  let lin = 15;
  let rect = 40;
  board.strokeStyle = "#000";
  for (let i = 0; i < lin; i++) {
    for (let j = 0; j < lin; j++) {
      board.strokeRect(j * rect + 20, i * rect + 20, rect, rect);
    }
  }
};
