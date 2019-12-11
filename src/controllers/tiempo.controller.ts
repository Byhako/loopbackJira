/* eslint-disable @typescript-eslint/camelcase */
import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
} from '@loopback/rest';
import { Tiempo } from '../models';
import moment from 'moment-with-locales-es6';

import { TiempoRepository, UsuarioRepository } from '../repositories';

export class TiempoController {
  constructor(
    @repository(TiempoRepository)
    public tiempoRepository: TiempoRepository,
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
  ) { }

  @get('/tiempos', {
    responses: {
      '200': {
        description: 'Array of Tiempo model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Tiempo, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Tiempo)) filter?: Filter<Tiempo>,
  ): Promise<Tiempo[]> {
    return this.tiempoRepository.find(filter);
  }

  @get('/tiempos/{usuario_id}/{fecha_inicio}/{fecha_fin}', {
    responses: {
      '200': {
        description: 'Array of Tiempo model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              // items: getModelSchemaRef(Tiempo, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findProyects(
    @param.path.number('usuario_id') usuario_id: number,
    @param.path.string('fecha_inicio') fecha_inicio: string,
    @param.path.string('fecha_fin') fecha_fin: string,
    // @param.query.object('filter', getFilterSchemaFor(Tiempo)) filter?: Filter<Tiempo>,
  ): Promise<{}> {
    // return this.tiempoRepository.find(filter);
    const fechaInicio = moment(fecha_inicio).date();
    const fechaFin = moment(fecha_fin);

    const usuariosTimer = await this.tiempoRepository.find({
      where: { usuario_id: usuario_id },
    });

    const usuario = await this.usuarioRepository.find({
      where: { id: usuario_id },
    });
    const nombre = usuario.map(item => item.nombre);

    // console.log(usuarios)
    const users = usuariosTimer.filter(item =>
      moment(item.fecha) >= fechaInicio && moment(item.fecha) <= fechaFin
    );

    const durations = users.map(item => {
      const horaIni = moment(item.hora_inicio, "HH:mm:ss");
      const horaFin = moment(item.hora_fin, "HH:mm:ss");

      const diff = horaFin.diff(horaIni);
      return moment.utc(diff).format("HH:mm");
    })

    const detalleLogs: object[] = [];
    durations.forEach((d, idx) => {
      const obj = {
        duracion: d,
        usuario: nombre,
        issue_id: users[idx].issue_id
      };
      detalleLogs.push(obj);
    })


    console.log(detalleLogs)


    return {
      statusCode: 200,
      user: usuario_id,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin
    };
  }
}
