# back

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

Ejemplo de uso de loopback para crear back end, tipo sistema de loggeo de jira.

## Notas MySql

#### Transactions

Es un conjunto de operaciones sobre tablas vinculadas que se llevan a cabo en memoria antes de ser escritas en la base de datos para evitar que las tablas tengan el resulado de operaciones parciales durante la actualizacion. Si ocurre un error en alguna de las operaciones, se ejecuta el *rollback* y la base de datos es restaurada a su estado original. Si no ocurren errores se ejecuta el *commit* y las tatalidad de las operaciones son aplicadas a la base de datos.


```
-- 1. start a new transaction
START TRANSACTION;

-- 2. Get the latest order number
SELECT
    @orderNumber:=MAX(orderNUmber)+1
FROM
    orders;

-- 3. insert a new order for customer 145
INSERT INTO orders(orderNumber,
                   orderDate,
                   requiredDate,
                   shippedDate,
                   status,
                   customerNumber)
VALUES(@orderNumber,
       '2005-05-31',
       '2005-06-10',
       '2005-06-11',
       'In Process',
        145);

-- 4. Insert order line items
INSERT INTO orderdetails(orderNumber,
                         productCode,
                         quantityOrdered,
                         priceEach,
                         orderLineNumber)
VALUES(@orderNumber,'S18_1749', 30, '136', 1),
      (@orderNumber,'S18_2248', 50, '55.09', 2);

-- 5. commit changes
COMMIT;
```

Ejemplo de rollback

```
START TRANSACTION;
DELETE FROM orders;

-- ups!  no queriamos borrar, entonces desacemos el cambio

ROLLBACK;
```


## Transactions en Loopback

Se habilitan en los archivos ***.repository.ts**
El repositorio debe estender de *TransactionalRepository* lo cual expone el metodo *beginTransaction()*

En el repositorio:
```
import {inject} from '@loopback/core';
import {
  juggler,
  Transaction,
  DefaultTransactionalRepository,
  IsolationLevel,
} from '@loopback/repository';
import {Note, NoteRelations} from '../models';

export class NoteRepository extends DefaultTransactionalRepository<
  Note,
  typeof Note.prototype.id,
  NoteRelations
> {
  constructor(@inject('datasources.ds') ds: juggler.DataSource) {
    super(Note, ds);
  }
}
```

En el controlador:
```
import {
  Transaction,
  DefaultTransactionalRepository,
  IsolationLevel,
} from '@loopback/repository';
// assuming there is a Note model extending Entity class, and
// ds datasource which is backed by a transaction enabled
// connector

const repo = new DefaultTransactionalRepository(Note, ds);
// Now we have a transaction (tx)
const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

const created = await repo.create({title: 'Groceries'}, {transaction: tx});
const updated = await repo.update(
  {title: 'Errands', id: created.id},
  {transaction: tx},
);

// commit the transaction to persist the changes
await tx.commit();

// or
await tx.rollback();
```

Se puede usar un "set up timeuot" el cual se pone en la declaracion de la transaccion. Si se cumple el timepo y la transaccion no a terminado, automaticamente se hace el *rollback*

```
const tx: Transaction = await repo.beginTransaction({
  isolationLevel: IsolationLevel.READ_COMMITTED,
  timeout: 30000, // 30000ms = 30s
});
```

1 Model
2 Datasource
3 Repository
4 Controller
