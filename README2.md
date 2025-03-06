# DataForge

<div align="center">
  <img src="https://raw.githubusercontent.com/dataforge/assets/main/logo/dataforge-logo.png" alt="DataForge Logo" width="200"/>
  <h3>Type-Safe Domain Modeling with Automatic View Maintenance</h3>
  <p>
    <b>DataForge</b> is a powerful and flexible data modeling framework designed to bridge the gap between your application's domain model and its persistence layer. By leveraging mathematically sound foundations from the <a href="https://github.com/vmware/database-stream-processor">DBSP</a> model, DataForge automates incremental view maintenance across any storage technology.
  </p>
</div>

## Overview

DataForge provides clear abstractions for cells, traits, columns, rows, properties, and entities, enabling you to build scalable, maintainable systems with best-in-class type safety and expressiveness. The framework's mathematical foundations allow it to automatically detect and propagate changes efficiently, eliminating the need for brittle, error-prone manual update logic.

---

## 🚀 Key Features

- **Industrial-Strength Type Safety**  
  Leverage TypeScript's advanced type system with phantom types, generic constraints, and precise type inference to catch errors at compile time.

- **Composable Type System**  
  Build rich domain models through composition of cells, traits, columns, and properties with full type preservation.

- **Bidirectional Data Flow**  
  Define how data transforms from persistence to runtime and back with precise control and type safety.

- **Declarative Data Validation**  
  Apply validation rules at multiple levels with reusable traits and composable predicates, all type-checked at compile time.

- **Type-Safe Query API**  
  Use a functional, composable API for queries with support for filtering, projections, and relationships with complete end-to-end type safety.

- **Reversible Operations**  
  Define operations with their inverses, enabling sophisticated undo/redo and data transformation with guaranteed type correctness.

- **Algebraic Operation Properties**  
  Specify formal properties of operations (associativity, commutativity, idempotence) to enable automatic optimization and parallelization.

- **Location-Agnostic Execution**  
  Execute operations consistently across client, server, or database with automatic optimization based on operation properties.

- **Immutable Data with Mutable Semantics**  
  Get the best of both worlds with an Immer-like API for tracking changes while maintaining immutability and type safety.

- **Event-Driven Architecture**  
  Subscribe to data changes with a flexible event system built directly into operations, with strong typing for event handlers.

- **CRDT-Compatible Operations**  
  Design operations with conflict-free replicated data type semantics for robust distributed applications.

---

## 📦 Quick Start

Get up and running with DataForge in minutes!

### Installation

```bash
npm install dataforge
```

### Basic Usage

```typescript
// Create a world with traits - all type-safe from the start
const world = createWorld({
  traits: [
    // Define reusable traits
    {
      name: 'required',
      appliesTo: ['string', 'number', 'boolean'],
      implementation: (cell) => ({
        validation: (value) => value !== null && value !== undefined,
        errorMessage: 'This field is required'
      })
    },
    {
      name: 'minLength',
      appliesTo: ['string'],
      parameters: ['length'],
      implementation: (cell, { length }) => ({
        validation: (value) => value.length >= length,
        errorMessage: `Minimum length is ${length} characters`
      })
    }
  ],
  storageLocations: [{ type: 'database', connection: 'sqlite://memory' }]
});

// Define entities with strong typing
interface PersonData {
  id: number;
  name: string;
  age: number;
}

// Define cells (primitive types)
const string = world.createCell({
  name: 'string',
  primitiveType: 'string',
  version: 1
});

const number = world.createCell({
  name: 'number',
  primitiveType: 'number',
  version: 1
});

// Apply traits to create enhanced cells with preserved types
const nameString = world.applyTrait(
  world.applyTrait(string, 'required'),
  'minLength', 
  { length: 2 }
);

// Define columns with cells
const nameColumn = world.createColumn({
  name: 'name',
  cell: nameString,
  constraints: ['unique']
});

const ageColumn = world.createColumn({
  name: 'age',
  cell: number,
  constraints: []
});

// Define a row (table) with columns - fully type-checked
const personRow = world.createRow<PersonData, 'Person'>({
  name: 'Person',
  version: 1,
  columns: {
    id: world.columns.id,
    name: nameColumn,
    age: ageColumn
  }
});

// Define properties based on row columns
const nameProperty = world.createProperty({
  column: personRow.columns.name,
  transforms: {
    fromColumn: (value) => value.trim(),
    toColumn: (value) => value.trim()
  }
});

// Create an entity with properties - type safety preserved
const Person = world.createEntity<PersonData, any>({
  row: personRow,
  properties: {
    id: personRow.columns.id,
    name: nameProperty,
    age: personRow.columns.age
  }
});

// Create a new person - TypeScript validates the shape
const john = Person.create({
  name: 'John Doe',
  age: 30
});

// Save it to storage
await john.save();

// Query for people with type-safe predicates and projections
const youngPeople = await query<PersonData, { name: string, age: number }>(
  world,
  filter(Person, person => 
    where(person.age, 'lessThan', 40)
  ),
  lens({
    name: 'name',
    age: 'age'
  })
);
```

