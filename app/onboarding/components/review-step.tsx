// app/onboarding/components/review-step.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOnboarding } from '../onboarding-provider'

export function ReviewStep() {
  const { formData, nextStep } = useOnboarding()

  const handleSubmit = async () => {
    // Aqui você pode adicionar a lógica de envio para sua API
    console.log('Dados enviados:', formData)
    nextStep() // Ou redirecionar para outra página
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <ReviewItem label="Nome da Empresa" value={formData.companyName} />
        <ReviewItem label="CNPJ" value={formData.cnpj} />
        <ReviewItem 
          label="Tipo de Operação" 
          value={formData.operationType} 
          badge
        />
        <ReviewItem label="Faturamento Anual" value={formData.annualRevenue} />
        <ReviewItem label="Número de Funcionários" value={formData.employeesCount} />
        <ReviewItem 
          label="Descrição de Produtos/Serviços" 
          value={formData.productServiceDescription} 
          fullWidth
        />
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={handleSubmit}>
          Confirmar e Finalizar
        </Button>
      </div>
    </div>
  )
}

const ReviewItem = ({ 
  label, 
  value, 
  badge = false,
  fullWidth = false 
}: { 
  label: string
  value: string
  badge?: boolean
  fullWidth?: boolean
}) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    {badge ? (
      <Badge variant="outline" className="mt-1">
        {value}
      </Badge>
    ) : (
      <p className="mt-1 font-medium">{value || '-'}</p>
    )}
  </div>
)