// Changed icon for variety
import { useNavigate, useParams } from 'react-router-dom';

import { MapPinIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import barangaysDataRaw from '@/data/directory/barangays.json';

import type { Barangay } from '@/types/directoryTypes';

const barangaysData = barangaysDataRaw as Barangay[];

/**
 * Names are rendered verbatim. formatGovName() lowercases a whole word before
 * recapitalising it, which turned "Barangay II" into "Ii" in this sidebar.
 * The PSGC names are already cased for display.
 *
 * The list is copied before sorting: .sort() mutates in place, and this array
 * is the same module-level import the index page renders from.
 */
export default function BarangaysSidebar() {
  const { barangay: activeSlug } = useParams(); // URL param: /barangays/:barangay
  const navigate = useNavigate();

  return (
    <SidebarContainer title='Barangays'>
      {[...barangaysData]
        .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name))
        .map(brgy => (
          <SidebarItem
            key={brgy.slug}
            label={brgy.barangay_name}
            icon={MapPinIcon}
            isActive={activeSlug === brgy.slug}
            onClick={() =>
              navigate(`/government/barangays/${brgy.slug}`, {
                state: { scrollToContent: true },
              })
            }
          />
        ))}
    </SidebarContainer>
  );
}
