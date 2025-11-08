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
      name: 'Campionato',
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
      name: 'Crediti',
      url: '/credits',
      iconComponent: { name: 'cil-coffee' },
      badge: {
        color: 'success',
        text: 'NEW'
      }
    },
    {
      name: 'Playground',
      url: '/playground',
      iconComponent: { name: 'cil-happy' },
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
      },
      children: [
        {
          name: 'Gestione Gare',
          url: '/admin',
          iconComponent: { name: 'cil-calendar' }
        },
        {
          name: 'Gestione Utenti',
          url: '/admin-change-password',
          iconComponent: { name: 'cil-user' }
        }
      ]
    });
  }

  return items;
};