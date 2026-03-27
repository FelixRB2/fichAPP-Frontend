import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { PanelControl } from './pages/dashboard/dashboard';
import { PanelAdministrador } from './pages/admin/admin.component';

export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'landingPage', component: LandingPage },
    { path: 'login', component: Login },
    { path: 'registro', component: Registro },
    { 
        path: 'dashboard', 
        component: PanelControl, 
        canActivate: [authGuard] 
    },
    { 
        path: 'admin', 
        component: PanelAdministrador, 
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' }
    }
];
