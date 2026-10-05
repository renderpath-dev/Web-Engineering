// Goal:
// Bind a generic type parameter when creating reusable type

// Expected result:
// The repository keeps one entity type

export {};

type Repository<EntityType> = {
    save(entity: EntityType): void;
    findById(id: string): EntityType | undefined;
};

type ProductRecord = {
    id: string;
    title:string;
};

const productRepository: Repository<ProductRecord> = {
    save (entity) {
        console.log(entity.title);
    },
    findById(id) {
        return {id, title:"keyboard"};
    },
};

productRepository.save({id:"p1",title:"Mouse"});
console.log(productRepository.findById("p1")?.title);