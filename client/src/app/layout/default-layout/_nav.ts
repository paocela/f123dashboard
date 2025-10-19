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
      name: 'Albo D\'oro',
      url: '/albo-d-oro',
      iconComponent: { name: 'cil-star' },
      badge: {
        color: 'success',
        text: 'NEW'
      }
    },
    {
      name: 'Credits',
      url: '/credits',
      iconComponent: { name: 'cil-coffee' },
      badge: {
        color: 'success',
        text: 'NEW'
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
        color: 'success',
        text: 'NEW'
      }
    });
  }

  return items;
};