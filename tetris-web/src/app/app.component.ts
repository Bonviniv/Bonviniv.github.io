import { Component } from '@angular/core';
import { TetrisBoardComponent } from './components/tetris-board/tetris-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TetrisBoardComponent],
  template: '<app-tetris-board></app-tetris-board>'
})
export class AppComponent {
  title = 'tetris-web';
}
