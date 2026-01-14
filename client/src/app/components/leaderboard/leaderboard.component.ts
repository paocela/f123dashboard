import { CommonModule } from '@angular/common';
import { Component, Input, inject, OnInit } from '@angular/core';
import { GridModule, TableDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ButtonCloseDirective, ThemeDirective, AlertModule } from '@coreui/angular';
import { LeaderBoard } from '../../../app/model/leaderboard'
import { FantaService } from '../../../app/service/fanta.service';
import { DbDataService } from '../../../app/service/db-data.service';
import { cilPeople, cilInfo, cilBell } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { AvatarComponent, TextColorDirective } from '@coreui/angular';
import type { User, FantaVote } from '@f123dashboard/shared';
import { VoteHistoryTableComponent } from '../vote-history-table/vote-history-table.component';
import { allFlags } from '../../model/constants';


@Component({
    selector: 'app-leaderboard',
    imports: [
        CommonModule,
        GridModule,
        TableDirective,
        IconDirective,
        TextColorDirective,
        AvatarComponent,
        ModalComponent,
        ModalHeaderComponent,
        ModalTitleDirective,
        ModalBodyComponent,
        ButtonCloseDirective,
        ThemeDirective,
        VoteHistoryTableComponent,
        AlertModule
    ],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss'
})

export class LeaderboardComponent implements OnInit {
  private fantaService = inject(FantaService);
  private dbData = inject(DbDataService);

  @Input() maxDisplayable: number | undefined = undefined; // Default value set to 10
  @Input() showVotes = true;
  public cilPeople: string[] = cilPeople;
  public cilInfo: string[] = cilInfo;
  public cilBell: string[] = cilBell;
  public allFlags = allFlags;

  modalVisible = false;
  selectedUser: User | null = null;
  userVotes: { vote: FantaVote, trackId: number, trackName: string, trackCountry: string }[] = [];

   users: User[] = this.dbData.getUsers();
   leaderBoards: LeaderBoard[] = [];
   totNumberVotes: number = this.fantaService.getTotNumberVotes();
  
  ngOnInit(): void {
    //this.users = this.users.filter(u => u.id !== 0); //remove admin user
    this.users.forEach(user => {
      const newUser: LeaderBoard = {
        id: user.id,
        username: user.username,
        points: this.fantaService.getFantaPoints(user.id),
        numberVotes: this.fantaService.getFantaNumberVotes(user.id),
        avatarImage: user.image
      };
      this.leaderBoards.push(newUser);
    });
    this.leaderBoards = this.leaderBoards.filter(lb => lb.numberVotes > 0);
    this.leaderBoards.sort((a, b) => b.points - a.points);
  }

  getAvatar(userId: number, image?: string): string {
    if (image) 
      {return `data:image/jpeg;base64,${image}`;}
    
    // Fallback to file path
    return `./assets/images/avatars_fanta/${userId}.png`;
  }

  /**
   * Open modal with last 2 votes for the selected user
   */
  openVoteHistoryModal(userId: number): void {
    this.selectedUser = this.users.find(u => u.id === userId) || null;
    if (!this.selectedUser) {return;}

    // Get all tracks with results
    const allTracks = this.dbData.getAllTracks();
    const tracksWithResults = allTracks.filter(track => {
      const result = this.fantaService.getRaceResult(track.track_id);
      return result && result.id_1_place !== null && result.id_1_place !== undefined;
    });

    // Sort by date descending to get the most recent
    tracksWithResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get the last 2 races
    const lastTwoTracks = tracksWithResults.slice(0, 2);

    // Get votes for these races
    this.userVotes = lastTwoTracks
      .map(track => {
        const vote = this.fantaService.getFantaVote(userId, track.track_id);
        return vote ? {
          vote,
          trackId: track.track_id,
          trackName: track.name,
          trackCountry: track.country
        } : null;
      })
      .filter(v => v !== null) as { vote: FantaVote, trackId: number, trackName: string, trackCountry: string }[];

    this.modalVisible = true;
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    this.modalVisible = false;
    this.selectedUser = null;
    this.userVotes = [];
  }
}
