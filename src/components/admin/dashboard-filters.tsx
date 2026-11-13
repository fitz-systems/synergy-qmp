"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, X } from "lucide-react";
import { CompanyPicker } from "@/components/admin/company-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminFilterAll, adminRoutes, companyListFilterParam, companyPickerLabels, dashboardFilterLabels, noDistributorValue, userCompanyParam } from "@/constants/admin";
import { adminListHref, companyMatchesDistributor } from "@/lib/helpers/admin";
import type { DashboardFilterData } from "@/types/admin";

interface DashboardFiltersProps {
  data: DashboardFilterData;
}

export function DashboardFilters({ data }: DashboardFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { distributor, company } = data;
  const pickerData = useMemo(() => ({
    companies: data.companies.filter((option) => companyMatchesDistributor(option, distributor)),
    distributors: distributor === adminFilterAll ? data.distributors : data.distributors.filter((option) => String(option.id) === distributor)
  }), [data.companies, data.distributors, distributor]);

  function navigate(nextDistributor: string, nextCompany: string) {
    startTransition(() => router.replace(adminListHref(adminRoutes.dashboard, { [companyListFilterParam]: nextDistributor, [userCompanyParam]: nextCompany }), { scroll: false }));
  }

  function changeDistributor(value: string) {
    const selected = data.companies.find((option) => String(option.id) === company);
    navigate(value, selected && companyMatchesDistributor(selected, value) ? company : adminFilterAll);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center" aria-busy={pending}>
      <Select value={distributor} onValueChange={changeDistributor}>
        <SelectTrigger aria-label={dashboardFilterLabels.distributor} className="bg-background sm:w-56">
          <SelectValue placeholder={dashboardFilterLabels.allDistributors}/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={adminFilterAll}>{dashboardFilterLabels.allDistributors}</SelectItem>
          <SelectItem value={noDistributorValue}>{companyPickerLabels.noDistributor}</SelectItem>
          {data.distributors.length > 0 && <SelectSeparator/>}
          {data.distributors.map((option) => <SelectItem key={option.id} value={String(option.id)}>{option.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="sm:w-64">
        <CompanyPicker
          key={distributor}
          id="dashboard-company"
          data={pickerData}
          value={company === adminFilterAll ? "" : company}
          onValueChange={(value) => navigate(distributor, value || adminFilterAll)}
          allowCreate={false}
          showDistributor={false}
          labels={{ placeholder: dashboardFilterLabels.allCompanies, none: dashboardFilterLabels.allCompanies }}
        />
      </div>
      {(distributor !== adminFilterAll || company !== adminFilterAll) && (
        <Button variant="ghost" size="sm" onClick={() => navigate(adminFilterAll, adminFilterAll)} disabled={pending}><X/>{dashboardFilterLabels.clear}</Button>
      )}
      {pending && <LoaderCircle aria-label="Loading" className="size-4 animate-spin text-muted-foreground"/>}
    </div>
  );
}