---

## 🛠️ Core Concepts with Enhanced Type Safety

### World

The world is the central container for your DataForge application. It manages storage connections, traits, operations, and provides context for queries and mutations. Everything in DataForge exists within a world, with strong type preservation throughout.

```typescript
const world = createWorld({
  traits: [...],
  storageLocations: [...]
});
```

### Cells

Cells are the fundamental data types in DataForge. They represent primitive values like strings, numbers, and dates, along with validation rules, ordering operations, and serialization behavior. Cells maintain their type information throughout the system.

```typescript
const emailCell = world.createCell<string>({
  name: 'email',
  primitiveType: 'string',
  version: 1,
  validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  errorMessage: 'Invalid email format'
});
```

### Traits

Traits are reusable behaviors that can be applied to cells. They provide a compositional approach to adding functionality such as validation, default values, formatting, and more. Type information is preserved when traits are applied.

```typescript
// Define a trait with strongly typed parameters
type PositiveTraitParams = {};

// Define a trait with parameter type checking
world.defineTrait<number, PositiveTraitParams>({
  name: 'positive',
  appliesTo: ['number'],
  implementation: (options) => ({
    validation: (value) => value > 0,
    errorMessage: 'Value must be positive'
  })
});

// Apply the trait with preserved type information
const positiveNumber = world.applyTrait(numberCell, 'positive');
```

### Columns

Columns represent database columns and define how cell data is stored in the persistence layer. They specify database-specific constraints and type mappings, with full type safety.

```typescript
const priceColumn = world.createColumn<number, 'price'>({
  name: 'price',
  cell: positiveNumber,
  type: 'DECIMAL(10,2)',
  constraints: ['NOT NULL']
});
```

### Rows

Rows define database tables as collections of columns. They provide the schema for your data storage and serve as the foundation for entities. TypeScript ensures columns match the expected shape.

```typescript
// Define the shape of our data
interface ProductData {
  id: number;
  name: string;
  price: number;
  description: string;
}

const productRow = world.createRow<ProductData, 'Product'>({
  name: 'Product',
  version: 1,
  columns: {
    id: world.columns.id,
    name: nameColumn,
    price: priceColumn,
    description: descriptionColumn
  }
});
```

### Properties

Properties bridge the gap between storage columns and runtime entities. They define transformations, validations, and behaviors that apply when moving data between the persistence layer and application memory, with precise type checking.

```typescript
const priceProperty = world.createProperty<number, number>({
  column: productRow.columns.price,
  transforms: {
    fromColumn: (value) => value / 100, // Store in cents, display in dollars
    toColumn: (value) => value * 100
  },
  validation: (value) => value >= 0.01,
  errorMessage: 'Price must be at least $0.01'
});
```

### Entities

Entities are the runtime objects that your application works with. They combine properties from one or more rows and provide methods for interacting with the data. Type safety ensures your entity definitions match your data model.

```typescript
const Product = world.createEntity<ProductData, any>({
  row: productRow,
  properties: {
    id: productRow.columns.id,
    name: productRow.columns.name,
    price: priceProperty,
    description: productRow.columns.description
  }
});
```

### Operations

Operations define transformations and computations that act on your data model. They can be characterized with formal properties like associativity and commutativity, enabling sophisticated optimizations and distributed execution. Input and output types are strictly enforced.

