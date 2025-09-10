import {Routes} from "@angular/router";
import {TaskListComponent} from "./tasks/task-list/task-list.component";
import {AuthGuard} from "./core/guards/auth.guard";
import {TaskFormComponent} from "./tasks/task-form/task-form.component";
import {ProfileComponent} from "./profile/profile.component";
import {LoginComponent} from "./core/auth/login.component";
import {RegisterComponent} from "./core/auth/register.component";
import {LogoutComponent} from "./core/auth/logout.component";
import {TagManagementComponent} from "./tag-management/tag-management.component";

export const routes: Routes = [
  {path: '', redirectTo: '/profile', pathMatch: 'full'},
  {path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard]},
  {path: 'tasks/new', component: TaskFormComponent, canActivate: [AuthGuard]},
  {path: 'tasks/edit/:id', component: TaskFormComponent, canActivate: [AuthGuard]},
  {path: 'tags', component: TagManagementComponent, canActivate: [AuthGuard]},
  {path: 'tags/new', component: TagManagementComponent, canActivate: [AuthGuard]},
  {path: 'tags/edit/:id', component: TagManagementComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'logout', component: LogoutComponent},
  {path: '**', redirectTo: '/profile'}
];