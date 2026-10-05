// Goal:
// Verify subtype and supertype relationship through object structure

// Expected result
// The compiler accepts assigning a narrower object to a wider type

export {};

type EntityRecord = {
    id: string;
}

type ProductRecord =  {
    id: string;
    title: string;
    price: number;
}

const productRecord: ProductRecord = {
    id:"p1",
    title:"keyboard",
    price: 99,  
}

const entityRecord: EntityRecord = productRecord;

console.log(entityRecord.id);