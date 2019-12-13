import { DefaultCrudRepository, BelongsToAccessor, repository, juggler } from '@loopback/repository';
import { Proyecto, Issue, IssueRelations } from '../models';
import { inject, Getter } from '@loopback/core';
import { ProyectoRepository } from './proyecto.repository';
export class IssueRepository extends DefaultCrudRepository<
  Issue,
  typeof Issue.prototype.id,
  IssueRelations
  > {
  public readonly proyecto: BelongsToAccessor<
    Proyecto,
    typeof Issue.prototype.id
  >;
  constructor(
    @inject('datasources.database') protected db: juggler.DataSource,
    @repository.getter('ProyectoRepository')
    proyectoRepositoryGetter: Getter<ProyectoRepository>,
  ) {
    super(Issue, db);
    this.proyecto = this.createBelongsToAccessorFor(
      'proyecto',
      proyectoRepositoryGetter,
    );
    // add this line to register inclusion resolver.
    this.registerInclusionResolver('proyecto', this.proyecto.inclusionResolver);
  }
}
