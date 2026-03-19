// src/lib/validations/index.ts
// Export all validation schemas

// Agent validations
export {
  traitsSchema,
  registerAgentSchema,
  validateAgentRegistration,
  FITNESS_MAX,
  FITNESS_MIN,
  TRAIT_EXTREME_THRESHOLD,
  TRAIT_AVERAGE_MAX,
  MAX_EXTREME_TRAITS,
  type RegisterAgentInput,
} from "./agent";

// Breeding validations
export {
  breedingRequestSchema,
  breedingApprovalSchema,
  breedingExecuteSchema,
  breedingCancelSchema,
  breedingOnChainSyncSchema,
  validateBreedingRequest,
  validateBreedingApproval,
  validateBreedingExecute,
  type BreedingRequestInput,
  type BreedingApprovalInput,
  type BreedingExecuteInput,
  type BreedingCancelInput,
  type BreedingOnChainSyncInput,
} from "./breeding";

// User validations
export {
  ethereumAddressSchema,
  userProfileUpdateSchema,
  userRegistrationSchema,
  walletLinkSchema,
  telegramLinkSchema,
  verificationCodeSchema,
  validateUserProfile,
  validateUserRegistration,
  validateVerificationCode,
  isValidEthereumAddress,
  type UserProfileUpdateInput,
  type UserRegistrationInput,
  type WalletLinkInput,
  type TelegramLinkInput,
  type VerificationCodeInput,
} from "./user";
