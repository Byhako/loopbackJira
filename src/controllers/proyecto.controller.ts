import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Proyecto} from '../models';
import {ProyectoRepository} from '../repositories';

export class ProyectoController {
  constructor(
    @repository(ProyectoRepository)
    public proyectoRepository : ProyectoRepository,
  ) {}

  @post('/proyectos', {
    responses: {
      '200': {
        description: 'Proyecto model instance',
        content: {'application/json': {schema: getModelSchemaRef(Proyecto)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Proyecto, {
            title: 'NewProyecto',
            exclude: ['id'],
          }),
        },
      },
    })
    proyecto: Omit<Proyecto, 'id'>,
  ): Promise<Proyecto> {
    return this.proyectoRepository.create(proyecto);
  }

  @get('/proyectos/count', {
    responses: {
      '200': {
        description: 'Proyecto model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Proyecto)) where?: Where<Proyecto>,
  ): Promise<Count> {
    return this.proyectoRepository.count(where);
  }

  @get('/proyectos', {
    responses: {
      '200': {
        description: 'Array of Proyecto model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Proyecto, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Proyecto)) filter?: Filter<Proyecto>,
  ): Promise<Proyecto[]> {
    return this.proyectoRepository.find(filter);
  }

  @patch('/proyectos', {
    responses: {
      '200': {
        description: 'Proyecto PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Proyecto, {partial: true}),
        },
      },
    })
    proyecto: Proyecto,
    @param.query.object('where', getWhereSchemaFor(Proyecto)) where?: Where<Proyecto>,
  ): Promise<Count> {
    return this.proyectoRepository.updateAll(proyecto, where);
  }

  @get('/proyectos/{id}', {
    responses: {
      '200': {
        description: 'Proyecto model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Proyecto, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Proyecto)) filter?: Filter<Proyecto>
  ): Promise<Proyecto> {
    return this.proyectoRepository.findById(id, filter);
  }

  @patch('/proyectos/{id}', {
    responses: {
      '204': {
        description: 'Proyecto PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Proyecto, {partial: true}),
        },
      },
    })
    proyecto: Proyecto,
  ): Promise<void> {
    await this.proyectoRepository.updateById(id, proyecto);
  }

  @put('/proyectos/{id}', {
    responses: {
      '204': {
        description: 'Proyecto PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() proyecto: Proyecto,
  ): Promise<void> {
    await this.proyectoRepository.replaceById(id, proyecto);
  }

  @del('/proyectos/{id}', {
    responses: {
      '204': {
        description: 'Proyecto DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.proyectoRepository.deleteById(id);
  }
}
