import { INavData } from '@coreui/angular';


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
    iconComponent: { name: 'cil-gamepad' },
    badge: {
      color: 'warning',
      text: 'BETA'
    }
  }
];
