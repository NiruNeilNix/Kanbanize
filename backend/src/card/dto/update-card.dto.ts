import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsOptional, IsISO8601 } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
    @IsOptional()
    @IsISO8601()
    dueDate?: string;
    @IsOptional()
    complete?: boolean;
}

const saveCard = (cardDto: UpdateCardDto) => {
    const dueDate = new Date(cardDto.dueDate);
    // Convert to UTC
    const utcDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000);
};