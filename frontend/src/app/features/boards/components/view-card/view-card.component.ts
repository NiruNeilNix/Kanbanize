import { Component, Inject, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ICard, ISwimlane } from '../../../../shared/models/board.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AddCardComponent } from '../add-card/add-card.component';
import { CardService } from '../../../../shared/services/card.service';
import { BoardService } from '../../../../shared/services/board.service';
import { SwimlanesService } from '../../../../shared/services/swimlanes.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-view-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule,
    RouterModule,
    MatIconModule, 
  ],
  templateUrl: './view-card.component.html',
  styleUrls: ['./view-card.component.scss']
})
export class ViewCardComponent implements OnInit {
  private readonly boardService = inject(BoardService);
  private readonly matDialog = inject(MatDialog);
  private readonly swimlaneService = inject(SwimlanesService);
  private readonly cardService = inject(CardService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  refetch$ = new Subject<void>();
  board = toSignal(
    this.refetch$
      .asObservable()
      .pipe(
        switchMap(() =>
          this.boardService.getBoardById(
            this.activatedRoute.snapshot.params['id']
          )
        )
      )
  );

  @Output() cardUpdated = new EventEmitter<void>();

  getCardStatus(dueDate: string, complete: boolean): string {
    if (complete) {
      return 'COMPLETED';
    }
    if (!dueDate) {
      return '';
    }

    const currentDate = new Date();
    const dueDateObj = new Date(dueDate);
    const timeDiff = dueDateObj.getTime() - currentDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff < -1) {
      return 'OVERDUE';
    } else if (daysDiff >= -1 && daysDiff < 0) {
      return 'DUE TODAY';
    } else if (daysDiff <= 1) {
      return 'ALMOST DUE';
    } else {
      return 'PENDING';
    }
  }

  constructor(
    public dialogRef: MatDialogRef<ViewCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: ICard; swimlane: ISwimlane }
  ) {}

  ngOnInit(): void {
    this.refetch$.next()
  }

  addOrEditCard(swimlane: ISwimlane, card?: ICard, dueDate: Date = new Date()) {
    this.matDialog
      .open(AddCardComponent, { width: '600px', data: { swimlane: swimlane, boardId: swimlane.boardId, card, dueDate } })
      .afterClosed()
      .subscribe((card?: ICard) => {
        if (card) {
          this.refetch$.next();
          this.cardUpdated.emit();
        }
        this.dialogRef.close();
      });
  }
}