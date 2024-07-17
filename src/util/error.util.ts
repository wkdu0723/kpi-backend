import { ErrorResult } from "constant/errorMsg";

/**
 * 타입에 맞는 에러를 .error()로 기록
 * @param errorType
 */
export const errorLogger = (errorType: keyof typeof ErrorResult) => {
  const error = ErrorResult[errorType];
  console.error(`Error Code: ${error.code}, Message: ${error.message}`);
};
