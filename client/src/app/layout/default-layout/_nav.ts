import { INavData } from '@coreui/angular';

export const getNavItems = (isAdmin: boolean, fantaEnabled: boolean): INavData[] => {
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
    ...(fantaEnabled ? [{
      name: 'Fanta',
      url: '/fanta',
      iconComponent: { name: 'cil-gamepad' }
    }] : []),
    {
      name: 'Albo D\'oro',
      url: '/albo-d-oro',
      iconComponent: { name: 'cil-star' }
    },
    {
      name: 'Crediti',
      url: '/credits',
      iconComponent: { name: 'cil-coffee' }
    },
    {
      name: 'Minigiochi',
      url: '/playground',
      iconComponent: { name: 'cil-happy' }
    }
  ];

  // Add Admin only if the user is admin
  if (isAdmin) {
    items.push({
      name: 'Admin',
      url: '/admin',
      iconComponent: { name: 'cil-settings' },
      children: [
        {
          name: 'Gestione Risultati',
          url: '/admin/result-edit',
          iconComponent: { name: 'cil-pencil' }
        },
        {
          name: 'Modifica GP',
          url: '/admin/gp-edit',
          iconComponent: { name: 'cil-calendar' }
        },
        {
          name: 'Estrazione Pista',
          url: '/admin/track-extraction',
          iconComponent: { name: 'cil-loop-circular' },
          badge: {
            color: 'success',
            text: 'NEW'
          },
        },
        {
          name: 'Gestione Utenti',
          url: '/admin/change-password',
          iconComponent: { name: 'cil-user' }
        }
      ]
    });
  }

  return items;
};