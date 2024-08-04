export class CreateCardDto {
  name: string;
  content: string;
  order: number;
  swimlaneId: number;
  dueDate: string;
  complete: boolean;
}
