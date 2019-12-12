import { DefaultCrudRepository } from '@loopback/repository';
import { Tiempo, TiempoRelations } from '../models';
import { DatabaseDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class TiempoRepository extends DefaultCrudRepository<
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


export type SetExpirationBody = {
  usuario_id: number,
  issue_id: number,
  log: number,
  fecha: string,
  hora_inicio: string,
  hora_fin: string
};
