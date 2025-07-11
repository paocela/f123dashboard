import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DreandosTwitchInterface } from "@genezio-sdk/f123dashboard" 


interface TwitchStreamResponse {
  data: Array<{
      id: string;
      user_id: string;
      user_login: string;
      type: string;
      title: string;
      viewer_count: number;
      started_at: string;
      language: string;
      thumbnail_url: string;
  }>;
}


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
    this.twitchStreamResponse = JSON.parse(await DreandosTwitchInterface.getStreamInfo(this.channelId));
  }
  
  isLive(): boolean {
    return  this.twitchStreamResponse && this.twitchStreamResponse.data.length > 0 ? true : false;
  }

}