import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-tetris-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tetris-board.component.html',
  styleUrls: ['./tetris-board.component.scss']
})
export class TetrisBoardComponent implements OnInit {
  // Add these properties
  score: number = 0;
  highScore: number = 0;
  board: number[][] = [];
  currentPiece: any = null;
  nextPieces: any[] = [];
  readonly ROWS = 20;
  readonly COLS = 10;

  readonly PIECES = [
    { shape: [[1, 1, 1, 1]], color: '#00f0f0' },  // I
    { shape: [[1, 1], [1, 1]], color: '#f0f000' }, // O
    { shape: [[1, 1, 1], [0, 1, 0]], color: '#a000f0' }, // T
    { shape: [[1, 1, 1], [1, 0, 0]], color: '#f0a000' }, // L
    { shape: [[1, 1, 1], [0, 0, 1]], color: '#0000f0' }, // J
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#00f000' }, // S
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#f00000' }  // Z
  ];

  // Add these new properties
  comboText: string = '';
  showCombo: boolean = false;
  isFlashing: boolean = false;

  constructor() {
    this.initializeBoard();
    this.spawnNewPiece();
    this.generateNextPieces();
  }

  private initializeBoard(): void {
    this.board = Array(this.ROWS).fill(null)
      .map(() => Array(this.COLS).fill(0));
  }

  private spawnNewPiece(): void {
    if (this.nextPieces.length === 0) {
      this.generateNextPieces();
    }
    this.currentPiece = {
      ...this.nextPieces.shift(),
      x: Math.floor(this.COLS / 2) - 1,
      y: 0
    };
    this.generateNextPieces();
    this.drawPiece();
  }

  @ViewChild('gameContainer') gameContainer!: ElementRef;

  ngAfterViewInit() {
    this.gameContainer.nativeElement.focus();
  }

  onFocus() {
    // Keep focus on the game container for keyboard events
  }
  
  private generateNextPieces(): void {
    while (this.nextPieces.length < 3) {
      const randomPiece = this.PIECES[Math.floor(Math.random() * this.PIECES.length)];
      this.nextPieces.push({ ...randomPiece });
    }
  }

  isPieceCell(piece: any, row: number, col: number, pieceIndex: number): boolean {
    const offsetY = 1; // Vertical centering
    const offsetX = 0; // Horizontal centering
    const spacing = 0; // Increased space between pieces
    
    const adjustedRow = row - offsetY - (pieceIndex * spacing);
    const adjustedCol = col - offsetX;
    
    if (adjustedRow < 0 || adjustedRow >= piece.shape.length) return false;
    if (adjustedCol < 0 || adjustedCol >= piece.shape[0].length) return false;
    
    return piece.shape[adjustedRow][adjustedCol] === 1;
  }

  private drawPiece(): void {
    if (!this.currentPiece) return;
    
    this.drawGhostPiece(); // Draw ghost piece first
    
    const { shape, x, y, color } = this.currentPiece;
    shape.forEach((row: number[], i: number) => {
      row.forEach((cell: number, j: number) => {
        if (cell === 1) {
          const boardX = x + j;
          const boardY = y + i;
          if (this.isWithinBounds(boardX, boardY)) {
            this.board[boardY][boardX] = 1;
          }
        }
      });
    });
  }

