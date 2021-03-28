import { ChessEvent } from "./ChessEvent.js";
import { DrawEvent } from "./DrawEvent.js";
let ChessBoard = new ChessEvent();
window.onload = function () {
  ChessBoard.initBoardStates();
  let canvas = document.getElementById("boardbackground");
  let canvas2 = document.getElementById("board");
  let DOMBoard = document.getElementById("domboard");
  let toolbar = document.getElementById("toolbar");
  let infobox = document.getElementById("infobox");
  let drawBoard = new DrawEvent(DOMBoard, infobox);
  drawBoard.initCanvasBoard(canvas2, canvas);
  canvas2.addEventListener("click", function (e) {
    console.log(e);
    let line = Math.abs(((e.layerX - 20) / 40).toFixed());
    let row = Math.abs(((e.layerY - 20) / 40).toFixed());
    console.log(row, line);
    let step = ChessBoard.setStep({ x: row, y: line });
    drawBoard.reducer(step);
  });
  DOMBoard.addEventListener("click", function (e) {
    console.log(e);
    let line = Math.abs(((e.layerX - 20) / 40).toFixed());
    let row = Math.abs(((e.layerY - 20) / 40).toFixed());
    console.log(row, line);
    let step = ChessBoard.setStep({ x: row, y: line });
    drawBoard.reducer(step);
  });
  toolbar.addEventListener(
    "click",
    function (e) {
      let eTarget = e.target;
      let type = eTarget.id;
      if (type == "withdraw") {
        let stpe = ChessBoard.withDraw();
        drawBoard.reducer(stpe);
      } else if (type == "unwithdraw") {
        let step = ChessBoard.unwithDraw();
        drawBoard.reducer(step);
      } else if (type == "save") {
        ChessBoard.save();
      } else if (type == "continue") {
        let step = ChessBoard.read();
        drawBoard.read(step, ChessBoard.stepStack);
      } else if (type == "reload") {
        ChessBoard.initBoardStates();
        drawBoard.init();
      } else if (type == "canvas") {
        drawBoard.changeModel("canvas", ChessBoard.stepStack);
      } else if (type == "dom") {
        drawBoard.changeModel("dom", ChessBoard.stepStack);
      }
    },
    false
  );
  toolbar.addEventListener(
    "mousedown",
    function (e) {
      let eTarget = e.target;
      if (eTarget.id != "toolbar") {
        eTarget.className = "toolbtn on";
      }
    },
    false
  );
  toolbar.addEventListener(
    "mouseup",
    function (e) {
      let eTarget = e.target;
      if (eTarget.id != "toolbar") {
        eTarget.className = "toolbtn";
      }
    },
    false
  );
};
