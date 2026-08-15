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
  /** Selected quantity per SKU, keyed across every group of the set. */
  quantities: Record<string, number>
  onChange: QuantityChangeHandler
}
