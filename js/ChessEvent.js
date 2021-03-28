/**
 * ChessEvent棋盘事件，管理棋盘二维数组、步数、悔棋、输赢、保存的状态，与渲染无关，外部不应该修改
 *
 * 一步棋表示
 * step = {
 *      steper,这一步的棋手 1||2 黑||白
 *      type,操作 nowork || draw || withdraw
 *      x,第x行
 *      y,第y行
 *      winner,胜利 false||1||2
 * }
 */
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
  //初始化，重新开始
  initBoardStates() {
    this.stepStack = [];
    this.withdrawStack = [];
    this.boardStates = new Array();
    this.iswin = false;
    this.steper = 1;
    for (let i = 0; i < this.boardLength; i++) {
      this.boardStates.push([]);
    }
    for (let row of this.boardStates) {
      for (let item = 0; item < this.boardLength; item++) {
        row.push(0);
      }
    }
  }
  //判断胜利
  cheakWin(step) {
    return win(this.boardStates, step.x, step.y, step.steper);
  }
  //下棋，当前位置二维数组不为0，已有棋子或输赢不能下。否则修改数组状态，step入栈，清空悔棋栈。如果胜利修改iswin为steper
  setStep(action) {
    let step = {
      steper: this.steper,
      x: action.x,
      y: action.y,
    };
    console.log(this.boardStates[step.x][step.y]);
    if (this.boardStates[step.x][step.y] || this.iswin) {
      return { type: "nowork" };
    } else {
      this.stepStack.push(step);
      step.type = "draw";
      this.withdrawStack = [];
      this.boardStates[step.x][step.y] = step.steper;
      this.iswin = this.cheakWin(step);
      this.steper == 1 ? (this.steper = 2) : (this.steper = 1);
      if (this.iswin) {
        step.winner = step.steper;
        return step;
      } else {
        step.winner = false;
        return step;
      }
    }
  }
  //悔棋，栈空不能悔，step出栈，入悔棋栈
  withDraw() {
    if (this.stepStack.length > 0) {
      this.iswin = false;
      let step = this.stepStack.pop();
      this.withdrawStack.push(step);
      step.type = "withdraw";
      step.winner = false;
      this.boardStates[step.x][step.y] = 0;
      this.steper = step.steper;
      return step;
    } else {
      return { type: "nowork" };
    }
  }
  //取消悔棋，悔棋栈空不能取消，step出悔棋栈，入栈
  unwithDraw() {
    if (this.withdrawStack.length > 0) {
      let step = this.withdrawStack.pop();
      this.boardStates[step.x][step.y] = step.steper;
      step.steper == 1 ? (this.steper = 2) : (this.steper = 1);
      this.iswin = this.cheakWin(step);
      if (this.iswin) {
        step.winner = step.steper;
      } else {
        step.winner = false;
      }
      this.stepStack.push(step);
      step.type = "draw";
      return step;
    } else {
      return { type: "nowork" };
    }
  }
  //保存，保存功能还可以拓展
  save() {
    if (this.stepStack.length > 0) {
      window.localStorage.setItem(
        "lastchess",
        JSON.stringify({
          stepStack: this.stepStack,
          boardStates: this.boardStates,
        })
      );
    }
  }
  //读取
  read() {
    let lastchess = JSON.parse(window.localStorage.getItem("lastchess"));
    if (lastchess) {
      console.log(this.stepStack);
      this.stepStack = lastchess.stepStack;
      this.boardStates = lastchess.boardStates;
      let laststep = this.stepStack[this.stepStack.length - 1];
      if (laststep.steper == 1) {
        this.steper = 2;
      } else {
        this.steper = 1;
      }
      this.iswin = laststep.winner;
      return laststep;
    }
  }
}
/**
 * 胜利判断，以当前落子为起点，向四个方向搜寻，碰到状态不一或边界则反向，两边合计超过4则胜利
 * @param {Array} arr BoardStates 棋盘状态二维数组
 * @param {Number} x 当前棋子第x行
 * @param {Number} y 当前棋子第y列
 * @param {Number} who steper当前下棋者
 */
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
//横向胜利判断
function cheakRow(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (y - order > -1) {
    //console.log(arr[x][y-order],'left');
    if (arr[x][y - order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (y + order < arr.length) {
    //console.log(arr[x][y+order],'right');
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
//竖向胜利
function cheakLine(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (x - order > -1) {
    //console.log(arr[x-order][y],'up');
    if (arr[x - order][y] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (x + order < arr.length) {
    //console.log(arr[x+order][y],'down');
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
//斜线胜利
function cheakSlash(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (x - order > -1 && y + order < arr.length) {
    //console.log(arr[x-order][y+order],'slashup');
    if (arr[x - order][y + order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (x + order < arr.length && y - order > -1) {
    //console.log(arr[x+order][y-order],'slashdown');
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
//反斜线胜利
function cheakBackslash(arr, x, y, who) {
  let count = 1;
  let order = 1;
  while (x - order > -1 && y - order > -1) {
    //console.log(arr[x-order][y-order],'Backslashup');
    if (arr[x - order][y - order] == who) {
      count++;
      order++;
    } else {
      break;
    }
  }
  order = 1;
  while (x + order < arr.length && y + order < arr.length) {
    //console.log(arr[x+order][y+order],'Backslashdown');
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
export { ChessEvent };
/* let board = new ChessEvent();
board.initBoardStates();
board.setStep({x:0,y:2});
board.setStep({x:1,y:1});
board.withDraw();
board.unwithDraw();
console.log(board.withdrawStack);
console.log(board.stepStack); */
