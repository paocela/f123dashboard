import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GridModule, TableDirective } from '@coreui/angular';
import { User, USERS } from '../../app/model/user';
import { LeaderBoard } from '../../app/model/leaderboard'
import { forEach } from 'lodash-es';
import { ReturnStatement } from '@angular/compiler';
import { FantaService } from 'src/app/service/fanta.service';
import { DbDataService } from 'src/app/service/db-data.service';
import { cilPeople} from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { AvatarComponent, TextColorDirective } from '@coreui/angular';


@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    TableDirective,
    IconDirective,
    TextColorDirective, 
    AvatarComponent
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})

export class LeaderboardComponent {

  public cilPeople: string[] = cilPeople;

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
    this.leaderBoards.sort((a,b) => b.points - a.points );

    console.log(this.leaderBoards)
  }
}
