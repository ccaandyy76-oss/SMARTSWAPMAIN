export type UserKycStatus = 'not_started' | 'pending' | 'verified' | 'failed'

export type KycDocumentType = 'aadhaar' | 'pan' | 'dl' | 'passport'

export interface KycRecord {
  documentType: KycDocumentType
  verifiedAt: number
  displayLabel?: string
  maskedRef?: string
}
