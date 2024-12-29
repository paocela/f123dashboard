import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GridModule, TableDirective } from '@coreui/angular';
import { User, USERS } from '../../app/model/user';
import { LeaderBoard } from '../../app/model/leaderboard'
import { forEach } from 'lodash-es';
import { ReturnStatement } from '@angular/compiler';
import { FantaService } from 'src/app/service/fanta.service';
import { DbDataService } from 'src/app/service/db-data.service';

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

  constructor(private fantaService: FantaService, private dbData: DbDataService){}

   users: User[] = this.dbData.getUsers();
   leaderBoards: LeaderBoard[] = [];
  
  ngOnInit(): void {
    //this.users = this.users.filter(u => u.id !== 0); //remove admin user
    this.users.forEach(user => {
      let newUser: LeaderBoard = {
        id: user.id,
        username: user.username,
        points: this.fantaService.getFantaPoints(user.id)
      };
      this.leaderBoards.push(newUser);
    });
  }
}
