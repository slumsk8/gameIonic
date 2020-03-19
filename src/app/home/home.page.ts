import { Component, ViewChild } from "@angular/core";
import { IonButton } from "@ionic/angular";


@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  @ViewChild(IonButton, { static: false }) startButton: IonButton;
  startScreen;
  overScreen;
  sec;
  min;
  score;

  board;
  answer;

  win: HTMLAudioElement;
  start: HTMLAudioElement;
  move: HTMLAudioElement;

  stop: number;
  time_ctrl: any;
  hundredths: number;
  minutes;
  seconds;

  constructor() {}

  ionViewDidEnter() {
    this.board = [];
    this.answer = [];

    this.stop = 0;
    this.hundredths = 0;
    this.minutes = 0;
    this.seconds = 0;

    this.startScreen = <HTMLDivElement>document.querySelector("#startScreen");
    this.startScreen.addEventListener(
      "click",
      () => {
        this.startGame();
        this.time_ctrl = setInterval(() => {
          this.cronometerStart();
        }, 10);
        // this.seconds = -1;
      },
      false
    );
    this.overScreen = <HTMLDivElement>document.querySelector("#overScreen");
    this.sec = <HTMLDivElement>document.querySelector("#secs");
    this.min = <HTMLDivElement>document.querySelector("#minutes");
    this.score = <HTMLElement> document.querySelector("#score");

    this.startButton.disabled = true;

    this.start = new Audio();
    this.start.src = "assets/sounds/vidro.mp3";
    this.move = new Audio();
    this.move.src = "assets/sounds/clique.mp3";
    this.win = new Audio();
    this.win.src = "assets/sounds/aplausos.mp3";

    this.init();
  }

  init() {
    for (let i = 1; i < 9; i++) {
      let piece = <HTMLElement>document.querySelector("#n" + i);
      piece.style.background = "url('assets/img/n" + i + ".png')";
      piece.style.backgroundPosition = "center";
      piece.addEventListener(
        "click",
        () => {
          this.movePiece(piece);
          if (this.checkVictory()) {
            this.gameOver();
          }
        },
        false
      );
      this.board.push(piece);
    }
    this.board.push(null);
    this.answer = this.board;
    this.render();
  }

  //Método para distribuir as peças sobre o quadro
  render() {
    for (let i in this.board) {
      let index = parseInt(i);
      let piece = this.board[index];
      if (piece) {
        piece.style.left = (index % 3) * 100 + 5 + "px";
        if (index < 3) {
          piece.style.top = "5px";
        } else if (index < 6) {
          piece.style.top = "105px";
        } else {
          piece.style.top = "205px";
        }
      }
    }
  }

  //Validando o array (iniciar sempre o jogo válido)
  //Caso o array apresente número ímpar de inversões, o sistema não tem solução
  validGame(array) {
    let inversions = 0;
    let size = array.length;
    for (let i = 0; i < size - 1; i++) {
      for (let j = i; j < size; j++) {
        if (
          array[i] &&
          array[j] &&
          array[i].dataset.value > array[j].dataset.value
        ) {
          inversions++;
        }
      }
    }
    // console.log(inversions);
    return inversions % 2 === 0;
  }  

  //Ordena o array aleatoriamente
  randomBoard(oldBoard) {
    let newBoard;
    do {
      newBoard = [];
      while (newBoard.length < oldBoard.length) {
        let i = Math.floor(Math.random() * oldBoard.length);
        if (newBoard.indexOf(oldBoard[i]) < 0) {
          newBoard.push(oldBoard[i]);
        }
      }
    } while (!this.validGame(newBoard));

    return newBoard;
  }

  //funcionamento do cronometro
  cronometerStart() {
    if (this.stop) return;

    if (this.hundredths < 99) {
      this.hundredths++;
    }
    if (this.hundredths == 99) {
      this.hundredths = -1;
    }
    if (this.hundredths == 0) {
      this.seconds++;
      if (this.seconds < 10) {
        this.seconds = "0" + this.seconds;
      }
      let sec: HTMLDivElement = document.querySelector("#secs");
      sec.innerHTML = this.seconds.toString();
    }
    if (this.seconds == 59) {
      this.seconds = -1;
    }
    if (this.hundredths == 0 && this.seconds == 0) {
      this.minutes++;      
      let min: HTMLDivElement = document.querySelector("#minutes");
      min.innerHTML = this.minutes.toString();
    }
  }

  
  //startando o jogo
  startGame() {
    /*O array inicial com a ordem crescente recebe o novo array 
    com a ordem aleatória e é redenrizado na tela. */

    this.board = this.randomBoard(this.board);
    this.startButton.disabled = false;

    this.startScreen.style.opacity = "0";
    this.startScreen.style.zIndex = "-1";

    this.start.play();
    this.win.pause();

    this.stop = 0;
    this.seconds = 0;
    
    
    // console.log(this.time_ctrl);

    this.render();
  }

  //movimentando as peças
  movePiece(piece) {
    let index = this.board.indexOf(piece);

    this.move.play();

    //se a peça está o não na coluna da esquerda
    if (index % 3 !== 0) {
      //se não estiver movo para a esquerda, se estiver vazio
      if (!this.board[index - 1]) {
        this.board[index - 1] = piece;
        this.board[index] = null;
      }
    }

    //se a peça está o não na coluna da esquerda
    if (index % 3 !== 2) {
      //se não estiver movo para a direita, se estiver vazio
      if (!this.board[index + 1]) {
        this.board[index + 1] = piece;
        this.board[index] = null;
      }
    }

    // se a peça não estiver na linha do topo
    if (index > 2) {
      //se não estiver movo para baixo, se estiver vazio
      if (!this.board[index - 3]) {
        this.board[index - 3] = piece;
        this.board[index] = null;
      }
    }

    // se a peça não estiver na linha do fundo
    if (index < 6) {
      //se não estiver movo para cima, se estiver vazio
      if (!this.board[index + 3]) {
        this.board[index + 3] = piece;
        this.board[index] = null;
      }
    }

    this.render();
  }

  //se o peão ganha ou perde
  checkVictory() {
    for (let i in this.board) {
      //variável que armazena a arrumação inicial
      let boardBefore = this.board[i];
      //variável que armazena a nova arrumação
      let boardAfter = this.answer[i];
      if (boardAfter !== boardBefore) {
        return false;
      }
    }
    this.win.play();
    this.score.innerHTML = "Seu tempo foi: " + this.minutes + " min : " + this.seconds + " seg" ;
    window.setInterval(this.time_ctrl);
    this.stop = 1;
    return true;
  }

  //mostra a tela de vitória
  gameOver() {
    this.overScreen.style.opacity = "1";
    this.overScreen.style.zIndex = "1";
    setTimeout(() => {
      this.overScreen.addEventListener(
        "click",
        () => {
          this.startGame();
          this.overScreen.style.opacity = "0";
          this.overScreen.style.zIndex = "-1";          
        },
        false
      );
      this.seconds = -1;
    }, 500);
  }
}
