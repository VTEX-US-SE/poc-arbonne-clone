import {
  frequenciesFromDomain,
  REPLENISH_ATTACHMENT,
  REPLENISH_FREQUENCY_FIELD,
  type ReplenishFrequency,
} from '../../../utils/replenish'
import { readFields, type RawAttachment } from './parseComposition'

/**
 * The cadences the ReplenishMe plan offers on this SKU, read off its catalog
 * attachment. Empty for a product the plan is not registered on -- which is
 * what hides the ReplenishMe option on the PDP.
 *
 * `readFields` handles both shapes VTEX returns the attachment in; the parsing
 * of the domain itself lives in `utils/replenish` next to the code that sends
 * the value back, so the two cannot drift.
 */
export function replenishFrequencies(
  attachments: RawAttachment[] = []
): ReplenishFrequency[] {
  const attachment = attachments.find(
    (candidate) => candidate.name === REPLENISH_ATTACHMENT
  )

  if (!attachment) {
    return []
  }

  const field = readFields(attachment).find(
    (candidate) => candidate.fieldName === REPLENISH_FREQUENCY_FIELD
  )

  return field ? frequenciesFromDomain(field.composition) : []
}