```typescript
const increasePrice = world.createOperation<[number, number], number>({
  name: 'increasePrice',
  version: 1,
  type: 'producer',
  inputs: [priceProperty, numberCell],
  output: priceProperty,
  operation: (price, increase) => price + increase,
  // Algebraic properties
  properties: {
    associative: true,     // (a+b)+c = a+(b+c)
    commutative: false,    // price+amount != amount+price semantically
    idempotent: false,     // a+b != a+b+b
    deterministic: true,   // Always produces same output for same inputs
    pure: true             // No side effects
  },
  // Define how this operation can be reversed
  reversableWith: {
    operation: 'decreasePrice',
    inputs: ['output', 'input[1]']
  }
});

// Event handlers receive properly typed parameters
const [updatePrice, onUpdatePrice] = world.on(increasePrice);

// Use the operation with type checking
updatePrice(product.price, 5.00);

// Subscribe to price updates with typed parameters
onUpdatePrice((price, amount) => {
  console.log(`Price increased by ${amount} to ${price}`);
});
```

### Predicates and Filters

Predicates are composable conditions that can be used to filter entities, while filters combine predicates to create reusable query components. Type checking ensures predicates work with the correct property types.

```typescript
// Create a predicate with property type checking
const isDiscounted = where<ProductData, 'price'>(
  'price', 
  'lessThan', 
  20.00
);

// Create a filter with full type inference
const affordableProducts = filter(Product, product => 
  and(
    where(product.price, 'lessThan', 50.00),
    where(product.inStock, 'equals', true)
  )
);

// Use with query - type safety preserved
const results = await query<ProductData>(world, affordableProducts);
```

### Lenses and Projections

Lenses define projections of your data, allowing you to retrieve only the specific properties you need. TypeScript ensures the projection matches the expected output shape.

```typescript
// Type-safe projection
type ProductSummary = {
  name: string;
  price: number;
};

const productSummary = lens<ProductData, ProductSummary>({
  name: 'name',
  price: 'price'
});

// Get only name and price, with result typed as ProductSummary[]
const summaries = await query<ProductData, ProductSummary>(
  world, 
  affordableProducts, 
  productSummary
);
```

### Mutations

Mutations allow you to make changes to your data with an Immer-like API that tracks the changes for efficient updates. Type checking ensures valid property access and assignments.

```typescript
// Update a product with type safety and change tracking
await world.mutate(product, draft => {
  // TypeScript validates property names and types
  draft.name = 'Updated Product Name';
  draft.price = 25.99;
}, 'updateProductDetails');
```

---

## 🌟 Advanced Data Structures and Ordering

DataForge provides robust support for complex data structures like arrays, trees, and custom ordering, making it easy to model real-world scenarios with type safety and automatic view maintenance. Below, we explore how to work with iterable/array-like cells and entities, hierarchical tree structures, and the `ord` trait for ordering.

### Iterable and Array-Like Cells and Entities

DataForge supports arrays natively through the `arrayCell` method, allowing you to define collections with type-safe elements and apply traits to both the array and its contents.

#### Array Cells
Create an array cell with a specified element type:
```typescript
const tagsCell = world.arrayCell(world.cells.string, {
  name: 'tags',
  version: 1,
  minLength: 1, // Array must have at least one element
  uniqueElements: true // No duplicates
});

// Apply additional traits
const requiredTags = world.applyTrait(tagsCell, 'nonEmpty');
```

Use it in a column and entity:
```typescript
interface ProductData {
  id: number;
  name: string;
  tags: string[];
}

const productRow = world.createRow<ProductData, 'Product'>({
  name: 'Product',
  columns: {
    id: world.columns.id,
    name: world.createColumn({ name: 'name', cell: world.cells.string }),
    tags: world.createColumn({ name: 'tags', cell: requiredTags, type: 'JSON' })
  }
});

const Product = world.createEntity<ProductData, any>({
  row: productRow,
  properties: {
    id: productRow.columns.id,
    name: productRow.columns.name,
    tags: world.createProperty({ column: productRow.columns.tags })
  }
});

const laptop = Product.create({ name: 'Laptop', tags: ['tech', 'portable'] });
await laptop.save();
```

