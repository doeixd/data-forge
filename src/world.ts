

function createWorld({
  traits: Trait[]
  storageLocations: StorageLocation[]
}): World {
  const world = new World();
  world.createEntity();
  return world;
}




const world = createWorld()

const string = world.createCell({
  name: 'string',
  primitiveType: 'string',
  version: 1,
})

world.createRow({
  version: 1,
  storageLocation: world.storageLocations[0],
  cells: {
    firstName: col({
      name: 'firstName',
      cell: string,
    })
    
    

  }
})

const number = world.createCell({
  name: 'string',
  primitiveType: 'number',
  version: 1,
})

const stringToNumber = world.createConverter({
  from: string,
  to: number, 

  coverter: (from): to => {



  }
})

const subtract = world.createOperation({
  name: 'subtract',
  version: 1,
  type: 'producer',
  inputs: [number, number],
  output: number,
  operation: (a, b) => a - b,
  reversableWith: {
    operation: add,
    inputs: ['output', 'input[]']
  }
})

world.createOpaqueOperation({
  name: 'add',
  version: 1,
  type: 'producer',
  inputs: [number, number],
  output: number,
})

const add = world.createOperation({
  name: 'add',
  version: 1,
  type: 'producer',
  inputs: [number, number],
  output: number,
  operation: (a, b) => a + b,
  reversableWith: {
    operation: subtract,
    inputs: ['output', 'input[]']
  },

})