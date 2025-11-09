import { Injectable } from '@angular/core';
import { PlaygroundInterface, PlaygroundBestScore } from "@genezio-sdk/f123dashboard" 

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {

  constructor() { }

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
      PlaygroundInterface.getPlaygroundLeaderboard()
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
    await PlaygroundInterface.setUserBestScore(voto);
  }
}

export { PlaygroundBestScore };
