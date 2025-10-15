import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GridModule, TableDirective } from '@coreui/angular';
import { LeaderBoard } from '../../../app/model/leaderboard'
import { FantaService } from '../../../app/service/fanta.service';
import { DbDataService } from '../../../app/service/db-data.service';
import { cilPeople} from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { AvatarComponent, TextColorDirective } from '@coreui/angular';
import { User } from '@genezio-sdk/f123dashboard';


@Component({
    selector: 'app-leaderboard',
    imports: [
        CommonModule,
        GridModule,
        TableDirective,
        IconDirective,
        TextColorDirective,
        AvatarComponent
    ],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss'
})

export class LeaderboardComponent {
  @Input() maxDisplayable: number | undefined = undefined; // Default value set to 10
  @Input() showVotes: boolean = true;
  public cilPeople: string[] = cilPeople;

  constructor(private fantaService: FantaService, private dbData: DbDataService){}

   users: User[] = this.dbData.getUsers();
   leaderBoards: LeaderBoard[] = [];
   totNumberVotes: number = this.fantaService.getTotNumberVotes();
  
  ngOnInit(): void {
    //this.users = this.users.filter(u => u.id !== 0); //remove admin user
    this.users.forEach(user => {
      let newUser: LeaderBoard = {
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

    GetAvatar(userId: number, image?: string): string {
    if (image) {
      return `data:image/jpeg;base64,${image}`;
    }
    // Fallback to file path
    return `./assets/images/avatars_fanta/${userId}.png`;
  }
}
