/* eslint-disable @typescript-eslint/camelcase */
const ProyectSchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: {
      type: 'string',
    },
  },
};

export const ProyectSpec = {
  description: 'lsdnfidi',
  required: true,
  content: {
    'application/json': { schema: ProyectSchema },
  },
};
