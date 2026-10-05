// Goal:
// Use a default genenric type parameter

// Expected result:
// The compiler uses the default metadata type unless overridden

export {};

type ApiResponse<DataType, MetaType = {requestId:string} >= {
    data: DataType;
    meta: MetaType;
};

type ProductRecord = {
    id: string;
    title:string;
};

const defaultMetaResponse: ApiResponse<ProductRecord> = {
    data: {
        id: "p1",
        title:"keyboard",
    },
    meta: {
        requestId:"req-1"
    },
};

const customMetaResponse: ApiResponse<ProductRecord, {page:number; total:number}> ={
    data: {
        id:"p2",
        title:"Mouse",
    },
    meta: {
            page:1,
            total:20,
    },
};

console.log(defaultMetaResponse.meta.requestId);
console.log(customMetaResponse.meta.total);


