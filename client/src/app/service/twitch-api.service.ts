import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import type { TwitchStreamResponse } from '@f123dashboard/shared';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TwitchApiService {
  private apiService = inject(ApiService);
  private channelId = 'dreandos';
  private _isLive = new BehaviorSubject<boolean>(false);
  //public readonly isLive$ = this._isLive.asObservable();
  //public isLive: boolean = false;
  private twitchStreamResponse: TwitchStreamResponse |null = null;

  async checkStreamStatus(){
    this.twitchStreamResponse = await firstValueFrom(
      this.apiService.post<TwitchStreamResponse>('/twitch/stream-info', { channelName: this.channelId })
    );
  }
  
  isLive(): boolean {
    return  this.twitchStreamResponse && this.twitchStreamResponse.data.length > 0 ? true : false;
  }
  getChannel(): string {
    return this.channelId;
  }

}