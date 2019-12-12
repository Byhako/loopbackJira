const SetExpirationInputSchema = {
  type: 'object',
  required: ['account_license_id', 'expiration_date'],
  properties: {
    account_license_id: {
      type: 'number',
    },
    expiration_date: {
      type: 'string',
      format: 'date',
    },
  },
};
export const SetExpirationBodySpecs = {
  description: 'Set an expiration date for a license',
  required: true,
  content: {
    'application/json': { schema: SetExpirationInputSchema },
  },
};
