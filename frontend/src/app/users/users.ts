import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../generated-api/api/users.service';
import { UsersGet200ResponseInner, UsersPostRequest } from '../../generated-api';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent implements OnInit {
  users: UsersGet200ResponseInner[] = [];
  loading = false;
  error: string | null = null;

  // Form for creating new users
  newUser = {
    first_name: '',
    last_name: '',
    username: '',
    email: ''
  };

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.usersService.usersGet().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  createUser() {
    if (!this.newUser.first_name || !this.newUser.last_name ||
        !this.newUser.username || !this.newUser.email) {
      this.error = 'All fields are required';
      return;
    }

    this.loading = true;
    this.error = null;

    const request: UsersPostRequest = {
      user: {
        first_name: this.newUser.first_name,
        last_name: this.newUser.last_name,
        username: this.newUser.username,
        email: this.newUser.email
      }
    };

    this.usersService.usersPost(request).subscribe({
      next: (user) => {
        console.log('User created:', user);
        this.resetForm();
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.error = 'Failed to create user';
        this.loading = false;
        console.error('Error creating user:', error);
      }
    });
  }

  deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.usersService.usersIdDelete(id.toString()).subscribe({
      next: () => {
        console.log('User deleted');
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.error = 'Failed to delete user';
        console.error('Error deleting user:', error);
      }
    });
  }

  private resetForm() {
    this.newUser = {
      first_name: '',
      last_name: '',
      username: '',
      email: ''
    };
    this.loading = false;
  }
}
