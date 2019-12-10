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
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Usuario } from '../models';
import { UsuarioRepository, TiempoRepository } from '../repositories';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(TiempoRepository)
    public tiempoRepository: TiempoRepository,
  ) { }

  @post('/usuarios', {
    responses: {
      '200': {
        description: 'Usuario creado correctamente',
        content: { 'application/json': { schema: getModelSchemaRef(Usuario) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<{}> {
    await this.usuarioRepository.create(usuario);
    return {
      statusCode: 200,
      response: 'El usuario fue creado correctamente'
    }
  }

  @get('/usuarios/count', {
    responses: {
      '200': {
        description: 'Usuario model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Usuario)) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios', {
    responses: {
      '200': {
        description: 'Lista de usuarios',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Usuario, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Usuario)) filter?: Filter<Usuario>,
  ): Promise<{}> {
    const listUsuarios = await this.usuarioRepository.find(filter);
    return {
      statusCode: 200,
      response: listUsuarios
    }
  }

  @get('/usuarios/{id}', {
    responses: {
      '200': {
        description: 'Usuario model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Usuario, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Usuario)) filter?: Filter<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @put('/usuarios/{id}', {
    responses: {
      '204': {
        description: 'El usuario fue editado correctamente',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() usuario: Usuario,
  ): Promise<{}> {
    await this.usuarioRepository.replaceById(id, usuario);
    return {
      statusCode: 200,
      response: 'El usuario fue editado correctamente'
    }
  }

  @del('/usuarios/{id}', {
    responses: {
      '204': {
        description: 'Usuario borrado correctamente',
      },
    },
  })
  async delete(@param.path.number('id') id: number): Promise<{}> {
    const tiempos = await this.tiempoRepository.find({
      where: { usuario_id: id },
    });

    const tiempoIds = tiempos.map(item => item.id);

    await this.tiempoRepository.deleteAll({
      id: {
        inq: tiempoIds,
      },
    });

    await this.usuarioRepository.deleteById(id);

    return {
      statusCode: 200,
      response: 'Success'
    }
  }
}
