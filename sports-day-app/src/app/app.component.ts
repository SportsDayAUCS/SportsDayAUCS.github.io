import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Team } from './team';
import { NgIf } from '@angular/common';

const DEFAULT_STANDINGS: Team[] = [
  {position: 1, name: 'Complexity', points: 0},
  {position: 2, name: 'Algo', points: 0},
  {position: 3, name: 'Crypto', points: 0},
  {position: 4, name: 'DB', points: 0},
  {position: 5, name: 'CoCHI', points: 0},
  {position: 6, name: 'UBI', points: 0},
  {position: 7, name: 'LogSem', points: 0},
  {position: 8, name: 'TAP', points: 0},
];


/**const Standings: Team[] = [
  {position: 1, name: 'Complexity', points: 0},
  {position: 2, name: 'Algo', points: 0},
  {position: 3, name: 'Crypto', points: 0},
  {position: 4, name: 'DB', points: 0},
  {position: 5, name: 'CoCHI', points: 0},
  {position: 6, name: 'UBI', points: 0},
  {position: 7, name: 'LogSem', points: 0},
  {position: 8, name: 'TAP', points: 0},
];*/

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatTabsModule, MatCardModule, MatListModule, MatDividerModule, MatTableModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './dialog-entry-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  tableDataSource = new MatTableDataSource<Team>([]);
  displayedColumns: string[] = ['position', 'name', 'points'];
  
  title = 'sports-day-app';

  constructor() {
    this.loadData();
  }
  
  loadData(): void {
  const savedStandings = localStorage.getItem('standings');
  const savedMatches = localStorage.getItem('matches');

  if (savedStandings) {
    this.tableDataSource.data = JSON.parse(savedStandings);
  } else {
    this.tableDataSource.data = [...DEFAULT_STANDINGS];
  }

  if (savedMatches) {
    this.matches = JSON.parse(savedMatches);
  }
}

saveData(): void {
  localStorage.setItem('standings', JSON.stringify(this.tableDataSource.data));
  localStorage.setItem('matches', JSON.stringify(this.matches));
}

  readonly dialog = inject(MatDialog);

  matches = [
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
    '0-0',
  ]

  openDialog(teamA: string, teamB: string, match: number): void {
    const dialogRef = this.dialog.open(DialogEntryDialog, {
      width: '400px',
      data: [teamA, teamB]
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;

      if (result == "draw") {
        this.tableDataSource.data.filter((team) => team.name == teamA || team.name == teamB).forEach((team) => team.points += 1)
        this.matches[match] = ('1/2 - 1/2')
      } else {
        this.tableDataSource.data.filter((team) => team.name == result).forEach((team) => team.points += 2)
        this.matches[match] = result === teamA ? '1-0' : '0-1';
      }
      this.tableDataSource.data.sort((a, b) => {
        if (b.points === a.points) {
          return a.name.localeCompare(b.name);
        }
      return b.points - a.points;
      });
      this.tableDataSource.data.forEach((team, index) => {
        team.position = index + 1;
      });
      this.tableDataSource.data = [...this.tableDataSource.data];
      this.saveData();  // Save after updating standings and matches
    });
  }
}

@Component({
  selector: 'dialog-entry-dialog',
  templateUrl: './dialog-entry-dialog.html',
  styleUrls: ['./dialog-entry-dialog.css'],
  imports: [MatButtonModule, MatDialogActions, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogEntryDialog {
  readonly dialogRef = inject(MatDialogRef<DialogEntryDialog>);
  readonly teams = inject<string[]>(MAT_DIALOG_DATA);
  password: string = '';
  passwordVisible: boolean = false;
  errorMessage: string | null = null; // Add an error message property

  // Correct password for validation
  readonly correctPassword: string = 'judge1234';

  teamAWin(): void {
    this.dialogRef.close(this.teams[0]);
  }

  draw(): void {
    this.dialogRef.close('draw');
  }

  teamBWin(): void {
    this.dialogRef.close(this.teams[1]);
  }

  // Function to check if the entered password is correct
  isPasswordValid(): boolean {
    return this.password === this.correctPassword;
  }

  // Function to handle button clicks and check password
  onResultClick(result: string): void {
    if (this.isPasswordValid()) {
      // If the password is correct, close the dialog with the result
      if (result === 'teamA') {
        this.teamAWin();
      } else if (result === 'teamB') {
        this.teamBWin();
      } else {
        this.draw();
      }
    } else {
      // If the password is incorrect, show an error message
      this.errorMessage = 'Invalid password. Please try again.';
    }
  }

  // Toggle visibility of the password
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}

