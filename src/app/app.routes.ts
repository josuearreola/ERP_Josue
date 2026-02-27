import { Routes } from '@angular/router';

export const routes: Routes = [

    { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing) },

    {
        path: 'dashboard',
        loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
        children: [
            { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
            { path: 'group', loadComponent: () => import('./pages/group/group').then(m => m.Group) },
            { path: 'user', loadComponent: () => import('./pages/user/user').then(m => m.User) },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },

    {
        path: 'auth',
        children: [
            { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login) },
            { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.Register) }
        ]
    },

];
