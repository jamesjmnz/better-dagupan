import { BookOpenIcon, BuildingIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  SidebarContainer,
  SidebarGroup,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { lguLabels } from '@/lib/lguLabels';

export default function ElectedOfficialsSidebar() {
  const { t } = useTranslation('common');

  /*
   * The titles come from the LGU configuration rather than being written in.
   * The template hard-coded "Municipal Government" here, which is the wrong
   * kind of LGU for a component city. The council's name is a proper noun,
   * so it reads the same in English and Filipino.
   */
  const groups = [
    {
      title: t('electedOfficials.sidebarOfficials'),
      items: [
        {
          label: t('government.electedofficialsTitle'),
          icon: BuildingIcon,
          path: '/government/elected-officials',
        },
      ],
    },
    {
      title: lguLabels.body,
      items: [
        {
          label: t('electedOfficials.committeesTitle'),
          icon: BookOpenIcon,
          path: '/government/elected-officials/committees',
        },
      ],
    },
  ];

  return (
    <SidebarContainer title={lguLabels.fullName}>
      {groups.map(group => (
        <SidebarGroup key={group.title} title={group.title}>
          {group.items.map(item => (
            <SidebarItem key={item.path} {...item} />
          ))}
        </SidebarGroup>
      ))}
    </SidebarContainer>
  );
}
