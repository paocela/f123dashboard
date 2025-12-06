import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { PlaygroundBestScore } from '@f123dashboard/shared';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  private apiService = inject(ApiService);

/****************************************************************/
//variabili locali
/****************************************************************/
  private playgroundLeaderboard: PlaygroundBestScore[] = [];


/****************************************************************/
//compilazione delle variabili pre caricamento del interfaccia web 
/****************************************************************/

  async AllData() {
    const [
      playgroundLeaderboard
    ] = await Promise.all([
      firstValueFrom(this.apiService.post<PlaygroundBestScore[]>('/playground/leaderboard', {}))
    ]);

    this.playgroundLeaderboard = playgroundLeaderboard;
  }

  getPlaygroundLeaderboard(): PlaygroundBestScore[] {
    return this.playgroundLeaderboard;
  }

  getUserBestScore(userId: number): number {
    const userScore = this.playgroundLeaderboard.find(score => score.user_id === userId);
    return userScore ? userScore.best_score : 9999; // return 9999 if no score found
  }

  async setUserBestScore(voto: PlaygroundBestScore): Promise<void> {
    await firstValueFrom(
      this.apiService.post('/playground/score', voto)
    );
  }
}

export { PlaygroundBestScore };
