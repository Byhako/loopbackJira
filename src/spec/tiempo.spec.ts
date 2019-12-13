/* eslint-disable @typescript-eslint/camelcase */
const TimeSchema = {
  type: 'object',
  required: ['usuario_id', 'issue_id', 'log', 'fecha', 'hora_inicio', 'hora_fin'],
  properties: {
    usuario_id: {
      type: 'number',
    },
    issue_id: {
      type: 'number',
    },
    log: {
      type: 'string',
    },
    fecha: {
      type: 'string',
      format: 'date',
    },
    hora_inicio: {
      type: 'string',
    },
    hora_fin: {
      type: 'string',
    },
  },
};

const TimeSchemaMultiple = {
  required: ['logs'],
  properties: {
    logs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['usuario_id', 'issue_id', 'log', 'fecha', 'hora_inicio', 'hora_fin'],
        properties: {
          usuario_id: {
            type: 'number',
          },
          issue_id: {
            type: 'number',
          },
          log: {
            type: 'string',
          },
          fecha: {
            type: 'string',
            format: 'date',
          },
          hora_inicio: {
            type: 'string',
          },
          hora_fin: {
            type: 'string',
          },
        },
      },
    },
  },
};

export const TimeBodySpecs = {
  description: 'lsdnfidi',
  required: true,
  content: {
    'application/json': { schema: TimeSchema },
  },
};

export const TimeBodySpecsMultiple = {
  description: 'knkxcs',
  required: true,
  content: {
    'application/json': { schema: TimeSchemaMultiple },
  },
};
