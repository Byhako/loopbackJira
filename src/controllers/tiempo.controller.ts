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

import { TiempoRepository, UsuarioRepository, ProyectoRepository, IssueRepository } from '../repositories';

export class TiempoController {
  constructor(
    @repository(TiempoRepository)
    public tiempoRepository: TiempoRepository,
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(IssueRepository)
    public issueRepository: IssueRepository,
    @repository(ProyectoRepository)
    public proyectoRepository: ProyectoRepository,
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
    const fechaInicio = moment(fecha_inicio).date();
    const fechaFin = moment(fecha_fin);

    // detalles de usuario
    const usuario = await this.usuarioRepository.find({
      where: { id: usuario_id },
    });
    const nombre = usuario.map(item => item.nombre);

    // tiempo por cada issue
    const usuariosTimer = await this.tiempoRepository.find({
      where: { usuario_id: usuario_id },
    });

    const users = usuariosTimer.filter(item =>
      moment(item.fecha) >= fechaInicio && moment(item.fecha) <= fechaFin
    );

    let tiempoTotal = moment('00:00:00', "HH:mm:ss");
    const detalleLogs = users.map(item => {
      const horaIni = moment(item.hora_inicio, "HH:mm:ss");
      const horaFin = moment(item.hora_fin, "HH:mm:ss");

      const diff = horaFin.diff(horaIni);
      tiempoTotal = tiempoTotal + diff;
      return {
        horasTabajadas: moment.utc(diff).format("HH:mm"),
        issue_id: item.issue_id
      }
    })
    tiempoTotal = moment(tiempoTotal).format("HH:mm");

    const detalleLogsSum: any[] = [];
    const issuesIds: number[] = [];
    detalleLogs.forEach(item => {
      const issue = item.issue_id;
      const indexIssue = issuesIds.indexOf(issue);
      if (indexIssue === -1) {
        detalleLogsSum.push(item)
        issuesIds.push(issue);
      } else {
        let indexDetail = 0;
        let time = '';
        detalleLogsSum.forEach((el, idx) => {
          if (el.issue_id === issue) {
            indexDetail = idx;
            time = el.horasTabajadas
          }
        })
        time = moment(time, "HH:mm") + moment.utc(item.horasTabajadas, "HH:mm")
        time = moment(time).format("HH:mm");
        detalleLogsSum.splice(indexDetail, 1)
        detalleLogsSum.push({ horasTabajadas: time, issue_id: issue })
      }
    })

    const issuesList = await this.issueRepository.find({
      where: {
        id: {
          inq: issuesIds
        },
      },
    });
    const proyectosIds = issuesList.map(item => item.proyecto_id)

    detalleLogsSum.forEach((item, idx) => {
      const issueId = item.issue_id;
      issuesList.forEach(is => {
        if (issueId === is.id) {
          detalleLogsSum[idx].proyecto_id = is.proyecto_id;
        }
      })
    })

    const proyectosList = await this.proyectoRepository.find({
      where: {
        id: {
          inq: proyectosIds
        },
      },
    });

    const proyectos = detalleLogsSum.map(item => {
      const proyectId = item.proyecto_id;
      let proyecItem = {};
      proyectosList.forEach(pl => {
        if (proyectId === pl.id) {
          proyecItem = { horasTabajadas: item.horasTabajadas, nombreProyecto: pl.nombre };
        }
      })
      return proyecItem;
    })

    return {
      statusCode: 200,
      response: {
        user: nombre[0],
        tiempoTotal,
        proyectos,
      }
    };
  }
}
