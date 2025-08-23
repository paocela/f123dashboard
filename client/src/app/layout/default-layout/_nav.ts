import { INavData } from '@coreui/angular';
import { cilCoffee } from '@coreui/icons';
import { AuthService } from './../../service/auth.service';


export const getNavItems = (isAdmin: boolean): INavData[] => {
  const items: INavData[] = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      iconComponent: { name: 'cil-speedometer' },
    },
    {
      name: 'Piloti',
      url: '/piloti',
      iconComponent: { name: 'cil-people' },
    },
    {
      name: 'Regole',
      url: '/regole',
      iconComponent: { name: 'cil-description' },
    },
    {
      name: 'Championship',
      url: '/championship',
      iconComponent: { name: 'cil-calendar' },
    },
    {
      name: 'Fanta',
      url: '/fanta',
      iconComponent: { name: 'cil-gamepad' }
    },
    {
      name: 'Credits',
      url: '/credits',
      iconComponent: { name: 'cil-coffee' },
      badge: {
        color: 'warning',
        text: 'BETA'
      }
    }
  ];

  // Add Admin only if the user is admin
  if (isAdmin) {
    items.push({
      name: 'Admin',
      url: '/admin',
      iconComponent: { name: 'cil-settings' },
      badge: {
        color: 'warning',
        text: 'BETA'
      }
    });
  }

  return items;
};