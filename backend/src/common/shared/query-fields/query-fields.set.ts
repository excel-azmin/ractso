export const USER_SAFE_FIELDS = new Set([
  'id',
  'firstName',
  'lastName',
  'fullName',
  'email',
  'username',
  'clerkId',
  'roles',
  'status',
  'bio',
  'image',
  'location',
  'website',
  'createdAt',
  'updatedAt',
]);

export const PAYMENTS_SAFE_FIELDS = new Set([
  'id',
  'userId',
  'amount',
  'tran_id',
  'paymentType',
  'status',
  'createdAt',
  'updatedAt',
]);
