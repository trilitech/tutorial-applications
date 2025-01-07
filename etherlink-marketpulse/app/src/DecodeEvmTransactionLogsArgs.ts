import {
  Abi,
  BaseError,
  ContractFunctionRevertedError,
  decodeErrorResult,
} from "viem";

// Type-Safe Error Handling Interface
interface DetailedError {
  type: "DecodedError" | "RawError" | "UnknownError";
  message: string;
  details?: string;
  errorData?: any;
}

// Advanced Error Extraction Function
export function extractErrorDetails(error: unknown, abi: Abi): DetailedError {
  // Type guard for BaseError
  if (error instanceof BaseError) {
    // Type guard for ContractFunctionRevertedError
    if (error.walk() instanceof ContractFunctionRevertedError) {
      try {
        // Safe data extraction
        const revertError = error.walk() as ContractFunctionRevertedError;

        // Extract error data safely
        const errorData = (revertError as any).data;

        // Attempt to decode error
        if (errorData) {
          try {
            // Generic error ABI for decoding
            const errorAbi = abi;

            const decodedError = decodeErrorResult({
              abi: errorAbi,
              data: errorData,
            });

            return {
              type: "DecodedError",
              message: decodedError.errorName || "Contract function reverted",
              details: decodedError.args?.toString(),
              errorData,
            };
          } catch {
            // Fallback if decoding fails
            return {
              type: "RawError",
              message: "Could not decode error",
              errorData,
            };
          }
        }
      } catch (extractionError) {
        // Fallback error extraction
        return {
          type: "UnknownError",
          message: error.shortMessage || "Unknown contract error",
          details: error.message,
        };
      }
    }

    // Generic BaseError handling
    return {
      type: "RawError",
      message: error.shortMessage || "Base error occurred",
      details: error.message,
    };
  }

  // Fallback for non-BaseError
  return {
    type: "UnknownError",
    message: "message" in (error as any) ? (error as any).message : String(error),
    details: error instanceof Error ? error.message : undefined,
  };
}
