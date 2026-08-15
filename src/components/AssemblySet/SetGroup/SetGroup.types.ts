import type {
  AssemblyGroup,
  AssemblySetProps,
  QuantityChangeHandler,
} from '../AssemblySet.types'

export interface SetGroupProps extends Pick<
  AssemblySetProps,
  'headline' | 'hint' | 'completeHint'
> {
  group: AssemblyGroup
  quantities: Record<string, number>
  onChange: QuantityChangeHandler
}
