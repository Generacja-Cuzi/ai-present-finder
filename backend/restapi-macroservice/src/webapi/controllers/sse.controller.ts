import { Controller, Query, Res, Sse } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { SseService } from 'src/app/services/sse-service';

interface MessageEvent {
  data: any;
  id?: string;
  type?: string;
  retry?: number;
}

interface RegisterSseUserDto {
  clientId: string;
}

@Controller()
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('sse')
  sse(
    @Query() query: RegisterSseUserDto,
    @Res() response: Response,
  ): Observable<MessageEvent> {
    this.sseService.addUser(query.clientId);
    response.on('close', () => {
      this.sseService.removeUser(query.clientId);
    });
    return this.sseService.events(query.clientId);
  }
}
