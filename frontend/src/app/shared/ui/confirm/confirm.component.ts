import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'], // corrected property name
})
export class ConfirmComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmComponent>);

  data = inject<{
    title: string;
    message: string;
  }>(MAT_DIALOG_DATA);

  confirm() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}
