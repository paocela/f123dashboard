import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GridModule, TableDirective } from '@coreui/angular';
import { User, USERS } from '../../app/model/user';
import { LeaderBoard } from '../../app/model/leaderboard'
import { forEach } from 'lodash-es';
import { ReturnStatement } from '@angular/compiler';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    TableDirective,
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})

export class LeaderboardComponent {

   users: User[] = USERS;
   leaderBoards: LeaderBoard[] = [];

  getTotalPoints(ueserId: number): number {
    return ueserId * 100;
  }
  
  ngOnInit(): void {
    this.users = this.users.filter(u => u.id !== 0); //remove admin user
    this.users.forEach(user => {
      let newUser: LeaderBoard = {
        id: user.id,
        username: user.username,
        points: this.getTotalPoints(user.id)
      };
      this.leaderBoards.push(newUser);
      this.leaderBoards.sort((a,b) => a.points - b.points );
    });
  }
}
