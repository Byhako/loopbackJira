import { Entity, model, property } from '@loopback/repository';

@model()
export class Tiempo extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  usuario_id: number;
  @property({
    type: 'number',
    required: true,
  })
  issue_id: number;

  @property({
    type: 'string',
    required: true,
  })
  log: string;

  @property({
    type: 'date',
    required: true,
  })
  fecha: string;

  @property({
    type: 'string',
    required: true,
  })
  hora_inicio: string;

  @property({
    type: 'string',
    required: true,
  })
  hora_fin: string;

  constructor(data?: Partial<Tiempo>) {
    super(data);
  }
}

export interface TiempoRelations {
  // describe navigational properties here
}

export type TiempoWithRelations = Tiempo & TiempoRelations;
