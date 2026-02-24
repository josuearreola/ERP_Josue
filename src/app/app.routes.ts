import { Routes } from '@angular/router';

export const routes: Routes = [

    { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing) },

    {
        path: 'auth',
        children: [
            { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login) },
            { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.Register) }
        ]
    },

];
