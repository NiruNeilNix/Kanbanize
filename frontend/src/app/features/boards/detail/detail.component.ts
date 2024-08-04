import { Component, Input, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { BoardService } from '../../../shared/services/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { SwimlanesService } from '../../../shared/services/swimlanes.service';
import { Subject, switchMap } from 'rxjs';
import { ICard, ISwimlane, IBoard } from '../../../shared/models/board.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCardComponent } from '../components/add-card/add-card.component';
import { CardService } from '../../../shared/services/card.service';
import { ConfirmComponent } from '../../../shared/ui/confirm/confirm.component';
import { EditSwimlaneComponent } from '../components/edit-swimlane/edit-swimlane.component';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { ListComponent } from '../list/list.component';
import { ViewCardComponent } from '../components/view-card/view-card.component';


@Component({ 
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    RouterModule,
    DragDropModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    ConfirmComponent,
    MatMenuModule,
    ListComponent,
    ViewCardComponent,],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit {
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

  getCardStatus(dueDate: string, complete: boolean): string {
    if (complete){
      return 'COMPLETED';
    }
    if (!dueDate) {
      return ''
    } ;
    
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
  
  //For Completion Checkbox
  toggleCardCompletion(card: ICard) {
    card.complete = !card.complete;
      this.cardService.updateCard(card.id, { complete: card.complete }).subscribe(() => {
        this.refetch$.next();
      });
    }
  

  private readonly fb = inject(NonNullableFormBuilder);
  swimlaneForm = this.fb.group({
    name: this.fb.control('', Validators.required),
  });
dueDate: string | number | Date | undefined;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.refetch$.next();
    });
  }

  selectBoard(boardId: string) {
    this.activatedRoute.snapshot.params['id'] = boardId;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { id: boardId },
      queryParamsHandling: 'merge',
    }).then(() => {
      this.refetch$.next();
    });
    this.refetch$.next();
  }

  editSwimlane(swimlane: ISwimlane) {
    this.matDialog
      .open(EditSwimlaneComponent, { width: '600px', data: { swimlane } })
      .afterClosed()
      .subscribe(() => this.refetch$.next());
  }

  onCardChange($event: CdkDragDrop<any>, swimlane: ISwimlane): void {
    if ($event.previousContainer === $event.container) {
      moveItemInArray(
        swimlane.cards || [],
        $event.previousIndex,
        $event.currentIndex
      );
    } else {
      transferArrayItem(
        $event.previousContainer.data,
        $event.container.data,
        $event.previousIndex,
        $event.currentIndex
      );
    }

    const _board = this.board();
    if (!_board) return;

    const cards: ICard[] =
      _board.swimlanes?.reduce((prev: ICard[], current: ISwimlane) => {
        const cards =
          current.cards?.map((c, idx) => ({
            ...c,
            swimlaneId: current.id,
            order: idx,
          })) || [];

        return [...prev, ...cards];
      }, []) || [];

    this.cardService
      .updateCardOrdersAndSwimlanes(_board.id, cards)
      .subscribe(() => {
        this.refetch$.next();
      });
  }

  onSwimlaneChange($event: CdkDragDrop<any>): void {
    const _board = this.board();
    if (!_board) return;
    moveItemInArray(
      _board.swimlanes || [],
      $event.previousIndex,
      $event.currentIndex
    );

    this.boardService
      .updateSwimlaneOrder({
        boardId: _board.id,
        items:
          _board.swimlanes?.map((swimlane, index) => ({
            id: swimlane.id,
            order: index,
          })) || [],
      })
      .subscribe(() => {
        this.refetch$.next();
      });
    console.log(this.board()?.swimlanes);
  }

  addOrEditCard(swimlane: ISwimlane, card?: ICard, dueDate: Date = new Date()) {
    this.matDialog
      .open(AddCardComponent, {width: '600px', data: { swimlane: swimlane, boardId: swimlane.boardId, card, dueDate, }, })
      .afterClosed()
      .subscribe((card?: ICard) => { card && this.refetch$.next(); });
  }

  addSwimlane() {
    if (this.swimlaneForm.invalid) {
      return;
    }
    const _board = this.board();
    if (!_board) return;

    this.swimlaneService
      .createSwimlane({
        name: this.swimlaneForm.value.name as string,
        boardId: _board.id,
        order: _board.swimlanes?.length || 0,
      })
      .subscribe(() => {
        this.swimlaneForm.reset();
        this.refetch$.next();
      });
  }

  viewCard(swimlane: ISwimlane, card: ICard) {
    const dialogRef = this.matDialog.open(ViewCardComponent, {
      width: '600px',
      data: {
        swimlane: swimlane,
        boardId: swimlane.boardId,
        card: card
      }
    });

    dialogRef.componentInstance.cardUpdated.subscribe(() => {
      this.refetch$.next();
    });
  }
}