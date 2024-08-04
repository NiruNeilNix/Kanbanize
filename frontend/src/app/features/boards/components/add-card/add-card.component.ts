import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog,} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ICard } from '../../../../shared/models/board.model';
import { CardService } from '../../../../shared/services/card.service';
import { ConfirmComponent } from '../../../../shared/ui/confirm/confirm.component';
import { filter, mergeMap } from 'rxjs';
// date picker import
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
// date picker import

// date picker
const MAT_MOMENT_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'l',
  },
  display: {
    dateInput: 'l',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
// date picker

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepicker,
    MatDatepickerModule],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.scss',
  // date picker provider
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],
  // date picker providers
})
export class AddCardComponent {

  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cardService = inject(CardService);
  data = inject(MAT_DIALOG_DATA);

  addCardForm = this.fb.group({
    order: this.fb.control(this.data.swimlane.cards.length),
    boardId: this.fb.control(this.data.boardId),
    swimlaneId: this.fb.control(this.data.swimlane.id),
    name: this.fb.control(this.data.card?.name, [Validators.required]),
    content: this.fb.control(this.data.card?.content),
    dueDate: this.fb.control(this.data.card?.dueDate),
    complete: this.fb.control(this.data.card?.complete ?? false),
  });

   createOrEditCard() {
    if (this.addCardForm.valid) {
      const cardData = this.addCardForm.value;
      cardData.content = cardData.content || ''; 
      
      if (this.data.card?.id) {
        this.cardService.updateCard(this.data.card.id, cardData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.cardService.createCard(cardData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }
  private _updateCard() {
    this.cardService
      .updateCard(this.data.card?.id, this.addCardForm.value as Partial<ICard>)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card);
      });
  }

  private _createCard() {
    this.cardService
      .createCard(this.addCardForm.value as Partial<ICard>)
      .subscribe((card: ICard) => {
        this.dialogRef.close(card);
      });
  }

  deleteCard() {
    if (!this.data.card?.id) return;
    this.matDialog
      .open(ConfirmComponent, {
        data: {
          title: 'Delete Card',
          message: 'Are you sure you want to delete this card?',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirm) => confirm),
        mergeMap(() => this.cardService.deleteCard(this.data.card.id))
      )
      .subscribe(() => this.dialogRef.close(true));
  }

// date picker
// Save the selected date to your backend
private _createOrEditCard() {
  const formValue = this.addCardForm.value as Partial<{
    order: any;
    boardId: any;
    swimlaneId: any;
    name: any;
    content: any;
    dueDate: Date;
  }>;
  const dueDate = formValue?.dueDate;
};

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}

  function createOrEditCard() {
    throw new Error('Function not implemented.');
  }
// date picker
