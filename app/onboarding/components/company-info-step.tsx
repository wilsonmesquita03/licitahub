// app/onboarding/components/company-info-step.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOnboarding } from '../onboarding-provider'

export function CompanyInfoStep() {
  const { formData, updateFormData } = useOnboarding()

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="companyName">Nome da Empresa</Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => updateFormData({ companyName: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={(e) => updateFormData({ cnpj: e.target.value })}
          placeholder="00.000.000/0000-00"
        />
      </div>
    </div>
  )
}