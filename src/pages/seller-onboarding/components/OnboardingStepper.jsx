import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OnboardingStepper({ currentStep = 2 }) {
  const { t } = useTranslation()

  const steps = [
    { number: 1, label: t('becomeSeller.stepper.overview', 'OVERVIEW'), key: 'overview' },
    { number: 2, label: t('becomeSeller.stepper.info', 'SHOP INFORMATION'), key: 'info' },
    { number: 3, label: t('becomeSeller.stepper.review', 'REVIEW'), key: 'review' },
    { number: 4, label: t('becomeSeller.stepper.complete', 'COMPLETE'), key: 'complete' },
  ]

  return (
    <div className="w-full py-4 border-b border-neutral-200 mb-8">
      <div className="max-w-3xl mx-auto flex items-center justify-between relative px-2 sm:px-6">
        {/* Horizontal connector line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[1px] bg-neutral-200 -z-0" />

        {steps.map((step) => {
          const isDone = currentStep > step.number
          const isActive = currentStep === step.number

          return (
            <div
              key={step.number}
              className="relative z-10 flex flex-col items-center group select-none"
            >
              {/* Step indicator circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-200 ${
                  isDone
                    ? 'bg-black text-white'
                    : isActive
                    ? 'bg-black text-white ring-4 ring-neutral-100 font-bold'
                    : 'bg-white text-neutral-400 border border-neutral-300'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={`mt-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-center ${
                  isActive
                    ? 'font-bold text-black'
                    : isDone
                    ? 'text-neutral-700 font-medium'
                    : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