#### Array Operations
Manipulate arrays with type-safe operations:
```typescript
const addTag = world.createOperation<[ProductData, string], ProductData>({
  name: 'addTag',
  inputs: [Product, world.cells.string],
  output: Product,
  operation: (product, tag) => ({ ...product, tags: [...product.tags, tag] })
});

const updatedLaptop = await addTag(laptop, 'new');
console.log(updatedLaptop.tags); // ['tech', 'portable', 'new']
```

#### Querying Arrays
Filter entities based on array properties:
```typescript
const techProducts = await query<ProductData>(
  world,
  filter(Product, p => p.tags.contains('tech'))
);
```

Entities can also be queried as arrays:
```typescript
const allProducts = await query<ProductData>(world, filter(Product, () => true));
// Iterate: allProducts.forEach(p => console.log(p.name));
```

### Tree Structures

DataForge supports hierarchical data with the `treeCell` and `createTreeEntity` APIs, ideal for categories, organizational charts, or nested comments.

#### Tree Cells
Define a tree with a value type:
```typescript
const categoryTreeCell = world.treeCell(world.cells.string, {
  name: 'categoryTree',
  version: 1,
  maxDepth: 5 // Optional constraint
});
```

#### Tree Entities
Create a self-referential tree entity:
```typescript
interface CategoryData {
  id: number;
  name: string;
  children: CategoryData[];
}

const Category = world.createTreeEntity<CategoryData, 'Category'>({
  name: 'Category',
  columns: {
    id: world.columns.id,
    name: world.createColumn({ name: 'name', cell: world.cells.string })
  },
  children: 'self' // Links via id
});

const electronics = Category.create({ name: 'Electronics' });
const laptops = Category.create({ name: 'Laptops', parent: electronics });
await electronics.save();
await laptops.save();
```

#### Tree Traversal
Use built-in operations to navigate trees:
```typescript
const getChildren = world.createOperation<[CategoryData], CategoryData[]>({
  name: 'getChildren',
  inputs: [Category],
  output: Category.array(),
  operation: (node) => node.children
});

const childCategories = await getChildren(electronics);
console.log(childCategories[0].name); // 'Laptops'
```

Query descendants:
```typescript
const allDescendants = await query<CategoryData>(
  world,
  filter(Category, c => c.isDescendantOf(electronics.id))
);
```

### The `ord` Trait for Ordering

The `ord` trait enables custom ordering for cells and entities, powering sorting, comparisons, and optimized operations.

#### Defining `ord`
Apply the built-in `ord` trait:
```typescript
const orderedNumber = world.applyTrait(world.cells.number, 'ord', { reverse: false });
// Custom comparison for strings
const caseInsensitiveString = world.applyTrait(world.cells.string, 'ord', {
  compare: (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })
});
```

#### Ordering Entities
Order an entity by a property:
```typescript
const orderedProduct = world.applyTrait(Product, 'ord', {
  compare: (a, b) => a.price - b.price // Sort by price
});
```

#### Sorting in Queries
Sort query results:
```typescript
const sortedProducts = await query<ProductData>(
  world,
  filter(Product, () => true),
  orderBy(p => p.price, 'asc')
);
```

#### Optimized Operations
Use `ord` for merging sorted arrays:
```typescript
const mergeSorted = world.createOperation<[ProductData[], ProductData[]], ProductData[]>({
  name: 'mergeSorted',
  inputs: [orderedProduct.array(), orderedProduct.array()],
  output: orderedProduct.array(),
  operation: (a, b) => [...a, ...b].sort((x, y) => x.price - y.price),
  properties: { associative: true }
});
```

### Why These Features Matter
- **Arrays**: Simplify lists (e.g., tags, items) with native operations and queries.
- **Trees**: Streamline hierarchies with built-in traversal and maintenance.
- **Ordering**: Unlock sorting and comparison with type-safe flexibility.

