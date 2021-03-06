// import { DefaultCrudRepository } from '@loopback/repository';
import {
  DefaultTransactionalRepository,
} from '@loopback/repository';
import { Tiempo, TiempoRelations } from '../models';
import { DatabaseDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class TiempoRepository extends DefaultTransactionalRepository<
  Tiempo,
  typeof Tiempo.prototype.id,
  TiempoRelations
  > {
  constructor(
    @inject('datasources.database') dataSource: DatabaseDataSource,
  ) {
    super(Tiempo, dataSource);
  }
}


export type TimeBody = {
  usuario_id: number,
  issue_id: number,
  log: string,
  fecha: string,
  hora_inicio: string,
  hora_fin: string
};

export type TimeBodyMultiple = {
  logs: [TimeBody],
};
