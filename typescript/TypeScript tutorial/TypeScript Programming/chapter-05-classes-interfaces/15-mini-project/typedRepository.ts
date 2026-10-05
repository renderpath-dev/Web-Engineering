// Goal:
// Build a typed repository with an interface and a concrete memory implementation.

// Expected result:
// The compiler enforces entity ids and repository behavior.

export {};

interface EntityRecord {
  readonly id: string;
}

interface Repository<EntityType extends EntityRecord> {
  save(entity: EntityType): void;
  findById(id: string): EntityType | undefined;
  findAll(): EntityType[];
}

class MemoryRepository<EntityType extends EntityRecord> implements Repository<EntityType> {
  private records = new Map<string, EntityType>();

  save(entity: EntityType): void {
    this.records.set(entity.id, entity);
  }

  findById(id: string): EntityType | undefined {
    return this.records.get(id);
  }

  findAll(): EntityType[] {
    return Array.from(this.records.values());
  }
}

type ProductRecord = EntityRecord & {
  readonly title: string;
  readonly price: number;
};

const productRepository: Repository<ProductRecord> = new MemoryRepository<ProductRecord>();

productRepository.save({
  id: "p1",
  title: "Keyboard",
  price: 99,
});

console.log(productRepository.findById("p1")?.title);
