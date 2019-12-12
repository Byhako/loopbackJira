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
      // format: 'time',
    },
    hora_fin: {
      type: 'string',
      // format: 'time',
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
