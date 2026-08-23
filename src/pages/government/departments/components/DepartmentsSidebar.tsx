import { useNavigate, useParams } from 'react-router-dom';

import { Building2Icon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { lguLabels } from '@/lib/lguLabels';
import { officeIcons } from '@/lib/officeIcons';

import departmentsDataRaw from '@/data/directory/departments.json';

import type { Department } from '@/types/directoryTypes';

const departmentsData = departmentsDataRaw as Department[];

export default function DepartmentsSidebar() {
  const { department: activeSlug } = useParams();
  const navigate = useNavigate();

  /*
   * The list is copied before sorting: .sort() mutates in place, and this array
   * is the same module-level import the index page renders from.
   *
   * The old comparator stripped "MUNICIPAL " and "DEPARTMENT OF " prefixes that
   * no Dagupan office name carries, and did so case-sensitively in upper case,
   * so it never matched anything here.
   */
  const sortedDepartments = [...departmentsData].sort((a, b) =>
    a.office_name.localeCompare(b.office_name)
  );

  return (
    <SidebarContainer title={`${lguLabels.adjective} Departments`}>
      {sortedDepartments.map(dept => {
        // 2. Get the specific icon or fallback to a default building icon
        const IconComponent = officeIcons[dept.slug] || Building2Icon;

        return (
          <SidebarItem
            key={dept.slug}
            /*
              Rendered verbatim. formatGovName() lowercases a whole word before
              recapitalising it, which turned acronyms in these names to
              sentence case in this sidebar.
            */
            label={dept.office_name}
            tooltip={dept.office_name}
            icon={IconComponent} // Use the specific icon
            isActive={activeSlug === dept.slug}
            onClick={() =>
              navigate(`/government/departments/${dept.slug}`, {
                state: { scrollToContent: true },
              })
            }
          />
        );
      })}
    </SidebarContainer>
  );
}
