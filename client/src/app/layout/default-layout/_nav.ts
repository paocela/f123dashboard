import { INavData } from '@coreui/angular';
import { cilCoffee } from '@coreui/icons';


export const navItems: INavData[] = [
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
    name: 'Admin',
    url: '/admin',
    iconComponent: { name: 'cil-settings' },
    badge: {
      color: 'warning',
      text: 'BETA'
    }
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
