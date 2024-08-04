import { Component, EventEmitter, OnInit, Output, TrackByFunction, ViewEncapsulation, inject } from '@angular/core';
import { BoardService } from '../../../shared/services/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router'; 
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddBoardComponent } from '../components/add-board/add-board.component';
import { IBoard } from '../../../shared/models/board.model';
import { Subject, filter, mergeMap, switchMap } from 'rxjs';
import { ConfirmComponent } from '../../../shared/ui/confirm/confirm.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatButtonModule, MatDialogModule, MatMenuModule, MatIcon, CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly boardService = inject(BoardService);
  private readonly router = inject(Router); 
  refetch$ = new Subject<void>();
  boards = toSignal(
    this.refetch$
      .asObservable()
      .pipe(switchMap(() => this.boardService.getBoards()))
  );

  @Output() boardSelected = new EventEmitter<string>();
  swimlane: any;
  trackBoard!: TrackByFunction<IBoard>;

  ngOnInit(): void {
    this.refetch$.next();
  }

  openNewBoardFlow($event: Event, board?: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
     .open(AddBoardComponent, { width: '400px', data: { board } })
     .afterClosed()
     .subscribe((newBoard: IBoard) => {
        if (newBoard) {
          this.refetch$.next();
          this.router.navigate(['/boards', newBoard.id]);
        }
      });
  }

  deleteBoard($event: Event, board: IBoard) {
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.dialog
      .open(ConfirmComponent, {
        data: {
          title: 'Delete Board',
          message: 'Are you sure you want to delete this board?',
        },
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        mergeMap(() => this.boardService.deleteBoard(board.id))
      )
      .subscribe(() => {
        this.refetch$.next();
        this.boardService.getBoards().subscribe((boards) => {
          if (!boards.length) {
            this.router.navigateByUrl('/dashboard', { replaceUrl: true });
          } else {
            const currentIndex = boards.findIndex((b) => b.id === board.id);
            const previousBoardId = currentIndex > 0? boards[currentIndex - 1].id : boards[0].id;
            this.router.navigate(['/boards', previousBoardId]);
          }
        });
      });
  }

  selectBoard(boardId: string) {
    this.boardSelected.emit(boardId);
  }
}