// Goal:
// Override a method while preserving the base contract

// Expected result:
// The compiler accepts a safe override and rejects an unsafe one

export {};

class BaseRenderer {
    render(labelText?: string): string {
        return labelText ?? "default"
    }
}

class ProductRenderer extends BaseRenderer {
    override render(labelText?: string): string {
        return `product: ${labelText ?? "default"}`
    }
}

class BrokenRenderer extends BaseRenderer {
    // @ts-expect-error: The override return type is not compatible with the base method
    override render(labelText?: string): number {
        return labelText?.length ?? 0;
    }
}

const renderer: BaseRenderer = new ProductRenderer();