  private isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.COLS && y >= 0 && y < this.ROWS;
  }

  private fallInterval: Subscription | undefined;
  private readonly FALL_SPEED = 1000; // 1 second

  ngOnInit(): void {
    this.startFalling();
  }

  ngOnDestroy(): void {
    this.stopFalling();
  }

  private startFalling(): void {
    this.fallInterval = interval(this.FALL_SPEED).subscribe(() => {
      this.moveDown();
    });
  }

  private stopFalling(): void {
    if (this.fallInterval) {
      this.fallInterval.unsubscribe();
    }
  }

  // Add this property at the top with other properties
  // Change from private to public
  public gameOver: boolean = false;

  // Update the lockPiece method
  private lockPiece(): void {
    if (!this.currentPiece) return;
    
    const { shape, x, y } = this.currentPiece;
    let shouldGameOver = false;

    shape.forEach((row: number[], i: number) => {
      row.forEach((cell: number, j: number) => {
        if (cell === 1) {
          const boardY = y + i;
          const boardX = x + j;
          
          if (this.isWithinBounds(boardX, boardY)) {
            this.board[boardY][boardX] = 2;
            if (boardY <= 0) {  // Check if piece is locked in the top 3 rows
              shouldGameOver = true;
            }
          }
        }
      });
    });

    if (shouldGameOver) {
      this.gameOver = true;
      this.stopFalling();
    }
  }

  // Update moveDown method
  private moveDown(): void {
    if (!this.currentPiece || this.gameOver) return;
    
    this.erasePiece();
    if (this.canMove(this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      this.drawPiece();
    } else {
      this.drawPiece();
      this.lockPiece();
      if (!this.gameOver) {
        this.clearLines();
        this.spawnNewPiece();
      }
    }
  }

  // Update handleKeyboardEvent method
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Prevent default browser scrolling behavior
    event.preventDefault();
    
    if (event.key === ' ') { // Space bar
      this.handleHardDrop();
      return;
    }
  
    if (event.key === 'Enter') {
      this.restartGame();
      return;
    }
  
    if (!this.currentPiece || this.gameOver) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        this.erasePiece();
        if (this.canMove(this.currentPiece.x - 1, this.currentPiece.y)) {
          this.currentPiece.x--;
        }
        this.drawPiece();
        break;
      case 'ArrowRight':
        this.erasePiece();
        if (this.canMove(this.currentPiece.x + 1, this.currentPiece.y)) {
          this.currentPiece.x++;
        }
        this.drawPiece();
        break;
      case 'ArrowDown':
        this.moveDown();
        break;
      case 'ArrowUp':
        this.rotatePiece();
        break;
    }
  }

  // Update restartGame method
  restartGame(): void {
    this.stopFalling();
    this.gameOver = false;
    this.score = 0;
    this.initializeBoard();
    this.nextPieces = [];
    this.generateNextPieces();
    this.currentPiece = null;
    this.spawnNewPiece();
    this.startFalling();
  }

  private erasePiece(): void {
    if (!this.currentPiece) return;
    
    // First erase the ghost piece
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        if (this.board[y][x] === 3) {
          this.board[y][x] = 0;
        }
      }
    }
    
    // Then erase the current piece
    const { shape, x, y } = this.currentPiece;
    shape.forEach((row: number[], i: number) => {
      row.forEach((cell: number, j: number) => {
        if (cell === 1) {
          const boardX = x + j;
          const boardY = y + i;
          if (this.isWithinBounds(boardX, boardY)) {
            this.board[boardY][boardX] = 0;
          }
        }
      });
    });
  }

  private canMove(newX: number, newY: number): boolean {
    if (!this.currentPiece) return false;

    return this.currentPiece.shape.every((row: number[], i: number) =>
      row.every((cell: number, j: number) => {
        if (cell === 0) return true;
        const boardX = newX + j;
        const boardY = newY + i;
        return this.isWithinBounds(boardX, boardY) && this.board[boardY][boardX] !== 2;
      })
    );
  }

  private clearLines(): void {
    let linesCleared = 0;
    
    for (let y = this.ROWS - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell === 2)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.COLS).fill(0));
        linesCleared++;
        y++; // Recheck the same row
      }
    }

    // Update score and show combo animation
    let comboName = '';
    switch (linesCleared) {
      case 1: 
        this.score += 100;
        comboName = 'SINGLE!';
        break;
      case 2: 
        this.score += 300;
        comboName = 'DOUBLE!';
        break;
      case 3: 
        this.score += 500;
        comboName = 'TRIPLE!';
        break;
      case 4: 
        this.score += 800;
        comboName = 'TETRIS!';
        break;
    }

    if (comboName) {
      this.showComboAnimation(comboName);
    }

    // Update high score if needed
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  private showComboAnimation(comboName: string): void {
    this.comboText = comboName;
    this.showCombo = true;
    this.isFlashing = true;

    // Flash twice
    setTimeout(() => {
      this.isFlashing = false;
      setTimeout(() => {
        this.isFlashing = true;
        setTimeout(() => {
          this.isFlashing = false;
          // Show normal for 2 seconds then hide
          setTimeout(() => {
            this.showCombo = false;
          }, 2000);
        }, 250);
      }, 250);
    }, 250);
  }

  getPieceColor(cell: number, row: number, col: number): string {
    if (cell === 0) return '';
    if (cell === 2) return '#808080'; // gray color for locked pieces
    if (cell === 3) return '#404040'; // darker color for ghost piece
    if (cell === 1 && this.currentPiece) {
      const pieceRow = row - this.currentPiece.y;
      const pieceCol = col - this.currentPiece.x;
      if (pieceRow >= 0 && pieceRow < this.currentPiece.shape.length &&
          pieceCol >= 0 && pieceCol < this.currentPiece.shape[0].length &&
          this.currentPiece.shape[pieceRow][pieceCol] === 1) {
        return this.currentPiece.color;
      }
    }
    return '#808080';
  }
  public rotatePiece(): void {
    if (!this.currentPiece) return;
    
    this.erasePiece();
    const rotated = this.currentPiece.shape[0].map((_: any, i: number) =>
      this.currentPiece.shape.map((row: any[]) => row[row.length - 1 - i])
    );
    
    const originalShape = [...this.currentPiece.shape];
    this.currentPiece.shape = rotated;
    
    if (!this.canMove(this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.shape = originalShape;
    }
    
    this.drawPiece();
  }



  private getGhostPosition(): { x: number, y: number } {
      if (!this.currentPiece) return { x: 0, y: 0 };
  
      let ghostY = this.currentPiece.y;
      while (this.canMove(this.currentPiece.x, ghostY + 1)) {
        ghostY++;
      }
      return { x: this.currentPiece.x, y: ghostY };
    }
  
    private drawGhostPiece(): void {
      if (!this.currentPiece) return;
      
      const ghostPos = this.getGhostPosition();
      const { shape } = this.currentPiece;
      
      shape.forEach((row: number[], i: number) => {
        row.forEach((cell: number, j: number) => {
          if (cell === 1) {
            const boardX = ghostPos.x + j;
            const boardY = ghostPos.y + i;
            if (this.isWithinBounds(boardX, boardY) && this.board[boardY][boardX] === 0) {
              this.board[boardY][boardX] = 3; // 3 represents ghost piece
            }
          }
        });
      });
    }

  public handleVirtualKey(key: string): void {
    // Create a synthetic keyboard event
    const event = new KeyboardEvent('keydown', { key });
    this.handleKeyboardEvent(event);
  }

  public handleHardDrop(): void {
    if (!this.currentPiece) return;
    
    const ghostPos = this.getGhostPosition();
    const movesNeeded = ghostPos.y - this.currentPiece.y;
    
    // Execute exactly the number of moves needed to reach the ghost position
    for(let i = 0; i < movesNeeded; i++) {
      this.handleVirtualKey('ArrowDown');
    }
  }
}



