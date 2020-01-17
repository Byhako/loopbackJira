// import {DefaultCrudRepository} from '@loopback/repository';
import {
  DefaultTransactionalRepository,
} from '@loopback/repository';
import { Usuario, UsuarioRelations } from '../models';
import { DatabaseDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class UsuarioRepository extends DefaultTransactionalRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
  > {
  constructor(
    @inject('datasources.database') dataSource: DatabaseDataSource,
  ) {
    super(Usuario, dataSource);
  }
}
