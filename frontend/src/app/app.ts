import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Group } from './api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'frontend';

  // Test properties
  backendStatus = 'Not tested';
  groups: Group[] = [];
  newGroupName = '';
  newGroupDescription = '';
  isLoading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.testBackendHealth();
  }

  testBackendHealth() {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Testing backend health...');

    this.apiService.testHealth().subscribe({
      next: (response) => {
        console.log('Health check success:', response);
        this.backendStatus = 'Connected ✅';
        this.isLoading = false;
        this.loadGroups();
      },
      error: (error) => {
        console.log('Health check failed:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        console.log('Full error object:', error);

        this.backendStatus = 'Failed ❌';
        this.errorMessage = `Backend connection failed: Status ${error.status} - ${error.message}`;
        this.isLoading = false;
      }
    });
  }

  loadGroups() {
    this.apiService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: (error) => {
        this.errorMessage = `Failed to load groups: ${error.message}`;
      }
    });
  }

  createGroup() {
    if (!this.newGroupName.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const newGroup = {
      name: this.newGroupName,
      description: this.newGroupDescription || undefined
    };

    this.apiService.createGroup(newGroup).subscribe({
      next: (group) => {
        this.groups.push(group);
        this.newGroupName = '';
        this.newGroupDescription = '';
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = `Failed to create group: ${error.message}`;
        this.isLoading = false;
      }
    });
  }
}
