/* eslint-disable @typescript-eslint/camelcase */
import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import { Proyecto } from '../models';
import { ProyectoRepository, IssueRepository, TiempoRepository } from '../repositories';

export class ProyectoController {
  constructor(
    @repository(ProyectoRepository)
    public proyectoRepository: ProyectoRepository,
    @repository(IssueRepository)
    public issueRepository: IssueRepository,
    @repository(TiempoRepository)
    public tiempoRepository: TiempoRepository,
  ) { }

  @post('/proyectos', {
    responses: {
      '200': {
        description: 'Proyecto model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Proyecto) } },
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
  ): Promise<{}> {
    const exist = await this.proyectoRepository.findOne({
      where: { key: proyecto.key }
    });
    if (exist) {
      return {
        statusCode: 403,
        response: 'Key incorrect. Use another'
      }
    } else {
      await this.proyectoRepository.create(proyecto);
      return {
        statusCode: 200,
        response: 'The project was created successfully.'
      }
    }
  }

  @get('/proyectos', {
    responses: {
      '200': {
        description: 'Array of Proyecto model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Proyecto, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Proyecto)) filter?: Filter<Proyecto>,
  ): Promise<{}> {
    const listProyectos = await this.proyectoRepository.find(filter);
    return {
      statusCode: 200,
      response: listProyectos
    }
  }

  @get('/proyectos/{id}', {
    responses: {
      '200': {
        description: 'Proyecto model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Proyecto, { includeRelations: true }),
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
          schema: getModelSchemaRef(Proyecto, { partial: true }),
        },
      },
    })
    proyecto: Proyecto,
  ): Promise<{}> {
    await this.proyectoRepository.updateById(id, proyecto);
    return {
      statusCode: 200,
      response: 'El proyecto fue editado correctamente'
    }
  }

  @del('/proyectos/{id}', {
    responses: {
      '204': {
        description: 'Proyecto DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<{}> {
    const issues = await this.issueRepository.find({
      where: { proyecto_id: id },
    });
    const issuesIds = issues.map(item => item.id ? item.id : 0).filter(item => !!item);

    const tiempos = await this.tiempoRepository.find({
      where: {
        issue_id: {
          inq: issuesIds
        },
      },
    });
    const tiemposIds = tiempos.map(item => item.id);

    // delete in tiempos
    await this.tiempoRepository.deleteAll({
      id: {
        inq: tiemposIds,
      },
    });

    // delete in issue
    await this.issueRepository.deleteAll({
      id: {
        inq: issuesIds,
      },
    });

    // delete in proyecto
    await this.proyectoRepository.deleteById(id);

    return {
      statusCode: 200,
      response: 'Success'
    }
  }
}
