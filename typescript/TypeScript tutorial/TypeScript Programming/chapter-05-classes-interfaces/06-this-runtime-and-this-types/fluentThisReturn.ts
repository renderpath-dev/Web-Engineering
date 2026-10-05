// Goal:
// Use this return type for a fluent API

// Expected result:
// The subclass chain preserves subclass methods

export {};

class QueryBuilder {
    protected queryParts: string[] = [];

    where(conditionText: string): this {
        this.queryParts.push(`where ${conditionText}`);
        return this;
    }

    build(): string {
        return this.queryParts.join("");
    }
}

class ProductQueryBuilder extends QueryBuilder {
    orderBy(fieldName:string):this {
        this.queryParts.push(`order by ${fieldName}`)
        return this;
    }
}

const queryText = new ProductQueryBuilder()
.where("stock > 0")
.orderBy("price")
.build();

console.log(queryText);