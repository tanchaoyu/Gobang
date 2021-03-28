/**
 * DrawEvent渲染事件，根据ChessEvent和页面情况处理渲染操作，只负责渲染，不应该修改ChessEvent状态。
 */
class DrawEvent {
  constructor(DOMBoard, infobox, model = "canvas") {
    //当前模式
    this.model = model;
    //棋盘正方形边长
    this.rect = 40;
    //行列正方形数
    this.rectNum = 15;
    //DOM版棋面
    this.DOMBoard = DOMBoard;
    //切换前的步栈
    this.oldstepStack = [];
    //左边消息栏
    this.infobox = infobox;
  }
  //初始化底部棋盘，底部棋盘与后续渲染无关
  initCanvasBoard(canvasElement, boardElement) {
    this.DOMBoard.style.display = "none";
    this.canvasElement = canvasElement;
    this.canvasContent = canvasElement.getContext("2d");
    this.boardElement = boardElement;
    this.boardContent = boardElement.getContext("2d");
    this.boardContent.strokeStyle = "#000";
    for (let i = 0; i < this.rectNum; i++) {
      for (let j = 0; j < this.rectNum; j++) {
        //防止边角棋子显示不完全，棋盘从(20,20)开始画
        this.boardContent.strokeRect(
          j * this.rect + 20,
          i * this.rect + 20,
          this.rect,
          this.rect
        );
      }
    }
  }
  //重新开始清空棋盘
  init() {
    while (this.DOMBoard.firstChild) {
      this.DOMBoard.removeChild(this.DOMBoard.firstChild);
    }
    this.oldstepStack = [];
    this.canvasContent.clearRect(0, 0, 640, 640);
    this.showInfo({ type: "draw", steper: 2 });
  }
  //处理下棋悔棋操作
  reducer(step) {
    console.log(step);
    if (step.type == "nowork") {
      return;
    }
    if (this.model == "canvas") {
      if (step.type == "draw") {
        this.drawStep(step);
      } else if (step.type == "withdraw") {
        this.withdraw(step);
      }
    } else if (this.model == "dom") {
      if (step.type == "draw") {
        this.DOMdrawStep(step);
      } else if (step.type == "withdraw") {
        this.DOMwithdraw(step);
      }
    }
  }
  //下棋渲染，因为棋盘偏移，棋子圆心在线的交点上，所以也偏移
  drawStep(step) {
    if (step == "nowork") {
    } else {
      if (step.steper == 1) {
        this.canvasContent.fillStyle = "#000";
      } else {
        this.canvasContent.fillStyle = "#fff";
      }
      this.canvasContent.beginPath();
      this.canvasContent.arc(
        step.y * 40 + 20,
        step.x * 40 + 20,
        15,
        0,
        Math.PI * 2,
        true
      );
      this.canvasContent.closePath();
      this.canvasContent.fill();
      this.showInfo(step);
    }
  }
  //悔棋渲染，矩形从左上角角标开始，棋盘便宜(20,20)，棋子半径15，所以矩形从(5,5)开始覆盖，DOM下棋渲染同理
  withdraw(step) {
    this.canvasContent.fillStyle = "rgba(255, 255, 255, 0)";
    this.canvasContent.clearRect(step.y * 40 + 5, step.x * 40 + 5, 30, 30);
    this.showInfo(step);
  }
  //DOM模式下棋渲染
  DOMdrawStep(step) {
    if (step == "nowork") {
    } else {
      let chessman = document.createElement("div");
      let x = step.x * 40 + 5;
      let y = step.y * 40 + 5;
      if (step.steper == 1) {
        chessman.className = "black";
      } else {
        chessman.className = "white";
      }
      chessman.style.transform = "translate(" + y + "px," + x + "px)";
      this.DOMBoard.appendChild(chessman);
      this.showInfo(step);
    }
  }
  //DOM模式悔棋
  DOMwithdraw(step) {
    let lastchessman = this.DOMBoard.lastChild;
    this.DOMBoard.removeChild(lastchessman);
    this.showInfo(step);
  }
  /*模式切换，思路:判断oldstepStack和stepStack的第一个差异位置，消除差异位之后渲染的内容，补充差异位之后新的内容
    上一版使用一个变量标记上次stepStack的长度进行判断消除和补充存在的问题
    无法实现悔棋之后再下棋这种情况的修改
    DOM补充渲染时创建fragment，避免多次appendChild
  */
  changeModel(model, stepStack) {
      if(this.model!=model){
    let shortLength = stepStack.length>this.oldstepStack.length?this.oldstepStack.length:stepStack.length;
    let nocatch = 0;
    for(let i=0;i<shortLength;i++){
        if(stepStack[i].x!=this.oldstepStack[i].x||stepStack[i].y!=this.oldstepStack[i].y||stepStack[i].steper!=this.oldstepStack[i].steper){
            nocatch = i;
            break;
        }
        else{
          nocatch = shortLength;
        }
    }
/*     console.log(this.oldstepStack);
    console.log(stepStack);
    console.log(nocatch);
    console.log(shortLength); */
    if (model == "canvas" && model != this.model) {
      this.canvasElement.style.display = "block";
      for(let i=nocatch;i<this.oldstepStack.length;i++){
        this.withdraw(this.oldstepStack[i]);
      }
      for(let i=nocatch;i<stepStack.length;i++){
          this.drawStep(stepStack[i]);
      }
      this.model = "canvas";
      this.DOMBoard.style.display = "none";
    }
    if (model == "dom" && model != this.model) {
      this.DOMBoard.style.display = "block";
      let fragment = document.createDocumentFragment();
      for(let i=nocatch;i<this.oldstepStack.length;i++){
        this.DOMwithdraw(this.oldstepStack[i]);
      }
      for(let i=nocatch;i<stepStack.length;i++){
        let chessman = document.createElement("div");
        let x = stepStack[i].x * 40 + 5;
        let y = stepStack[i].y * 40 + 5;
        if (stepStack[i].steper == 1) {
          chessman.className = "black";
        } else {
          chessman.className = "white";
        }
        chessman.style.transform = "translate(" + y + "px," + x + "px)";
        fragment.appendChild(chessman);
      }
      this.DOMBoard.appendChild(fragment);
      this.model = "dom";
      this.canvasElement.style.display = "none";
    }
    //需要创建新的数组，只保存引用无法完成比较
    this.oldstepStack = new Array (...stepStack);
    }
  }
  //左边信息栏显示，赢了显示谁赢了，下棋显示下一棋手，悔棋显示当前棋手
  showInfo(step) {
    let lastinfo = this.infobox.lastChild;
    this.infobox.removeChild(lastinfo);
    if (step.hasOwnProperty("winner") && step.winner) {
      let wininfo = document.createElement("div");
      if (step.winner == 1) {
        wininfo.innerHTML = "黑方胜利！";
      } else {
        wininfo.innerHTML = "白方胜利！";
      }
      this.infobox.appendChild(wininfo);
    } else {
      let stepinfo = document.createElement("div");
      if (step.type == "draw") {
        if (step.steper == 1) {
          stepinfo.innerHTML = "当前白方落子";
        } else {
          stepinfo.innerHTML = "当前黑方落子";
        }
      } else if (step.type == "withdraw") {
        if (step.steper == 1) {
          stepinfo.innerHTML = "当前黑方落子";
        } else {
          stepinfo.innerHTML = "当前白方落子";
        }
      }
      this.infobox.appendChild(stepinfo);
    }
  }
  //读取渲染，用初始化加canvas模式渲染实现
  read(step, stepStack) {
    if (step) {
      console.log(step);
      this.init();
      this.model = "updata";
      this.changeModel("canvas", stepStack);
      this.showInfo(step);
      this.oldstepStack = [];
    }
  }
}
export { DrawEvent };
