import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TetrisBoardComponent } from './components/tetris-board/tetris-board.component';

@NgModule({
  declarations: [
    AppComponent,
    TetrisBoardComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }