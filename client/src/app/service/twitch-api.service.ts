import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DreandosTwitchInterface, TwitchStreamResponse } from "@genezio-sdk/f123dashboard" 


@Injectable({
  providedIn: 'root',
})
export class TwitchApiService {
  private channelId: string = 'dreandos';
  private _isLive = new BehaviorSubject<boolean>(false);
  //public readonly isLive$ = this._isLive.asObservable();
  //public isLive: boolean = false;
  private twitchStreamResponse: TwitchStreamResponse |null = null;

  async checkStreamStatus(){
    this.twitchStreamResponse = await DreandosTwitchInterface.getStreamInfo(this.channelId);
  }
  
  isLive(): boolean {
    return  this.twitchStreamResponse && this.twitchStreamResponse.data.length > 0 ? true : false;
  }

}