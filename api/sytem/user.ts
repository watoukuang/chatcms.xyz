import { User } from '@/types/app/scrum';
import { R } from '@/src/shared/types/response';

// Stub API function for listing employees
export async function listEmployeesAPI(): Promise<R<User[]>> {
  // TODO: Implement actual API call
  return {
    success: true,
    data: [],
    message: null,
    code: 200
  };
}