Explore these features in our [advanced examples](#-advanced-examples) to see them in action!

---

## 📚 Advanced Examples

### Relationship Queries with Type-Safe Projections

Using relationships with lens projections ensures type safety across entity boundaries:

```typescript
interface OrderData {
  id: number;
  date: string;
  customerId: number;
}

interface OrderItemData {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
}

interface ProductData {
  id: number;
  name: string;
  price: number;
}

// Define type for the projected result
interface OrderSummary {
  id: number;
  date: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
}

// Query with fully typed relationship traversal
const recentOrders = await query<OrderData, OrderSummary>(
  world,
  filter(Order, order => 
    where(order.date, 'greaterThan', daysAgo(30))
  ),
  lens({
    id: 'id',
    date: 'date',
    items: include('items', lens({
      productName: 'product.name',
      quantity: 'quantity',
      price: 'product.price'
    })),
    total: 'id' // This would be a computed field in practice
  })
);
```

### Type-Safe Computed Properties

Create properties that derive their values from other properties with full type checking:

```typescript
// Define the compute function with proper parameter types
const calculatePriceWithTax = (price: number, taxRate: number): number => 
  price * (1 + taxRate);

const Product = world.createEntity<ProductWithTaxData, any>({
  row: productRow,
  properties: {
    id: productRow.columns.id,
    name: productRow.columns.name,
    price: priceProperty,
    taxRate: taxRateProperty,
    // Type-safe computed property
    priceWithTax: computed<number, [number, number]>(
      [priceProperty, taxRateProperty],
      calculatePriceWithTax
    )
  }
});
```

### Event-Driven Patterns with Type Safety

Build reactive applications with the event system, ensuring type safety throughout:

```typescript
// Define an operation with proper types
const markAsShipped = world.createOperation<[OrderData], OrderData>({
  name: 'markAsShipped',
  inputs: [Order],
  output: Order,
  operation: (order) => {
    // TypeScript validates property access
    return {
      ...order,
      status: 'shipped',
      shippedAt: new Date().toISOString()
    };
  }
});

// Create function and event handler with proper typing
const [shipOrder, onOrderShipped] = world.on(markAsShipped);

// Subscribe to shipping events with type safety
onOrderShipped((order) => {
  // TypeScript validates property access in the handler
  notifyCustomer(order.customerId, `Order #${order.id} has been shipped!`);
});

// Somewhere in your application - type checked
await shipOrder(order123);
```

---

## 💡 Philosophy

DataForge is built on several key principles:

1. **Type Safety by Design** - Use TypeScript's type system to catch errors at compile time
2. **Composition over Inheritance** - Build complex models by composing simpler pieces
3. **Progressive Enhancement** - Build worlds with exactly the traits and capabilities needed
4. **Separation of Concerns** - Clearly distinguish between persistence, domain model, and presentation
5. **Bidirectional Data Flow** - Support transformations in both directions with converters and operations
6. **Algebraic Foundations** - Use formal properties of operations to enable optimization and parallelization
7. **Location Transparency** - Write operations once, execute efficiently anywhere (client, server, database)
8. **Granular Reusability** - Create reusable components at multiple levels of abstraction
9. **CRDT-Compatible Design** - Structure operations and entities for conflict-free replication
10. **Automatic View Maintenance** - Track entity changes efficiently with stable identifiers and traits
11. **Progressive Complexity** - Start simple and add sophistication as needed

---

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](https://dataforge.dev/contribute) for more details. Join the community on [GitHub](https://github.com/dataforge).

---

## 💬 Support

Need help? Visit our [support page](https://dataforge.dev/support) or join our [Discord](https://discord.dataforge.dev) community for assistance.

---

**DataForge** is licensed under the MIT License. See [LICENSE](https://github.com/dataforge/LICENSE) for more information.

---

### Notes
- **Structure**: The new "Advanced Data Structures and Ordering" section is placed between "Core Concepts with Enhanced Type Safety" and "Advanced Examples" to maintain a logical progression: basics → advanced features → examples.
- **Content**: The original README is unchanged except for the addition of the new section, which introduces array cells, tree structures, and the `ord` trait with examples.
- **Formatting**: Everything is wrapped in a single ` ```markdown ``` ` block as requested, preserving Markdown syntax (e.g., headers, code blocks, links).

Let me know if you’d like me to adjust anything—split it up, tweak examples, or refine further!