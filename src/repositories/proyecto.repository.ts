import {DefaultCrudRepository} from '@loopback/repository';
import {Proyecto, ProyectoRelations} from '../models';
import {DatabaseDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ProyectoRepository extends DefaultCrudRepository<
  Proyecto,
  typeof Proyecto.prototype.id,
  ProyectoRelations
> {
  constructor(
    @inject('datasources.database') dataSource: DatabaseDataSource,
  ) {
    super(Proyecto, dataSource);
  }
}
